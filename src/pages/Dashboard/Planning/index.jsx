import React, { useState, useEffect } from 'react';
import Navbar from '../../../components/Navbar';
import Modal from '../../../components/Modal'; // Importando para pedir o nome
import { appService } from '../../../services/appService';
import './index.css';

export default function Planning() {
  
  // Variáveis de Estado (0 a 100)
  const [quality, setQuality] = useState(50); 
  const [urgency, setUrgency] = useState(30); 
  const [scope, setScope] = useState(20);     

  // Resultados calculados
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [calculatedEffort, setCalculatedEffort] = useState(0);
  const [teamSize, setTeamSize] = useState(1);

  // Estado para salvar no banco
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [loading, setLoading] = useState(false);

  // ALGORITMO DE CÁLCULO (Sua Lógica Original)
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

  // Botão Aprovar
  const handlePreApprove = () => {
    setIsConfirmOpen(true); // Abre modal para pedir o nome
  };

  // Salvar Real no Supabase
  const handleConfirmSave = async () => {
    if (!projectTitle) return alert("Dê um nome ao projeto.");
    setLoading(true);

    try {
      // Calcula Data de Entrega baseada nos dias de esforço
      const deadlineDate = new Date();
      deadlineDate.setDate(deadlineDate.getDate() + calculatedEffort);

      await appService.createProjectWithDemands({
        title: projectTitle,
        description: `Planejamento Automático: Qualidade ${quality}%, Urgência ${urgency}%, Escopo ${scope}%`,
        budget_estimated: calculatedPrice,
        deadline: deadlineDate.toISOString(),
        quality_score: quality,
        time_score: urgency,
        scope_score: scope
      }, []); // Sem tarefas iniciais manuais, apenas cria o projeto base

      alert("PROJETO CRIADO COM SUCESSO!\nVisível no Dashboard e Kanban.");
      setIsConfirmOpen(false);
      setProjectTitle('');
      // Resetar sliders se quiser
      setQuality(50); setUrgency(30); setScope(20);

    } catch (error) {
      console.error(error);
      alert("Erro ao salvar projeto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="planning-container">
      <Navbar />
      
      <div className="planning-content">
        <div className="planning-header">
          <h1>Planejamento & Viabilidade</h1>
          <p>Defina as variáveis da Tríade de Ferro para calcular a projeção do projeto.</p>
        </div>

        <div className="planning-grid">
          
          {/* SLIDERS */}
          <div className="controls-section">
            
            <div className="slider-group">
              <div className="slider-header">
                <span className="slider-label" style={{color: 'var(--neon-purple)'}}>Qualidade Técnica</span>
                <span className="slider-value" style={{color: 'var(--neon-purple)'}}>{quality}%</span>
              </div>
              <input type="range" min="0" max="100" value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="custom-range range-quality" />
              <p className="range-desc">{getQualityLabel(quality)}</p>
            </div>

            <div className="slider-group">
              <div className="slider-header">
                <span className="slider-label" style={{color: 'var(--alert-yellow)'}}>Urgência / Prazo</span>
                <span className="slider-value" style={{color: 'var(--alert-yellow)'}}>{urgency}%</span>
              </div>
              <input type="range" min="0" max="100" value={urgency} onChange={(e) => setUrgency(Number(e.target.value))} className="custom-range range-time" />
              <p className="range-desc">{getUrgencyLabel(urgency)}</p>
            </div>

            <div className="slider-group">
              <div className="slider-header">
                <span className="slider-label" style={{color: 'var(--cyber-blue)'}}>Volume de Escopo</span>
                <span className="slider-value" style={{color: 'var(--cyber-blue)'}}>{scope}%</span>
              </div>
              <input type="range" min="0" max="100" value={scope} onChange={(e) => setScope(Number(e.target.value))} className="custom-range range-scope" />
              <p className="range-desc">{getScopeLabel(scope)}</p>
            </div>

          </div>

          {/* RESULTADO (OUTPUT) */}
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

      {/* MODAL PARA CONFIRMAR NOME */}
      <Modal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} title="Finalizar Planejamento">
        <div className="modal-form">
          <p style={{color:'#aaa'}}>O orçamento de <strong>R$ {calculatedPrice.toLocaleString('pt-BR')}</strong> será registrado no financeiro.</p>
          <label>Nome do Projeto</label>
          <input 
            className="modal-input" 
            placeholder="Ex: Novo App Delivery" 
            value={projectTitle} 
            onChange={e => setProjectTitle(e.target.value)} 
            autoFocus
          />
          <button className="btn-primary" onClick={handleConfirmSave} disabled={loading}>
            {loading ? 'Criando...' : 'Confirmar e Lançar'}
          </button>
        </div>
      </Modal>

    </div>
  );
}