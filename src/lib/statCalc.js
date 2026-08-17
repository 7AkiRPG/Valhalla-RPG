import { computeMaxHp } from '../data/lineages.js'

// PDs = 5 + Nível + (Mente x Nível)
// PMs = 5 + Nível + (Alma x Nível)
// Corpo -> 1 RD por ponto
// Mente -> 1 espaço de magia por ponto
// Alma  -> soma no Bônus Arcano

export function computeDerivedStats({ nivel, corpo, mente, alma, lineageId }) {
  const nivelSeguro = Math.max(1, nivel || 1)
  const pv = computeMaxHp(lineageId, nivelSeguro, corpo || 0)
  const pd = 5 + nivelSeguro + (mente || 0) * nivelSeguro
  const pm = 5 + nivelSeguro + (alma || 0) * nivelSeguro
  const rd = corpo || 0
  const espacosMagia = mente || 0
  const bonusArcanoBase = alma || 0

  return { pv, pd, pm, rd, espacosMagia, bonusArcanoBase, nivel: nivelSeguro }
}

// Pontos de atributo disponíveis por nível, seguindo a progressão:
// Nível 1: base (3 pontos distribuídos na criação, máx 2 num atributo)
// A cada 3 níveis: +1 atributo normal e +1 atributo de conjuração
export function attributePointsForLevel(nivel) {
  return Math.floor((nivel || 1) / 3)
}

// A cada 4 níveis: +1 caminho ou talento
export function pathsOrTalentsForLevel(nivel) {
  return Math.floor((nivel || 1) / 4)
}

// A cada 2 níveis: +1 espaço de magia (magias, não truques)
export function spellSlotsForLevel(nivel) {
  return 1 + Math.floor((nivel || 1) / 2)
}

// Nível divisível por 5: ascensão
export function ascensionsForLevel(nivel) {
  return Math.floor((nivel || 1) / 5)
}
