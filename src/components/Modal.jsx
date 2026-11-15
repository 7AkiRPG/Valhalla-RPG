import { createPortal } from 'react-dom'

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
