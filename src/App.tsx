import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './routes/index';
import VisaoAnual from './routes/visao-anual';
import Perfil from './routes/perfil';
import Auth from './routes/auth';
import { Layout } from './components/ui/layout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota Pública */}
        <Route path="/auth" element={<Auth />} />

        {/* Rotas Privadas envoltas no Layout */}
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/visao-anual" element={<Layout><VisaoAnual /></Layout>} />
        <Route path="/perfil" element={<Layout><Perfil /></Layout>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App