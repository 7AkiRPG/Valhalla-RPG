import { useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'

export default function DeleteCharacter({ characterId, characterName, onDeleted }) {
  const [step, setStep] = useState('idle') // 'idle' | 'confirming'
  const [typedName, setTypedName] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)

  const matches = typedName.trim() === characterName.trim()

  async function handleDelete() {
    if (!matches) return
    setDeleting(true)
    setError(null)
    const { error } = await supabase.from('characters').delete().eq('id', characterId)
    setDeleting(false)
    if (error) {
      setError(error.message)
      return
    }
    onDeleted()
  }

  return (
    <div className="card" style={{ borderColor: 'var(--blood)' }}>
      <span className="eyebrow">Zona de perigo</span>
      <h3>Excluir personagem</h3>

      {step === 'idle' && (
        <>
          <p className="muted">Essa ação apaga {characterName} para sempre. Não tem como desfazer.</p>
          <button className="ghost" style={{ borderColor: 'var(--blood)', color: 'var(--blood)' }} onClick={() => setStep('confirming')}>
            Excluir personagem
          </button>
        </>
      )}

      {step === 'confirming' && (
        <>
          <p className="muted">
            Pra confirmar, digite o nome exato do personagem — <strong style={{ color: 'var(--bone)' }}>{characterName}</strong> —
            no campo abaixo.
          </p>
          <div className="field">
            <input value={typedName} onChange={(e) => setTypedName(e.target.value)} placeholder={characterName} />
          </div>
          {error && <p style={{ color: 'var(--blood)' }}>{error}</p>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleDelete}
              disabled={!matches || deleting}
              style={{ borderColor: 'var(--blood)', color: matches ? '#fff' : 'var(--blood)', background: matches ? 'var(--blood)' : 'transparent' }}
            >
              {deleting ? 'Excluindo...' : 'Confirmar exclusão definitiva'}
            </button>
            <button className="ghost" onClick={() => { setStep('idle'); setTypedName(''); setError(null) }}>
              Cancelar
            </button>
          </div>
        </>
      )}
    </div>
  )
}
