import { LINEAGES } from '../data/lineages.js'
import { PATHS } from '../data/paths.js'

function makeId() {
  return Math.random().toString(36).slice(2, 10)
}

// Personagens criados antes das últimas reformas da ficha têm formatos de
// dados mais antigos. Essa função converte tudo pro formato atual (6
// atributos, nível atual/total, habilidades e magias unificadas, defesas em
// texto, pontos de ação, perícias e inventário com forma), sem apagar nada
// que já existia.
export function normalizeSheet(rawSheet) {
  const sheet = { ...rawSheet }

  // Atributos: agora são 6 (Corpo, Mente, Alma, Rituais, Selos, Sigilos)
  const oldAtributos = sheet.atributos || {}
  sheet.atributos = {
    corpo: oldAtributos.corpo || 0,
    mente: oldAtributos.mente || 0,
    alma: oldAtributos.alma || 0,
    rituais: oldAtributos.rituais || 0,
    selos: oldAtributos.selos || 0,
    sigilos: oldAtributos.sigilos || 0,
  }

  // Nível: antes era um valor único, agora são dois (Atual e Total)
  if (sheet.nivelAtual === undefined || sheet.nivelTotal === undefined) {
    const legacyNivel = sheet.nivel || 1
    sheet.nivelAtual = sheet.nivelAtual ?? legacyNivel
    sheet.nivelTotal = sheet.nivelTotal ?? legacyNivel
  }

  if (!sheet.resources) {
    sheet.resources = {
      pv: { max: sheet.derived?.pv || 0, current: sheet.derived?.pv || 0, temp: 0 },
      pd: { max: sheet.derived?.pd || 0, current: sheet.derived?.pd || 0, temp: 0 },
      pm: { max: sheet.derived?.pm || 0, current: sheet.derived?.pm || 0, temp: 0 },
    }
  }

  // Habilidades: unifica linhagem + talentos + caminhos numa lista só
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
    } else if (sheet.talento) {
      items.push(sheet.talento)
    }

    if (Array.isArray(sheet.caminhos)) {
      items.push(...sheet.caminhos)
    } else if (sheet.paths) {
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

    sheet.habilidades = items
  }
  sheet.habilidades = sheet.habilidades.map((h) => (h.id ? h : { ...h, id: makeId() }))

  // Equipamento: formato antigo { arma, armadura } -> lista (mantido como
  // referência antes de virar itens do inventário, se ainda não migrado)
  if (!Array.isArray(sheet.equipamento)) {
    const legacy = sheet.equipamento || {}
    const items = []
    if (legacy.arma) items.push({ id: makeId(), nome: legacy.arma, descricao: '' })
    if (legacy.armadura) items.push({ id: makeId(), nome: legacy.armadura, descricao: '' })
    sheet.equipamento = items
  }

  // Magias: unifica truques + magias numa lista só
  if (!Array.isArray(sheet.magiasUnificadas)) {
    const items = []
    if (Array.isArray(sheet.magias)) {
      items.push(...sheet.magias)
    } else if (sheet.magias && typeof sheet.magias === 'object') {
      const legacy = sheet.magias
      if (legacy.truque) items.push({ id: makeId(), nome: legacy.truque, descricao: '' })
      if (legacy.magia) items.push({ id: makeId(), nome: legacy.magia, descricao: '' })
    }
    if (Array.isArray(sheet.truques)) {
      items.push(...sheet.truques)
    }
    sheet.magiasUnificadas = items
  }
  sheet.magiasUnificadas = sheet.magiasUnificadas.map((m) => (m.id ? m : { ...m, id: makeId() }))

  // Defesas: viram linhas de texto livre (Aparar, Bloquear, Esquivar,
  // Resistências) — RD deixou de existir como campo próprio
  const legacyCombat = sheet.combatStats || {}
  const collapseToText = (v) => {
    if (v === undefined || v === null) return ''
    if (typeof v === 'object') return String((v.base || 0) + (v.extra || 0))
    return String(v)
  }
  if (
    typeof sheet.combatStats?.aparar !== 'string' &&
    typeof sheet.combatStats?.bloquear !== 'string'
  ) {
    sheet.combatStats = {
      aparar: collapseToText(legacyCombat.aparar),
      bloquear: collapseToText(legacyCombat.bloquear),
      esquivar: collapseToText(legacyCombat.esquivar),
      resistencias: collapseToText(legacyCombat.resistencias),
    }
  }

  // Pontos de Ação: novo, começa zerado (só os 2 vermelhos fixos, sem extras)
  if (!sheet.pontosAcao) {
    sheet.pontosAcao = { esquerda: 0, direita: 0 }
  }

  // Perícias: novo, valores por perícia (chave = id da perícia)
  if (!sheet.pericias) {
    sheet.pericias = {}
  }

  // Inventário: novo, lista de itens com forma (Tetris) e posição na grade
  if (!Array.isArray(sheet.inventario)) {
    sheet.inventario = []
  }

  if (typeof sheet.anotacoes !== 'string') {
    sheet.anotacoes = ''
  }

  return sheet
}
