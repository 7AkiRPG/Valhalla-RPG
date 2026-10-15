import { useEffect, useRef } from 'react'
import { sanitizeRichHtml } from '../lib/sanitizeHtml.js'

// Editor de texto simples: só aceita negrito (que sai vermelho) e Tab pra
// indentar. Texto colado de outros lugares entra como texto puro, sem a
// fonte/tamanho/cor de origem. O conteúdo é guardado como HTML limpo.
//
// O valor inicial só é aplicado na montagem — depois disso o próprio
// navegador cuida do conteúdo, pra não perder a posição do cursor a cada
// letra digitada. Pra trocar de item, use uma key diferente no componente
// pai pra forçar remontar.
export default function RichTextEditor({ initialValue, onChange, placeholder, rows = 6 }) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = sanitizeRichHtml(initialValue || '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function emitChange() {
    onChange(sanitizeRichHtml(ref.current.innerHTML))
  }

  function handleKeyDown(e) {
    if (e.key === 'Tab') {
      e.preventDefault()
      document.execCommand('insertText', false, '\t')
      emitChange()
    }
  }

  function handlePaste(e) {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
    emitChange()
  }

  function toggleBold() {
    document.execCommand('styleWithCSS', false, false)
    document.execCommand('bold')
    ref.current.focus()
    emitChange()
  }

  return (
    <div className="rich-text-wrap">
      <div className="rich-text-toolbar">
        <button type="button" className="rich-bold-btn" onMouseDown={(e) => e.preventDefault()} onClick={toggleBold}>
          N
        </button>
        <span className="rich-text-hint">Tab pra indentar a linha</span>
      </div>
      <div
        ref={ref}
        className="rich-text-editor"
        contentEditable
        suppressContentEditableWarning
        onInput={emitChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        style={{ minHeight: `${rows * 1.5}em` }}
      />
    </div>
  )
}
