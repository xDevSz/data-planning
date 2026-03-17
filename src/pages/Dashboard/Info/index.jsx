import React, { useState } from 'react';
import Navbar from '../../../components/Navbar';
import { Lightbulb, Rocket, Landmark, Coins } from 'lucide-react';
import FundingGuide from './components/FundingGuide';
import StartupRoadmap from './components/StartupRoadmap';
import FinExecution from './components/FinExecution';
import './index.css';

export default function Info() {
  // Começamos direto no Roadmap por ser o mais visual e importante
  const [activeTab, setActiveTab] = useState('roadmap');

  return (
    <div className="info-base-wrapper">
      <Navbar />
      
      <main className="info-base-content fade-in">
        <header className="page-header">
          <div className="header-info">
            <h1 className="page-title"><Lightbulb className="text-alert-yellow mr-2"/> Base de Aceleração</h1>
            <p className="page-subtitle">O playbook definitivo para estruturar, financiar e escalar a sua startup de software sem cair nos abismos tradicionais do mercado.</p>
          </div>
        </header>

        {/* Menu de Navegação Interno */}
        <div className="academy-nav custom-scrollbar">
          <button className={`acad-btn ${activeTab === 'roadmap' ? 'active' : ''}`} onClick={() => setActiveTab('roadmap')}>
            <Rocket size={18}/> SaaS Blueprint (Roadmap)
          </button>
          <button className={`acad-btn ${activeTab === 'funding' ? 'active' : ''}`} onClick={() => setActiveTab('funding')}>
            <Landmark size={18}/> Editais & Fomento
          </button>
          <button className={`acad-btn ${activeTab === 'finance' ? 'active' : ''}`} onClick={() => setActiveTab('finance')}>
            <Coins size={18}/> Execução Financeira
          </button>
        </div>

        {/* Renderização Condicional Inteligente */}
        <div className="academy-content-area">
          {activeTab === 'roadmap' && <StartupRoadmap />}
          {activeTab === 'funding' && <FundingGuide />}
          {activeTab === 'finance' && <FinExecution />}
        </div>
      </main>
    </div>
  );
}