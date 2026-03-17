import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom'; 
import { 
  ArrowLeft, Menu, X, LayoutDashboard, Target, 
  KanbanSquare, DollarSign, FolderOpen, UserCircle,
  FileText, Info // <-- Ícones novos adicionados aqui
} from 'lucide-react';
import './index.css';
import logoImg from '../../assets/logo4.png'; // Logo Data-Planner (Branca/Clean)

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const [info, setInfo] = useState({
    startupName: 'Carregando...',
    startupCnpj: '',
    startupLogo: null,
    userRole: '',
    userInitials: 'US'
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        startupName: parsed.startupName || 'Workspace',
        startupCnpj: parsed.startupCnpj || '',
        startupLogo: parsed.startupLogo,
        userRole: parsed.role || 'Membro',
        userInitials: getInitials(parsed.name)
      });
    }
  }, []);

  const closeMenu = () => setIsMobileMenuOpen(false);

  // Não exibe o botão voltar se estiver na rota principal do dashboard
  const isHome = location.pathname === '/dashboard/overview';

  return (
    <>
      <nav className={`navbar-dashboard ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container-dash">
          
          {/* LADO ESQUERDO: Voltar + Logo */}
          <div className="nav-left-dash">
              {!isHome && (
                <button className="btn-back-dash" onClick={() => navigate(-1)} title="Voltar">
                    <ArrowLeft size={20} />
                </button>
              )}

              <button 
                  className="mobile-toggle-btn" 
                  onClick={() => setIsMobileMenuOpen(true)}
                  aria-label="Abrir menu"
              >
                  <Menu size={24} />
              </button>

              <div className="nav-brand-dash" onClick={() => navigate('/dashboard/overview')}>
                  <img src={logoImg} alt="Data-Planner" className="nav-logo-dash" />
              </div>
          </div>

          {/* CENTRO: LINKS DESKTOP */}
          <div className="nav-links-desktop">
              <NavLink to="/dashboard/overview" className="nav-item-dash">
                <LayoutDashboard size={16} className="nav-icon" /> Visão Geral
              </NavLink>
              <NavLink to="/dashboard/planning" className="nav-item-dash">
                <Target size={16} className="nav-icon" /> Planejamento
              </NavLink>
              <NavLink to="/dashboard/kanban" className="nav-item-dash">
                <KanbanSquare size={16} className="nav-icon" /> Demandas
              </NavLink>
              <NavLink to="/dashboard/financial" className="nav-item-dash">
                <DollarSign size={16} className="nav-icon" /> Financeiro
              </NavLink>
              <NavLink to="/dashboard/storage" className="nav-item-dash">
                <FolderOpen size={16} className="nav-icon" /> Arquivos
              </NavLink>
              
              {/* Nossos links novos agora usando NavLink para brilhar quando ativos */}
              <NavLink to="/dashboard/dataroom" className="nav-item-dash">
                <FileText size={16} className="nav-icon"/> Data Room
              </NavLink>
              <NavLink to="/dashboard/info" className="nav-item-dash">
                <Info size={16} className="nav-icon"/> Info
              </NavLink>
          </div>

          {/* LADO DIREITO: PERFIL */}
          <div className="nav-right-dash" onClick={() => navigate('/dashboard/infoprofile')} title="Acessar Perfil">
              <div className="startup-info-dash">
                  <h4>{info.startupName}</h4>
                  <span>{info.startupCnpj ? `CNPJ: ${info.startupCnpj}` : info.userRole}</span>
              </div>
              
              <div className="avatar-box">
                {info.startupLogo ? (
                    <img src={info.startupLogo} alt="Logo Startup" className="avatar-image" />
                ) : (
                    <div className="avatar-fallback">{info.userInitials}</div>
                )}
              </div>
          </div>
        </div>
      </nav>

      {/* --- GAVETA MOBILE (DRAWER) --- */}
      {isMobileMenuOpen && <div className="drawer-overlay" onClick={closeMenu}></div>}
      
      <div className={`mobile-nav-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="drawer-header">
           <img src={logoImg} alt="Data-Planner" className="drawer-logo" />
           <button className="btn-close-drawer" onClick={closeMenu}>
             <X size={24} />
           </button>
        </div>

        <div className="drawer-profile" onClick={() => { navigate('/dashboard/infoprofile'); closeMenu(); }}>
            <div className="avatar-box large">
              {info.startupLogo ? (
                  <img src={info.startupLogo} alt="Logo" className="avatar-image" />
              ) : (
                  <div className="avatar-fallback">{info.userInitials}</div>
              )}
            </div>
            <div className="drawer-profile-info">
                <h4>{info.startupName}</h4>
                <span>{info.userRole}</span>
            </div>
        </div>

        <div className="drawer-links">
            <NavLink to="/dashboard/overview" className="drawer-item" onClick={closeMenu}>
              <LayoutDashboard size={20} /> Visão Geral
            </NavLink>
            <NavLink to="/dashboard/planning" className="drawer-item" onClick={closeMenu}>
              <Target size={20} /> Planejamento
            </NavLink>
            <NavLink to="/dashboard/kanban" className="drawer-item" onClick={closeMenu}>
              <KanbanSquare size={20} /> Demandas
            </NavLink>
            <NavLink to="/dashboard/financial" className="drawer-item" onClick={closeMenu}>
              <DollarSign size={20} /> Financeiro
            </NavLink>
            <NavLink to="/dashboard/storage" className="drawer-item" onClick={closeMenu}>
              <FolderOpen size={20} /> Arquivos
            </NavLink>
            
            {/* Adicionados no menu mobile */}
            <NavLink to="/dashboard/dataroom" className="drawer-item" onClick={closeMenu}>
              <FileText size={20} /> Data Room
            </NavLink>
            <NavLink to="/dashboard/info" className="drawer-item" onClick={closeMenu}>
              <Info size={20} /> Info
            </NavLink>

            <NavLink to="/dashboard/infoprofile" className="drawer-item profile-link" onClick={closeMenu}>
              <UserCircle size={20} /> Configurações de Conta
            </NavLink>
        </div>
      </div>
    </>
  );
}