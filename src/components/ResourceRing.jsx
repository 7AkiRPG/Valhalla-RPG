import { useState } from 'react'

export default function ResourceRing({ label, resource, onChange }) {
  const { current, max, temp } = resource
  const [editingCurrent, setEditingCurrent] = useState(false)
  const [currentDraft, setCurrentDraft] = useState(current)
  const [editingMax, setEditingMax] = useState(false)
  const [maxDraft, setMaxDraft] = useState(max)

  const pct = max > 0 ? Math.max(0, Math.min(1, current / max)) : 0
  const r = 42
  const c = 2 * Math.PI * r

  function applyDelta(n) {
    const next = Math.max(0, current + n)
    onChange({ ...resource, current: next })
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

  function applyTemp(n) {
    const next = Math.max(0, temp + n)
    onChange({ ...resource, temp: next })
  }

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
        <button type="button" onClick={() => applyTemp(-1)}>
          −
        </button>
        <div className="temp-track">
          <div className="temp-fill" style={{ width: `${Math.min(100, temp * 10)}%` }} />
          <span className="temp-value">{temp} temp.</span>
        </div>
        <button type="button" onClick={() => applyTemp(1)}>
          +
        </button>
      </div>
    </div>
  )
}
