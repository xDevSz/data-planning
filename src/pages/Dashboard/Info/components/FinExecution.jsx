import React from 'react';
import { useNavigate } from 'react-router-dom';
import { financePlaybook } from '../data/accelerationData';
import { 
  Monitor, Server, Users, ArrowRight, ShieldAlert, 
  TrendingDown, Calculator, Landmark, Target
} from 'lucide-react';

export default function FinExecution() {
  const navigate = useNavigate();
  const data = financePlaybook;

  const renderIcon = (iconName, color) => {
    const props = { size: 28, color: color };
    switch (iconName) {
      case 'Monitor': return <Monitor {...props} />;
      case 'Server': return <Server {...props} />;
      case 'Users': return <Users {...props} />;
      default: return <Landmark {...props} />;
    }
  };

  return (
    <div className="fin-execution-wrapper fade-in">
      <div className="guide-header text-center">
        <h2>Execução Financeira & Compliance</h2>
        <p>A matemática da sobrevivência. Gerir capital próprio ou de editais exige rigor absoluto. Desvios de rubrica ou falta de prestação de contas resultam em devolução de dinheiro com juros ou falência prematura.</p>
      </div>

      <div className="bento-grid">
        
        {/* BENTO 1: RUNWAY (Destaque Principal) */}
        <div className="bento-card large alert-bento">
          <div className="bento-icon-bg bg-red-glow"><TrendingDown size={32} className="text-alert-red"/></div>
          <div className="bento-content">
            <h3 className="text-alert-red">{data.survival.title}</h3>
            <p>{data.survival.description}</p>
            <div className="bento-action mt-auto">
              <span className="bento-hint">{data.survival.plannerAction.text}</span>
              <button className="bento-btn bg-red" onClick={() => navigate(data.survival.plannerAction.route)}>
                Simular Orçamento <ArrowRight size={16}/>
              </button>
            </div>
          </div>
        </div>

        {/* BENTO 2: COMPLIANCE E IMPOSTOS */}
        <div className="bento-card medium dark-bento">
          <div className="bento-icon-bg bg-purple-glow"><Landmark size={28} className="text-neon-purple"/></div>
          <div className="bento-content">
            <h3>{data.compliance.title}</h3>
            <p>{data.compliance.description}</p>
            <div className="bento-action mt-auto">
              <span className="bento-hint">{data.compliance.plannerAction.text}</span>
              <button className="bento-btn bg-purple" onClick={() => navigate(data.compliance.plannerAction.route)}>
                Acessar Livro Caixa <ArrowRight size={16}/>
              </button>
            </div>
          </div>
        </div>

        {/* BENTO 3: DICIONÁRIO DE KPIs */}
        <div className="bento-card small kpi-bento custom-scrollbar">
          <div className="bento-icon-bg bg-blue-glow mb-3"><Calculator size={24} className="text-cyber-blue"/></div>
          <h3>KPIs Essenciais SaaS</h3>
          <div className="kpi-list">
            {data.kpis.map((kpi, idx) => (
              <div key={idx} className="kpi-item">
                <div className="kpi-name">{kpi.name}</div>
                <div className="kpi-info">
                  <strong>{kpi.fullName}</strong>
                  <span>{kpi.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BENTOS 4, 5, 6: RUBRICAS DE EDITAL */}
        <div className="bento-card large title-only-bento">
          <Target size={24} className="text-alert-yellow mr-2"/> 
          <h3>Entendendo as Rubricas de Fomento (Editais)</h3>
        </div>

        {data.rubrics.map((pillar) => (
          <div key={pillar.id} className="bento-card small rubric-bento">
            <div className="rubric-header">
              <div className="bento-icon-bg" style={{ background: `${pillar.color}15`, border: `1px solid ${pillar.color}40` }}>
                {renderIcon(pillar.icon, pillar.color)}
              </div>
              <h4>{pillar.title}</h4>
            </div>
            <p>{pillar.rules}</p>
          </div>
        ))}

      </div>
    </div>
  );
}