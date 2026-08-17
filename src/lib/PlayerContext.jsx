import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { ensureIdentity } from './playerIdentity.js'

const PlayerContext = createContext(null)

export function PlayerProvider({ children }) {
  const [identity, setIdentity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const id = await ensureIdentity()
      setIdentity(id)
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <PlayerContext.Provider value={{ identity, loading, error, reload: load, setIdentity }}>
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  return useContext(PlayerContext)
}
