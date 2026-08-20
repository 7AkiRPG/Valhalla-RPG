import { useState } from 'react'

export default function LevelDial({ nivel, onChange }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(nivel))
  const r = 42
  const c = 2 * Math.PI * r

  function commit() {
    const n = parseInt(draft, 10)
    if (!isNaN(n) && n >= 1) onChange(n)
    else setDraft(String(nivel))
    setEditing(false)
  }

  return (
    <div className="level-dial">
      <button type="button" onClick={() => onChange(nivel + 1)} aria-label="Subir nível">
        +
      </button>

      <div className="ring-wrap level-dial-ring">
        <svg viewBox="0 0 100 100" className="ring-svg">
          <circle cx="50" cy="50" r={r} className="ring-bg" />
          <circle cx="50" cy="50" r={r} className="ring-fill" strokeDasharray={c} strokeDashoffset={0} transform="rotate(-90 50 50)" />
        </svg>
        <div className="ring-center">
          {editing ? (
            <input
              className="ring-current-input"
              type="number"
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => e.key === 'Enter' && commit()}
            />
          ) : (
            <span className="ring-current" onClick={() => { setDraft(String(nivel)); setEditing(true) }}>
              {nivel}
            </span>
          )}
        </div>
      </div>

      <button type="button" onClick={() => onChange(Math.max(1, nivel - 1))} aria-label="Descer nível">
        −
      </button>
    </div>
  )
}
