import { useState } from 'react'
import { rollD12x2, rollNotation } from '../lib/dice.js'

export default function DiceRoller() {
  const [vantagem, setVantagem] = useState(0)
  const [result, setResult] = useState(null)

  const [notation, setNotation] = useState('')
  const [customResult, setCustomResult] = useState(null)
  const [customError, setCustomError] = useState(null)

  function roll() {
    setResult(rollD12x2({ vantagemNivel: vantagem }))
  }

  function rollCustom() {
    const r = rollNotation(notation)
    if (!r) {
      setCustomError('Notação inválida. Use o formato NdM, ex: 3d6, 1d20.')
      setCustomResult(null)
      return
    }
    setCustomError(null)
    setCustomResult(r)
  }

  return (
    <div className="card">
      <span className="eyebrow">Rolagem do sistema</span>
      <h3>Rolador de Dados (2d12)</h3>

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
        Rolar 2d12
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

      <div className="rune-divider">ᛟ</div>

      <span className="eyebrow">Rolagem livre</span>
      <h3>Qualquer notação (ex: 3d6, 1d20)</h3>
      <div style={{ display: 'flex', gap: 10 }}>
        <input
          value={notation}
          onChange={(e) => setNotation(e.target.value)}
          placeholder="Ex: 3d6"
          onKeyDown={(e) => e.key === 'Enter' && rollCustom()}
        />
        <button className="primary" onClick={rollCustom}>
          Rolar
        </button>
      </div>

      {customError && <p style={{ color: 'var(--blood)' }}>{customError}</p>}

      {customResult && (
        <div className="dice-result">
          <span className="total">{customResult.total}</span>
          <div className="muted">
            {customResult.notation}: {customResult.rolls.join(' + ')}
          </div>
        </div>
      )}
    </div>
  )
}
