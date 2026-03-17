import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import Modal from '../../../components/Modal';
import { appService } from '../../../services/appService';
import { useAlert } from '../../../hooks/useAlert';
import { 
  Zap, Clock, Target, Calculator, LayoutTemplate, 
  Briefcase, CheckCircle2, TrendingUp, TrendingDown, Users, DollarSign, Save
} from 'lucide-react';
import './index.css';

export default function Planning() {
  const alertHook = useAlert();
  const navigate = useNavigate();

  // TABS: 'budget' | 'mrr' | 'canvas'
  const [activeTab, setActiveTab] = useState('budget');
  const [loading, setLoading] = useState(false);

  // =================================================================================
  // 1. ESCOPO & ORÇAMENTO (QUICK + PRO)
  // =================================================================================
  const [quality, setQuality] = useState(50);
  const [urgency, setUrgency] = useState(30);
  const [scope, setScope] = useState(20);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [calculatedEffort, setCalculatedEffort] = useState(0);
  const [teamSize, setTeamSize] = useState(1);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');

  const getQualityLabel = (val) => val < 30 ? "MVP (Básico)" : val < 70 ? "Padrão Mercado" : "Alta Performance";
  const getUrgencyLabel = (val) => val < 30 ? "Confortável" : val < 70 ? "Normal" : "Urgente (Sprints Curtas)";
  const getScopeLabel = (val) => val < 30 ? "Feature Única" : val < 70 ? "Módulo SaaS" : "Ecossistema Completo";

  // Quick Planner (Simples)
  useEffect(() => {
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
      alertHook.notify("Projeto Estratégico Criado!");
      setIsConfirmOpen(false); setProjectTitle('');
    } catch (e) { alertHook.notifyError("Erro ao salvar projeto."); } finally { setLoading(false); }
  };

  // PRO ESTIMATOR
  const [proForm, setProForm] = useState({ 
    name: '', client: '', description: '', clientBudget: '', hourlyRate: 150, developers: 1, qualityLevel: 1 
  });
  
  const [matrix, setMatrix] = useState({ screens: 1, design: 1, database: 1, integrations: 1 });
  const [proResults, setProResults] = useState({ 
    level: 1, levelName: '', totalPoints: 4, estimatedHours: 0, suggestedPrice: 0, estimatedWeeks: 0, profitMargin: 0 
  });

  const complexityCriteria = [
    { key: 'screens', label: 'Front-end (Telas/Views)', options: [{ val: 1, text: 'Até 3 telas', desc: 'Landing Page' }, { val: 2, text: '4 a 10 telas', desc: 'Dashboard / App' }, { val: 3, text: '11+ telas', desc: 'Sistema Complexo' }] },
    { key: 'design', label: 'Interface (UX/UI)', options: [{ val: 1, text: 'Template Base', desc: 'Uso de bibliotecas' }, { val: 2, text: 'Customizado', desc: 'Identidade visual própria' }, { val: 3, text: 'Premium/Motion', desc: 'Animações avançadas' }] },
    { key: 'database', label: 'Back-end / DB', options: [{ val: 1, text: 'CRUD Básico', desc: 'Leitura/Escrita Simples' }, { val: 2, text: 'Avançado', desc: 'RLS, Relacionamentos' }, { val: 3, text: 'Realtime/IA', desc: 'Websockets, Processos pesados' }] },
    { key: 'integrations', label: 'Integrações Externas', options: [{ val: 1, text: 'Nenhuma', desc: 'Apenas banco próprio' }, { val: 2, text: '1 a 2 APIs', desc: 'Pagamento, Emails' }, { val: 3, text: 'Múltiplas', desc: 'ERP, Webhooks, Sistemas legados' }] }
  ];

  useEffect(() => {
    const s = Number(matrix.screens) || 1;
    const d = Number(matrix.design) || 1;
    const db = Number(matrix.database) || 1;
    const i = Number(matrix.integrations) || 1;
    
    const totalPoints = s + d + db + i;
    
    let level = 1; let levelName = "Nível 1: Baixa Complexidade";
    if (totalPoints >= 6 && totalPoints <= 9) { level = 2; levelName = "Nível 2: Média Complexidade (SaaS Padrão)"; } 
    else if (totalPoints >= 10) { level = 3; levelName = "Nível 3: Alta Complexidade / Crítico"; }

    const baseHours = totalPoints * 12;
    
    const qLevel = Number(proForm.qualityLevel) || 1;
    const qMult = qLevel === 3 ? 1.5 : qLevel === 2 ? 1.25 : 1.0;
    
    const totalHours = Math.ceil(baseHours * qMult);
    
    const hourlyRate = Number(proForm.hourlyRate) || 0;
    const price = totalHours * hourlyRate;
    
    const devs = Number(proForm.developers) || 1;
    const effectiveHoursPerWeek = 30 * (devs > 0 ? devs : 1);
    const weeks = Math.ceil(totalHours / effectiveHoursPerWeek);
    
    const clientOffer = Number(proForm.clientBudget) || 0;
    const margin = clientOffer > 0 ? clientOffer - price : 0;

    setProResults({ 
      level, levelName, totalPoints, estimatedHours: totalHours, 
      suggestedPrice: price, estimatedWeeks: weeks, profitMargin: margin 
    });
  }, [matrix, proForm.hourlyRate, proForm.developers, proForm.qualityLevel, proForm.clientBudget]);

  const handleProSave = async () => {
    if (!proForm.name.trim()) return alertHook.notifyError("Nome do projeto é obrigatório.");
    
    const finalBudget = Number(proForm.clientBudget) || proResults.suggestedPrice;
    if (finalBudget <= 0) return alertHook.notifyError("Orçamento deve ser maior que zero.");

    const confirmMsg = `Custo Base da Operação: R$ ${proResults.suggestedPrice.toLocaleString()}\nOrçamento Final Vendido: R$ ${finalBudget.toLocaleString()}\n${proResults.profitMargin < 0 ? '⚠️ ATENÇÃO: PREJUÍZO PREVISTO NA OPERAÇÃO' : '✅ Margem Positiva'}`;
    
    if (await alertHook.confirm("Aprovar Início do Projeto?", confirmMsg)) {
      setLoading(true);
      try {
        const deadline = new Date(); 
        const weeksToAdd = proResults.estimatedWeeks > 0 ? proResults.estimatedWeeks : 4;
        deadline.setDate(deadline.getDate() + (weeksToAdd * 7));
        
        const fullDesc = `CLIENTE: ${proForm.client || 'Interno / N/A'} \nDESCRIÇÃO: ${proForm.description || 'Não detalhada'} \nCOMPLEXIDADE: ${proResults.levelName} (${proResults.totalPoints} pts)\nEQUIPE ALOCADA: ${proForm.developers} dev(s) | TAXA/HORA: R$ ${proForm.hourlyRate}`;
        
        await appService.createProjectWithDemands({
          title: proForm.name, 
          description: fullDesc, 
          budget_estimated: finalBudget, 
          deadline: deadline.toISOString(),
          quality_score: 80, 
          time_score: 50,    
          scope_score: Math.min(100, proResults.totalPoints * 10)
        }, []);

        alertHook.notify("Projeto Profissional Inicializado! 🚀");
        setProForm({ name: '', client: '', description: '', clientBudget: '', hourlyRate: 150, developers: 1, qualityLevel: 1 });
        window.scrollTo(0,0);
      } catch (e) { 
        alertHook.notifyError("Falha na sincronização com o servidor."); 
      } finally { 
        setLoading(false); 
      }
    }
  };

  // =================================================================================
  // 2. SIMULADOR MRR 
  // =================================================================================
  const [mrrTarget, setMrrTarget] = useState(10000);
  const [ticket, setTicket] = useState(97);
  const [churnRate, setChurnRate] = useState(5);

  const neededUsers = Math.ceil((Number(mrrTarget) || 0) / (Number(ticket) || 1));
  const lostUsersPerMonth = Math.ceil(neededUsers * ((Number(churnRate) || 0) / 100));

  // =================================================================================
  // 3. LEAN CANVAS (AGORA CONECTADO AO BANCO)
  // =================================================================================
  const [savingCanvas, setSavingCanvas] = useState(false);
  const [canvas, setCanvas] = useState({
    problem: '', solution: '', metrics: '', valueProp: '', advantage: '', channels: '', segments: '', costs: '', revenue: ''
  });

  // Carrega o Canvas ao iniciar a tela
  useEffect(() => {
    const loadCanvas = async () => {
      try {
        const dbCanvas = await appService.getLeanCanvas();
        if (dbCanvas) {
          setCanvas({
            problem: dbCanvas.problem || '',
            solution: dbCanvas.solution || '',
            metrics: dbCanvas.metrics || '',
            valueProp: dbCanvas.value_prop || '', // Mapeamento do BD
            advantage: dbCanvas.advantage || '',
            channels: dbCanvas.channels || '',
            segments: dbCanvas.segments || '',
            costs: dbCanvas.costs || '',
            revenue: dbCanvas.revenue || ''
          });
        }
      } catch (error) {
        console.error("Erro ao puxar canvas", error);
      }
    };
    loadCanvas();
  }, []);
  
  // Salva o Canvas no Banco
  const handleSaveCanvas = async () => {
    setSavingCanvas(true);
    try {
      await appService.saveLeanCanvas(canvas);
      alertHook.notify("Lean Canvas salvo e sincronizado na nuvem!", "success");
    } catch (error) {
      alertHook.notifyError("Erro ao salvar o Canvas.");
    } finally {
      setSavingCanvas(false);
    }
  };


  return (
    <div className="planning-wrapper">
      <Navbar />

      <main className="planning-content fade-in">
        
        <header className="planning-header">
          <div>
            <h1 className="page-title"><Target className="text-neon-purple mr-2"/> Engenharia de Projetos</h1>
            <p className="page-subtitle">Modele teses de negócio, projete métricas e estruture orçamentos técnicos de software.</p>
          </div>
        </header>

        {/* NAVEGAÇÃO DE ABAS */}
        <div className="planning-tabs custom-scrollbar">
          <button className={`p-tab-btn ${activeTab === 'budget' ? 'active' : ''}`} onClick={() => setActiveTab('budget')}>
            <Calculator size={18}/> Estimativas & Orçamentos
          </button>
          <button className={`p-tab-btn ${activeTab === 'mrr' ? 'active' : ''}`} onClick={() => setActiveTab('mrr')}>
            <TrendingUp size={18}/> Metas de Crescimento (MRR)
          </button>
          <button className={`p-tab-btn ${activeTab === 'canvas' ? 'active' : ''}`} onClick={() => setActiveTab('canvas')}>
            <LayoutTemplate size={18}/> Estruturação (Lean Canvas)
          </button>
        </div>

        {/* =========================================
            ABA 1: ESCPOPO E ORÇAMENTOS
            ========================================= */}
        {activeTab === 'budget' && (
          <div className="tab-section fade-in">
            
            {/* QUICK PLANNER */}
            <div className="glass-card mb-4">
              <div className="card-header">
                <h2 className="card-title"><Zap size={20} className="text-alert-yellow"/> Planejador Ágil (Tríade de Ferro)</h2>
                <p className="card-desc">Faça estimativas em segundos manipulando as três variáveis críticas do desenvolvimento.</p>
              </div>

              <div className="quick-grid">
                <div className="sliders-container">
                  
                  <div className="slider-group">
                    <div className="slider-labels"><span className="text-neon-purple font-bold">Qualidade Técnica</span><span>{quality}%</span></div>
                    <input type="range" min="0" max="100" value={quality} onChange={e=>setQuality(Number(e.target.value))} className="styled-slider purple" />
                    <p className="slider-hint">{getQualityLabel(quality)}</p>
                  </div>

                  <div className="slider-group">
                    <div className="slider-labels"><span className="text-alert-yellow font-bold">Urgência do Prazo</span><span>{urgency}%</span></div>
                    <input type="range" min="0" max="100" value={urgency} onChange={e=>setUrgency(Number(e.target.value))} className="styled-slider yellow" />
                    <p className="slider-hint">{getUrgencyLabel(urgency)}</p>
                  </div>

                  <div className="slider-group">
                    <div className="slider-labels"><span className="text-cyber-blue font-bold">Volume de Escopo</span><span>{scope}%</span></div>
                    <input type="range" min="0" max="100" value={scope} onChange={e=>setScope(Number(e.target.value))} className="styled-slider blue" />
                    <p className="slider-hint">{getScopeLabel(scope)}</p>
                  </div>

                </div>

                <div className="quick-result-card">
                  <div className="qr-value">R$ {calculatedPrice.toLocaleString('pt-BR')}</div>
                  <div className="qr-meta">
                    <span><Clock size={14}/> {calculatedEffort} dias úteis</span>
                    <span><Users size={14}/> {teamSize} Dev(s) sugeridos</span>
                  </div>
                  <button className="btn-primary bg-green text-black w-100 mt-2" onClick={() => setIsConfirmOpen(true)}>Converter em Projeto</button>
                </div>
              </div>
            </div>

            <div className="neon-divider"></div>

            {/* PRO PLANNER */}
            <div className="glass-card">
              <div className="card-header">
                <h2 className="card-title"><Briefcase size={20} className="text-neon-green"/> Orçamentador Enterprise</h2>
                <p className="card-desc">Cálculo tático baseado em Pontos de Função, Complexidade de Arquitetura e Taxa H/h.</p>
              </div>

              <div className="pro-grid">
                {/* Lado Esquerdo: Formulário */}
                <div className="pro-form">
                  <div className="form-row">
                    <div className="input-group"><label>Produto / Sistema</label><input className="custom-input" value={proForm.name} onChange={e => setProForm({...proForm, name: e.target.value})} placeholder="Ex: Marketplace Delivery B2B" /></div>
                    <div className="input-group"><label>Cliente (Opcional)</label><input className="custom-input" value={proForm.client} onChange={e => setProForm({...proForm, client: e.target.value})} placeholder="Empresa Contratante" /></div>
                  </div>

                  <div className="input-group"><label>Escopo Resumido</label><textarea className="custom-input textarea-small" value={proForm.description} onChange={e => setProForm({...proForm, description: e.target.value})} placeholder="Módulos principais que serão desenvolvidos..." /></div>

                  <div className="form-row three-cols">
                    <div className="input-group"><label>Sua Taxa/Hora (R$)</label><input type="number" className="custom-input" value={proForm.hourlyRate} onChange={e => setProForm({...proForm, hourlyRate: e.target.value})} min="0" /></div>
                    <div className="input-group"><label>Devs Alocados</label><input type="number" className="custom-input" value={proForm.developers} onChange={e => setProForm({...proForm, developers: e.target.value})} min="1"/></div>
                    <div className="input-group"><label>Grau de Acabamento</label>
                      <select className="custom-input" value={proForm.qualityLevel} onChange={e => setProForm({...proForm, qualityLevel: e.target.value})}>
                        <option value="1">MVP Funcional Padrão</option>
                        <option value="2">Profissional (+25% tempo)</option>
                        <option value="3">Enterprise/Crítico (+50%)</option>
                      </select>
                    </div>
                  </div>

                  <h3 className="matrix-title">Matriz de Complexidade Tecnológica <span>({proResults.totalPoints} Pontos)</span></h3>
                  
                  <div className="complexity-matrix">
                    {complexityCriteria.map(criteria => (
                      <div key={criteria.key} className="matrix-row">
                        <div className="matrix-label">{criteria.label}</div>
                        <div className="matrix-options">
                          {criteria.options.map(opt => (
                            <div key={opt.val} className={`matrix-card ${matrix[criteria.key] === opt.val ? 'selected' : ''}`} onClick={() => setMatrix({...matrix, [criteria.key]: opt.val})}>
                              <span className="m-weight">Peso {opt.val}</span>
                              <span className="m-title">{opt.text}</span>
                              <span className="m-desc">{opt.desc}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lado Direito: Invoice Dark */}
                <div className="pro-invoice">
                  <div className="invoice-head">
                    PROJEÇÃO DA OPERAÇÃO
                  </div>
                  <div className="invoice-body">
                    <div className="inv-row"><span className="inv-label">Grau de Risco</span><span className="inv-val text-white">{proResults.levelName.split(':')[0]}</span></div>
                    <div className="inv-row"><span className="inv-label">Carga de Trabalho</span><span className="inv-val text-white">{proResults.estimatedHours} horas</span></div>
                    <div className="inv-row"><span className="inv-label">Prazo de Entrega</span><span className="inv-val text-alert-yellow">~{proResults.estimatedWeeks} semanas úteis</span></div>
                    
                    <div className="inv-divider"></div>
                    
                    <div className="inv-row ">
                      <span className="inv-label">Custo Base (Break-even)</span>
                      <span className="inv-val text-cyber-blue">R$ {proResults.suggestedPrice.toLocaleString('pt-BR')}</span>
                    </div>

                    <div className="inv-budget-box">
                      <label>Orçamento Aprovado Cliente (R$)</label>
                      <input type="number" placeholder="0,00" value={proForm.clientBudget} onChange={e => setProForm({...proForm, clientBudget: e.target.value})}/>
                    </div>

                    {Number(proForm.clientBudget) > 0 && (
                      <div className={`inv-margin ${proResults.profitMargin >= 0 ? 'profit' : 'loss'}`}>
                        {proResults.profitMargin >= 0 ? 'LUCRO BRUTO: ' : 'PREJUÍZO: '}
                        R$ {Math.abs(proResults.profitMargin).toLocaleString('pt-BR')}
                      </div>
                    )}
                  </div>
                  <button className="btn-primary w-100 invoice-btn" onClick={handleProSave} disabled={loading}>
                    {loading ? 'Processando Arquitetura...' : 'Aprovar Contrato e Iniciar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            ABA 2: METAS DE CRESCIMENTO (MRR)
            ========================================= */}
        {activeTab === 'mrr' && (
          <div className="tab-section fade-in">
            <div className="glass-card">
              <div className="card-header">
                <h2 className="card-title"><TrendingUp size={20} className="text-neon-green"/> Simulador de Tração e Faturamento</h2>
                <p className="card-desc">Simule quantos clientes pagantes sua startup precisa para atingir a meta mensal (MRR) e calcule o impacto da taxa de cancelamento.</p>
              </div>

              <div className="mrr-grid">
                <div className="mrr-inputs">
                  <div className="input-group">
                    <label>Faturamento Alvo Mensal (MRR Estimado - R$)</label>
                    <input type="number" className="custom-input text-neon-green font-bold text-lg" value={mrrTarget} onChange={e => setMrrTarget(e.target.value)} min="1"/>
                  </div>
                  <div className="input-group">
                    <label>Ticket Médio Cobrado por Assinatura (R$)</label>
                    <input type="number" className="custom-input text-cyber-blue font-bold text-lg" value={ticket} onChange={e => setTicket(e.target.value)} min="1"/>
                  </div>
                  <div className="input-group">
                    <label>Taxa de Cancelamento Mensal (Churn Rate %)</label>
                    <input type="number" className="custom-input text-alert-red font-bold text-lg" value={churnRate} onChange={e => setChurnRate(e.target.value)} min="0" max="100"/>
                  </div>
                </div>

                <div className="mrr-results">
                  <div className="mrr-res-card border-green">
                    <Users size={32} className="text-neon-green mb-2"/>
                    <h4>Base Ativa Necessária</h4>
                    <div className="mrr-big-val">{neededUsers.toLocaleString('pt-BR')} <span>assinantes</span></div>
                    <p>Para bater a meta de R$ {Number(mrrTarget || 0).toLocaleString('pt-BR')} por mês.</p>
                  </div>

                  <div className="mrr-res-card border-red">
                    <TrendingDown size={32} className="text-alert-red mb-2"/>
                    <h4>Perda Mensal (Rotatividade)</h4>
                    <div className="mrr-big-val">{lostUsersPerMonth.toLocaleString('pt-BR')} <span>cancelamentos</span></div>
                    <p>Clientes que você precisará vender e repor todo mês devido ao Churn de {churnRate || 0}%.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            ABA 3: LEAN CANVAS
            ========================================= */}
        {activeTab === 'canvas' && (
          <div className="tab-section fade-in">
            <div className="glass-card">
              <div className="card-header canvas-header">
                <div>
                  <h2 className="card-title"><LayoutTemplate size={20} className="text-alert-yellow"/> Blueprint (Lean Canvas)</h2>
                  <p className="card-desc">Estruture e valide sua tese de produto de forma visual. O modelo padrão utilizado por Venture Capitals e Aceleradoras.</p>
                </div>
                <button className="btn-primary bg-yellow text-black" onClick={handleSaveCanvas} disabled={savingCanvas}>
                  <Save size={16} className="mr-2"/> 
                  {savingCanvas ? 'Salvando Nuvem...' : 'Salvar Versão'}
                </button>
              </div>

              <div className="canvas-grid">
                
                {/* Top Half */}
                <div className="c-box" style={{gridArea: 'problem'}}>
                  <div className="c-header text-alert-red">1. O Problema</div>
                  <textarea placeholder="Liste as 3 maiores dores reais do seu cliente." value={canvas.problem} onChange={e => setCanvas({...canvas, problem: e.target.value})}></textarea>
                </div>

                <div className="c-box" style={{gridArea: 'solution'}}>
                  <div className="c-header text-neon-green">4. A Solução</div>
                  <textarea placeholder="Como o seu software vai curar essas dores de forma prática?" value={canvas.solution} onChange={e => setCanvas({...canvas, solution: e.target.value})}></textarea>
                </div>

                <div className="c-box" style={{gridArea: 'valueProp'}}>
                  <div className="c-header text-neon-purple">3. Proposta de Valor Única</div>
                  <textarea placeholder="Mensagem clara e convincente que explica porque seu produto é diferente." value={canvas.valueProp} onChange={e => setCanvas({...canvas, valueProp: e.target.value})}></textarea>
                </div>

                <div className="c-box" style={{gridArea: 'advantage'}}>
                  <div className="c-header text-alert-yellow">9. Vantagem Injusta</div>
                  <textarea placeholder="O que você tem que não pode ser facilmente copiado ou comprado pelos rivais?" value={canvas.advantage} onChange={e => setCanvas({...canvas, advantage: e.target.value})}></textarea>
                </div>

                <div className="c-box" style={{gridArea: 'segments'}}>
                  <div className="c-header text-cyber-blue">2. Segmento de Clientes</div>
                  <textarea placeholder="Quem são seus Early Adopters? Descreva seu ICP (Ideal Customer Profile)." value={canvas.segments} onChange={e => setCanvas({...canvas, segments: e.target.value})}></textarea>
                </div>

                <div className="c-box" style={{gridArea: 'metrics'}}>
                  <div className="c-header">8. Métricas Chave</div>
                  <textarea placeholder="Como você vai medir se a empresa está dando certo? (MRR, LTV, CAC...)" value={canvas.metrics} onChange={e => setCanvas({...canvas, metrics: e.target.value})}></textarea>
                </div>

                <div className="c-box" style={{gridArea: 'channels'}}>
                  <div className="c-header">5. Canais de Aquisição</div>
                  <textarea placeholder="Como o produto vai chegar até o cliente? (SEO, Ads, Outbound...)" value={canvas.channels} onChange={e => setCanvas({...canvas, channels: e.target.value})}></textarea>
                </div>

                {/* Bottom Half */}
                <div className="c-box" style={{gridArea: 'costs'}}>
                  <div className="c-header text-alert-red">7. Estrutura de Custos</div>
                  <textarea placeholder="Onde o dinheiro vai ser queimado? (Folha, Servidores, Impostos, Ferramentas...)" value={canvas.costs} onChange={e => setCanvas({...canvas, costs: e.target.value})}></textarea>
                </div>

                <div className="c-box" style={{gridArea: 'revenue'}}>
                  <div className="c-header text-neon-green">6. Fontes de Receita</div>
                  <textarea placeholder="Como você ganha dinheiro? Qual o modelo de cobrança, tickets e LTV estimado?" value={canvas.revenue} onChange={e => setCanvas({...canvas, revenue: e.target.value})}></textarea>
                </div>

              </div>

            </div>
          </div>
        )}

      </main>

      {/* MODAL QUICK SAVE */}
      <Modal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} title="Lançar Projeto Ágil" centerOnMobile={true}>
        <div className="input-group">
          <label>Nomeie a Operação</label>
          <input className="custom-input" placeholder="Ex: MVP App de Logística" value={projectTitle} onChange={e => setProjectTitle(e.target.value)} autoFocus />
        </div>
        <button className="btn-primary w-100 mt-4 bg-green text-black" onClick={handleQuickSave}>Confirmar Execução</button>
      </Modal>

    </div>
  );
}