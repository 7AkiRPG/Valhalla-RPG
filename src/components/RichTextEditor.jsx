import { useEffect, useRef } from 'react'

// Editor de texto simples (negrito + Tab pra indentar). O conteúdo é
// guardado como HTML. O valor inicial só é aplicado na montagem — depois
// disso o próprio navegador cuida do conteúdo, pra não perder a posição do
// cursor a cada letra digitada. Pra trocar de item (ex: outro talento
// selecionado), use uma key diferente no componente pai pra forçar remontar.
export default function RichTextEditor({ initialValue, onChange, placeholder, rows = 6 }) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = initialValue || ''
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleInput() {
    onChange(ref.current.innerHTML)
  }

  function handleKeyDown(e) {
    if (e.key === 'Tab') {
      e.preventDefault()
      document.execCommand('insertText', false, '\t')
      handleInput()
    }
  }

  function toggleBold() {
    document.execCommand('bold')
    ref.current.focus()
    handleInput()
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
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        style={{ minHeight: `${rows * 1.5}em` }}
      />
    </div>
  )
}
