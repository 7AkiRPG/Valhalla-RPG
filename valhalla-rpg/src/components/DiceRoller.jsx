import { useState } from 'react'
import { rollD12x2 } from '../lib/dice.js'

export default function DiceRoller() {
  const [vantagem, setVantagem] = useState(0)
  const [result, setResult] = useState(null)

  function roll() {
    setResult(rollD12x2({ vantagemNivel: vantagem }))
  }

  return (
    <div className="card">
      <span className="eyebrow">Rolagem 2d12</span>
      <h3>Rolador de Dados</h3>

      <div className="field">
        <label>Nível de vantagem (0 a 4)</label>
        <select value={vantagem} onChange={(e) => setVantagem(Number(e.target.value))}>
          <option value={0}>Sem vantagem</option>
          <option value={1}>Vantagem +1d4</option>
          <option value={2}>Vantagem +1d6</option>
          <option value={3}>Vantagem +1d8</option>
          <option value={4}>Vantagem +1d10</option>
        </select>
      </div>

      <button className="primary" onClick={roll}>
        Rolar
      </button>

      {result && (
        <div className="dice-result">
          <span className="total">{result.total}</span>
          <div className="muted">
            d12: {result.d1} + {result.d2}
            {result.vantagemRolada !== null ? ` + ${result.vantagemRolada} (vantagem)` : ''}
          </div>
          {result.isCritico && <div className="tag tag-critico">★ Crítico ★</div>}
          {result.isFalhaCritica && <div className="tag tag-falha">Falha crítica</div>}
        </div>
      )}
    </div>
  )
}
