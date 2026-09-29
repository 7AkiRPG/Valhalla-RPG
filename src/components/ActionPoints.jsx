// Pontos de Ação: 3 triângulos vermelhos fixos (padrão de todo personagem)
// + triângulos verdes extras que podem ser adicionados/removidos. Qualquer
// triângulo pode ser clicado pra alternar entre "cheio" (disponível) e
// "vazio" (gasto), mantendo sempre a cor de origem.

function Triangle({ color, up, filled, onClick }) {
  const points = up ? '10,2 18,18 2,18' : '2,2 18,2 10,18'
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" className="ap-triangle" onClick={onClick}>
      <polygon points={points} fill={filled ? color : 'none'} stroke={color} strokeWidth="1.5" />
    </svg>
  )
}

const RED_KEYS = ['red-0', 'red-1', 'red-2']

export default function ActionPoints({ pontosAcao, onChange }) {
  const extra = pontosAcao?.extra || 0
  const toggledOff = pontosAcao?.toggledOff || []

  function toggle(key) {
    const next = toggledOff.includes(key) ? toggledOff.filter((k) => k !== key) : [...toggledOff, key]
    onChange({ ...pontosAcao, toggledOff: next })
  }

  function addExtra() {
    onChange({ ...pontosAcao, extra: extra + 1 })
  }

  function removeExtra() {
    const newExtra = Math.max(0, extra - 1)
    const removedKey = `green-${newExtra}`
    onChange({ ...pontosAcao, extra: newExtra, toggledOff: toggledOff.filter((k) => k !== removedKey) })
  }

  return (
    <div className="ap-track">
      <div className="ap-row">
        {Array.from({ length: extra }).map((_, i) => {
          const key = `green-${i}`
          return (
            <Triangle
              key={key}
              color="#4c9a5a"
              up={i % 2 === 0}
              filled={!toggledOff.includes(key)}
              onClick={() => toggle(key)}
            />
          )
        })}
        {RED_KEYS.map((key, i) => (
          <Triangle
            key={key}
            color="#8c3230"
            up={i % 2 === 0}
            filled={!toggledOff.includes(key)}
            onClick={() => toggle(key)}
          />
        ))}
      </div>

      <div className="ap-row-controls">
        <button type="button" onClick={removeExtra}>
          −
        </button>
        <button type="button" onClick={addExtra}>
          +
        </button>
      </div>
    </div>
  )
}
