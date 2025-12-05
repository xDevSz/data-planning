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
function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 6000); 

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* ROTAS DO DASHBOARD */}
        {/* Por enquanto criamos rotas diretas, futuramente protegeremos com autenticação */}
        <Route path="/dashboard/overview" element={<Overview />} />
        
        {/* Placeholders para não quebrar a Navbar */}
        <Route path="/dashboard/storage" element={<Storage />} />
        <Route path="/dashboard/planning" element={<Planning />} />
        <Route path="/dashboard/kanban" element={<Kanban />} />
        <Route path="/dashboard/financial" element={<Financial />} />

        <Route path="*" element={<div style={{color: 'white', marginTop:'50px', textAlign:'center'}}>Página não encontrada</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;