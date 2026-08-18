import { Routes, Route } from 'react-router-dom'
import { PlayerProvider } from './lib/PlayerContext.jsx'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Recover from './pages/Recover.jsx'
import Library from './pages/Library.jsx'
import CharacterCreate from './pages/CharacterCreate.jsx'
import CharacterSheet from './pages/CharacterSheet.jsx'
import Campaigns from './pages/Campaigns.jsx'
import CampaignView from './pages/CampaignView.jsx'

export default function App() {
  return (
    <PlayerProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recuperar" element={<Recover />} />
          <Route path="/biblioteca" element={<Library />} />
          <Route path="/personagem/novo" element={<CharacterCreate />} />
          <Route path="/personagem/:id" element={<CharacterSheet />} />
          <Route path="/campanhas" element={<Campaigns />} />
          <Route path="/campanhas/:id" element={<CampaignView />} />
        </Routes>
      </Layout>
    </PlayerProvider>
  )
}
