import { useState } from 'react'

const COLS = 8
const ROWS = 14
const SHAPE_SIZE = 8

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

function buildOccupancy(items) {
  const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null))
  for (const item of items) {
    for (const [dx, dy] of item.shape) {
      const x = item.x + dx
      const y = item.y + dy
      if (x >= 0 && x < COLS && y >= 0 && y < ROWS) grid[y][x] = item.id
    }
  }
  return grid
}

function findPlacement(items, shape) {
  const grid = buildOccupancy(items)
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const fits = shape.every(([dx, dy]) => {
        const px = x + dx
        const py = y + dy
        return px >= 0 && px < COLS && py >= 0 && py < ROWS && !grid[py][px]
      })
      if (fits) return { x, y }
    }
  }
  return null
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
  const width = Math.max(...xs) - Math.min(...xs) + 1
  const height = Math.max(...ys) - Math.min(...ys) + 1
  return { width, height }
}

export default function InventoryGrid({ items, onChange }) {
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
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
    setCreateError(null)
  }

  function confirmCreate() {
    const shape = normalizeShape(shapeGrid)
    if (shape.length === 0) {
      setCreateError('Desenhe pelo menos um quadrado pra forma do item.')
      return
    }
    const placement = findPlacement(items, shape)
    if (!placement) {
      setCreateError('Não há espaço no inventário pra essa forma.')
      return
    }
    const item = {
      id: makeId(),
      nome: newName.trim(),
      descricao: newDesc.trim(),
      shape,
      x: placement.x,
      y: placement.y,
    }
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

  const occupancy = buildOccupancy(items)

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
                  onClick={() => toggleShapeCell(x, y)}
                />
              ))
            )}
          </div>
          {shapeDimensions(shapeGrid) && (
            <p className="muted">
              Espaço: {shapeDimensions(shapeGrid).width} × {shapeDimensions(shapeGrid).height}
            </p>
          )}
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

      <div className="inventory-grid">
        {Array.from({ length: ROWS }).map((_, y) =>
          Array.from({ length: COLS }).map((_, x) => {
            const itemId = occupancy[y][x]
            return (
              <div
                key={`${x}-${y}`}
                className={`inventory-cell ${itemId ? 'occupied' : ''}`}
                onClick={() => itemId && setSelectedItem(items.find((it) => it.id === itemId))}
              />
            )
          })
        )}
      </div>

      {selectedItem && (
        <div className="pending-block">
          <h4>{selectedItem.nome}</h4>
          <p className="muted">{selectedItem.descricao || 'Sem descrição.'}</p>
          <div style={{ display: 'flex', gap: 10 }}>
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
