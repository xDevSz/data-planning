import React from 'react';
import { useNavigate } from 'react-router-dom';
import { fundingPhases } from '../data/accelerationData';
import { 
  Map, FileText, Mic, Rocket, ShieldAlert, ArrowRight, 
  CheckCircle2, Activity, ExternalLink 
} from 'lucide-react';

export default function FundingGuide() {
  const navigate = useNavigate();

  const renderIcon = (iconName, color) => {
    const props = { size: 24, color: color };
    switch (iconName) {
      case 'Map': return <Map {...props} />;
      case 'FileText': return <FileText {...props} />;
      case 'Mic': return <Mic {...props} />;
      case 'Rocket': return <Rocket {...props} />;
      case 'ShieldAlert': return <ShieldAlert {...props} />;
      default: return <FileText {...props} />;
    }
  };

  return (
    <div className="guide-wrapper fade-in">
      <div className="guide-header">
        <h2>O Jogo dos Editais e Fomento (Subvenção)</h2>
        <p>Editais são verbas a "fundo perdido" (equity-free) dadas pelo governo para incentivar inovação. Entenda o ciclo de vida cronológico de programas de aceleração para ser aprovado e não sofrer auditorias.</p>
      </div>

      <div className="timeline-container">
        {fundingPhases.map((phase, index) => (
          <div key={phase.id} className="timeline-step">
            
            {/* Ícone Conector */}
            <div className="timeline-icon-wrapper" style={{ borderColor: phase.color, boxShadow: `0 0 15px ${phase.color}40` }}>
              {renderIcon(phase.icon, phase.color)}
            </div>

            {/* Linha conectora (exceto no último) */}
            {index !== fundingPhases.length - 1 && <div className="timeline-line"></div>}

            {/* Cartão de Conteúdo Expandido */}
            <div className="timeline-content glass-card">
              <h3 style={{ color: phase.color }}><span style={{opacity: 0.5}}>{phase.id}.</span> {phase.phase}</h3>
              <p className="phase-desc">{phase.description}</p>
              
              {/* Checklists / Subitens */}
              <div className="tl-subitems">
                {phase.subItems.map((item, idx) => (
                  <span key={idx} className="tl-chip">
                    <CheckCircle2 size={14} className="text-text-dim" /> {item}
                  </span>
                ))}
              </div>
              
              {/* Integração Dupla (Data-Planner + Externo) */}
              <div className="tl-integration-grid">
                
                <div className="tl-box dp-box">
                  <div className="tl-box-header">
                    <Activity size={18} className="text-neon-purple"/>
                    <h4>Apoio do Data-Planner</h4>
                  </div>
                  <p>{phase.dataPlanner.text}</p>
                  <button 
                    className="tl-btn-action" 
                    onClick={() => navigate(phase.dataPlanner.route)}
                  >
                    {phase.dataPlanner.btnText} <ArrowRight size={16}/>
                  </button>
                </div>

                <div className="tl-box ext-box">
                  <div className="tl-box-header">
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
        ))}
      </div>
    </div>
  );
}