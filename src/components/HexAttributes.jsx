import { useState } from 'react'

const ATTRS = [
  { key: 'corpo', label: 'Corpo' },
  { key: 'mente', label: 'Mente' },
  { key: 'alma', label: 'Alma' },
  { key: 'rituais', label: 'Rituais' },
  { key: 'selos', label: 'Selos' },
  { key: 'sigilos', label: 'Sigilos' },
]

// Posições ao redor de um hexágono (ângulos partindo do topo, sentido horário)
const ANGLES = [-90, -30, 30, 90, 150, 210]

function posForAngle(deg, radius) {
  const rad = (deg * Math.PI) / 180
  return {
    left: `calc(50% + ${Math.cos(rad) * radius}px)`,
    top: `calc(50% + ${Math.sin(rad) * radius}px)`,
  }
}

function AttrBadge({ label, value, onChange }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(value ?? 0))

  function commit() {
    const n = parseInt(draft, 10)
    onChange(isNaN(n) ? 0 : n)
    setEditing(false)
  }

  return (
    <div className="hex-attr-badge">
      <span className="hex-attr-label">{label}</span>
      {editing ? (
        <input
          autoFocus
          className="hex-attr-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === 'Enter' && commit()}
        />
      ) : (
        <span
          className="hex-attr-value"
          onClick={() => {
            setDraft(String(value ?? 0))
            setEditing(true)
          }}
        >
          {value ?? 0}
        </span>
      )}
    </div>
  )
}

// Escala do gráfico: acompanha o maior atributo atual, com um piso de 10
// pra personagens com valores baixos não ficarem todos "no talo".
function radarScale(atributos) {
  const values = ATTRS.map((a) => atributos?.[a.key] || 0)
  return Math.max(10, ...values)
}

function radarPoints(cx, cy, maxRadius, atributos, scaleMax) {
  return ATTRS.map((a, i) => {
    const angle = (Math.PI / 180) * (60 * i - 90)
    const value = Math.max(0, atributos?.[a.key] || 0)
    const frac = Math.min(1, value / scaleMax)
    const r = frac * maxRadius
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
  }).join(' ')
}

export default function HexAttributes({ atributos, onChange }) {
  const scaleMax = radarScale(atributos)

  return (
    <div className="hex-wrap">
      <svg viewBox="0 0 200 200" className="hex-svg">
        {[86, 68, 50, 32].map((r) => (
          <polygon
            key={r}
            points={hexPoints(100, 100, r)}
            className="hex-ring"
          />
        ))}
        <polygon points={radarPoints(100, 100, 86, atributos, scaleMax)} className="hex-radar" />
      </svg>
      {ATTRS.map((a, i) => {
        const pos = posForAngle(ANGLES[i], 118)
        return (
          <div className="hex-attr-pos" style={pos} key={a.key}>
            <AttrBadge
              label={a.label}
              value={atributos?.[a.key]}
              onChange={(v) => onChange({ ...atributos, [a.key]: v })}
            />
          </div>
        )
      })}
    </div>
  )
}

function hexPoints(cx, cy, r) {
  const pts = []
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 90)
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`)
  }
  return pts.join(' ')
}
