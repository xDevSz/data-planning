import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { roadmapPhases } from '../data/accelerationData';
import { 
  Lightbulb, LayoutTemplate, CodeSquare, Megaphone, TrendingUp, 
  SearchCheck, Target, PenTool, Server, Bug, Rocket, Magnet, 
  Network, Filter, DollarSign, LineChart, HeartHandshake, Maximize,
  ArrowRight, FolderOpen, ExternalLink, Activity
} from 'lucide-react';

export default function StartupRoadmap() {
  const navigate = useNavigate();
  const [openPhaseId, setOpenPhaseId] = useState(null);

  const togglePhase = (id) => {
    setOpenPhaseId(openPhaseId === id ? null : id);
  };

  const renderIcon = (iconName) => {
    switch (iconName) {
      case 'Lightbulb': return <Lightbulb size={24} />;
      case 'SearchCheck': return <SearchCheck size={24} />;
      case 'Target': return <Target size={24} />;
      case 'PenTool': return <PenTool size={24} />;
      case 'CodeSquare': return <CodeSquare size={24} />;
      case 'Server': return <Server size={24} />;
      case 'Bug': return <Bug size={24} />;
      case 'Rocket': return <Rocket size={24} />;
      case 'Magnet': return <Magnet size={24} />;
      case 'Network': return <Network size={24} />;
      case 'Filter': return <Filter size={24} />;
      case 'DollarSign': return <DollarSign size={24} />;
      case 'LineChart': return <LineChart size={24} />;
      case 'HeartHandshake': return <HeartHandshake size={24} />;
      case 'TrendingUp': return <TrendingUp size={24} />;
      case 'Maximize': return <Maximize size={24} />;
      default: return <Lightbulb size={24} />;
    }
  };

  return (
    <div className="roadmap-wrapper fade-in">
      <div className="guide-header">
        <h2>SaaS Blueprint: A Bíblia do Produto</h2>
        <p>A mortalidade de startups de software chega a 90% porque fundadores pulam etapas fundamentais. Do design ao tráfego: siga este mapa cronológico rigorosamente para garantir a escala perfeita do seu negócio.</p>
      </div>

      <div className="roadmap-accordion-container">
        {roadmapPhases.map((phase) => {
          const isOpen = openPhaseId === phase.id;

          return (
            <div key={phase.id} className={`roadmap-card glass-card ${isOpen ? 'open' : ''}`}>
              
              {/* HEADER DO CARD (Clicável) */}
              <div className="rm-header" onClick={() => togglePhase(phase.id)}>
                <div className="rm-header-left">
                  <div className="rm-icon-box" style={{ color: phase.color, background: `${phase.color}15`, border: `1px solid ${phase.color}40` }}>
                    {renderIcon(phase.icon)}
                  </div>
                  <h3 className="rm-title"><span className="rm-number" style={{color: phase.color}}>{phase.id}.</span> {phase.phase}</h3>
                </div>
                <div className="rm-header-right">
                  <span className="rm-toggle-icon">{isOpen ? '−' : '+'}</span>
                </div>
              </div>

              {/* CORPO DO CARD (Abre ao clicar) */}
              <div className="rm-body">
                <p className="rm-desc">{phase.description}</p>
                
                {/* SUB-ITENS (Pastas da imagem) */}
                <div className="rm-subitems-grid">
                  {phase.subItems.map((item, idx) => (
                    <div key={idx} className="rm-subitem">
                      <FolderOpen size={16} className="text-text-dim" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="rm-integration-grid">
                  {/* INTEGRAÇÃO DATA-PLANNER */}
                  <div className="rm-integration-box dp-box">
                    <div className="dp-box-header">
                      <Activity size={18} className="text-neon-purple"/>
                      <h4>Apoio do Data-Planner</h4>
                    </div>
                    <p>{phase.dataPlanner.text}</p>
                    <button 
                      className="rm-btn-action" 
                      onClick={() => navigate(phase.dataPlanner.route)}
                    >
                      {phase.dataPlanner.btnText} <ArrowRight size={16}/>
                    </button>
                  </div>

                  {/* FERRAMENTAS EXTERNAS (ECOSSISTEMA) */}
                  <div className="rm-integration-box ext-box">
                    <div className="ext-box-header">
                      <ExternalLink size={18} className="text-cyber-blue"/>
                      <h4>Ecossistema Recomendado</h4>
                    </div>
                    <p>{phase.externalTools.text}</p>
                    <div className="ext-tools-tags">
                      {phase.externalTools.tools.map((tool, idx) => (
                        <span key={idx} className="ext-tool-tag">{tool}</span>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}