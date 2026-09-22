import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { usePlayer } from '../lib/PlayerContext.jsx'

export default function CharacterCreate() {
  const { identity } = usePlayer()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleSave(e) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    try {
      const sheet = {
        nivelAtual: 1,
        nivelTotal: 1,
        atributos: { corpo: 0, mente: 0, alma: 0, rituais: 0, selos: 0, sigilos: 0 },
        habilidades: [],
        magiasUnificadas: [],
        equipamento: [],
        combatStats: { aparar: '', bloquear: '', esquivar: '', resistencias: '' },
        pontosAcao: { esquerda: 0, direita: 0 },
        pericias: {},
        inventario: [],
        anotacoes: '',
        resources: {
          pv: { max: 0, current: 0, temp: 0 },
          pd: { max: 0, current: 0, temp: 0 },
          pm: { max: 0, current: 0, temp: 0 },
        },
      }

      const { data, error } = await supabase
        .from('characters')
        .insert({ player_id: identity.playerId, name: name.trim(), sheet })
        .select('id')
        .single()

      if (error) throw error
      navigate(`/personagem/${data.id}`)
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card">
      <span className="eyebrow">Novo campeão</span>
      <h2>Como ele se chama?</h2>
      <form onSubmit={handleSave}>
        <div className="field">
          <label>Nome do campeão</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Ragnar do Norte" autoFocus />
        </div>
        {error && <p style={{ color: 'var(--blood)' }}>{error}</p>}
        <button className="primary" type="submit" disabled={saving || !name.trim()}>
          {saving ? 'Forjando...' : 'Criar campeão'}
        </button>
      </form>
      <p className="muted" style={{ marginTop: 16 }}>
        Depois de criado, você preenche tudo direto na ficha.
      </p>
    </div>
  )
}
