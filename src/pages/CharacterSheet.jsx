import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import DiceRoller from '../components/DiceRoller.jsx'

export default function CharacterSheet() {
  const { id } = useParams()
  const [character, setCharacter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const { data, error } = await supabase.from('characters').select('*').eq('id', id).single()
      if (cancelled) return
      if (error) setError(error.message)
      else setCharacter(data)
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) return <div className="card muted">Consultando os pergaminhos...</div>
  if (error) return <div className="card">Erro: {error}</div>
  if (!character) return null

  const sheet = character.sheet || {}
  const derived = sheet.derived || {}

  return (
    <div>
      <div className="card">
        <span className="eyebrow">
          {sheet.lineageName} · Caminho de {sheet.pathName}
        </span>
        <h1>{character.name}</h1>
        <p className="muted">Nível {sheet.nivel || 1}</p>

        <div className="stat-row">
          <div className="stat-box">
            <span className="value">{derived.pv}</span>
            <span className="label">PV</span>
          </div>
          <div className="stat-box">
            <span className="value">{derived.pd}</span>
            <span className="label">PD</span>
          </div>
          <div className="stat-box">
            <span className="value">{derived.pm}</span>
            <span className="label">PM</span>
          </div>
          <div className="stat-box">
            <span className="value">{derived.rd}</span>
            <span className="label">RD</span>
          </div>
        </div>
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
          <h3>Talento</h3>
          <p>
            <strong>{sheet.talento?.nome}</strong>
          </p>
          <p className="muted">{sheet.talento?.descricao}</p>
        </div>

        <div className="card">
          <h3>Equipamento</h3>
          <p className="muted">Arma: {sheet.equipamento?.arma || '—'}</p>
          <p className="muted">Proteção: {sheet.equipamento?.armadura || '—'}</p>
        </div>

        <div className="card">
          <h3>Magias</h3>
          <p className="muted">Truque: {sheet.magias?.truque || '—'}</p>
          <p className="muted">Magia: {sheet.magias?.magia || '—'}</p>
        </div>
      </div>

      <DiceRoller />
    </div>
  )
}
