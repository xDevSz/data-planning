import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home as HomeIcon, Info, Layers, Phone, Send, 
  Rocket, Target, BarChart, FolderKanban, 
  ShieldCheck, ArrowRight, Zap, FileText, FileSpreadsheet,
  Globe2
} from 'lucide-react';
import './index.css';

import logoPlanner from '../../assets/logo.png';   
import logoDataRo from '../../assets/logo2.png';   

export default function Home() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
        }
      });
    }, { threshold: 0.1 });

    const hiddenElements = document.querySelectorAll('.hidden');
    hiddenElements.forEach((el) => observer.observe(el));

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      hiddenElements.forEach((el) => observer.unobserve(el));
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const servicesList = [
    { title: "Kanban Inteligente", icon: <FolderKanban size={40} className="icon-purple" /> },
    { title: "Fluxo de Caixa", icon: <BarChart size={40} className="icon-green" /> },
    { title: "Apoio a Editais", icon: <FileText size={40} className="icon-yellow" /> },
    { title: "Métricas e KPIs", icon: <Target size={40} className="icon-blue" /> },
    { title: "Storage Seguro", icon: <ShieldCheck size={40} className="icon-purple" /> },
    { title: "Gestão Ágil", icon: <Zap size={40} className="icon-green" /> },
  ];

  const closeMenu = () => setIsMenuOpen(false);

  // Componente interno para evitar repetição dos botões do menu
  const NavItems = () => (
    <>
      <a href="#inicio" onClick={closeMenu}>
        <HomeIcon size={18} /> Início
      </a>
      <a href="#sobre" onClick={closeMenu}>
        <Info size={18} /> Sobre nós
      </a>
      <a href="#fomento" onClick={closeMenu}>
        <Target size={18} /> Editais
      </a>
      <a href="#servicos" onClick={closeMenu}>
        <Layers size={18} /> Módulos
      </a>
      <button className="nav-btn-fale" onClick={() => { closeMenu(); document.getElementById('contato').scrollIntoView(); }}>
        <Send size={16} /> Fale Conosco
      </button>
    </>
  );

  return (
    <div className="home-container">
      <div className="bg-shape shape-1"></div>
      <div className="bg-shape shape-2"></div>
      <div className="bg-shape shape-3"></div>

      {/* --- HEADER / NAVBAR (Sempre Acompanha o Scroll) --- */}
      <header className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <div className="nav-logo" onClick={() => { window.scrollTo(0,0); closeMenu(); }}>
            <img src={logoPlanner} alt="Data-Planner Logo" />
          </div>

          {/* Menu Desktop */}
          <nav className="desktop-nav">
            <NavItems />
          </nav>

          {/* Botão Hambúrguer Mobile */}
          <button 
            className="mobile-menu-btn" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Alternar menu"
          >
            <div className={`hamburger ${isMenuOpen ? 'open' : ''}`}></div>
          </button>
        </div>
      </header>

      {/* --- MENU MOBILE GAVETA (Independente do Header para não falhar) --- */}
      {isMenuOpen && <div className="menu-overlay" onClick={closeMenu}></div>}
      <nav className={`mobile-drawer ${isMenuOpen ? 'open' : ''}`}>
        <NavItems />
      </nav>

      {/* --- HERO SECTION --- */}
      <section id="inicio" className="hero-section hidden">
        <div className="hero-logo-wrapper pulse-animation">
           <img src={logoPlanner} alt="Data-Planner" className="hero-logo-img" />
        </div>
        
        <h1 className="hero-title">
          Data-<span className="highlight">Planner</span>
        </h1>
        
        <p className="hero-subtitle">
          A primeira plataforma proprietária que correlaciona matematicamente 
          Qualidade, Tempo e Escopo para precificar projetos de software e acelerar resultados.
        </p>

        <div className="action-buttons">
          <button className="btn-outline" onClick={() => navigate('/login')}>
            <ArrowRight size={20} /> Já tenho minha conta
          </button>
          <button className="btn-primary" onClick={() => navigate('/register')}>
            <Rocket size={20} /> Cadastrar Startup
          </button>
        </div>
      </section>

      {/* --- SEÇÃO: SOBRE --- */}
      <section id="sobre" className="about-section hidden">
        <div className="about-container">
          <div className="about-visual">
             <div className="abstract-bg">
                <div className="abstract-line"></div>
                <div className="abstract-line line-2"></div>
                <div className="abstract-line line-3"></div>
             </div>
             <div className="about-logo-center">
                <img src={logoDataRo} alt="DATA-RO Inteligência Territorial" />
             </div>
             <div className="experience-badge">
                <span className="badge-number">BIG</span>
                <span className="badge-text">DATA</span>
             </div>
          </div>

          <div className="about-content">
            <h4 className="section-pre-title text-yellow">QUEM SOMOS</h4>
            <h2>DATA-RO INTELIGÊNCIA TERRITORIAL</h2>
            <div className="title-underline bg-yellow"></div>
            
            <p>
              A <strong>DATA-RO INTELIGÊNCIA TERRITORIAL</strong> é uma <em>Data Tech e Software House</em> especializada na criação de sistemas sob medida para o setor público, privado, órgãos governamentais e prefeituras.
            </p>
            <p>
              Trabalhamos focados em <strong>Big Data</strong> e Inteligência Territorial. Nosso principal objetivo é modernizar a infraestrutura de TI dos nossos clientes: entregamos sistemas novos, <strong>100% funcionais e de extrema excelência</strong> (ou reformulamos arquiteturas já existentes) por um <strong>preço justo</strong>.
            </p>
            <p>
              Não importa a complexidade ou o tamanho do cliente, nossa entrega é sempre pautada pela inovação, segurança e alta performance estrutural.
            </p>
          </div>
        </div>
      </section>

      {/* --- NOVA SEÇÃO: FOMENTO E EDITAIS --- */}
      <section id="fomento" className="content-section hidden">
         <div className="text-block">
          <h4 className="section-pre-title text-green">ACELERAÇÃO DE STARTUPS</h4>
          <h2>Projetos, Editais e <span className="text-neon-green">Fomento</span></h2>
          <p>
            Sabemos que a maioria dos empreendedores tem dificuldades em organizar prazos e montar um <strong>cronograma de execução financeira</strong> realista. O Data-Planner vai muito além de um simples organizador.
          </p>
          <p>
            Possuímos uma área dedicada a estruturar sua startup para processos seletivos e programas de fomento (como o <strong>Programa Centelha</strong>). Extraímos os pontos principais dos editais governamentais e ajudamos você a mapear seu projeto de ponta a ponta.
          </p>
          <button className="btn-icon-text mt-4">
             <FileSpreadsheet size={20} /> Conhecer Módulo de Fomento
          </button>
        </div>
        
        <div className="visual-block roadmap-visual">
           <div className="roadmap-overlay">
              <div className="roadmap-item"><FolderKanban size={24} className="text-yellow"/> <span>Problem Discovery</span></div>
              <div className="roadmap-item"><BarChart size={24} className="text-green"/> <span>Validation & Demand</span></div>
              <div className="roadmap-item"><Target size={24} className="text-neon-purple"/> <span>MVP Scope & Tech Stack</span></div>
              <div className="roadmap-item"><Rocket size={24} className="text-blue"/> <span>Launch & Distribution</span></div>
           </div>
        </div>
      </section>

      {/* --- SEÇÃO: INOVAÇÃO E ESCALABILIDADE --- */}
      <section className="content-section reverse hidden">
         <div className="text-block">
          <h4 className="section-pre-title text-blue">AGILE & SCALE</h4>
          <h2>Cultura de Inovação e <span className="text-cyber-blue">Escalabilidade</span></h2>
          <p>
            Projetos de alto crescimento precisam de flexibilidade para pivotar sem perder o controle do que já foi construído. Nossa arquitetura foi desenhada para respirar a cultura ágil.
          </p>
          <p>
            Ao fornecer transparência total sobre projetos e finanças, o Data-Planner empodera gestores para tomarem riscos calculados. Apresente relatórios sólidos para investidores e escale sua operação com a tranquilidade de quem domina seus próprios dados.
          </p>
        </div>
        
        <div className="visual-block glow-block">
           <div className="tech-grid">
              <div className="innovation-logo-box">
                 <Globe2 size={60} className="icon-cyber-blue pulse-slow" />
                 <div className="innovation-text">GLOBAL SCALE</div>
              </div>
           </div>
        </div>
      </section>

      {/* --- SEÇÃO: CENTRALIZAÇÃO ESTRATÉGICA --- */}
      <section className="content-section hidden">
        <div className="text-block">
          <h4 className="section-pre-title text-purple">WORKFLOW</h4>
          <h2>Centralização <span className="text-neon-purple">Estratégica</span></h2>
          <p>
            Equipes perdem até 30% do tempo operacional procurando informações em ferramentas desconexas. Elimine a fragmentação e deixe de alternar entre Trello, Drive e planilhas avulsas.
          </p>
          <p>
            O <strong>Data-Planner</strong> centraliza a operação técnica, financeira e a gestão de documentos em um único ambiente de performance. Decisões infinitamente mais rápidas e baseadas em dados precisos.
          </p>
        </div>
        
        <div className="visual-block">
          <div className="tech-grid">
            <div className="logo-badge-center">
               <img src={logoPlanner} alt="Data-Planner Logo" className="center-logo-img pulse-slow" />
               <span className="badge-label">SINGLE SOURCE OF TRUTH</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO: CARROSSEL INFINITO --- */}
      <section id="servicos" className="scroller-section hidden">
        <h4 className="section-pre-title center text-yellow">ECOSSISTEMA DO DATA-PLANNER</h4>
        <h2 className="scroller-title">Módulos do Data-Planner</h2>
        <div className="title-underline center bg-yellow"></div>
        
        <div className="scroller-container">
          <div className="scroller-track">
            {[...servicesList, ...servicesList].map((service, index) => (
              <div className="scroller-card" key={index}>
                <div className="scroller-icon-wrapper">{service.icon}</div>
                <div className="scroller-text">{service.title}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SEÇÃO: CONTATO --- */}
      <section id="contato" className="contact-section hidden">
        <h4 className="section-pre-title center text-green">SUPORTE</h4>
        <h2 className="contact-title">Fale Conosco</h2>
        <div className="title-underline center bg-green"></div>
        <p className="contact-subtitle">
          Entre em contato para descobrir como podemos construir ou modernizar o sistema da sua instituição.
        </p>

        <div className="contact-cards-container">
          <div className="contact-card hover-green">
            <div className="contact-icon-wrapper bg-green-light">
               <Phone size={28} className="text-neon-green" />
            </div>
            <div className="contact-info">
              <span className="contact-label">Telefone / WhatsApp</span>
              <span className="contact-value">(69) 99908-9202</span>
            </div>
          </div>

          <div className="contact-card hover-purple">
            <div className="contact-icon-wrapper bg-purple-light">
               <Send size={28} className="text-neon-purple" />
            </div>
            <div className="contact-info">
              <span className="contact-label">E-mail Corporativo</span>
              <span className="contact-value">contato@dataro-it.com.br</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="home-footer">
        <div className="footer-logos-container">
          <img src={logoPlanner} alt="Data-Planner Logo" className="footer-logo-img" />
          <div className="footer-divider-gradient"></div>
          <img src={logoDataRo} alt="DATA-RO INTELIGÊNCIA TERRITORIAL" className="footer-logo-img company-logo" />
        </div>

        <div className="footer-links">
           <a href="#inicio">Início</a>
           <a href="#sobre">Sobre a Empresa</a>
           <a href="#fomento">Editais</a>
           <a href="#servicos">Módulos</a>
        </div>
        <p className="footer-text">
          DATA-RO INTELIGÊNCIA TERRITORIAL © {new Date().getFullYear()}. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}