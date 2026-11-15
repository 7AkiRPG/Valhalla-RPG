import { supabase } from './supabaseClient.js'
import { formatCode } from './accessCode.js'

const CACHE_KEY = 'valhalla_player_cache'

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || 'null')
  } catch {
    return null
  }
}

function writeCache(data) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(data))
}

export async function ensureIdentity() {
  let { data: sessionData } = await supabase.auth.getSession()

  if (!sessionData?.session) {
    const { error } = await supabase.auth.signInAnonymously()
    if (error) throw error
  }

  const { data, error } = await supabase.rpc('ensure_player')
  if (error) throw error

  const row = Array.isArray(data) ? data[0] : data
  const identity = { playerId: row.player_id, recoveryCode: row.recovery_code }
  writeCache(identity)
  return identity
}

export function getCachedIdentity() {
  return readCache()
}

export async function recoverAccess(code) {
  const { data: sessionData } = await supabase.auth.getSession()
  if (!sessionData?.session) {
    const { error } = await supabase.auth.signInAnonymously()
    if (error) throw error
  }

  const { data: refreshed } = await supabase.auth.getSession()
  const accessToken = refreshed?.session?.access_token

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const res = await fetch(`${supabaseUrl}/functions/v1/recover-access`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ code: formatCode(code) }),
  })

  const body = await res.json()
  if (!res.ok) {
    throw new Error(body.error || 'Não foi possível recuperar o acesso.')
  }

  const identity = await ensureIdentity()
  return identity
}
