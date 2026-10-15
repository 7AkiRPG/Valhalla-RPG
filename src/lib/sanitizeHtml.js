// Limpa o HTML dos campos de texto: só sobra negrito, quebras de linha e
// texto puro. Qualquer fonte, tamanho, cor, link, imagem ou script que vier
// de um texto colado (ou de outro jogador) é descartado.

const BLOCK_TAGS = new Set([
  'DIV', 'P', 'LI', 'UL', 'OL', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'BLOCKQUOTE', 'PRE', 'TR', 'SECTION', 'ARTICLE',
])
const DROP_TAGS = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED'])

function cleanChildren(node) {
  const out = document.createDocumentFragment()
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      out.appendChild(document.createTextNode(child.textContent))
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const tag = child.tagName
      if (DROP_TAGS.has(tag)) continue
      const inner = cleanChildren(child)
      if (tag === 'B' || tag === 'STRONG') {
        const el = document.createElement('b')
        el.appendChild(inner)
        out.appendChild(el)
      } else if (tag === 'BR') {
        out.appendChild(document.createElement('br'))
      } else if (BLOCK_TAGS.has(tag)) {
        const el = document.createElement('div')
        el.appendChild(inner)
        out.appendChild(el)
      } else {
        out.appendChild(inner)
      }
    }
  }
  return out
}

export function sanitizeRichHtml(html) {
  if (!html) return ''
  const tpl = document.createElement('template')
  tpl.innerHTML = html
  const wrapper = document.createElement('div')
  wrapper.appendChild(cleanChildren(tpl.content))
  return wrapper.innerHTML
}
