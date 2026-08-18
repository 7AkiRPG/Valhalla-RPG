// Rolador 2d12 do sistema Valhalla.
//
// Regras:
// - Rola 2d12 e soma.
// - Se os dois dados saírem com o mesmo valor -> crítico.
// - Soma final <= 3 -> falha crítica.
// - Soma final > 3 -> crítico normal (dano máximo em combate).
// - "Crítico de margem": atingido apenas com combinações específicas de
//   modificadores de arma/magia que aumentam a margem de ameaça (ex: a
//   arma define "12,12" como margem). Combinação verificada à parte.
// - Vantagem: dado extra somado ao resultado. Começa em 1d4 e escala até
//   1d10 (1d4 -> 1d6 -> 1d8 -> 1d10) conforme o número de vantagens.

const VANTAGEM_STEPS = [4, 6, 8, 10]

function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1
}

export function rollD12x2({ vantagemNivel = 0 } = {}) {
  const d1 = rollDie(12)
  const d2 = rollDie(12)
  let total = d1 + d2
  let vantagemRolada = null

  if (vantagemNivel > 0) {
    const sides = VANTAGEM_STEPS[Math.min(vantagemNivel, VANTAGEM_STEPS.length) - 1]
    vantagemRolada = rollDie(sides)
    total += vantagemRolada
  }

  const isCritico = d1 === d2
  const isFalhaCritica = total <= 3

  return {
    d1,
    d2,
    vantagemRolada,
    total,
    isCritico,
    isFalhaCritica,
  }
}

// Verifica se a soma dos dois d12 (sem vantagem) bate com a margem crítica
// de uma arma, ex: margemCritica = "12,12" significa que só 12+12 conta.
export function checaMargemCritica(d1, d2, margemCritica) {
  if (!margemCritica || margemCritica === '—') return false
  const partes = margemCritica.split(',').map((n) => parseInt(n.trim(), 10))
  if (partes.length !== 2) return false
  const [a, b] = partes
  return (d1 >= a && d2 >= b) || (d1 >= b && d2 >= a)
}
