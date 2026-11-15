import { useEffect, useRef } from 'react'
import { sanitizeRichHtml } from '../lib/sanitizeHtml.js'

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
