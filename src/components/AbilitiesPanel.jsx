import { useState } from 'react'
import { PATHS } from '../data/paths.js'

const ASCENSION_BONUSES = [
  { id: 'resistencia', label: 'Vantagem permanente em um teste de resistência' },
  { id: 'margemCritica', label: 'Margem Crítica +1' },
  { id: 'multiplicador', label: 'Multiplicador Crítico +1' },
]

const ASCENSION_LABELS = {
  resistencia: 'Vantagem em resistência',
  margemCritica: 'Margem Crítica +1',
  multiplicador: 'Multiplicador Crítico +1',
}

export default function AbilitiesPanel({ sheet, onChange }) {
  const [resolvingChoice, setResolvingChoice] = useState(null) // 'caminho' | 'talento' | null
  const [choicePathId, setChoicePathId] = useState('')
  const [choiceAbility, setChoiceAbility] = useState('')
  const [newTalentName, setNewTalentName] = useState('')
  const [newTalentDesc, setNewTalentDesc] = useState('')
  const [ascPathId, setAscPathId] = useState('')
  const [ascBonus, setAscBonus] = useState('')

  const ownedPathIds = Object.keys(sheet.paths || {})

  function resolveCaminho() {
    if (!choicePathId || !choiceAbility) return
    const paths = { ...(sheet.paths || {}) }
    const existing = paths[choicePathId] || { unlockedPatamar: 1, abilities: [] }
    paths[choicePathId] = { ...existing, abilities: [...existing.abilities, choiceAbility] }
    onChange({ ...sheet, paths, pendingChoicePoints: Math.max(0, (sheet.pendingChoicePoints || 0) - 1) })
    setResolvingChoice(null)
    setChoicePathId('')
    setChoiceAbility('')
  }

  function resolveTalento() {
    if (!newTalentName.trim()) return
    onChange({
      ...sheet,
      talentos: [...(sheet.talentos || []), { nome: newTalentName.trim(), descricao: newTalentDesc.trim() }],
      pendingChoicePoints: Math.max(0, (sheet.pendingChoicePoints || 0) - 1),
    })
    setResolvingChoice(null)
    setNewTalentName('')
    setNewTalentDesc('')
  }

  function removeTalento(index) {
    onChange({ ...sheet, talentos: sheet.talentos.filter((_, i) => i !== index) })
  }

  function resolveAscensao() {
    if (!ascPathId || !ascBonus) return
    const paths = { ...(sheet.paths || {}) }
    const existing = paths[ascPathId]
    if (!existing) return
    paths[ascPathId] = { ...existing, unlockedPatamar: Math.min(5, existing.unlockedPatamar + 1) }

    onChange({
      ...sheet,
      paths,
      ascensoes: [...(sheet.ascensoes || []), { nivel: sheet.nivel, pathId: ascPathId, bonus: ascBonus }],
      pendingAscensions: Math.max(0, (sheet.pendingAscensions || 0) - 1),
    })
    setAscPathId('')
    setAscBonus('')
  }

  const pathOptions = PATHS.map((p) => {
    const owned = sheet.paths?.[p.id]
    const maxPatamar = owned ? owned.unlockedPatamar : 1
    const already = new Set(owned?.abilities || [])
    const available = []
    for (let pat = 1; pat <= maxPatamar; pat++) {
      for (const ab of p.patamares[pat] || []) {
        if (!already.has(ab.name)) available.push({ ...ab, patamar: pat })
      }
    }
    return { path: p, available }
  }).filter((o) => o.available.length > 0)

  const chosenPathOptions = pathOptions.find((o) => o.path.id === choicePathId)

  return (
    <>
      <div className="card">
        <h3>Talentos</h3>
        {(sheet.talentos || []).length === 0 && <p className="muted">Nenhum talento ainda.</p>}
        {(sheet.talentos || []).map((t, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
            <p style={{ margin: 0 }}>
              <strong>{t.nome}</strong> — <span className="muted">{t.descricao}</span>
            </p>
            <button className="ghost" onClick={() => removeTalento(i)}>
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="card">
        <h3>Caminhos</h3>
        {ownedPathIds.length === 0 && <p className="muted">Nenhum caminho ainda.</p>}
        {ownedPathIds.map((id) => {
          const path = PATHS.find((p) => p.id === id)
          const owned = sheet.paths[id]
          return (
            <div key={id} style={{ marginBottom: 16 }}>
              <p>
                <strong style={{ color: 'var(--gold-bright)' }}>{path?.name}</strong>{' '}
                <span className="pill">Patamar {owned.unlockedPatamar}</span>
              </p>
              <ul style={{ margin: '6px 0 0 18px', padding: 0, color: 'var(--ash)' }}>
                {owned.abilities.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      {sheet.pendingChoicePoints > 0 && (
        <div className="card" style={{ borderColor: 'var(--gold)' }}>
          <p>
            <strong style={{ color: 'var(--gold-bright)' }}>{sheet.pendingChoicePoints}</strong> ponto(s) pendente(s):
            escolha uma habilidade de caminho ou um novo talento.
          </p>
          {!resolvingChoice && (
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setResolvingChoice('caminho')}>Habilidade de caminho</button>
              <button onClick={() => setResolvingChoice('talento')}>Novo talento</button>
            </div>
          )}

          {resolvingChoice === 'caminho' && (
            <div style={{ marginTop: 12 }}>
              <div className="field">
                <label>Caminho</label>
                <select value={choicePathId} onChange={(e) => { setChoicePathId(e.target.value); setChoiceAbility('') }}>
                  <option value="">Selecione...</option>
                  {pathOptions.map((o) => (
                    <option key={o.path.id} value={o.path.id}>
                      {o.path.name}
                    </option>
                  ))}
                </select>
              </div>
              {chosenPathOptions && (
                <div className="choice-list">
                  {chosenPathOptions.available.map((a) => (
                    <div
                      key={a.name}
                      className={`choice-card ${choiceAbility === a.name ? 'selected' : ''}`}
                      onClick={() => setChoiceAbility(a.name)}
                    >
                      <h4>
                        {a.name} <span className="muted">· {a.patamar}º patamar</span>
                      </h4>
                      <p>{a.desc}</p>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button className="primary" onClick={resolveCaminho} disabled={!choiceAbility}>
                  Confirmar
                </button>
                <button className="ghost" onClick={() => setResolvingChoice(null)}>
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {resolvingChoice === 'talento' && (
            <div style={{ marginTop: 12 }}>
              <div className="field">
                <label>Nome do talento</label>
                <input value={newTalentName} onChange={(e) => setNewTalentName(e.target.value)} />
              </div>
              <div className="field">
                <label>Descrição</label>
                <textarea rows={3} value={newTalentDesc} onChange={(e) => setNewTalentDesc(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="primary" onClick={resolveTalento} disabled={!newTalentName.trim()}>
                  Confirmar
                </button>
                <button className="ghost" onClick={() => setResolvingChoice(null)}>
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="card">
        <h3>Ascensão</h3>

        {sheet.pendingAscensions > 0 ? (
          <div className="pending-block">
            <p>
              <strong style={{ color: 'var(--gold-bright)' }}>{sheet.pendingAscensions}</strong> ascensão(ões)
              pendente(s): desbloqueia automaticamente o próximo patamar de um caminho, e escolha um bônus.
            </p>
            <div className="field">
              <label>Qual caminho desbloqueia o próximo patamar?</label>
              <select value={ascPathId} onChange={(e) => setAscPathId(e.target.value)}>
                <option value="">Selecione...</option>
                {ownedPathIds.map((id) => {
                  const p = PATHS.find((pp) => pp.id === id)
                  const owned = sheet.paths[id]
                  return (
                    <option key={id} value={id} disabled={owned.unlockedPatamar >= 5}>
                      {p?.name} (atual: {owned.unlockedPatamar}º patamar)
                    </option>
                  )
                })}
              </select>
            </div>
            <div className="choice-list">
              {ASCENSION_BONUSES.map((b) => (
                <div
                  key={b.id}
                  className={`choice-card ${ascBonus === b.id ? 'selected' : ''}`}
                  onClick={() => setAscBonus(b.id)}
                >
                  <p style={{ margin: 0 }}>{b.label}</p>
                </div>
              ))}
            </div>
            <button className="primary" style={{ marginTop: 10 }} onClick={resolveAscensao} disabled={!ascPathId || !ascBonus}>
              Confirmar ascensão
            </button>
          </div>
        ) : (
          <p className="muted">Nenhuma ascensão pendente.</p>
        )}

        {(sheet.ascensoes || []).length > 0 && (
          <>
            <div className="rune-divider">ᛟ</div>
            <p className="muted" style={{ marginBottom: 8 }}>Histórico de ascensões:</p>
            <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--ash)' }}>
              {sheet.ascensoes.map((a, i) => (
                <li key={i}>
                  Nível {a.nivel} — {PATHS.find((p) => p.id === a.pathId)?.name}, {ASCENSION_LABELS[a.bonus]}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  )
}
