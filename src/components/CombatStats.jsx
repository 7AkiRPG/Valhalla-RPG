const FIELDS = [
  { key: 'rd', label: 'RD' },
  { key: 'aparar', label: 'Aparar' },
  { key: 'bloquear', label: 'Bloquear' },
  { key: 'esquivar', label: 'Esquivar' },
]

export default function CombatStats({ combatStats, onChange }) {
  function updateField(key, value) {
    const n = value === '' ? '' : Number(value)
    onChange({ ...combatStats, [key]: n })
  }

  return (
    <div className="combat-stats-grid">
      {FIELDS.map((f) => (
        <div className="combat-stat" key={f.key}>
          <span className="label">{f.label}</span>
          <input
            type="number"
            value={combatStats[f.key] ?? ''}
            onChange={(e) => updateField(f.key, e.target.value)}
          />
        </div>
      ))}
    </div>
  )
}
