import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { usePlayer } from '../lib/PlayerContext.jsx'
import Modal from '../components/Modal.jsx'
import { formatCodeInput } from '../lib/accessCode.js'

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M6 6l1 14h10l1-14" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  )
}

export default function Library() {
  const { identity, loading: identityLoading } = usePlayer()
  const [characters, setCharacters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [deleting, setDeleting] = useState(null)
  const [code, setCode] = useState('')
  const [deleteError, setDeleteError] = useState(null)
  const [busy, setBusy] = useState(false)

  const [copiedId, setCopiedId] = useState(null)
  const [regenerating, setRegenerating] = useState(null)
  const [regenError, setRegenError] = useState(null)

  useEffect(() => {
    if (!identity) return
    let cancelled = false

    async function load() {
      setLoading(true)
      const { data, error } = await supabase
        .from('characters')
        .select('id, name, sheet, created_at, access_code')
        .eq('player_id', identity.playerId)
        .order('created_at', { ascending: false })

      if (cancelled) return
      if (error) setError(error.message)
      else setCharacters(data)
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [identity])

  function openDelete(character) {
    setDeleting(character)
    setCode('')
    setDeleteError(null)
  }

  function closeDelete() {
    setDeleting(null)
    setCode('')
    setDeleteError(null)
  }

  async function confirmDelete() {
    setBusy(true)
    setDeleteError(null)
    const { error } = await supabase.rpc('delete_character', {
      p_character_id: deleting.id,
      p_code: code,
    })
    setBusy(false)
    if (error) {
      setDeleteError(error.message)
      return
    }
    setCharacters((list) => list.filter((c) => c.id !== deleting.id))
    closeDelete()
  }

  async function copyCode(c) {
    try {
      await navigator.clipboard.writeText(c.access_code)
      setCopiedId(c.id)
      setTimeout(() => setCopiedId((cur) => (cur === c.id ? null : cur)), 1500)
    } catch {
      // sem permissão de área de transferência: o código continua visível pra copiar na mão
    }
  }

  async function confirmRegenerate() {
    setBusy(true)
    setRegenError(null)
    const { data, error } = await supabase.rpc('regenerate_character_code', {
      p_character_id: regenerating.id,
    })
    setBusy(false)
    if (error) {
      setRegenError(error.message)
      return
    }
    setCharacters((list) => list.map((c) => (c.id === regenerating.id ? { ...c, access_code: data } : c)))
    setRegenerating(null)
  }

  if (identityLoading) return <div className="card muted">Carregando...</div>

  return (
    <div>
      <div className="card">
        <span className="eyebrow">Sua coleção</span>
        <h2>Biblioteca de Personagens</h2>
        <p className="muted">Estes campeões só são visíveis para você, a menos que estejam vinculados a uma campanha.</p>
        <Link className="btn primary" to="/personagem/novo">
          + Criar novo personagem
        </Link>
      </div>

      {loading && <div className="card muted">Buscando seus campeões...</div>}
      {error && <div className="card">Erro ao carregar: {error}</div>}

      {!loading && characters.length === 0 && (
        <div className="card muted">Nenhum campeão criado ainda. Que tal forjar o primeiro?</div>
      )}

      <div className="grid grid-2">
        {characters.map((c) => (
          <div key={c.id} className="card character-card">
            <Link to={`/personagem/${c.id}`} className="character-card-link">
              <h3>{c.name}</h3>
              <p className="muted">Nível {c.sheet?.nivelAtual ?? c.sheet?.nivel ?? 1}</p>
            </Link>
            <div className="sheet-code-row">
              <span className="label">Código da ficha</span>
              <strong className="sheet-code">{c.access_code}</strong>
              <button type="button" className="ghost small-action" onClick={() => copyCode(c)}>
                {copiedId === c.id ? 'Copiado!' : 'Copiar'}
              </button>
              <button
                type="button"
                className="ghost small-action"
                onClick={() => {
                  setRegenerating(c)
                  setRegenError(null)
                }}
              >
                Gerar outro
              </button>
            </div>
            <button
              type="button"
              className="trash-btn"
              title="Excluir personagem"
              aria-label={`Excluir ${c.name}`}
              onClick={() => openDelete(c)}
            >
              <TrashIcon />
            </button>
          </div>
        ))}
      </div>

      {regenerating && (
        <Modal onClose={() => setRegenerating(null)}>
          <h3>Gerar outro código para {regenerating.name}?</h3>
          <p className="muted">
            O código atual deixa de valer. Quem já tinha aberto essa ficha na campanha perde o acesso e vai precisar
            do código novo.
          </p>
          {regenError && <p style={{ color: 'var(--blood)' }}>{regenError}</p>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="primary" onClick={confirmRegenerate} disabled={busy}>
              {busy ? 'Gerando...' : 'Gerar outro código'}
            </button>
            <button className="ghost" onClick={() => setRegenerating(null)}>
              Cancelar
            </button>
          </div>
        </Modal>
      )}

      {deleting && (
        <Modal onClose={closeDelete}>
          <h3>Excluir {deleting.name}?</h3>
          <p className="muted">
            Isso apaga o personagem para sempre. Para confirmar, digite o seu código do site — o mesmo que
            aparece na página inicial.
          </p>
          <div className="field">
            <label>Código do site</label>
            <input
              value={code}
              onChange={(e) => setCode(formatCodeInput(e.target.value))}
              onKeyDown={(e) => e.key === 'Enter' && code.trim() && !busy && confirmDelete()}
              placeholder="XXXX-XXXX"
              autoFocus
            />
          </div>
          {deleteError && <p style={{ color: 'var(--blood)' }}>{deleteError}</p>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={confirmDelete}
              disabled={busy || !code.trim()}
              style={{ borderColor: 'var(--blood)', background: 'var(--blood)', color: '#fff' }}
            >
              {busy ? 'Excluindo...' : 'Excluir definitivamente'}
            </button>
            <button className="ghost" onClick={closeDelete}>
              Cancelar
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
