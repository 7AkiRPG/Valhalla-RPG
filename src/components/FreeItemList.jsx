function makeId() {
  return Math.random().toString(36).slice(2, 10)
}

export default function FreeItemList({
  items,
  onChange,
  title = 'Itens',
  hint = 'Adicione itens com nome e descrição livres.',
  namePlaceholder = 'Nome',
  descPlaceholder = 'Descrição',
  addLabel = '+ Adicionar item',
  emptyLabel = 'Nenhum item ainda.',
}) {
  function addItem() {
    onChange([...items, { id: makeId(), nome: '', descricao: '' }])
  }

  function updateItem(id, patch) {
    onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)))
  }

  function removeItem(id) {
    onChange(items.filter((it) => it.id !== id))
  }

  function move(index, delta) {
    const target = index + delta
    if (target < 0 || target >= items.length) return
    const next = [...items]
    const [moved] = next.splice(index, 1)
    next.splice(target, 0, moved)
    onChange(next)
  }

  return (
    <div className="card">
      <h3>{title}</h3>
      <p className="muted">{hint}</p>

      <div className="equipment-list">
        {items.map((item, index) => (
          <div className="equipment-item" key={item.id}>
            <div className="equipment-reorder">
              <button type="button" onClick={() => move(index, -1)} disabled={index === 0}>
                ↑
              </button>
              <button type="button" onClick={() => move(index, 1)} disabled={index === items.length - 1}>
                ↓
              </button>
            </div>
            <div className="equipment-fields">
              <input
                placeholder={namePlaceholder}
                value={item.nome}
                onChange={(e) => updateItem(item.id, { nome: e.target.value })}
              />
              <textarea
                placeholder={descPlaceholder}
                rows={2}
                value={item.descricao}
                onChange={(e) => updateItem(item.id, { descricao: e.target.value })}
              />
            </div>
            <button type="button" className="ghost" onClick={() => removeItem(item.id)}>
              ✕
            </button>
          </div>
        ))}
        {items.length === 0 && <p className="muted">{emptyLabel}</p>}
      </div>

      <button type="button" onClick={addItem} style={{ marginTop: 10 }}>
        {addLabel}
      </button>
    </div>
  )
}
