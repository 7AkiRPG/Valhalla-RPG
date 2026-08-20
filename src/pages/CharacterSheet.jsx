import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import DiceRoller from '../components/DiceRoller.jsx'
import ResourceRing from '../components/ResourceRing.jsx'
import LevelDial from '../components/LevelDial.jsx'
import DeleteCharacter from '../components/DeleteCharacter.jsx'
import FreeItemList from '../components/FreeItemList.jsx'
import CombatStats from '../components/CombatStats.jsx'
import { normalizeSheet } from '../lib/characterMigration.js'

const TABS = [
  { id: 'atributos', label: 'Atributos' },
  { id: 'habilidades', label: 'Habilidades' },
  { id: 'magias', label: 'Magias' },
  { id: 'equipamentos', label: 'Equipamentos' },
  { id: 'anotacoes', label: 'Anotações' },
]

export default function CharacterSheet() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [character, setCharacter] = useState(null)
  const [sheet, setSheet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [activeTab, setActiveTab] = useState('atributos')

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

  function changeLevel(target) {
    updateSheet({ ...sheet, nivel: Math.max(1, target) })
  }

  function changeAttribute(key, value) {
    const n = value === '' ? 0 : Math.max(0, Number(value))
    updateSheet({ ...sheet, atributos: { ...sheet.atributos, [key]: n } })
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
        <div className="header-row">
          <LevelDial nivel={sheet.nivel || 1} onChange={changeLevel} />
          <h1>{character.name}</h1>
        </div>
      </div>

      <div style={{ position: 'sticky', top: 10, zIndex: 5, display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button className="primary" onClick={handleSave} disabled={!dirty || saving}>
          {saving ? 'Salvando...' : dirty ? 'Salvar alterações' : 'Tudo salvo'}
        </button>
      </div>

      <div className="tab-bar">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'atributos' && (
        <>
          <div className="card">
            <div className="grid grid-2">
              <ResourceRing label="PV" resource={sheet.resources.pv} onChange={(r) => updateSheet({ ...sheet, resources: { ...sheet.resources, pv: r } })} />
              <ResourceRing label="PD" resource={sheet.resources.pd} onChange={(r) => updateSheet({ ...sheet, resources: { ...sheet.resources, pd: r } })} />
              <ResourceRing label="PM" resource={sheet.resources.pm} onChange={(r) => updateSheet({ ...sheet, resources: { ...sheet.resources, pm: r } })} />
            </div>
          </div>

          <CombatStats combatStats={sheet.combatStats} onChange={(cs) => updateSheet({ ...sheet, combatStats: cs })} />

          <div className="card">
            <h3>Atributos</h3>
            <div className="stat-row">
              {['corpo', 'mente', 'alma'].map((key) => (
                <div className="stat-box" key={key}>
                  <span className="value">{sheet.atributos?.[key]}</span>
                  <span className="label">{key}</span>
                  <div style={{ marginTop: 8, display: 'flex', gap: 6, justifyContent: 'center' }}>
                    <button type="button" onClick={() => changeAttribute(key, (sheet.atributos?.[key] || 0) - 1)}>
                      −
                    </button>
                    <button type="button" onClick={() => changeAttribute(key, (sheet.atributos?.[key] || 0) + 1)}>
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'habilidades' && (
        <>
          <FreeItemList
            title="Linhagem"
            hint="Adicione a linhagem e habilidades raciais com nome e descrição livres."
            namePlaceholder="Nome da linhagem ou habilidade"
            descPlaceholder="Descrição do efeito"
            addLabel="+ Adicionar"
            emptyLabel="Nenhuma linhagem ainda."
            items={sheet.lineagem || []}
            onChange={(items) => updateSheet({ ...sheet, lineagem: items })}
          />
          <FreeItemList
            title="Talentos"
            hint="Adicione talentos com nome e descrição livres."
            namePlaceholder="Nome do talento"
            descPlaceholder="Descrição, efeito e limitações"
            addLabel="+ Adicionar talento"
            emptyLabel="Nenhum talento ainda."
            items={sheet.talentos || []}
            onChange={(items) => updateSheet({ ...sheet, talentos: items })}
          />
          <FreeItemList
            title="Caminhos"
            hint="Adicione caminhos e habilidades com nome e descrição livres."
            namePlaceholder="Nome do caminho ou habilidade"
            descPlaceholder="Descrição do efeito"
            addLabel="+ Adicionar caminho"
            emptyLabel="Nenhum caminho ainda."
            items={sheet.caminhos || []}
            onChange={(items) => updateSheet({ ...sheet, caminhos: items })}
          />
        </>
      )}

      {activeTab === 'magias' && (
        <>
          <FreeItemList
            title="Truques"
            hint="Truques de nível 1, sem custo relevante — nome e descrição livres."
            namePlaceholder="Nome do truque"
            descPlaceholder="Descrição (efeito, exigência...)"
            addLabel="+ Adicionar truque"
            emptyLabel="Nenhum truque ainda."
            items={sheet.truques || []}
            onChange={(items) => updateSheet({ ...sheet, truques: items })}
          />
          <FreeItemList
            title="Magias"
            hint="Magias com custo em PM — nome e descrição livres."
            namePlaceholder="Nome da magia"
            descPlaceholder="Descrição (custo, tempo de conjuração, efeito...)"
            addLabel="+ Adicionar magia"
            emptyLabel="Nenhuma magia ainda."
            items={sheet.magias || []}
            onChange={(items) => updateSheet({ ...sheet, magias: items })}
          />
        </>
      )}

      {activeTab === 'equipamentos' && (
        <FreeItemList
          title="Equipamento"
          hint="Adicione qualquer item — arma, armadura, artefato — com nome e descrição livres."
          namePlaceholder="Nome do item"
          descPlaceholder="Descrição (dano, RD, efeitos, o que você quiser)"
          addLabel="+ Adicionar item"
          emptyLabel="Nenhum item ainda."
          items={sheet.equipamento || []}
          onChange={(items) => updateSheet({ ...sheet, equipamento: items })}
        />
      )}

      {activeTab === 'anotacoes' && (
        <div className="card">
          <h3>Anotações</h3>
          <textarea
            rows={14}
            value={sheet.anotacoes || ''}
            onChange={(e) => updateSheet({ ...sheet, anotacoes: e.target.value })}
            placeholder="Anote o que quiser sobre a jornada do seu campeão..."
          />
        </div>
      )}

      <DiceRoller />

      <DeleteCharacter
        characterId={id}
        characterName={character.name}
        onDeleted={() => navigate('/biblioteca')}
      />
    </div>
  )
}
