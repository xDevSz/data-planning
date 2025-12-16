import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom'; 
import './index.css';
import logoImg from '../../assets/logo4.png';

export default function Navbar() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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
        startupLogo: parsed.startupLogo,
        userRole: parsed.role || 'Membro',
        userInitials: getInitials(parsed.name)
      });
    }
  }, []);

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* LADO ESQUERDO */}
        <div className="nav-left">
            {/* BOTÃO VOLTAR ADICIONADO AQUI */}
            <button 
                className="btn-back-nav" 
                onClick={() => navigate(-1)} 
                title="Voltar"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>

            <button 
                className={`hamburger-btn ${isMobileMenuOpen ? 'open' : ''}`} 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                <span></span>
                <span></span>
                <span></span>
            </button>

            <div className="nav-brand">
                <img src={logoImg} alt="Data Planning Logo" className="nav-logo-img" />
            </div>
        </div>

        {/* CENTRO: LINKS */}
        <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            <NavLink to="/dashboard/overview" className="nav-item" onClick={closeMenu}>Visão Geral</NavLink>
            <NavLink to="/dashboard/planning" className="nav-item" onClick={closeMenu}>Planejamento</NavLink>
            <NavLink to="/dashboard/kanban" className="nav-item" onClick={closeMenu}>Demandas</NavLink>
            <NavLink to="/dashboard/financial" className="nav-item" onClick={closeMenu}>Financeiro</NavLink>
            <NavLink to="/dashboard/storage" className="nav-item" onClick={closeMenu}>Arquivos</NavLink>
        </div>

        {/* LADO DIREITO: PERFIL */}
        <div 
            className="user-profile" 
            onClick={() => navigate('/dashboard/infoprofile')}
            style={{ cursor: 'pointer' }}
            title="Ir para meu perfil"
        >
            <div className="startup-info">
                <h4>{info.startupName}</h4>
                <span>{info.startupCnpj ? `CNPJ: ${info.startupCnpj}` : info.userRole}</span>
            </div>
            
            <div className="avatar-container">
            {info.startupLogo ? (
                <img src={info.startupLogo} alt="Logo" className="avatar-img" />
            ) : (
                <div className="avatar-text">{info.userInitials}</div>
            )}
            </div>
        </div>
      </div>
    </nav>
  );
}