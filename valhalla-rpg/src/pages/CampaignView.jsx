import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { usePlayer } from '../lib/PlayerContext.jsx'

export default function CampaignView() {
  const { id } = useParams()
  const { identity } = usePlayer()
  const [campaign, setCampaign] = useState(null)
  const [characters, setCharacters] = useState([])
  const [myCharacters, setMyCharacters] = useState([])
  const [selectedCharId, setSelectedCharId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function loadAll() {
    setLoading(true)
    const { data: campaignData, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single()

    const { data: charData, error: charError } = await supabase
      .from('characters')
      .select('id, name, sheet, player_id')
      .eq('campaign_id', id)

    const { data: mine } = await supabase
      .from('characters')
      .select('id, name, campaign_id')
      .eq('player_id', identity?.playerId)

    if (campaignError) setError(campaignError.message)
    else if (charError) setError(charError.message)
    else {
      setCampaign(campaignData)
      setCharacters(charData || [])
      setMyCharacters(mine || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    if (identity) loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, identity])

  async function linkCharacter(e) {
    e.preventDefault()
    if (!selectedCharId) return
    const { error } = await supabase.from('characters').update({ campaign_id: id }).eq('id', selectedCharId)
    if (!error) {
      setSelectedCharId('')
      loadAll()
    }
  }

  if (loading) return <div className="card muted">Convocando o conselho...</div>
  if (error) return <div className="card">Erro: {error}</div>
  if (!campaign) return null

  const availableToLink = myCharacters.filter((c) => c.campaign_id !== id)

  return (
    <div>
      <div className="card">
        <span className="eyebrow">Campanha</span>
        <h1>{campaign.name}</h1>
        <span className="pill">Código de convite: {campaign.code}</span>
      </div>

      <div className="card">
        <h3>Levar um personagem para esta campanha</h3>
        {availableToLink.length === 0 ? (
          <p className="muted">
            Todos os seus personagens já estão aqui, ou você ainda não criou nenhum.{' '}
            <Link to="/personagem/novo">Criar personagem</Link>
          </p>
        ) : (
          <form onSubmit={linkCharacter} style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <div className="field" style={{ flex: 1, marginBottom: 0 }}>
              <label>Seu personagem</label>
              <select value={selectedCharId} onChange={(e) => setSelectedCharId(e.target.value)}>
                <option value="">Selecione...</option>
                {availableToLink.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <button className="primary" type="submit">
              Adicionar
            </button>
          </form>
        )}
      </div>

      <div className="rune-divider">ᛟ</div>

      <h3>Campeões nesta campanha</h3>
      <div className="grid grid-2">
        {characters.map((c) => (
          <Link key={c.id} to={`/personagem/${c.id}`} className="card" style={{ textDecoration: 'none' }}>
            <h4>{c.name}</h4>
            <p className="muted">
              {c.sheet?.lineageName} · Nível {c.sheet?.nivel || 1}
            </p>
          </Link>
        ))}
        {characters.length === 0 && <p className="muted">Nenhum campeão nesta campanha ainda.</p>}
      </div>
    </div>
  )
}
