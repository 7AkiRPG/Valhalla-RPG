import { LINEAGES } from '../data/lineages.js'
import { PATHS } from '../data/paths.js'

function makeId() {
  return Math.random().toString(36).slice(2, 10)
}

// Personagens criados antes das últimas reformas da ficha têm formatos de
// dados mais antigos (inclusive de quando PV/PD/PM e linhagem ainda eram
// calculados por fórmula). Essa função converte tudo pro formato manual
// atual, sem apagar nada que já existia.
export function normalizeSheet(rawSheet) {
  const sheet = { ...rawSheet }

  sheet.atributos = sheet.atributos || { corpo: 0, mente: 0, alma: 0 }
  sheet.nivel = sheet.nivel || 1

  if (!sheet.resources) {
    sheet.resources = {
      pv: { max: sheet.derived?.pv || 0, current: sheet.derived?.pv || 0, temp: 0 },
      pd: { max: sheet.derived?.pd || 0, current: sheet.derived?.pd || 0, temp: 0 },
      pm: { max: sheet.derived?.pm || 0, current: sheet.derived?.pm || 0, temp: 0 },
    }
  }

  // Linhagem: converte o formato antigo (lineageId/lineageName + habilidades
  // fixas do livro) em lista livre, igual talentos/caminhos
  if (!Array.isArray(sheet.lineagem)) {
    const items = []
    if (sheet.lineageName) {
      items.push({ id: makeId(), nome: sheet.lineageName, descricao: '' })
      const lineageDef = LINEAGES.find((l) => l.id === sheet.lineageId)
      for (const a of lineageDef?.abilities || []) {
        items.push({ id: makeId(), nome: a.name, descricao: a.desc })
      }
    }
    sheet.lineagem = items
  }
  sheet.lineagem = sheet.lineagem.map((l) => (l.id ? l : { ...l, id: makeId() }))

  // Talentos: garante formato de lista livre (com id) — antes podia ser um
  // objeto único {nome, descricao}
  if (!Array.isArray(sheet.talentos)) {
    sheet.talentos = sheet.talento ? [sheet.talento] : []
  }
  sheet.talentos = sheet.talentos.map((t) => (t.id ? t : { ...t, id: makeId() }))

  // Caminhos: converte o formato estruturado antigo (patamares/habilidades
  // por caminho) em lista livre, igual equipamento/magias
  if (!Array.isArray(sheet.caminhos)) {
    const items = []
    if (sheet.paths) {
      for (const [pid, data] of Object.entries(sheet.paths)) {
        const pathDef = PATHS.find((p) => p.id === pid)
        const abilities = (data.abilities || [])
          .map((a) => (typeof a === 'string' ? a : a?.name))
          .filter(Boolean)
        items.push({ id: makeId(), nome: pathDef?.name || pid, descricao: abilities.join(', ') })
      }
    } else if (sheet.pathId) {
      const pathDef = PATHS.find((p) => p.id === sheet.pathId)
      items.push({ id: makeId(), nome: pathDef?.name || sheet.pathId, descricao: '' })
    }
    sheet.caminhos = items
  }
  sheet.caminhos = sheet.caminhos.map((c) => (c.id ? c : { ...c, id: makeId() }))

  // Equipamento: formato antigo { arma, armadura } -> lista
  if (!Array.isArray(sheet.equipamento)) {
    const legacy = sheet.equipamento || {}
    const items = []
    if (legacy.arma) items.push({ id: makeId(), nome: legacy.arma, descricao: '' })
    if (legacy.armadura) items.push({ id: makeId(), nome: legacy.armadura, descricao: '' })
    sheet.equipamento = items
  }

  // Magias: formato antigo { truque, magia } -> lista
  if (!Array.isArray(sheet.magias)) {
    const legacy = sheet.magias || {}
    const items = []
    if (legacy.truque) items.push({ id: makeId(), nome: legacy.truque, descricao: '' })
    if (legacy.magia) items.push({ id: makeId(), nome: legacy.magia, descricao: '' })
    sheet.magias = items
  }
  if (!Array.isArray(sheet.truques)) {
    sheet.truques = []
  }

  // Defesas: formato antigo {base, extra} por campo -> valor único
  const isLegacyShape = sheet.combatStats && typeof sheet.combatStats.rd === 'object'
  if (!sheet.combatStats || isLegacyShape) {
    const legacy = sheet.combatStats || {}
    const collapse = (v) => (v && typeof v === 'object' ? (v.base || 0) + (v.extra || 0) : v || 0)
    sheet.combatStats = {
      rd: legacy.rd !== undefined ? collapse(legacy.rd) : sheet.derived?.rd || 0,
      aparar: collapse(legacy.aparar),
      bloquear: collapse(legacy.bloquear),
      esquivar: collapse(legacy.esquivar),
    }
  }

  if (typeof sheet.anotacoes !== 'string') {
    sheet.anotacoes = ''
  }

  return sheet
}
