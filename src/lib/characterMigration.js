import { computeDerivedStats, buildInitialResources } from './statCalc.js'

// Personagens criados antes da reforma da ficha (recursos editáveis, caminhos
// com pontos, equipamento livre) têm um formato de dados mais antigo. Essa
// função preenche os campos novos que faltarem, sem apagar nada que já existe.
export function normalizeSheet(rawSheet) {
  const sheet = { ...rawSheet }

  sheet.atributos = sheet.atributos || { corpo: 0, mente: 0, alma: 0 }
  sheet.nivel = sheet.nivel || 1

  if (!sheet.derived) {
    sheet.derived = computeDerivedStats({
      nivel: sheet.nivel,
      corpo: sheet.atributos.corpo,
      mente: sheet.atributos.mente,
      alma: sheet.atributos.alma,
      lineageId: sheet.lineageId,
    })
  }

  if (!sheet.resources) {
    sheet.resources = buildInitialResources(sheet.derived)
  }

  // Formato antigo: pathId/pathName soltos -> paths = { [id]: {...} }
  if (!sheet.paths) {
    sheet.paths = sheet.pathId
      ? { [sheet.pathId]: { unlockedPatamar: 1, abilities: [] } }
      : {}
  }

  // Corrige um bug anterior que salvava habilidades de caminho como objeto
  // ({patamar, name}) em vez de apenas o nome (texto). Isso quebrava a ficha
  // (React não consegue renderizar um objeto direto).
  const fixedPaths = {}
  for (const [pid, data] of Object.entries(sheet.paths)) {
    const abilities = (data.abilities || [])
      .map((a) => (typeof a === 'string' ? a : a?.name))
      .filter(Boolean)
    fixedPaths[pid] = { ...data, abilities }
  }
  sheet.paths = fixedPaths

  // Formato antigo: talento (singular, objeto) -> talentos (array)
  if (!Array.isArray(sheet.talentos)) {
    sheet.talentos = sheet.talento ? [sheet.talento] : []
  }

  // Formato antigo: equipamento = { arma, armadura } -> equipamento = [itens]
  if (!Array.isArray(sheet.equipamento)) {
    const legacy = sheet.equipamento || {}
    const items = []
    if (legacy.arma) items.push({ id: 'legacy-arma', nome: legacy.arma, descricao: '' })
    if (legacy.armadura) items.push({ id: 'legacy-armadura', nome: legacy.armadura, descricao: '' })
    sheet.equipamento = items
  }

  sheet.pendingChoicePoints = sheet.pendingChoicePoints || 0
  sheet.pendingAscensions = sheet.pendingAscensions || 0
  sheet.ascensoes = sheet.ascensoes || []

  // Formato antigo: magias = { truque, magia } (nomes soltos) -> magias = [itens]
  if (!Array.isArray(sheet.magias)) {
    const legacy = sheet.magias || {}
    const items = []
    if (legacy.truque) items.push({ id: 'legacy-truque', nome: legacy.truque, descricao: '' })
    if (legacy.magia) items.push({ id: 'legacy-magia', nome: legacy.magia, descricao: '' })
    sheet.magias = items
  }

  return sheet
}
