import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import DiceRoller from '../components/DiceRoller.jsx'
import ResourceRing from '../components/ResourceRing.jsx'
import EquipmentList from '../components/EquipmentList.jsx'
import LevelProgression from '../components/LevelProgression.jsx'
import PathsOverview from '../components/PathsOverview.jsx'
import DeleteCharacter from '../components/DeleteCharacter.jsx'

export default function CharacterSheet() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [character, setCharacter] = useState(null)
  const [sheet, setSheet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const { data, error } = await supabase.from('characters').select('*').eq('id', id).single()
      if (cancelled) return
      if (error) setError(error.message)
      else {
        setCharacter(data)
        setSheet(data.sheet || {})
      }
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [id])

  function updateSheet(next) {
    setSheet(next)
    setDirty(true)
  }

  async function handleSave() {
    setSaving(true)
    const { error } = await supabase
      .from('characters')
      .update({ sheet, updated_at: new Date().toISOString() })
      .eq('id', id)
    setSaving(false)
    if (error) setError(error.message)
    else setDirty(false)
  }

  if (loading) return <div className="card muted">Consultando os pergaminhos...</div>
  if (error) return <div className="card">Erro: {error}</div>
  if (!character || !sheet) return null

  return (
    <div>
      <div className="card">
        <span className="eyebrow">
          {sheet.lineageName} · Nível {sheet.nivel || 1}
        </span>
        <h1>{character.name}</h1>

        <div className="grid grid-2" style={{ marginTop: 10 }}>
          <ResourceRing label="PV" resource={sheet.resources.pv} onChange={(r) => updateSheet({ ...sheet, resources: { ...sheet.resources, pv: r } })} />
          <ResourceRing label="PD" resource={sheet.resources.pd} onChange={(r) => updateSheet({ ...sheet, resources: { ...sheet.resources, pd: r } })} />
          <ResourceRing label="PM" resource={sheet.resources.pm} onChange={(r) => updateSheet({ ...sheet, resources: { ...sheet.resources, pm: r } })} />
          <div className="stat-box" style={{ alignSelf: 'start' }}>
            <span className="value">{sheet.derived?.rd}</span>
            <span className="label">RD</span>
          </div>
        </div>
      </div>

      <div style={{ position: 'sticky', top: 10, zIndex: 5, display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button className="primary" onClick={handleSave} disabled={!dirty || saving}>
          {saving ? 'Salvando...' : dirty ? 'Salvar alterações' : 'Tudo salvo'}
        </button>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3>Atributos</h3>
          <div className="stat-row">
            <div className="stat-box">
              <span className="value">{sheet.atributos?.corpo}</span>
              <span className="label">Corpo</span>
            </div>
            <div className="stat-box">
              <span className="value">{sheet.atributos?.mente}</span>
              <span className="label">Mente</span>
            </div>
            <div className="stat-box">
              <span className="value">{sheet.atributos?.alma}</span>
              <span className="label">Alma</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Talentos</h3>
          {(sheet.talentos || []).map((t, i) => (
            <p key={i}>
              <strong>{t.nome}</strong> — <span className="muted">{t.descricao}</span>
            </p>
          ))}
        </div>

        <div className="card">
          <h3>Magias</h3>
          <p className="muted">Truque: {sheet.magias?.truque || '—'}</p>
          <p className="muted">Magia: {sheet.magias?.magia || '—'}</p>
        </div>

        <PathsOverview paths={sheet.paths} />
      </div>

      <LevelProgression sheet={sheet} onChange={updateSheet} />

      <EquipmentList items={sheet.equipamento || []} onChange={(items) => updateSheet({ ...sheet, equipamento: items })} />

      <DiceRoller />

      <DeleteCharacter
        characterId={id}
        characterName={character.name}
        onDeleted={() => navigate('/biblioteca')}
      />
    </div>
  )
}
