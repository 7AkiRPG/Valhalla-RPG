import { PATHS } from '../data/paths.js'

export default function PathsOverview({ paths }) {
  const ownedIds = Object.keys(paths || {})

  return (
    <div className="card">
      <h3>Caminhos</h3>
      {ownedIds.length === 0 && <p className="muted">Nenhum caminho ainda.</p>}
      {ownedIds.map((id) => {
        const path = PATHS.find((p) => p.id === id)
        const owned = paths[id]
        return (
          <div key={id} style={{ marginBottom: 16 }}>
            <p>
              <strong style={{ color: 'var(--gold-bright)' }}>{path?.name}</strong>{' '}
              <span className="pill">Patamar {owned.unlockedPatamar}</span>
            </p>
            <ul style={{ margin: '6px 0 0 18px', padding: 0, color: 'var(--ash)' }}>
              {owned.abilities.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
