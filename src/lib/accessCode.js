// CÓDIGO DO SITE (recuperar acesso, excluir personagem): XXXX-XXXX, com hífen.
// O campo coloca o hífen sozinho enquanto a pessoa digita.
export function formatCodeInput(value) {
  const clean = String(value || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 8)
  return clean.length > 4 ? `${clean.slice(0, 4)}-${clean.slice(4)}` : clean
}

// Versão completa, pra mandar ao servidor (cola sem hífen? entra com hífen).
export function formatCode(input) {
  const clean = String(input || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase()
  if (clean.length === 8) return `${clean.slice(0, 4)}-${clean.slice(4)}`
  return clean
}

// CÓDIGO DA FICHA: 8 letras/números, sem hífen.
export function formatSheetCodeInput(value) {
  return String(value || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 8)
}
