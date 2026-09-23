import { useState } from 'react'

function makeId() {
  return Math.random().toString(36).slice(2, 10)
}

export default function CompactItemList({ items, onChange, createPlaceholder = 'Nome', emptyLabel = 'Nada ainda.' }) {
  const [newName, setNewName] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  function addItem() {
    if (!newName.trim()) return
    onChange([...items, { id: makeId(), nome: newName.trim(), descricao: '' }])
    setNewName('')
  }

  function updateItem(id, patch) {
    onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)))
  }

  function removeItem(id) {
    onChange(items.filter((it) => it.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  function move(index, delta) {
    const target = index + delta
    if (target < 0 || target >= items.length) return
    const next = [...items]
    const [moved] = next.splice(index, 1)
    next.splice(target, 0, moved)
    onChange(next)
  }

  const selected = items.find((it) => it.id === selectedId)

  return (
    <div className="compact-list">
      <div className="compact-create-row">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder={createPlaceholder}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
        />
        <button type="button" onClick={addItem} disabled={!newName.trim()}>
          +
        </button>
      </div>

      <div className="compact-rows">
        {items.length === 0 && <p className="muted">{emptyLabel}</p>}
        {items.map((item, index) => (
          <div className="compact-row" key={item.id}>
            <div className="compact-reorder">
              <button type="button" onClick={() => move(index, -1)} disabled={index === 0}>
                ↑
              </button>
              <button type="button" onClick={() => move(index, 1)} disabled={index === items.length - 1}>
                ↓
              </button>
            </div>
            <span className="compact-row-name" onClick={() => setSelectedId(item.id)}>
              {item.nome || 'Sem nome'}
            </span>
            <button type="button" className="ghost" onClick={() => removeItem(item.id)}>
              ✕
            </button>
          </div>
        ))}
      </div>

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelectedId(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="ghost modal-close" onClick={() => setSelectedId(null)}>
              Fechar ✕
            </button>
            <div className="field">
              <label>Nome</label>
              <input
                className="modal-name-input"
                value={selected.nome}
                onChange={(e) => updateItem(selected.id, { nome: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Descrição</label>
              <textarea
                rows={10}
                value={selected.descricao}
                onChange={(e) => updateItem(selected.id, { descricao: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
