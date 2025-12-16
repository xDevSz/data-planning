import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Loading from './components/Loading';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Importação do Dashboard
import Overview from './pages/Dashboard/Overview';
import Planning from './pages/Dashboard/Planning';
import Kanban from './pages/Dashboard/Kanban';
import Storage from './pages/Dashboard/Storage';
import Financial from './pages/Dashboard/Financial';
import InfoProfile from './pages/Dashboard/InfoProfile';

// Importação do Gerenciador de Compliance (LGPD/Cookies/Permissões)
import ComplianceManager from './components/Compliance/ComplianceManager';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simula tempo de carregamento inicial (Splash Screen)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000); // Reduzi para 3s para não ficar travado muito tempo, ajuste se quiser 6000

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <BrowserRouter>
      
      {/* ADICIONADO AQUI:
          O ComplianceManager precisa estar dentro do BrowserRouter 
          mas fora do Routes para aparecer em todas as telas.
      */}
      <ComplianceManager />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* ROTAS DO DASHBOARD */}
        <Route path="/dashboard/overview" element={<Overview />} />
        <Route path="/dashboard/storage" element={<Storage />} />
        <Route path="/dashboard/planning" element={<Planning />} />
        <Route path="/dashboard/kanban" element={<Kanban />} />
        <Route path="/dashboard/financial" element={<Financial />} />
        <Route path="/dashboard/infoprofile" element={<InfoProfile />} />

        <Route path="*" element={<div style={{color: 'white', marginTop:'50px', textAlign:'center'}}>Página não encontrada</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;