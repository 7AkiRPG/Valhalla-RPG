import { useState } from 'react'

const COLS = 8
const ROWS = 14
const SHAPE_SIZE = 8
const COLORS = ['#c9a24b', '#8c3230', '#4c9a5a', '#7a5ac9', '#3a6ea5', '#a5573a', '#8a8a8a', '#a53a8f']

function makeId() {
  return Math.random().toString(36).slice(2, 10)
}

function emptyShapeGrid() {
  return Array.from({ length: SHAPE_SIZE }, () => Array(SHAPE_SIZE).fill(false))
}

function normalizeShape(grid) {
  const cells = []
  for (let y = 0; y < SHAPE_SIZE; y++) {
    for (let x = 0; x < SHAPE_SIZE; x++) {
      if (grid[y][x]) cells.push([x, y])
    }
  }
  if (cells.length === 0) return []
  const minX = Math.min(...cells.map((c) => c[0]))
  const minY = Math.min(...cells.map((c) => c[1]))
  return cells.map(([x, y]) => [x - minX, y - minY])
}

function shapeDimensions(grid) {
  const cells = []
  for (let y = 0; y < SHAPE_SIZE; y++) {
    for (let x = 0; x < SHAPE_SIZE; x++) {
      if (grid[y][x]) cells.push([x, y])
    }
  }
  if (cells.length === 0) return null
  const xs = cells.map((c) => c[0])
  const ys = cells.map((c) => c[1])
  return { width: Math.max(...xs) - Math.min(...xs) + 1, height: Math.max(...ys) - Math.min(...ys) + 1 }
}

function buildOccupancy(items, excludeId) {
  const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null))
  for (const item of items) {
    if (item.id === excludeId) continue
    if (item.x === null || item.y === null || item.x === undefined || item.y === undefined) continue
    for (const [dx, dy] of item.shape) {
      const x = item.x + dx
      const y = item.y + dy
      if (x >= 0 && x < COLS && y >= 0 && y < ROWS) grid[y][x] = item.id
    }
  }
  return grid
}

function canPlace(items, shape, originX, originY, excludeId) {
  const grid = buildOccupancy(items, excludeId)
  return shape.every(([dx, dy]) => {
    const x = originX + dx
    const y = originY + dy
    return x >= 0 && x < COLS && y >= 0 && y < ROWS && !grid[y][x]
  })
}

export default function InventoryGrid({ items, onChange }) {
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newColor, setNewColor] = useState(COLORS[0])
  const [shapeGrid, setShapeGrid] = useState(emptyShapeGrid())
  const [createError, setCreateError] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)

  function toggleShapeCell(x, y) {
    setShapeGrid((prev) => {
      const next = prev.map((row) => [...row])
      next[y][x] = !next[y][x]
      return next
    })
  }

  function startCreate() {
    if (!newName.trim()) return
    setCreating(true)
    setShapeGrid(emptyShapeGrid())
    setNewColor(COLORS[0])
    setCreateError(null)
  }

  function confirmCreate() {
    const shape = normalizeShape(shapeGrid)
    if (shape.length === 0) {
      setCreateError('Desenhe pelo menos um quadrado pra forma do item.')
      return
    }
    const item = { id: makeId(), nome: newName.trim(), descricao: newDesc.trim(), shape, x: null, y: null, color: newColor }
    onChange([...items, item])
    setCreating(false)
    setNewName('')
    setNewDesc('')
    setShapeGrid(emptyShapeGrid())
    setCreateError(null)
  }

  function removeItem(id) {
    onChange(items.filter((it) => it.id !== id))
    setSelectedItem(null)
  }

  function unplaceItem(id) {
    onChange(items.map((it) => (it.id === id ? { ...it, x: null, y: null } : it)))
    setSelectedItem(null)
  }

  function updateItemColor(id, color) {
    onChange(items.map((it) => (it.id === id ? { ...it, color } : it)))
    setSelectedItem((s) => (s ? { ...s, color } : s))
  }

  function handleDragStart(e, id) {
    e.dataTransfer.setData('text/plain', id)
  }

  function handleDrop(e, x, y) {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    const item = items.find((it) => it.id === id)
    if (!item) return
    if (canPlace(items, item.shape, x, y, id)) {
      onChange(items.map((it) => (it.id === id ? { ...it, x, y } : it)))
    }
  }

  const occupancy = buildOccupancy(items)
  const unplaced = items.filter((it) => it.x === null || it.y === null || it.x === undefined || it.y === undefined)
  const dims = shapeDimensions(shapeGrid)

  return (
    <div className="inventory-wrap">
      <span className="eyebrow">Inventário</span>

      {!creating && (
        <div className="inventory-create-row">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Criar item"
            onKeyDown={(e) => e.key === 'Enter' && startCreate()}
          />
          <button type="button" onClick={startCreate} disabled={!newName.trim()}>
            +
          </button>
        </div>
      )}

      {creating && (
        <div className="shape-editor">
          <p className="muted">Clique nos quadrados pra desenhar a forma do item.</p>
          <div className="shape-grid">
            {shapeGrid.map((row, y) =>
              row.map((filled, x) => (
                <div
                  key={`${x}-${y}`}
                  className={`shape-cell ${filled ? 'filled' : ''}`}
                  style={filled ? { background: newColor } : undefined}
                  onClick={() => toggleShapeCell(x, y)}
                />
              ))
            )}
          </div>
          {dims && (
            <p className="muted">
              Espaço: {dims.width} × {dims.height}
            </p>
          )}
          <p className="muted">Cor do item:</p>
          <div className="color-picker">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className={`color-swatch ${newColor === c ? 'selected' : ''}`}
                style={{ background: c }}
                onClick={() => setNewColor(c)}
              />
            ))}
          </div>
          <div className="field">
            <label>Descrição</label>
            <textarea rows={3} value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
          </div>
          {createError && <p style={{ color: 'var(--blood)' }}>{createError}</p>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="primary" onClick={confirmCreate}>
              Confirmar
            </button>
            <button className="ghost" onClick={() => { setCreating(false); setCreateError(null) }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {unplaced.length > 0 && (
        <div className="inventory-tray">
          <p className="muted">Arraste pra posicionar no grid:</p>
          <div className="tray-items">
            {unplaced.map((item) => (
              <div
                key={item.id}
                className="tray-item"
                style={{ borderColor: item.color }}
                draggable
                onDragStart={(e) => handleDragStart(e, item.id)}
                onClick={() => setSelectedItem(item)}
              >
                <span className="tray-item-swatch" style={{ background: item.color }} />
                {item.nome}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="inventory-grid">
        {Array.from({ length: ROWS }).map((_, y) =>
          Array.from({ length: COLS }).map((_, x) => {
            const itemId = occupancy[y][x]
            const item = itemId ? items.find((it) => it.id === itemId) : null
            return (
              <div
                key={`${x}-${y}`}
                className={`inventory-cell ${item ? 'occupied' : ''}`}
                style={item ? { background: item.color } : undefined}
                draggable={!!item}
                onDragStart={(e) => item && handleDragStart(e, item.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, x, y)}
                onClick={() => item && setSelectedItem(item)}
              />
            )
          })
        )}
      </div>

      {selectedItem && (
        <div className="pending-block">
          <h4>{selectedItem.nome}</h4>
          <p className="muted">{selectedItem.descricao || 'Sem descrição.'}</p>
          <p className="muted">Cor:</p>
          <div className="color-picker">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className={`color-swatch ${selectedItem.color === c ? 'selected' : ''}`}
                style={{ background: c }}
                onClick={() => updateItemColor(selectedItem.id, c)}
              />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            {selectedItem.x !== null && selectedItem.x !== undefined && (
              <button className="ghost" onClick={() => unplaceItem(selectedItem.id)}>
                Tirar do grid
              </button>
            )}
            <button className="ghost" onClick={() => removeItem(selectedItem.id)}>
              Remover item
            </button>
            <button className="ghost" onClick={() => setSelectedItem(null)}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
