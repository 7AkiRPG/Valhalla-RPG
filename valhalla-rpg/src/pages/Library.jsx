import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { usePlayer } from '../lib/PlayerContext.jsx'

export default function Library() {
  const { identity, loading: identityLoading } = usePlayer()
  const [characters, setCharacters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!identity) return
    let cancelled = false

    async function load() {
      setLoading(true)
      const { data, error } = await supabase
        .from('characters')
        .select('id, name, sheet, created_at')
        .eq('player_id', identity.playerId)
        .order('created_at', { ascending: false })

      if (cancelled) return
      if (error) setError(error.message)
      else setCharacters(data)
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [identity])

  if (identityLoading) return <div className="card muted">Carregando...</div>

  return (
    <div>
      <div className="card">
        <span className="eyebrow">Sua coleção</span>
        <h2>Biblioteca de Personagens</h2>
        <p className="muted">Estes campeões só são visíveis para você, a menos que estejam vinculados a uma campanha.</p>
        <Link className="btn primary" to="/personagem/novo">
          + Criar novo personagem
        </Link>
      </div>

      {loading && <div className="card muted">Buscando seus campeões...</div>}
      {error && <div className="card">Erro ao carregar: {error}</div>}

      {!loading && characters.length === 0 && (
        <div className="card muted">Nenhum campeão criado ainda. Que tal forjar o primeiro?</div>
      )}

      <div className="grid grid-2">
        {characters.map((c) => (
          <Link key={c.id} to={`/personagem/${c.id}`} className="card" style={{ textDecoration: 'none' }}>
            <h3>{c.name}</h3>
            <p className="muted">
              {c.sheet?.lineageName || 'Linhagem indefinida'} · Nível {c.sheet?.nivel || 1}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
