// Pontos de Ação: 2 triângulos vermelhos fixos no meio (padrão de todo
// personagem), com triângulos extras dos dois lados que podem ser
// adicionados/removidos — verdes à esquerda, roxos à direita.

function Triangle({ color, up }) {
  const points = up ? '10,2 18,18 2,18' : '2,2 18,2 10,18'
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" className="ap-triangle">
      <polygon points={points} fill={color} />
    </svg>
  )
}

export default function ActionPoints({ pontosAcao, onChange }) {
  const esquerda = pontosAcao?.esquerda || 0
  const direita = pontosAcao?.direita || 0

  return (
    <div className="ap-track">
      <div className="ap-row-controls">
        <button type="button" onClick={() => onChange({ ...pontosAcao, esquerda: esquerda + 1 })}>
          +
        </button>
        <button type="button" onClick={() => onChange({ ...pontosAcao, direita: direita + 1 })}>
          +
        </button>
      </div>

      <div className="ap-row">
        {Array.from({ length: esquerda }).map((_, i) => (
          <Triangle key={`e${i}`} color="#4c9a5a" up={i % 2 === 0} />
        ))}
        <Triangle color="#8c3230" up={true} />
        <Triangle color="#8c3230" up={false} />
        {Array.from({ length: direita }).map((_, i) => (
          <Triangle key={`d${i}`} color="#7a5ac9" up={i % 2 === 0} />
        ))}
      </div>

      <div className="ap-row-controls">
        <button type="button" onClick={() => onChange({ ...pontosAcao, esquerda: Math.max(0, esquerda - 1) })}>
          −
        </button>
        <button type="button" onClick={() => onChange({ ...pontosAcao, direita: Math.max(0, direita - 1) })}>
          −
        </button>
      </div>
    </div>
  )
}
