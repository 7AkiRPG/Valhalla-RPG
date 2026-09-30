import { useState } from 'react'

export default function ResourceRing({ label, resource, onChange }) {
  const { current, max } = resource
  const temp = resource.temp && typeof resource.temp === 'object' ? resource.temp : { current: resource.temp || 0, max: resource.temp || 0 }
  const [editingCurrent, setEditingCurrent] = useState(false)
  const [currentDraft, setCurrentDraft] = useState(current)
  const [editingMax, setEditingMax] = useState(false)
  const [maxDraft, setMaxDraft] = useState(max)
  const [editingTempCurrent, setEditingTempCurrent] = useState(false)
  const [tempCurrentDraft, setTempCurrentDraft] = useState(temp.current)
  const [editingTempMax, setEditingTempMax] = useState(false)
  const [tempMaxDraft, setTempMaxDraft] = useState(temp.max)

  const pct = max > 0 ? Math.max(0, Math.min(1, current / max)) : 0
  const r = 42
  const c = 2 * Math.PI * r

  function applyDelta(n) {
    onChange({ ...resource, current: Math.max(0, current + n) })
  }

  function commitCurrent() {
    const n = parseInt(currentDraft, 10)
    if (!isNaN(n) && n >= 0) onChange({ ...resource, current: n })
    setEditingCurrent(false)
  }

  function commitMax() {
    const n = parseInt(maxDraft, 10)
    if (!isNaN(n) && n >= 0) onChange({ ...resource, max: n })
    setEditingMax(false)
  }

  function applyTempDelta(n) {
    const next = Math.max(0, Math.min(temp.max, temp.current + n))
    onChange({ ...resource, temp: { ...temp, current: next } })
  }

  function commitTempCurrent() {
    const n = parseInt(tempCurrentDraft, 10)
    if (!isNaN(n) && n >= 0) onChange({ ...resource, temp: { ...temp, current: Math.min(n, temp.max) } })
    setEditingTempCurrent(false)
  }

  function commitTempMax() {
    const n = parseInt(tempMaxDraft, 10)
    if (!isNaN(n) && n >= 0) onChange({ ...resource, temp: { current: Math.min(temp.current, n), max: n } })
    setEditingTempMax(false)
  }

  const tempPct = temp.max > 0 ? Math.max(0, Math.min(1, temp.current / temp.max)) * 100 : 0

  return (
    <div className="resource">
      <div className="resource-ring-row">
        <button type="button" onClick={() => applyDelta(-1)} aria-label={`Diminuir ${label}`}>
          −
        </button>

        <div className="ring-wrap">
          <svg viewBox="0 0 100 100" className="ring-svg">
            <circle cx="50" cy="50" r={r} className="ring-bg" />
            <circle
              cx="50"
              cy="50"
              r={r}
              className="ring-fill"
              strokeDasharray={c}
              strokeDashoffset={c * (1 - pct)}
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="ring-center ring-center-row">
            {editingCurrent ? (
              <input
                className="ring-current-input"
                type="number"
                autoFocus
                value={currentDraft}
                onChange={(e) => setCurrentDraft(e.target.value)}
                onBlur={commitCurrent}
                onKeyDown={(e) => e.key === 'Enter' && commitCurrent()}
              />
            ) : (
              <span className="ring-current" onClick={() => { setCurrentDraft(current); setEditingCurrent(true) }}>
                {current}
              </span>
            )}
            <span className="ring-slash">/</span>
            {editingMax ? (
              <input
                className="ring-max-input"
                type="number"
                autoFocus
                value={maxDraft}
                onChange={(e) => setMaxDraft(e.target.value)}
                onBlur={commitMax}
                onKeyDown={(e) => e.key === 'Enter' && commitMax()}
              />
            ) : (
              <span className="ring-max" onClick={() => { setMaxDraft(max); setEditingMax(true) }}>
                {max}
              </span>
            )}
          </div>
        </div>

        <button type="button" onClick={() => applyDelta(1)} aria-label={`Aumentar ${label}`}>
          +
        </button>
      </div>

      <span className="label">{label}</span>

      <div className="temp-row">
        <button type="button" onClick={() => applyTempDelta(-1)}>
          −
        </button>
        <div className="temp-track">
          <div className="temp-fill" style={{ width: `${tempPct}%` }} />
          <span className="temp-value">
            {editingTempCurrent ? (
              <input
                className="temp-edit-input"
                type="number"
                autoFocus
                value={tempCurrentDraft}
                onChange={(e) => setTempCurrentDraft(e.target.value)}
                onBlur={commitTempCurrent}
                onKeyDown={(e) => e.key === 'Enter' && commitTempCurrent()}
              />
            ) : (
              <span onClick={() => { setTempCurrentDraft(temp.current); setEditingTempCurrent(true) }}>
                {temp.current}
              </span>
            )}
            {' / '}
            {editingTempMax ? (
              <input
                className="temp-edit-input"
                type="number"
                autoFocus
                value={tempMaxDraft}
                onChange={(e) => setTempMaxDraft(e.target.value)}
                onBlur={commitTempMax}
                onKeyDown={(e) => e.key === 'Enter' && commitTempMax()}
              />
            ) : (
              <span onClick={() => { setTempMaxDraft(temp.max); setEditingTempMax(true) }}>{temp.max}</span>
            )}
            {' temp.'}
          </span>
        </div>
        <button type="button" onClick={() => applyTempDelta(1)}>
          +
        </button>
      </div>
    </div>
  )
}
