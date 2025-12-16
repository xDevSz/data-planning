import React, { useState, useEffect } from 'react';
import Navbar from '../../../components/Navbar';
import Modal from '../../../components/Modal';
import { appService } from '../../../services/appService';
import { useAlert } from '../../../hooks/useAlert'; // Import useAlert
import './index.css';

export default function Planning() {
  const alertHook = useAlert(); // Initialize hook

  // --- LÓGICA ORIGINAL (QUICK PLANNER) ---
  const [quality, setQuality] = useState(50);
  const [urgency, setUrgency] = useState(30);
  const [scope, setScope] = useState(20);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [calculatedEffort, setCalculatedEffort] = useState(0);
  const [teamSize, setTeamSize] = useState(1);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [loading, setLoading] = useState(false);

  // Labels Originais
  const getQualityLabel = (val) => val < 30 ? "MVP" : val < 70 ? "Padrão" : "Alta Performance";
  const getUrgencyLabel = (val) => val < 30 ? "Confortável" : val < 70 ? "Normal" : "Urgente";
  const getScopeLabel = (val) => val < 30 ? "Feature" : val < 70 ? "Módulo" : "Sistema";

  useEffect(() => {
    // Cálculo Original Mantido
    const BASE = 2500; const SCOPE_UNIT = 300;
    const qMult = 1 + (quality / 100);
    const uMult = 1 + ((urgency * 1.5) / 100);
    const raw = (BASE + (scope * SCOPE_UNIT)) * qMult * uMult;
    let d = (scope * 2) * (1 + (quality / 200));
    const speed = 1 - (urgency / 150);
    let t = 1;
    if (scope > 50) t += 2; if (urgency > 70) t += 2; if (quality > 80) t += 1;
    setCalculatedPrice(Math.floor(raw));
    setCalculatedEffort(Math.max(5, Math.ceil(d * speed)));
    setTeamSize(t);
  }, [quality, urgency, scope]);

  const handleQuickSave = async () => {
    if (!projectTitle) return alertHook.notifyError("Dê um nome ao projeto.");
    setLoading(true);
    try {
      const deadline = new Date(); deadline.setDate(deadline.getDate() + calculatedEffort);
      await appService.createProjectWithDemands({
        title: projectTitle,
        description: `[Quick Plan] Q:${quality}% U:${urgency}% S:${scope}%`,
        budget_estimated: calculatedPrice,
        deadline: deadline.toISOString(),
        quality_score: quality, time_score: urgency, scope_score: scope
      }, []);
      alertHook.notify("Projeto Rápido Criado!");
      setIsConfirmOpen(false); setProjectTitle('');
    } catch (e) { alertHook.notifyError("Erro ao salvar."); } finally { setLoading(false); }
  };

  // =================================================================================
  // --- NOVO: ORÇAMENTADOR PROFISSIONAL (PRO ESTIMATOR) ---
  // =================================================================================

  // Estado do Formulário Pro
  const [proForm, setProForm] = useState({
    name: '',
    client: '',
    description: '',
    clientBudget: '',
    hourlyRate: 150,
    developers: 1, // Alterado de 'devs' para 'developers' para consistência
    qualityLevel: 1,
  });

  // Matriz de Complexidade
  const [matrix, setMatrix] = useState({
    screens: 1, // 1, 2 ou 3
    design: 1,
    database: 1,
    integrations: 1
  });

  // Resultados Pro
  const [proResults, setProResults] = useState({
    level: 1,
    levelName: '',
    totalPoints: 4,
    estimatedHours: 0,
    suggestedPrice: 0,
    estimatedWeeks: 0,
    profitMargin: 0
  });

  // Tabela de Critérios
  const complexityCriteria = [
    {
      key: 'screens', label: 'Front-end (Telas React)',
      options: [
        { val: 1, text: 'Até 3 telas', desc: 'Landing Page / Simples' },
        { val: 2, text: '4 a 10 telas', desc: 'Dashboard / Sistema' },
        { val: 3, text: '11+ telas', desc: 'Complexo / Multi-fluxo' }
      ]
    },
    {
      key: 'design', label: 'Interface (CSS/UX)',
      options: [
        { val: 1, text: 'Padrão / Limpo', desc: 'CSS Básico / Template' },
        { val: 2, text: 'Customizado', desc: 'Responsivo Fino / Branding' },
        { val: 3, text: 'Interativo', desc: 'Animações / Motion' }
      ]
    },
    {
      key: 'database', label: 'Back-end (Supabase)',
      options: [
        { val: 1, text: 'Leitura/Escrita', desc: 'CRUD Simples' },
        { val: 2, text: 'RLS + Storage', desc: 'Permissões / Arquivos' },
        { val: 3, text: 'Realtime + Edge', desc: 'Chat / Notificações / Cron' }
      ]
    },
    {
      key: 'integrations', label: 'Integrações & Lógica',
      options: [
        { val: 1, text: 'Nenhuma', desc: 'Lógica interna apenas' },
        { val: 2, text: '1 API Simples', desc: 'CEP / Clima / Email' },
        { val: 3, text: 'Complexas', desc: 'Pagamento / IA / Webhooks' }
      ]
    }
  ];

  // CÁLCULO EM TEMPO REAL (PRO) - CORRIGIDO PARA EVITAR NaN
  useEffect(() => {
    // Garante que são números
    const s = Number(matrix.screens) || 1;
    const d = Number(matrix.design) || 1;
    const db = Number(matrix.database) || 1;
    const i = Number(matrix.integrations) || 1;

    const totalPoints = s + d + db + i;

    let level = 1;
    let levelName = "Nível 1: Baixa Complexidade";

    if (totalPoints >= 6 && totalPoints <= 9) {
      level = 2;
      levelName = "Nível 2: Média Complexidade (SaaS)";
    } else if (totalPoints >= 10) {
      level = 3;
      levelName = "Nível 3/4: Alta Complexidade / Crítico";
    }

    const HOURS_PER_POINT = 12;
    const baseHours = totalPoints * HOURS_PER_POINT;

    // Multiplicador Qualidade
    const qLevel = Number(proForm.qualityLevel);
    const qMult = qLevel === 3 ? 1.5 : qLevel === 2 ? 1.25 : 1.0;

    const totalHours = Math.ceil(baseHours * qMult);

    const hourlyRate = Number(proForm.hourlyRate) || 0;
    const price = totalHours * hourlyRate;

    const devs = Number(proForm.developers) || 1;
    // Evita divisão por zero
    const effectiveHoursPerWeek = 30 * (devs > 0 ? devs : 1);
    const weeks = Math.ceil(totalHours / effectiveHoursPerWeek);

    const clientOffer = Number(proForm.clientBudget) || 0;
    const margin = clientOffer - price;

    setProResults({
      level,
      levelName,
      totalPoints,
      estimatedHours: totalHours,
      suggestedPrice: price,
      estimatedWeeks: weeks,
      profitMargin: margin
    });

  }, [matrix, proForm.hourlyRate, proForm.developers, proForm.qualityLevel, proForm.clientBudget]);

  // FUNÇÃO DE SALVAR CORRIGIDA (EVITA ERRO 400)
  const handleProSave = async () => {
    if (!proForm.name.trim()) return alertHook.notifyError("Nome do projeto é obrigatório.");

    const finalBudget = Number(proForm.clientBudget) || proResults.suggestedPrice;

    // Validação extra
    if (finalBudget <= 0) {
      return alertHook.notifyError("Orçamento inválido (deve ser maior que zero).");
    }

    const confirmMsg = `
      Estimado: R$ ${proResults.suggestedPrice.toLocaleString()}
      Cliente paga: R$ ${Number(proForm.clientBudget || 0).toLocaleString()}
      ${proResults.profitMargin < 0 ? '⚠️ ATENÇÃO: PREJUÍZO PREVISTO' : 'Lucro Previsto ✅'}
    `;

    if (await alertHook.confirm("Confirmar Projeto?", confirmMsg)) {
      setLoading(true);
      try {
        const deadline = new Date();
        // Garante que weeks seja um número válido
        const weeksToAdd = proResults.estimatedWeeks > 0 ? proResults.estimatedWeeks : 4;
        deadline.setDate(deadline.getDate() + (weeksToAdd * 7));

        const fullDesc = `CLIENTE: ${proForm.client || 'Não informado'} \nDESCRIÇÃO: ${proForm.description || 'Sem descrição'} \n---\nMÉTRICAS TÉCNICAS:\n- Complexidade: ${proResults.levelName} (${proResults.totalPoints} pts)\n- Stack: React, Supabase\n- Equipe: ${proForm.developers} devs\n- Taxa Hora: R$ ${proForm.hourlyRate}`;

        // Objeto limpo para o Supabase
        const projectPayload = {
          title: proForm.name,
          description: fullDesc,
          budget_estimated: finalBudget, // Garante número
          deadline: deadline.toISOString(),
          quality_score: 80, // Fixo para Pro
          time_score: 50,    // Fixo para Pro
          scope_score: Math.min(100, proResults.totalPoints * 10) // Limita a 100
        };

        console.log("Enviando Payload:", projectPayload); // Debug no console

        await appService.createProjectWithDemands(projectPayload, []);

        alertHook.notify("Projeto Profissional Criado! 🚀");
        setProForm({...proForm, name: '', description: '', client: '', clientBudget: ''});
        window.scrollTo(0,0);
      } catch (e) {
        console.error("Erro detalhado:", e); // Veja o erro real no console
        alertHook.notifyError("Erro ao salvar (verifique o console).");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="planning-container">
      <Navbar />

      <div className="planning-content">

        {/* === SEÇÃO 1: PLANEJADOR RÁPIDO === */}
        <div className="section-block quick-planner">
          <div className="block-header">
            <h2>⚡ Planejamento Rápido (Tríade)</h2>
            <p>Estimativa baseada em variáveis abstratas.</p>
          </div>

          <div className="planning-grid">
            <div className="controls-section">
              <div className="slider-group">
                <div className="slider-header"><span className="label-q">Qualidade</span><span>{quality}%</span></div>
                <input type="range" min="0" max="100" value={quality} onChange={e=>setQuality(Number(e.target.value))} className="custom-range range-quality" />
                <p className="range-desc">{getQualityLabel(quality)}</p>
              </div>
              <div className="slider-group">
                <div className="slider-header"><span className="label-t">Urgência</span><span>{urgency}%</span></div>
                <input type="range" min="0" max="100" value={urgency} onChange={e=>setUrgency(Number(e.target.value))} className="custom-range range-time" />
                <p className="range-desc">{getUrgencyLabel(urgency)}</p>
              </div>
              <div className="slider-group">
                <div className="slider-header"><span className="label-s">Escopo</span><span>{scope}%</span></div>
                <input type="range" min="0" max="100" value={scope} onChange={e=>setScope(Number(e.target.value))} className="custom-range range-scope" />
                <p className="range-desc">{getScopeLabel(scope)}</p>
              </div>
            </div>

            <div className="result-mini-card">
              <div className="mini-price">R$ {calculatedPrice.toLocaleString('pt-BR')}</div>
              <div className="mini-meta">{calculatedEffort} dias • {teamSize} desenvolvedores</div>
              <button className="btn-approve-mini" onClick={() => setIsConfirmOpen(true)}>Criar Rápido</button>
            </div>
          </div>
        </div>

        <div className="divider-neon"></div>

        {/* === SEÇÃO 2: ORÇAMENTADOR PROFISSIONAL === */}
        <div className="section-block pro-planner">
          <div className="block-header">
            <h2>💎 Orçamentador Profissional</h2>
            <p>Cálculo de precisão baseado em pontos de complexidade técnica.</p>
          </div>

          <div className="pro-grid">

            {/* ESQUERDA: FORMULÁRIO */}
            <div className="pro-form-col">

              <div className="input-group-row">
                <div className="input-box">
                  <label>Nome do Projeto</label>
                  <input value={proForm.name} onChange={e => setProForm({...proForm, name: e.target.value})} placeholder="Ex: Marketplace Delivery" />
                </div>
                <div className="input-box">
                  <label>Cliente / Empresa</label>
                  <input value={proForm.client} onChange={e => setProForm({...proForm, client: e.target.value})} placeholder="Nome do contratante" />
                </div>
              </div>

              <div className="input-box">
                <label>Descrição do Escopo</label>
                <textarea rows="3" value={proForm.description} onChange={e => setProForm({...proForm, description: e.target.value})} placeholder="Resumo do que será desenvolvido..." />
              </div>

              <div className="input-group-row three-cols">
                <div className="input-box">
                  <label>Valor Hora (R$)</label>
                  <input type="number" value={proForm.hourlyRate} onChange={e => setProForm({...proForm, hourlyRate: e.target.value})} />
                </div>
                <div className="input-box">
                  <label>Desenvolvedores</label>
                  <input type="number" value={proForm.developers} onChange={e => setProForm({...proForm, developers: e.target.value})} />
                </div>
                <div className="input-box">
                  <label>Qualidade</label>
                  <select value={proForm.qualityLevel} onChange={e => setProForm({...proForm, qualityLevel: e.target.value})}>
                    <option value="1">MVP (Funcional)</option>
                    <option value="2">Profissional (+25%)</option>
                    <option value="3">Enterprise (+50%)</option>
                  </select>
                </div>
              </div>

              <h3 className="section-subtitle">Matriz de Complexidade (Pontuação: {proResults.totalPoints})</h3>

              <div className="complexity-matrix">
                {complexityCriteria.map(criteria => (
                  <div key={criteria.key} className="criteria-row">
                    <div className="criteria-label">{criteria.label}</div>
                    <div className="criteria-options">
                      {criteria.options.map(opt => (
                        <div
                          key={opt.val}
                          className={`criteria-card ${matrix[criteria.key] === opt.val ? 'selected' : ''}`}
                          onClick={() => setMatrix({...matrix, [criteria.key]: opt.val})}
                        >
                          <div className="opt-weight">Peso {opt.val}</div>
                          <div className="opt-text">{opt.text}</div>
                          <div className="opt-desc">{opt.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DIREITA: RECIBO BRANCO */}
            <div className="pro-result-col">
              <div className="invoice-card">
                <div className="invoice-header">PROJEÇÃO FINANCEIRA</div>

                <div className="invoice-body">
                  <div className="invoice-row">
                    <span>Complexidade</span>
                    <strong>{proResults.levelName.split(':')[0]}</strong>
                  </div>
                  <div className="invoice-row">
                    <span>Esforço Estimado</span>
                    <strong>{proResults.estimatedHours} horas</strong>
                  </div>
                  <div className="invoice-row">
                    <span>Prazo Estimado</span>
                    <strong>~{proResults.estimatedWeeks} semanas</strong>
                  </div>

                  <div className="invoice-divider"></div>

                  <div className="invoice-row invoice-highlight">
                    <span>Sugerido</span>
                    <span style={{color:'var(--neon-green)'}}>R$ {proResults.suggestedPrice.toLocaleString()}</span>
                  </div>

                  <div className="budget-input-area">
                    <label>Oferta Cliente (R$)</label>
                    <input
                      type="number"
                      placeholder="Quanto ofereceram?"
                      value={proForm.clientBudget}
                      onChange={e => setProForm({...proForm, clientBudget: e.target.value})}
                    />
                  </div>

                  {proForm.clientBudget && (
                    <div className={`margin-indicator ${proResults.profitMargin >= 0 ? 'profit' : 'loss'}`}>
                      {proResults.profitMargin >= 0 ? 'LUCRO: ' : 'PREJUÍZO: '}
                      R$ {Math.abs(proResults.profitMargin).toLocaleString()}
                    </div>
                  )}
                </div>

                <button className="btn-approve-pro" onClick={handleProSave} disabled={loading}>
                  {loading ? 'Processando...' : 'Confirmar & Criar Projeto'}
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

      <Modal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} title="Salvar Rápido">
        <div className="modal-form">
          <input className="modal-input" placeholder="Nome do Projeto" value={projectTitle} onChange={e => setProjectTitle(e.target.value)} autoFocus />
          <button className="btn-primary" onClick={handleQuickSave}>Confirmar</button>
        </div>
      </Modal>

    </div>
  );
}