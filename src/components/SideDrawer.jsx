import { useState } from 'react'

export default function SideDrawer({ side, label, children }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        className={`drawer-handle drawer-handle-${side}`}
        onClick={() => setOpen((o) => !o)}
      >
        {label}
      </button>

      <div className={`drawer-panel drawer-panel-${side} ${open ? 'drawer-open' : ''}`}>
        <div className="drawer-panel-inner">
          <button type="button" className="ghost drawer-close" onClick={() => setOpen(false)}>
            Fechar ✕
          </button>
          {children}
        </div>
      </div>
    </>
  )
}
