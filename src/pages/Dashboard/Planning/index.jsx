import React, { useState, useEffect } from 'react';
import Navbar from '../../../components/Navbar';
import { appService } from '../../../services/appService';
import { useAlert } from '../../../hooks/useAlert'; // Importando o Hook
import './index.css';

export default function Planning() {
  const alertHook = useAlert(); // Hook
  
  // Variáveis de Estado (0 a 100)
  const [quality, setQuality] = useState(50); 
  const [urgency, setUrgency] = useState(30); 
  const [scope, setScope] = useState(20);     

  // Resultados calculados
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [calculatedEffort, setCalculatedEffort] = useState(0);
  const [teamSize, setTeamSize] = useState(1);

  // ALGORITMO DE CÁLCULO
  useEffect(() => {
    const BASE_PRICE = 2500; 
    const SCOPE_COST_PER_UNIT = 300; 
    
    const qualityMultiplier = 1 + (quality / 100); 
    const urgencyMultiplier = 1 + ((urgency * 1.5) / 100); 

    const rawPrice = (BASE_PRICE + (scope * SCOPE_COST_PER_UNIT)) * qualityMultiplier * urgencyMultiplier;
    
    let days = (scope * 2); 
    days = days * (1 + (quality / 200)); 
    
    const speedFactor = 1 - (urgency / 150); 
    const finalDays = Math.max(5, Math.ceil(days * speedFactor)); 

    let team = 1;
    if (scope > 50) team += 2;
    if (urgency > 70) team += 2;
    if (quality > 80) team += 1;

    setCalculatedPrice(Math.floor(rawPrice));
    setCalculatedEffort(finalDays);
    setTeamSize(team);

  }, [quality, urgency, scope]);

  // Labels Dinâmicas
  const getQualityLabel = (val) => val < 30 ? "MVP (Mínimo Viável)" : val < 70 ? "Padrão de Mercado" : "Alta Performance / Crítico";
  const getUrgencyLabel = (val) => val < 30 ? "Prazo Confortável" : val < 70 ? "Prioridade Normal" : "Urgência Máxima (ASAP)";
  const getScopeLabel = (val) => val < 30 ? "Feature Pequena" : val < 70 ? "Módulo Completo" : "Sistema Inteiro / Plataforma";

  // Botão Aprovar -> Abre Prompt do SweetAlert
  const handlePreApprove = async () => {
    // 1. Pede o nome do projeto
    const projectName = await alertHook.prompt(
      "Finalizar Planejamento", 
      "Dê um nome para este projeto:"
    );

    if (!projectName) return; // Cancelou ou vazio

    // 2. Confirmação final com valores
    const confirmed = await alertHook.confirm(
      "Confirmar Criação?", 
      `Projeto: ${projectName}\nInvestimento: R$ ${calculatedPrice.toLocaleString('pt-BR')}`,
      "Sim, Criar Projeto"
    );

    if (confirmed) {
      handleConfirmSave(projectName);
    }
  };

  // Salvar Real no Supabase
  const handleConfirmSave = async (title) => {
    try {
      // Calcula Data de Entrega
      const deadlineDate = new Date();
      deadlineDate.setDate(deadlineDate.getDate() + calculatedEffort);

      await appService.createProjectWithDemands({
        title: title,
        description: `Planejamento Automático: Qualidade ${quality}%, Urgência ${urgency}%, Escopo ${scope}%`,
        budget_estimated: calculatedPrice,
        deadline: deadlineDate.toISOString(),
        quality_score: quality,
        time_score: urgency,
        scope_score: scope
      }, []); 

      alertHook.notify("Projeto criado com sucesso! 🚀");
      
      // Resetar para valores padrão
      setQuality(50); setUrgency(30); setScope(20);

    } catch (error) {
      console.error(error);
      alertHook.notifyError("Erro ao salvar projeto.");
    }
  };

  return (
    <div className="planning-container">
      <Navbar />
      
      <div className="planning-content">
        <div className="planning-header">
          <h1>Planejamento & Viabilidade</h1>
          <p>Defina as variáveis da Tríade de Ferro para calcular a projeção.</p>
        </div>

        <div className="planning-grid">
          
          {/* COLUNA ESQUERDA: SLIDERS */}
          <div className="controls-section">
            
            <div className="slider-group">
              <div className="slider-header">
                <span className="slider-label" style={{color: 'var(--neon-purple)'}}>Qualidade Técnica</span>
                <span className="slider-value" style={{color: 'var(--neon-purple)'}}>{quality}%</span>
              </div>
              <input 
                type="range" min="0" max="100" 
                value={quality} onChange={(e) => setQuality(Number(e.target.value))} 
                className="custom-range range-quality" 
              />
              <p className="range-desc">{getQualityLabel(quality)}</p>
            </div>

            <div className="slider-group">
              <div className="slider-header">
                <span className="slider-label" style={{color: 'var(--alert-yellow)'}}>Urgência / Prazo</span>
                <span className="slider-value" style={{color: 'var(--alert-yellow)'}}>{urgency}%</span>
              </div>
              <input 
                type="range" min="0" max="100" 
                value={urgency} onChange={(e) => setUrgency(Number(e.target.value))} 
                className="custom-range range-time" 
              />
              <p className="range-desc">{getUrgencyLabel(urgency)}</p>
            </div>

            <div className="slider-group">
              <div className="slider-header">
                <span className="slider-label" style={{color: 'var(--cyber-blue)'}}>Volume de Escopo</span>
                <span className="slider-value" style={{color: 'var(--cyber-blue)'}}>{scope}%</span>
              </div>
              <input 
                type="range" min="0" max="100" 
                value={scope} onChange={(e) => setScope(Number(e.target.value))} 
                className="custom-range range-scope" 
              />
              <p className="range-desc">{getScopeLabel(scope)}</p>
            </div>

          </div>

          {/* COLUNA DIREITA: RESULTADO (OUTPUT) */}
          <div className="result-section">
            <div className="result-card">
              <div className="result-title">--- PROJEÇÃO ALGORÍTMICA ---</div>
              
              <div className="price-display">
                <span className="price-label">INVESTIMENTO SUGERIDO</span>
                <span className="price-value">R$ {calculatedPrice.toLocaleString('pt-BR')}</span>
              </div>

              <div className="effort-display">
                <div className="metric">
                  <h4>{calculatedEffort}</h4>
                  <span>Dias Úteis</span>
                </div>
                <div className="metric">
                  <h4>{teamSize}</h4>
                  <span>Devs (Squad)</span>
                </div>
              </div>

              <button className="btn-approve" onClick={handlePreApprove}>
                Aprovar & Criar Projeto
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}