import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { usePlayer } from '../lib/PlayerContext.jsx'

function randomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // sem caracteres ambíguos
  let out = ''
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

export default function Campaigns() {
  const { identity } = usePlayer()
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  async function loadCampaigns() {
    if (!identity) return
    setLoading(true)
    const { data, error } = await supabase
      .from('campaigns')
      .select('id, name, code, gm_player_id')
      .order('created_at', { ascending: false })
    if (!error) setCampaigns(data)
    setLoading(false)
  }

  useEffect(() => {
    loadCampaigns()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identity])

  async function handleCreate(e) {
    e.preventDefault()
    if (!newName.trim()) return
    setBusy(true)
    setError(null)
    try {
      const code = randomCode()
      const { data, error } = await supabase
        .from('campaigns')
        .insert({ name: newName.trim(), code, gm_player_id: identity.playerId })
        .select('id')
        .single()
      if (error) throw error

      await supabase.from('campaign_members').insert({ campaign_id: data.id, player_id: identity.playerId })

      setNewName('')
      await loadCampaigns()
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setBusy(false)
    }
  }

  async function handleJoin(e) {
    e.preventDefault()
    if (!joinCode.trim()) return
    setBusy(true)
    setError(null)
    try {
      const { error } = await supabase.rpc('join_campaign_by_code', { invite_code: joinCode.trim().toUpperCase() })
      if (error) throw error
      setJoinCode('')
      await loadCampaigns()
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="grid grid-2">
        <div className="card">
          <span className="eyebrow">Fundar um reino</span>
          <h3>Criar campanha</h3>
          <form onSubmit={handleCreate}>
            <div className="field">
              <label>Nome da campanha</label>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex: A Corrupção de Valhalla" />
            </div>
            <button className="primary" type="submit" disabled={busy}>
              Criar
            </button>
          </form>
        </div>

        <div className="card">
          <span className="eyebrow">Juntar-se à jornada</span>
          <h3>Entrar com código</h3>
          <form onSubmit={handleJoin}>
            <div className="field">
              <label>Código de convite</label>
              <input value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder="ABC123" />
            </div>
            <button className="primary" type="submit" disabled={busy}>
              Entrar
            </button>
          </form>
        </div>
      </div>

      {error && <div className="card">{error}</div>}

      <div className="rune-divider">ᛟ</div>

      <h3>Suas campanhas</h3>
      {loading && <p className="muted">Carregando...</p>}
      {!loading && campaigns.length === 0 && <p className="muted">Você ainda não participa de nenhuma campanha.</p>}

      <div className="grid grid-2">
        {campaigns.map((c) => (
          <Link key={c.id} to={`/campanhas/${c.id}`} className="card" style={{ textDecoration: 'none' }}>
            <h4>{c.name}</h4>
            <span className="pill">Código: {c.code}</span>
            {c.gm_player_id === identity?.playerId && <span className="pill" style={{ marginLeft: 8 }}>Você é o mestre</span>}
          </Link>
        ))}
      </div>
    </div>
  )
}
