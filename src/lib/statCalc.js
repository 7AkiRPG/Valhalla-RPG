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

// O que acontece ao alcançar um determinado nível (chamado a cada level up):
// - a cada 4 níveis: ganha 1 ponto pra gastar em habilidade de caminho OU talento
// - a cada 5 níveis: ascensão — desbloqueia automaticamente o próximo patamar
//   de um caminho já possuído, e escolhe 1 bônus (resistência / margem / multiplicador)
export function levelUpEffects(newLevel) {
  return {
    grantsChoicePoint: newLevel % 4 === 0,
    isAscension: newLevel % 5 === 0,
  }
}

export function buildInitialResources(derived) {
  return {
    pv: { max: derived.pv, current: derived.pv, temp: 0 },
    pd: { max: derived.pd, current: derived.pd, temp: 0 },
    pm: { max: derived.pm, current: derived.pm, temp: 0 },
  }
}

// Aplica uma mudança de nível (subir ou descer, de 1 em 1, podendo pular
// vários de uma vez quando o número é editado manualmente). Ao subir,
// cada limiar cruzado concede pontos pendentes normalmente. Ao descer,
// os PV/PD/PM máximos apenas encolhem — pontos e escolhas já feitas não
// são desfeitos, pra não complicar o histórico do personagem.
export function applyLevelChange(sheet, targetLevel) {
  const clampedTarget = Math.max(1, targetLevel)
  let nivel = sheet.nivel || 1
  let pendingChoicePoints = sheet.pendingChoicePoints || 0
  let pendingAscensions = sheet.pendingAscensions || 0
  let resources = sheet.resources

  const direction = clampedTarget > nivel ? 1 : clampedTarget < nivel ? -1 : 0
  while (nivel !== clampedTarget) {
    const nextNivel = nivel + direction
    const derived = computeDerivedStats({
      nivel: nextNivel,
      corpo: sheet.atributos?.corpo,
      mente: sheet.atributos?.mente,
      alma: sheet.atributos?.alma,
      lineageId: sheet.lineageId,
    })

    const nextResources = { ...resources }
    for (const key of ['pv', 'pd', 'pm']) {
      const oldMax = resources[key]?.max || 0
      const newMax = derived[key]
      const delta = newMax - oldMax
      const oldCurrent = resources[key]?.current || 0
      nextResources[key] = {
        ...resources[key],
        max: newMax,
        current: delta > 0 ? oldCurrent + delta : Math.min(oldCurrent, newMax),
      }
    }
    resources = nextResources

    if (direction > 0) {
      const effects = levelUpEffects(nextNivel)
      if (effects.grantsChoicePoint) pendingChoicePoints += 1
      if (effects.isAscension) pendingAscensions += 1
    }

    nivel = nextNivel
  }

  const finalDerived = computeDerivedStats({
    nivel,
    corpo: sheet.atributos?.corpo,
    mente: sheet.atributos?.mente,
    alma: sheet.atributos?.alma,
    lineageId: sheet.lineageId,
  })

  return { ...sheet, nivel, derived: finalDerived, resources, pendingChoicePoints, pendingAscensions }
}

// Aplica uma mudança de atributo (Corpo/Mente/Alma), recalculando PV/PD/PM
// máximos e curando/ajustando o atual proporcionalmente, igual ao level up.
export function applyAttributeChange(sheet, attrKey, newValue) {
  const atributos = { ...sheet.atributos, [attrKey]: Math.max(0, newValue) }
  const derived = computeDerivedStats({
    nivel: sheet.nivel,
    corpo: atributos.corpo,
    mente: atributos.mente,
    alma: atributos.alma,
    lineageId: sheet.lineageId,
  })

  const resources = { ...sheet.resources }
  for (const key of ['pv', 'pd', 'pm']) {
    const oldMax = sheet.resources[key]?.max || 0
    const newMax = derived[key]
    const delta = newMax - oldMax
    const oldCurrent = sheet.resources[key]?.current || 0
    resources[key] = {
      ...sheet.resources[key],
      max: newMax,
      current: delta > 0 ? oldCurrent + delta : Math.min(oldCurrent, newMax),
    }
  }

  return { ...sheet, atributos, derived, resources }
}
