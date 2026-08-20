function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1
}

// Rolagem livre por expressão, ex: "1d5+7+2+1d45-21".
// Aceita quantos termos de dados (NdM) e números fixos forem digitados,
// somados ou subtraídos em qualquer combinação.
export function rollExpression(expression) {
  const cleaned = String(expression || '').replace(/\s+/g, '').toLowerCase()
  if (!cleaned) return null

  const tokenRegex = /([+-]?)(\d*d\d+|\d+)/g
  let match
  let matchedAny = false
  let total = 0
  const parts = []

  while ((match = tokenRegex.exec(cleaned)) !== null) {
    matchedAny = true
    const sign = match[1] === '-' ? -1 : 1
    const term = match[2]

    if (term.includes('d')) {
      const [countRaw, sidesRaw] = term.split('d')
      const count = Math.min(100, Math.max(1, countRaw === '' ? 1 : parseInt(countRaw, 10)))
      const sides = Math.max(1, parseInt(sidesRaw, 10))
      const rolls = []
      for (let i = 0; i < count; i++) rolls.push(rollDie(sides))
      const subtotal = rolls.reduce((a, b) => a + b, 0)
      total += sign * subtotal
      parts.push({ type: 'dice', sign, notation: `${count}d${sides}`, rolls })
    } else {
      const value = parseInt(term, 10)
      total += sign * value
      parts.push({ type: 'flat', sign, value })
    }
  }

  if (!matchedAny) return null
  return { expression: cleaned, total, parts }
}
