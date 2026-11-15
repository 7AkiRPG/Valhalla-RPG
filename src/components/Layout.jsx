import { Link } from 'react-router-dom'

export default function Layout({ children }) {
  return (
    <div className="app-shell">
      <nav className="top-nav">
        <Link to="/" className="brand">
          V A L H A L L A
        </Link>
        <div className="nav-links">
          <Link to="/biblioteca">Biblioteca</Link>
          <Link to="/campanhas">Campanhas</Link>
          <Link to="/recuperar">Recuperar acesso</Link>
        </div>
      </nav>
      {children}
    </div>
  )
}
