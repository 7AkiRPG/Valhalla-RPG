import { Link } from 'react-router-dom'
import { usePlayer } from '../lib/PlayerContext.jsx'

export default function Home() {
  const { identity, loading, error } = usePlayer()

  return (
    <div>
      <div className="card">
        <span className="eyebrow">Salão dos Guerreiros</span>
        <h1>Bem-vindo a Valhalla</h1>
        <p className="muted">
          Este reino é destinado àqueles que buscam redenção pelo que fizeram ou deixaram de
          fazer. A pergunta não é mais como sua história começou, mas sim como ela terminou.
          Valhalla enfrenta tempos sombrios — cabe a você criar o campeão que lutará pela própria
          sobrevivência, ou aquele que salvará um reino inteiro.
        </p>
      </div>

      {loading && <div className="card muted">Firmando um pacto com os deuses (carregando)...</div>}
      {error && <div className="card">Algo falhou ao te reconhecer: {error}</div>}

      {identity && (
        <div className="card">
          <span className="eyebrow">Seu código de recuperação</span>
          <p className="muted">
            Guarde este código. Ele é a única forma de acessar seus personagens em outro
            dispositivo ou navegador — não existe senha nem e-mail neste sistema.
          </p>
          <div className="recovery-code">{identity.recoveryCode}</div>
        </div>
      )}

      <div className="rune-divider">ᛟ</div>

      <div className="grid grid-2">
        <div className="card">
          <h3>Biblioteca de Personagens</h3>
          <p className="muted">Crie campeões e mantenha-os guardados só para você.</p>
          <Link className="btn primary" to="/biblioteca">
            Ver biblioteca
          </Link>
        </div>
        <div className="card">
          <h3>Campanhas</h3>
          <p className="muted">Crie uma campanha ou entre em uma usando um código de convite.</p>
          <Link className="btn primary" to="/campanhas">
            Ver campanhas
          </Link>
        </div>
      </div>
    </div>
  )
}
