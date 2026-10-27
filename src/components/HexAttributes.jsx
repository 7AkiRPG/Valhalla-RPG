import { useState } from 'react'

// Gráfico de atributos: um polígono com tantos lados quanto atributos
// (hoje 5 = pentágono). Pra mudar a lista, é só editar ATTRS.
const ATTRS = [
  { key: 'corpo', label: 'Corpo' },
  { key: 'mente', label: 'Mente' },
  { key: 'alma', label: 'Alma' },
  { key: 'nucleo', label: 'Núcleo' },
  { key: 'assimilacao', label: 'Assimilação' },
]

const SIDES = ATTRS.length
const STEP = 360 / SIDES
// Posições ao redor do polígono (ângulos partindo do topo, sentido horário)
const ANGLES = ATTRS.map((_, i) => -90 + STEP * i)

// O pentágono tem ponta em cima e base achatada: desce o centro um pouco
// pra figura ficar centralizada na caixa (200x200 no SVG, 260px na tela).
const CENTER_Y = 108
const LABEL_SHIFT_PX = (CENTER_Y - 100) * (260 / 200)

function posForAngle(deg, radius) {
  const rad = (deg * Math.PI) / 180
  return {
    left: `calc(50% + ${Math.cos(rad) * radius}px)`,
    top: `calc(50% + ${Math.sin(rad) * radius + LABEL_SHIFT_PX}px)`,
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
    const angle = (Math.PI / 180) * ANGLES[i]
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
            points={ringPoints(100, CENTER_Y, r)}
            className="hex-ring"
          />
        ))}
        <polygon points={radarPoints(100, CENTER_Y, 86, atributos, scaleMax)} className="hex-radar" />
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

function ringPoints(cx, cy, r) {
  return ANGLES.map((deg) => {
    const angle = (Math.PI / 180) * deg
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
  }).join(' ')
}
