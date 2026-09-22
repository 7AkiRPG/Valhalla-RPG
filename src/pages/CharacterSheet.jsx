import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import DiceRoller from '../components/DiceRoller.jsx'
import LevelDial from '../components/LevelDial.jsx'
import DeleteCharacter from '../components/DeleteCharacter.jsx'
import FreeItemList from '../components/FreeItemList.jsx'
import HexAttributes from '../components/HexAttributes.jsx'
import ActionPoints from '../components/ActionPoints.jsx'
import ResourceCircle from '../components/ResourceCircle.jsx'
import TextLine from '../components/TextLine.jsx'
import PericiasDrawer from '../components/PericiasDrawer.jsx'
import SideDrawer from '../components/SideDrawer.jsx'
import InventoryGrid from '../components/InventoryGrid.jsx'
import { normalizeSheet } from '../lib/characterMigration.js'

export default function CharacterSheet() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [character, setCharacter] = useState(null)
  const [sheet, setSheet] = useState(null)
  const [nameDraft, setNameDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [leftTab, setLeftTab] = useState('habilidades')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const { data, error } = await supabase.from('characters').select('*').eq('id', id).single()
      if (cancelled) return
      if (error) setError(error.message)
      else {
        setCharacter(data)
        setSheet(normalizeSheet(data.sheet || {}))
        setNameDraft(data.name || '')
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

  function updateName(v) {
    setNameDraft(v)
    setDirty(true)
  }

  async function handleSave() {
    setSaving(true)
    const { error } = await supabase
      .from('characters')
      .update({ sheet, name: nameDraft.trim() || character.name, updated_at: new Date().toISOString() })
      .eq('id', id)
    setSaving(false)
    if (error) setError(error.message)
    else {
      setCharacter((c) => ({ ...c, name: nameDraft.trim() || c.name }))
      setDirty(false)
    }
  }

  if (loading) return <div className="card muted">Consultando os pergaminhos...</div>
  if (error) return <div className="card">Erro: {error}</div>
  if (!character || !sheet) return null

  return (
    <div className="sheet-shell">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button className="primary" onClick={handleSave} disabled={!dirty || saving}>
          {saving ? 'Salvando...' : dirty ? 'Salvar alterações' : 'Tudo salvo'}
        </button>
      </div>

      <div className="sheet-columns">
        <div className="sheet-col sheet-col-left">
          <div className="left-toggle">
            <button
              className={`toggle-label ${leftTab === 'habilidades' ? 'active' : ''}`}
              onClick={() => setLeftTab('habilidades')}
            >
              habilidades
            </button>
            <button
              className={`toggle-label ${leftTab === 'magias' ? 'active' : ''}`}
              onClick={() => setLeftTab('magias')}
            >
              Magias
            </button>
          </div>

          {leftTab === 'habilidades' && (
            <FreeItemList
              title=""
              hint=""
              namePlaceholder="Nome da habilidade"
              descPlaceholder="Descrição"
              addLabel="+"
              emptyLabel="Nenhuma habilidade ainda."
              items={sheet.habilidades || []}
              onChange={(items) => updateSheet({ ...sheet, habilidades: items })}
            />
          )}
          {leftTab === 'magias' && (
            <FreeItemList
              title=""
              hint=""
              namePlaceholder="Nome da magia"
              descPlaceholder="Descrição"
              addLabel="+"
              emptyLabel="Nenhuma magia ainda."
              items={sheet.magiasUnificadas || []}
              onChange={(items) => updateSheet({ ...sheet, magiasUnificadas: items })}
            />
          )}
        </div>

        <div className="sheet-col sheet-col-center">
          <TextLine label="Nome" value={nameDraft} onChange={updateName} big />

          <div className="level-pair">
            <div className="level-pair-item">
              <LevelDial nivel={sheet.nivelAtual || 1} onChange={(n) => updateSheet({ ...sheet, nivelAtual: Math.max(1, n) })} />
              <span className="label">Nível Atual</span>
            </div>
            <div className="level-pair-item">
              <LevelDial nivel={sheet.nivelTotal || 1} onChange={(n) => updateSheet({ ...sheet, nivelTotal: Math.max(1, n) })} />
              <span className="label">Nível Total</span>
            </div>
          </div>

          <HexAttributes atributos={sheet.atributos} onChange={(a) => updateSheet({ ...sheet, atributos: a })} />

          <ActionPoints pontosAcao={sheet.pontosAcao} onChange={(pa) => updateSheet({ ...sheet, pontosAcao: pa })} />

          <div className="resources-row">
            <ResourceCircle label="PV" resource={sheet.resources.pv} onChange={(r) => updateSheet({ ...sheet, resources: { ...sheet.resources, pv: r } })} />
            <ResourceCircle label="PD" resource={sheet.resources.pd} onChange={(r) => updateSheet({ ...sheet, resources: { ...sheet.resources, pd: r } })} />
            <ResourceCircle label="PM" resource={sheet.resources.pm} onChange={(r) => updateSheet({ ...sheet, resources: { ...sheet.resources, pm: r } })} />
          </div>

          <TextLine label="Aparar" value={sheet.combatStats?.aparar} onChange={(v) => updateSheet({ ...sheet, combatStats: { ...sheet.combatStats, aparar: v } })} />
          <TextLine label="Bloquear" value={sheet.combatStats?.bloquear} onChange={(v) => updateSheet({ ...sheet, combatStats: { ...sheet.combatStats, bloquear: v } })} />
          <TextLine label="Esquivar" value={sheet.combatStats?.esquivar} onChange={(v) => updateSheet({ ...sheet, combatStats: { ...sheet.combatStats, esquivar: v } })} />
          <TextLine label="Resistências" value={sheet.combatStats?.resistencias} onChange={(v) => updateSheet({ ...sheet, combatStats: { ...sheet.combatStats, resistencias: v } })} />

          <div style={{ marginTop: 30 }}>
            <DeleteCharacter
              characterId={id}
              characterName={character.name}
              onDeleted={() => navigate('/biblioteca')}
            />
          </div>
        </div>

        <div className="sheet-col sheet-col-right">
          <InventoryGrid items={sheet.inventario || []} onChange={(items) => updateSheet({ ...sheet, inventario: items })} />
        </div>
      </div>

      <PericiasDrawer pericias={sheet.pericias} onChange={(p) => updateSheet({ ...sheet, pericias: p })} />

      <SideDrawer side="right" label="Anotações">
        <h2>Anotações</h2>
        <textarea
          rows={20}
          value={sheet.anotacoes || ''}
          onChange={(e) => updateSheet({ ...sheet, anotacoes: e.target.value })}
          placeholder="Anote o que quiser sobre a jornada do seu campeão..."
        />
      </SideDrawer>

      <SideDrawer side="left" label="Rolagens">
        <DiceRoller />
      </SideDrawer>
    </div>
  )
}
