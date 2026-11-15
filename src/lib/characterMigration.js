import { LINEAGES } from '../data/lineages.js'
import { PATHS } from '../data/paths.js'

function makeId() {
  return Math.random().toString(36).slice(2, 10)
}

export function normalizeSheet(rawSheet) {
  const sheet = { ...rawSheet }

  const oldAtributos = sheet.atributos || {}
  sheet.atributos = {
    corpo: oldAtributos.corpo || 0,
    mente: oldAtributos.mente || 0,
    alma: oldAtributos.alma || 0,
    nucleo: oldAtributos.nucleo || 0,
  }

  // Assimilação isolada dos atributos principais (0 a 5 estrelas)
  if (sheet.assimilacao === undefined) {
    sheet.assimilacao = oldAtributos.assimilacao || 0
  }

  const guardados = { ...(sheet.atributosAntigos || {}) }
  for (const k of ['rituais', 'selos', 'sigilos', 'assimilacao']) {
    if (oldAtributos[k] && guardados[k] === undefined) guardados[k] = oldAtributos[k]
  }
  if (Object.keys(guardados).length > 0) sheet.atributosAntigos = guardados

  if (sheet.nivelAtual === undefined || sheet.nivelTotal === undefined) {
    const legacyNivel = sheet.nivel || 1
    sheet.nivelAtual = sheet.nivelAtual ?? legacyNivel
    sheet.nivelTotal = sheet.nivelTotal ?? legacyNivel
  }

  if (!sheet.resources) {
    sheet.resources = {
      pv: { max: sheet.derived?.pv || 0, current: sheet.derived?.pv || 0, temp: { current: 0, max: 0 } },
      pd: { max: sheet.derived?.pd || 0, current: sheet.derived?.pd || 0, temp: { current: 0, max: 0 } },
      pm: { max: sheet.derived?.pm || 0, current: sheet.derived?.pm || 0, temp: { current: 0, max: 0 } },
    }
  }

  for (const key of ['pv', 'pd', 'pm']) {
    const res = sheet.resources[key]
    if (res && typeof res.temp !== 'object') {
      const oldTemp = res.temp || 0
      res.temp = { current: oldTemp, max: oldTemp }
    }
  }

  if (!Array.isArray(sheet.habilidades)) {
    const items = []
    if (Array.isArray(sheet.lineagem)) {
      items.push(...sheet.lineagem)
    } else if (sheet.lineageName) {
      items.push({ id: makeId(), nome: sheet.lineageName, descricao: '' })
      const lineageDef = LINEAGES.find((l) => l.id === sheet.lineageId)
      for (const a of lineageDef?.abilities || []) {
        items.push({ id: makeId(), nome: a.name, descricao: a.desc })
      }
    }
    if (Array.isArray(sheet.talentos)) {
      items.push(...sheet.talentos)
    }
    sheet.habilidades = items
  }
  sheet.habilidades = sheet.habilidades.map((h) => (h.id ? h : { ...h, id: makeId() }))

  if (!Array.isArray(sheet.equipamento)) {
    sheet.equipamento = []
  }

  if (!Array.isArray(sheet.magiasUnificadas)) {
    sheet.magiasUnificadas = []
  }

  const legacyCombat = sheet.combatStats || {}
  const collapseToText = (v) => {
    if (v === undefined || v === null) return ''
    if (typeof v === 'object') return String((v.base || 0) + (v.extra || 0))
    return String(v)
  }
  if (typeof sheet.combatStats?.aparar !== 'string') {
    sheet.combatStats = {
      aparar: collapseToText(legacyCombat.aparar),
      bloquear: collapseToText(legacyCombat.bloquear),
      esquivar: collapseToText(legacyCombat.esquivar),
      resistencias: collapseToText(legacyCombat.resistencias),
    }
  }

  if (!sheet.pontosAcao || sheet.pontosAcao.extra === undefined) {
    sheet.pontosAcao = { extra: 0, toggledOff: [] }
  }

  if (!sheet.pericias) {
    sheet.pericias = {}
  }

  if (!Array.isArray(sheet.inventario)) {
    sheet.inventario = []
  }

  return sheet
}
