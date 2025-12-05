import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';

export default function Home() {
  const navigate = useNavigate();

  // Hook para animação de scroll (Scroll Reveal)
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
        }
      });
    });

    // Seleciona todos os elementos com a classe 'hidden'
    const hiddenElements = document.querySelectorAll('.hidden');
    hiddenElements.forEach((el) => observer.observe(el));

    return () => hiddenElements.forEach((el) => observer.unobserve(el));
  }, []);

  return (
    <div className="home-container">
      {/* Formas Geométricas de Fundo (Vazadas e Coloridas) */}
      <div className="bg-shape shape-1"></div>
      <div className="bg-shape shape-2"></div>
      <div className="bg-shape shape-3"></div>

      {/* --- HERO SECTION --- */}
      <section className="hero-section hidden">
        <h1 className="hero-title">
          DATA <span className="highlight">PLANNING</span>
        </h1>
        
        <p className="hero-subtitle">
          A primeira plataforma proprietária que correlaciona matematicamente 
          Qualidade, Tempo e Escopo para precificar projetos de software.
        </p>

        <div className="action-buttons">
          <button className="btn-outline" onClick={() => navigate('/login')}>
            Já tenho minha Startup
          </button>
          <button className="btn-primary" onClick={() => navigate('/register')}>
            Cadastrar Startup
          </button>
        </div>
      </section>

      {/* --- SEÇÃO 1: Objetivo (Texto Esquerda / Imagem Direita) --- */}
      <section className="content-section hidden">
        <div className="text-block">
          <h2>Centralização <span style={{color: 'var(--cyber-blue)'}}>Estratégica</span></h2>
          <p>
            Elimine a fragmentação. Chega de alternar entre Trello, Drive e Excel. 
            O DATA PLANNING centraliza a operação técnica, financeira e estratégica 
            em um único ambiente de alta performance.
          </p>
          <p>
            Visão clara do budget vs gasto real em tempo real.
          </p>
        </div>
        
        <div className="visual-block">
          <div className="tech-grid">
            {/* Simulando interface futurista */}
            <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center'}}>
               <span style={{fontSize: '3rem', display: 'block'}}>💠</span>
               <span style={{color: 'var(--text-secondary)', fontSize: '0.8rem', letterSpacing: '2px'}}>SINGLE SOURCE OF TRUTH</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO 2: A Tríade (Imagem Esquerda / Texto Direita) --- */}
      <section className="content-section reverse hidden">
        <div className="text-block">
          <h2>A Tríade de <span style={{color: 'var(--neon-green)'}}>Ferro</span></h2>
          <p>
            Nosso núcleo baseia-se na correlação matemática entre 
            <strong> Qualidade, Tempo e Escopo</strong>.
          </p>
          <p>
            Diferente de gerenciadores comuns, utilizamos vetores proprietários 
            para definir expectativas de entrega dinamicamente, garantindo 
            previsibilidade financeira para sua startup.
          </p>
        </div>

        <div className="visual-block">
          <div className="tech-grid">
             <div style={{
               position: 'absolute', width: '100%', height: '100%', 
               display: 'flex', justifyContent: 'center', alignItems: 'center'
             }}>
                {/* Triângulo CSS Representando a Tríade */}
                <div style={{
                  width: '0', height: '0', 
                  borderLeft: '50px solid transparent', 
                  borderRight: '50px solid transparent', 
                  borderBottom: '86px solid var(--neon-purple)',
                  filter: 'drop-shadow(0 0 15px var(--neon-purple))'
                }}></div>
             </div>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO 3: Tech Stack (Texto Esquerda) --- */}
      <section className="content-section hidden">
         <div className="text-block">
          <h2>Arquitetura <span style={{color: 'var(--alert-yellow)'}}>Serverless</span></h2>
          <p>
            Construído para escalar. Nossa arquitetura separa rigidamente a lógica 
            de negócio sensível (Vercel Serverless Functions) do cliente visual, 
            garantindo segurança máxima para seus dados.
          </p>
          <p>
            Banco de dados PostgreSQL com RLS (Row Level Security) nativo, 
            garantindo isolamento total entre startups.
          </p>
        </div>
        
        <div className="visual-block">
           <div className="tech-grid">
              <div style={{
                 position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                 color: 'var(--alert-yellow)', fontSize: '2rem', border: '2px solid var(--alert-yellow)',
                 padding: '20px', borderRadius: '8px'
              }}>
                SECURE::API
              </div>
           </div>
        </div>
      </section>

      <footer style={{textAlign: 'center', padding: '40px', borderTop: '1px solid #222', marginTop: '50px'}}>
        <p style={{color: '#666'}}>DATA PLANNING | DATA-RO INTELIGÊNCIA TERRITORIAL © 2025. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}