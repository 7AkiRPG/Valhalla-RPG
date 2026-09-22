import { useState } from 'react'

export default function ResourceCircle({ label, resource, onChange }) {
  const { current, max } = resource
  const [editingCurrent, setEditingCurrent] = useState(false)
  const [currentDraft, setCurrentDraft] = useState(current)
  const [editingMax, setEditingMax] = useState(false)
  const [maxDraft, setMaxDraft] = useState(max)

  function applyDelta(n) {
    onChange({ ...resource, current: Math.max(0, current + n) })
  }

  function commitCurrent() {
    const n = parseInt(currentDraft, 10)
    if (!isNaN(n) && n >= 0) onChange({ ...resource, current: n })
    setEditingCurrent(false)
  }

  function applyMaxDelta(n) {
    onChange({ ...resource, max: Math.max(0, max + n) })
  }

  function commitMax() {
    const n = parseInt(maxDraft, 10)
    if (!isNaN(n) && n >= 0) onChange({ ...resource, max: n })
    setEditingMax(false)
  }

  return (
    <div className="resource-plain">
      <div className="resource-plain-row">
        <button type="button" onClick={() => applyDelta(-1)}>
          −
        </button>
        <div className="plain-circle">
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
            <span onClick={() => { setCurrentDraft(current); setEditingCurrent(true) }}>{current}</span>
          )}
        </div>
        <button type="button" onClick={() => applyDelta(1)}>
          +
        </button>
      </div>

      <span className="label">{label}</span>

      <div className="max-line-row">
        <button type="button" onClick={() => applyMaxDelta(-1)}>
          −
        </button>
        <div className="max-line">
          {editingMax ? (
            <input
              className="ring-current-input"
              type="number"
              autoFocus
              value={maxDraft}
              onChange={(e) => setMaxDraft(e.target.value)}
              onBlur={commitMax}
              onKeyDown={(e) => e.key === 'Enter' && commitMax()}
            />
          ) : (
            <span onClick={() => { setMaxDraft(max); setEditingMax(true) }}>{max}</span>
          )}
        </div>
        <button type="button" onClick={() => applyMaxDelta(1)}>
          +
        </button>
      </div>
    </div>
  )
}
