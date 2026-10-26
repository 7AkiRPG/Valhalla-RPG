import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { usePlayer } from '../lib/PlayerContext.jsx'
import Modal from '../components/Modal.jsx'
import { formatSheetCodeInput } from '../lib/accessCode.js'

export default function CampaignView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { identity } = usePlayer()
  const [campaign, setCampaign] = useState(null)
  const [characters, setCharacters] = useState([])
  const [myCharacters, setMyCharacters] = useState([])
  const [selectedCharId, setSelectedCharId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // abrir ficha de outro jogador (pede o código do dono)
  const [unlocking, setUnlocking] = useState(null)
  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState(null)
  // tirar personagem da campanha
  const [removing, setRemoving] = useState(null)
  // excluir campanha
  const [deletingCampaign, setDeletingCampaign] = useState(false)
  const [typedName, setTypedName] = useState('')
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState(null)

  async function loadAll() {
    setLoading(true)
    const { data: campaignData, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single()

    const { data: charData, error: charError } = await supabase.rpc('list_campaign_characters', {
      p_campaign_id: id,
    })

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

  function openCharacter(c) {
    if (c.can_open) {
      navigate(`/personagem/${c.id}`)
    } else {
      setUnlocking(c)
      setCode('')
      setCodeError(null)
    }
  }

  async function submitUnlock() {
    setBusy(true)
    setCodeError(null)
    const { error } = await supabase.rpc('unlock_character', {
      p_character_id: unlocking.id,
      p_code: code,
    })
    setBusy(false)
    if (error) {
      setCodeError(error.message)
      return
    }
    const target = unlocking.id
    setUnlocking(null)
    navigate(`/personagem/${target}`)
  }

  async function confirmRemove() {
    setBusy(true)
    setActionError(null)
    const { error } = await supabase.rpc('remove_character_from_campaign', {
      p_character_id: removing.id,
    })
    setBusy(false)
    if (error) {
      setActionError(error.message)
      return
    }
    setRemoving(null)
    loadAll()
  }

  async function confirmDeleteCampaign() {
    setBusy(true)
    setActionError(null)
    const { data, error } = await supabase.from('campaigns').delete().eq('id', id).select('id')
    setBusy(false)
    if (error) {
      setActionError(error.message)
      return
    }
    if (!data || data.length === 0) {
      setActionError('Só quem criou a campanha pode excluí-la.')
      return
    }
    navigate('/campanhas')
  }

  if (loading) return <div className="card muted">Convocando o conselho...</div>
  if (error) return <div className="card">Erro: {error}</div>
  if (!campaign) return null

  const me = identity?.playerId
  const isGm = campaign.gm_player_id === me
  const availableToLink = myCharacters.filter((c) => c.campaign_id !== id)

  return (
    <div>
      <div className="card">
        <span className="eyebrow">Campanha</span>
        <h1>{campaign.name}</h1>
        <span className="pill">Código de convite: {campaign.code}</span>
        {isGm && (
          <span className="pill" style={{ marginLeft: 8 }}>
            Você é o mestre
          </span>
        )}
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
      <p className="muted">Para abrir a ficha de outro jogador, é preciso o código da ficha — o dono encontra ele no cartão do personagem, na biblioteca.</p>
      <div className="grid grid-2">
        {characters.map((c) => {
          const mine = c.player_id === me
          return (
            <div key={c.id} className="card character-card">
              <div
                className="character-card-link"
                role="button"
                tabIndex={0}
                onClick={() => openCharacter(c)}
                onKeyDown={(e) => e.key === 'Enter' && openCharacter(c)}
              >
                <h4>{c.name}</h4>
                <p className="muted">Nível {c.nivel}</p>
                <span className="pill">{mine ? 'Seu personagem' : c.can_open ? 'Ficha liberada' : '🔒 Pede o código'}</span>
              </div>
              {(mine || isGm) && (
                <button
                  type="button"
                  className="ghost small-action"
                  onClick={() => {
                    setRemoving(c)
                    setActionError(null)
                  }}
                >
                  Tirar da campanha
                </button>
              )}
            </div>
          )
        })}
        {characters.length === 0 && <p className="muted">Nenhum campeão nesta campanha ainda.</p>}
      </div>

      {isGm && (
        <div className="card" style={{ borderColor: 'var(--blood)', marginTop: 30 }}>
          <span className="eyebrow">Zona de perigo</span>
          <h3>Excluir campanha</h3>
          <p className="muted">
            Só você, que criou a campanha, pode excluí-la. Os personagens não são apagados — só ficam sem campanha.
          </p>
          <button
            className="ghost"
            style={{ borderColor: 'var(--blood)', color: 'var(--blood)' }}
            onClick={() => {
              setDeletingCampaign(true)
              setTypedName('')
              setActionError(null)
            }}
          >
            Excluir campanha
          </button>
        </div>
      )}

      {unlocking && (
        <Modal onClose={() => setUnlocking(null)}>
          <h3>Abrir a ficha de {unlocking.name}</h3>
          <p className="muted">Digite o código dessa ficha. Quem criou o personagem encontra ele no cartão, na biblioteca.</p>
          <div className="field">
            <label>Código da ficha</label>
            <input
              value={code}
              onChange={(e) => setCode(formatSheetCodeInput(e.target.value))}
              onKeyDown={(e) => e.key === 'Enter' && code.trim() && !busy && submitUnlock()}
              placeholder="ABCD1234"
              autoFocus
            />
          </div>
          {codeError && <p style={{ color: 'var(--blood)' }}>{codeError}</p>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="primary" onClick={submitUnlock} disabled={busy || !code.trim()}>
              {busy ? 'Verificando...' : 'Abrir ficha'}
            </button>
            <button className="ghost" onClick={() => setUnlocking(null)}>
              Cancelar
            </button>
          </div>
        </Modal>
      )}

      {removing && (
        <Modal onClose={() => setRemoving(null)}>
          <h3>Tirar {removing.name} da campanha?</h3>
          <p className="muted">O personagem não é apagado: ele continua na biblioteca do dono, só deixa de aparecer aqui.</p>
          {actionError && <p style={{ color: 'var(--blood)' }}>{actionError}</p>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="primary" onClick={confirmRemove} disabled={busy}>
              {busy ? 'Tirando...' : 'Tirar da campanha'}
            </button>
            <button className="ghost" onClick={() => setRemoving(null)}>
              Cancelar
            </button>
          </div>
        </Modal>
      )}

      {deletingCampaign && (
        <Modal onClose={() => setDeletingCampaign(false)}>
          <h3>Excluir {campaign.name}?</h3>
          <p className="muted">
            Para confirmar, digite o nome da campanha: <strong style={{ color: 'var(--bone)' }}>{campaign.name}</strong>
          </p>
          <div className="field">
            <input value={typedName} onChange={(e) => setTypedName(e.target.value)} placeholder={campaign.name} autoFocus />
          </div>
          {actionError && <p style={{ color: 'var(--blood)' }}>{actionError}</p>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={confirmDeleteCampaign}
              disabled={busy || typedName.trim() !== campaign.name.trim()}
              style={{ borderColor: 'var(--blood)', background: 'var(--blood)', color: '#fff' }}
            >
              {busy ? 'Excluindo...' : 'Excluir definitivamente'}
            </button>
            <button className="ghost" onClick={() => setDeletingCampaign(false)}>
              Cancelar
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
