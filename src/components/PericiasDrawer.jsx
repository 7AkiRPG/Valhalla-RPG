import { useState } from 'react'
import { SKILL_CATEGORIES } from '../data/skills.js'

export default function PericiasDrawer({ pericias, onChange }) {
  const [open, setOpen] = useState(false)

  function setValue(skillId, value) {
    const n = value === '' ? '' : Number(value)
    onChange({ ...pericias, [skillId]: n })
  }

  return (
    <>
      <button type="button" className="drawer-handle drawer-handle-bottom" onClick={() => setOpen((o) => !o)}>
        {open ? '▼ Fechar Perícias' : '▲ Perícias'}
      </button>

      <div className={`drawer-panel drawer-panel-bottom ${open ? 'drawer-open' : ''}`}>
        <div className="drawer-panel-inner">
          <h2>Perícias</h2>
          {SKILL_CATEGORIES.map((cat) => (
            <div key={cat.id} className="skill-category">
              <h3>{cat.name}</h3>
              <div className="skill-grid">
                {cat.skills.map((s) => (
                  <div className="skill-row" key={s.id} title={s.desc}>
                    <span className="skill-name">{s.name}</span>
                    <input
                      type="number"
                      value={pericias?.[s.id] ?? ''}
                      onChange={(e) => setValue(s.id, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
