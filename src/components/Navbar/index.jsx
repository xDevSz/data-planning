import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './index.css';

export default function Navbar() {
  const navigate = useNavigate();
  
  const [info, setInfo] = useState({
    startupName: 'Carregando...',
    startupCnpj: '',
    startupLogo: null,
    userRole: '',
    userInitials: 'US'
  });

  useEffect(() => {
    const storedData = localStorage.getItem('user_data');
    
    if (storedData) {
      const parsed = JSON.parse(storedData);
      
      const getInitials = (name) => {
        if (!name) return 'US';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      };

      setInfo({
        startupName: parsed.startupName || 'Minha Startup',
        startupCnpj: parsed.startupCnpj || '',
        startupLogo: parsed.startupLogo, // URL da imagem
        userRole: parsed.role || 'Membro',
        userInitials: getInitials(parsed.name)
      });
    }
  }, []);

  return (
    <nav className="navbar">
      <div className="nav-brand">
        DATA <span className="brand-highlight">PLANNING</span>
      </div>

      <div className="nav-links">
        <NavLink to="/dashboard/overview" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
          Visão Geral
        </NavLink>
        
        <NavLink to="/dashboard/planning" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
          Planejamento
        </NavLink>
        
        <NavLink to="/dashboard/kanban" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
          Demandas
        </NavLink>
        
        <NavLink to="/dashboard/financial" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
          Financeiro
        </NavLink>

        {/* VOLTOU: Aba de Arquivos */}
        <NavLink to="/dashboard/storage" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
          Arquivos
        </NavLink>
      </div>

      <div className="user-profile" onClick={() => navigate('/dashboard/profile')} title="Meu Perfil">
        <div className="startup-info">
          <h4>{info.startupName}</h4>
          {/* Mostra CNPJ se tiver, senão mostra o cargo */}
          <span>{info.startupCnpj ? `CNPJ: ${info.startupCnpj}` : info.userRole}</span>
        </div>
        
        {/* Lógica: Imagem OU Iniciais */}
        <div className="avatar-container">
          {info.startupLogo ? (
            <img src={info.startupLogo} alt="Logo" className="avatar-img" />
          ) : (
            <div className="avatar-text">{info.userInitials}</div>
          )}
        </div>
      </div>
    </nav>
  );
}