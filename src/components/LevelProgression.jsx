import { useState } from 'react'
import { PATHS } from '../data/paths.js'
import { computeDerivedStats, levelUpEffects } from '../lib/statCalc.js'

const ASCENSION_BONUSES = [
  { id: 'resistencia', label: 'Vantagem permanente em um teste de resistência' },
  { id: 'margemCritica', label: 'Margem Crítica +1' },
  { id: 'multiplicador', label: 'Multiplicador Crítico +1' },
]

export default function LevelProgression({ sheet, onChange }) {
  const [resolvingChoice, setResolvingChoice] = useState(null) // 'caminho' | 'talento' | null
  const [choicePathId, setChoicePathId] = useState('')
  const [choiceAbility, setChoiceAbility] = useState('')
  const [newTalentName, setNewTalentName] = useState('')
  const [newTalentDesc, setNewTalentDesc] = useState('')
  const [ascPathId, setAscPathId] = useState('')
  const [ascBonus, setAscBonus] = useState('')

  const ownedPathIds = Object.keys(sheet.paths || {})

  function levelUp() {
    const newLevel = (sheet.nivel || 1) + 1
    const derived = computeDerivedStats({
      nivel: newLevel,
      corpo: sheet.atributos?.corpo,
      mente: sheet.atributos?.mente,
      alma: sheet.atributos?.alma,
      lineageId: sheet.lineageId,
    })

    // Sobe o máximo de cada recurso e cura a diferença ganha
    const resources = { ...sheet.resources }
    for (const [key, novoMax] of Object.entries({ pv: derived.pv, pd: derived.pd, pm: derived.pm })) {
      const antigoMax = sheet.resources?.[key]?.max || 0
      const ganho = Math.max(0, novoMax - antigoMax)
      resources[key] = {
        ...sheet.resources[key],
        max: novoMax,
        current: (sheet.resources?.[key]?.current || 0) + ganho,
      }
    }

    const effects = levelUpEffects(newLevel)

    onChange({
      ...sheet,
      nivel: newLevel,
      derived,
      resources,
      pendingChoicePoints: (sheet.pendingChoicePoints || 0) + (effects.grantsChoicePoint ? 1 : 0),
      pendingAscensions: (sheet.pendingAscensions || 0) + (effects.isAscension ? 1 : 0),
    })
  }

  function resolveCaminho() {
    if (!choicePathId || !choiceAbility) return
    const paths = { ...(sheet.paths || {}) }
    const existing = paths[choicePathId] || { unlockedPatamar: 1, abilities: [] }
    paths[choicePathId] = {
      ...existing,
      abilities: [...existing.abilities, choiceAbility],
    }
    onChange({
      ...sheet,
      paths,
      pendingChoicePoints: Math.max(0, (sheet.pendingChoicePoints || 0) - 1),
    })
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

  // Abilities disponíveis pra escolha de caminho: qualquer caminho, em qualquer
  // patamar já desbloqueado (1 se for caminho novo), excluindo as já escolhidas
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
    <div className="card">
      <span className="eyebrow">Jornada</span>
      <h3>Progressão de Nível</h3>
      <div className="stat-row" style={{ marginBottom: 14 }}>
        <div className="stat-box">
          <span className="value">{sheet.nivel || 1}</span>
          <span className="label">Nível</span>
        </div>
      </div>
      <button className="primary" onClick={levelUp}>
        Subir de nível
      </button>

      {(sheet.pendingChoicePoints > 0 || sheet.pendingAscensions > 0) && (
        <div className="rune-divider">ᛟ</div>
      )}

      {sheet.pendingChoicePoints > 0 && (
        <div className="pending-block">
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

      {sheet.pendingAscensions > 0 && (
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
      )}
    </div>
  )
}
