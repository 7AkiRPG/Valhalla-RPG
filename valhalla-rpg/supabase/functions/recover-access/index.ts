// Edge Function: recover-access
//
// Recebe o código de recuperação do jogador e vincula a sessão anônima
// ATUAL (deste novo dispositivo/navegador) ao player_id original.
//
// Precisa da service role key porque grava em player_auth_links pra um
// player que não é (ainda) o "dono" da sessão que está chamando.
//
// Deploy: supabase functions deploy recover-access

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { code } = await req.json()
    if (!code || typeof code !== 'string') {
      return json({ error: 'Código de recuperação ausente.' }, 400)
    }

    // Identifica quem está chamando (sessão anônima atual deste dispositivo)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return json({ error: 'Sessão não encontrada.' }, 401)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Cliente "do usuário", só pra descobrir o auth.uid() de quem chamou
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: userData, error: userError } = await callerClient.auth.getUser()
    if (userError || !userData?.user) {
      return json({ error: 'Não foi possível identificar a sessão atual.' }, 401)
    }
    const newAuthId = userData.user.id

    // Cliente admin, pra localizar o player pelo código e criar o vínculo
    const admin = createClient(supabaseUrl, serviceKey)

    const normalizedCode = code.trim().toUpperCase()
    const { data: player, error: playerError } = await admin
      .from('players')
      .select('id')
      .eq('recovery_code', normalizedCode)
      .maybeSingle()

    if (playerError || !player) {
      return json({ error: 'Código de recuperação inválido.' }, 404)
    }

    const { error: linkError } = await admin
      .from('player_auth_links')
      .upsert({ auth_id: newAuthId, player_id: player.id }, { onConflict: 'auth_id' })

    if (linkError) {
      return json({ error: 'Não foi possível vincular este dispositivo.' }, 500)
    }

    return json({ player_id: player.id }, 200)
  } catch (err) {
    return json({ error: 'Erro inesperado: ' + String(err) }, 500)
  }
})

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
