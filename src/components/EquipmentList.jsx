function makeId() {
  return Math.random().toString(36).slice(2, 10)
}

export default function EquipmentList({ items, onChange }) {
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
      <h3>Equipamento</h3>
      <p className="muted">Adicione qualquer item — arma, armadura, artefato — com nome e descrição livres.</p>

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
                placeholder="Nome do item"
                value={item.nome}
                onChange={(e) => updateItem(item.id, { nome: e.target.value })}
              />
              <textarea
                placeholder="Descrição (dano, RD, efeitos, o que você quiser)"
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
        {items.length === 0 && <p className="muted">Nenhum item ainda.</p>}
      </div>

      <button type="button" onClick={addItem} style={{ marginTop: 10 }}>
        + Adicionar item
      </button>
    </div>
  )
}
