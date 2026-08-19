const FIELDS = [
  { key: 'rd', label: 'RD' },
  { key: 'aparar', label: 'Aparar' },
  { key: 'bloquear', label: 'Bloquear' },
  { key: 'esquivar', label: 'Esquivar' },
]

export default function CombatStats({ combatStats, onChange }) {
  function updateField(key, part, value) {
    const n = value === '' ? '' : Number(value)
    onChange({
      ...combatStats,
      [key]: { ...combatStats[key], [part]: n },
    })
  }

  return (
    <div className="card">
      <h3>Defesas</h3>
      <div className="combat-stats-grid">
        {FIELDS.map((f) => (
          <div className="combat-stat" key={f.key}>
            <span className="label">{f.label}</span>
            <div className="combat-stat-boxes">
              <input
                type="number"
                className="combat-stat-base"
                value={combatStats[f.key]?.base ?? ''}
                onChange={(e) => updateField(f.key, 'base', e.target.value)}
              />
              <input
                type="number"
                className="combat-stat-extra"
                value={combatStats[f.key]?.extra ?? ''}
                onChange={(e) => updateField(f.key, 'extra', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
