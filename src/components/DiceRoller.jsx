import { useState } from 'react'
import { rollExpression } from '../lib/dice.js'

export default function DiceRoller() {
  const [expression, setExpression] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  function roll() {
    const r = rollExpression(expression)
    if (!r) {
      setError('Digite uma expressão válida, ex: 1d5+7+2+1d45-21')
      setResult(null)
      return
    }
    setError(null)
    setResult(r)
  }

  return (
    <div className="card">
      <span className="eyebrow">Rolador de Dados</span>
      <h3>Qualquer expressão (ex: 1d5+7+2+1d45-21)</h3>
      <div style={{ display: 'flex', gap: 10 }}>
        <input
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          placeholder="Ex: 1d20+5"
          onKeyDown={(e) => e.key === 'Enter' && roll()}
        />
        <button className="primary" onClick={roll}>
          Rolar
        </button>
      </div>

      {error && <p style={{ color: 'var(--blood)' }}>{error}</p>}

      {result && (
        <div className="dice-result">
          <span className="total">{result.total}</span>
          <div className="muted">
            {result.parts.map((p, i) => (
              <span key={i}>
                {i > 0 ? (p.sign < 0 ? ' − ' : ' + ') : p.sign < 0 ? '−' : ''}
                {p.type === 'dice' ? `${p.notation} [${p.rolls.join(', ')}]` : p.value}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
