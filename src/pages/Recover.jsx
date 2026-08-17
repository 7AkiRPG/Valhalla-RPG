import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { recoverAccess } from '../lib/playerIdentity.js'
import { usePlayer } from '../lib/PlayerContext.jsx'

export default function Recover() {
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const { setIdentity } = usePlayer()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const identity = await recoverAccess(code)
      setIdentity(identity)
      navigate('/biblioteca')
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card">
      <span className="eyebrow">Reconectar-se ao seu destino</span>
      <h2>Recuperar acesso</h2>
      <p className="muted">
        Digite o código de recuperação que você guardou para vincular este dispositivo à sua
        biblioteca de personagens.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Código de recuperação</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="XXXX-XXXX"
            required
          />
        </div>
        {error && <p style={{ color: 'var(--blood)' }}>{error}</p>}
        <button className="primary" type="submit" disabled={busy}>
          {busy ? 'Verificando...' : 'Recuperar acesso'}
        </button>
      </form>
    </div>
  )
}
