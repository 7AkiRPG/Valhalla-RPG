export function formatCodeInput(value) {
  const clean = String(value || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 8)
  return clean.length > 4 ? `${clean.slice(0, 4)}-${clean.slice(4)}` : clean
}

export function formatCode(input) {
  const clean = String(input || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase()
  if (clean.length === 8) return `${clean.slice(0, 4)}-${clean.slice(4)}`
  return clean
}

export function formatSheetCodeInput(value) {
  return String(value || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 8)
}
