import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { usePlayer } from '../lib/PlayerContext.jsx'
import { LINEAGES } from '../data/lineages.js'
import { PATHS } from '../data/paths.js'
import { CONJURATION_STYLES } from '../data/equipment.js'
import { computeDerivedStats, buildInitialResources } from '../lib/statCalc.js'

const STEPS = ['Nome & Atributos', 'Conjuração', 'Linhagem', 'Caminho', 'Talento', 'Revisão']
const ATTR_POINTS_START = 3
const ATTR_MAX_START = 2

export default function CharacterCreate() {
  const { identity } = usePlayer()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [name, setName] = useState('')
  const [attrs, setAttrs] = useState({ corpo: 0, mente: 0, alma: 0 })
  const [conjStyle, setConjStyle] = useState(null)
  const [lineageId, setLineageId] = useState(null)
  const [pathId, setPathId] = useState(null)
  const [chosenAbilityName, setChosenAbilityName] = useState(null)
  const [talentName, setTalentName] = useState('')
  const [talentDesc, setTalentDesc] = useState('')

  const attrPointsUsed = attrs.corpo + attrs.mente + attrs.alma
  const attrPointsLeft = ATTR_POINTS_START - attrPointsUsed

  const derived = useMemo(
    () => computeDerivedStats({ nivel: 1, corpo: attrs.corpo, mente: attrs.mente, alma: attrs.alma, lineageId }),
    [attrs, lineageId]
  )

  const selectedPath = PATHS.find((p) => p.id === pathId)

  function bumpAttr(key, delta) {
    setAttrs((prev) => {
      const next = { ...prev, [key]: prev[key] + delta }
      if (next[key] < 0) return prev
      if (next[key] > ATTR_MAX_START) return prev
      if (attrPointsUsed + delta > ATTR_POINTS_START) return prev
      return next
    })
  }

  function canAdvance() {
    switch (step) {
      case 0:
        return name.trim().length > 0 && attrPointsLeft === 0
      case 1:
        return !!conjStyle
      case 2:
        return !!lineageId
      case 3:
        return !!pathId && !!chosenAbilityName
      case 4:
        return talentName.trim().length > 0
      default:
        return true
    }
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const lineage = LINEAGES.find((l) => l.id === lineageId)

      const sheet = {
        nivel: 1,
        atributos: attrs,
        conjuracaoEstilo: conjStyle,
        lineageId,
        lineageName: lineage?.name,
        paths: {
          [pathId]: {
            unlockedPatamar: 1,
            abilities: [{ patamar: 1, name: chosenAbilityName }],
          },
        },
        talentos: [{ nome: talentName, descricao: talentDesc }],
        pendingChoicePoints: 0,
        pendingAscensions: 0,
        ascensoes: [],
        equipamento: [],
        magias: [],
        resources: buildInitialResources(derived),
        derived,
        pontosAcao: 3,
      }

      const { data, error } = await supabase
        .from('characters')
        .insert({ player_id: identity.playerId, name: name.trim(), sheet })
        .select('id')
        .single()

      if (error) throw error
      navigate(`/personagem/${data.id}`)
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="card">
        <span className="eyebrow">
          Passo {step + 1} de {STEPS.length}
        </span>
        <h2>{STEPS[step]}</h2>
      </div>

      {step === 0 && (
        <div className="card">
          <div className="field">
            <label>Nome do campeão</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Ragnar do Norte" />
          </div>

          <p className="muted">
            Distribua {ATTR_POINTS_START} pontos entre Corpo, Mente e Alma (máx. {ATTR_MAX_START} em cada). Restam:{' '}
            <strong style={{ color: 'var(--gold-bright)' }}>{attrPointsLeft}</strong>
          </p>

          <div className="stat-row">
            {['corpo', 'mente', 'alma'].map((key) => (
              <div className="stat-box" key={key}>
                <span className="value">{attrs[key]}</span>
                <span className="label">{key}</span>
                <div style={{ marginTop: 8, display: 'flex', gap: 6, justifyContent: 'center' }}>
                  <button type="button" onClick={() => bumpAttr(key, -1)}>
                    −
                  </button>
                  <button type="button" onClick={() => bumpAttr(key, 1)}>
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="card">
          <p className="muted">Como seu campeão encara o Arcano? Qual foi a relação dele com a magia?</p>
          <div className="choice-list">
            {CONJURATION_STYLES.map((s) => (
              <div
                key={s.id}
                className={`choice-card ${conjStyle === s.id ? 'selected' : ''}`}
                onClick={() => setConjStyle(s.id)}
              >
                <h4>{s.name}</h4>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card">
          <p className="muted">Escolha a linhagem do seu campeão.</p>
          <div className="choice-list">
            {LINEAGES.map((l) => (
              <div
                key={l.id}
                className={`choice-card ${lineageId === l.id ? 'selected' : ''}`}
                onClick={() => setLineageId(l.id)}
              >
                <h4>{l.name}</h4>
                {l.abilities.map((a) => (
                  <p key={a.name}>
                    <strong>{a.name}</strong> — {a.desc}
                  </p>
                ))}
                {l.abilities.length === 0 && <p className="muted">Habilidades a definir.</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card">
          <p className="muted">Escolha o caminho inicial do seu campeão.</p>
          <div className="choice-list">
            {PATHS.map((p) => (
              <div
                key={p.id}
                className={`choice-card ${pathId === p.id ? 'selected' : ''}`}
                onClick={() => {
                  setPathId(p.id)
                  setChosenAbilityName(null)
                }}
              >
                <h4>{p.name}</h4>
              </div>
            ))}
          </div>

          {selectedPath && (
            <>
              <div className="rune-divider">ᛟ</div>
              <p className="muted">Agora escolha 1 habilidade do 1º patamar de {selectedPath.name}.</p>
              <div className="choice-list">
                {selectedPath.patamares[1].map((a) => (
                  <div
                    key={a.name}
                    className={`choice-card ${chosenAbilityName === a.name ? 'selected' : ''}`}
                    onClick={() => setChosenAbilityName(a.name)}
                  >
                    <h4>{a.name}</h4>
                    <p>{a.desc}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="card">
          <p className="muted">
            Crie um talento único para seu campeão. Ele pode ter limitações e fraquezas em troca de ser mais
            poderoso.
          </p>
          <div className="field">
            <label>Nome do talento</label>
            <input value={talentName} onChange={(e) => setTalentName(e.target.value)} />
          </div>
          <div className="field">
            <label>Descrição, efeito e limitações</label>
            <textarea rows={5} value={talentDesc} onChange={(e) => setTalentDesc(e.target.value)} />
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="card">
          <h3>{name || 'Campeão sem nome'}</h3>
          <p className="muted">
            {LINEAGES.find((l) => l.id === lineageId)?.name} · Caminho de {selectedPath?.name} ({chosenAbilityName})
          </p>
          <div className="stat-row">
            <div className="stat-box">
              <span className="value">{derived.pv}</span>
              <span className="label">PV</span>
            </div>
            <div className="stat-box">
              <span className="value">{derived.pd}</span>
              <span className="label">PD</span>
            </div>
            <div className="stat-box">
              <span className="value">{derived.pm}</span>
              <span className="label">PM</span>
            </div>
            <div className="stat-box">
              <span className="value">{derived.rd}</span>
              <span className="label">RD</span>
            </div>
          </div>
          {error && <p style={{ color: 'var(--blood)' }}>{error}</p>}
          <div style={{ marginTop: 16 }}>
            <button className="primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Forjando...' : 'Salvar campeão'}
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
        <button className="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          Voltar
        </button>
        {step < STEPS.length - 1 && (
          <button className="primary" onClick={() => setStep((s) => s + 1)} disabled={!canAdvance()}>
            Avançar
          </button>
        )}
      </div>
    </div>
  )
}
