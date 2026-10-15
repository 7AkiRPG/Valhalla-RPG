import { createPortal } from 'react-dom'

// Janela central. Renderiza direto no <body> pra não ficar presa dentro de
// gavetas laterais (que usam transform e quebrariam o position: fixed).
export default function Modal({ onClose, closeOnBackdrop = true, children }) {
  return createPortal(
    <div className="modal-backdrop" onClick={closeOnBackdrop ? onClose : undefined}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="ghost modal-close" onClick={onClose}>
          Fechar ✕
        </button>
        {children}
      </div>
    </div>,
    document.body
  )
}
