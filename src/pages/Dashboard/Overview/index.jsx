import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import Modal from '../../../components/Modal';
import { appService } from '../../../services/appService';
import { useAlert } from '../../../hooks/useAlert';

// IMPORTANDO OS NOVOS GRÁFICOS DO RECHARTS
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area, XAxis, YAxis, CartesianGrid 
} from 'recharts';

// IMPORTANDO ÍCONES
import { 
  TrendingUp, TrendingDown, Target, Lightbulb, 
  CalendarDays, Plus, Activity, Briefcase, Rocket, 
  FileText, Landmark, Map, CheckCircle2, ChevronRight,
  Trash2, Play, AlertTriangle, Layers,
  FolderKanban, ShieldCheck, Zap, BarChart as BarChartIcon
} from 'lucide-react';
import './index.css';

export default function Overview() {
  const navigate = useNavigate();
  const alertHook = useAlert();
  
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  
  const [data, setData] = useState({
    kpis: { budgetTotal: 0, spentTotal: 0, incomeTotal: 0, burnRate: 0, roiProjected: 0, teamCount: 0 },
    projects: [], demands: [], meetings: [], transactions: [], ideas: [], profiles: []
  });
  const [loading, setLoading] = useState(true);

  // Modais e Abas
  const [modals, setModals] = useState({ task: false, meeting: false, manageMeetings: false, idea: false, fomento: false });
  const [fomentoTab, setFomentoTab] = useState('editais');

  const [newIdea, setNewIdea] = useState({ content: '', author: '' });
  const [newTask, setNewTask] = useState({ title: '', description: '', due_date: '', assignee: '', priority: 'medium' });
  const [newMeet, setNewMeet] = useState({ title: '', date: '', time: '', link: '', participants: '', description: '' });

  const loadData = async () => {
    try {
      const result = await appService.getFullOverview();
      setData(result);
    } catch (e) { 
      console.error(e); 
      alertHook.notifyError("Falha ao carregar os dados do dashboard.");
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { loadData(); }, []);

  const translateStatus = (status) => {
    const map = { 'todo': 'A Fazer', 'doing': 'Em Andamento', 'blocked': 'Bloqueado', 'done': 'Concluído' };
    return map[status] || status;
  };

  const handleCreateTask = async () => {
    if(!newTask.title) return alertHook.notifyError("Título da demanda é obrigatório.");
    try {
      const defaultProject = data.projects[0]?.id; 
      await appService.createDemand({ 
        title: newTask.title, 
        description: `${newTask.description} \n\nResponsável: ${newTask.assignee}`,
        due_date: newTask.due_date || null,
        project_id: defaultProject, 
        status: 'todo', 
        priority: newTask.priority 
      });
      setModals({...modals, task: false}); 
      setNewTask({ title: '', description: '', due_date: '', assignee: '', priority: 'medium' });
      loadData();
      alertHook.notify("Demanda alocada com sucesso!");
    } catch (e) {
      alertHook.notifyError("Erro ao criar demanda.");
    }
  };

  const handleAddIdea = async () => {
    if(!newIdea.content) return alertHook.notifyError("A ideia não pode estar vazia.");
    try {
      await appService.createIdea(newIdea.content, newIdea.author || 'Anônimo');
      setModals({...modals, idea: false}); 
      setNewIdea({content:'', author:''}); 
      loadData();
      alertHook.notify("Ideia registrada no cofre!");
    } catch(e) {
      alertHook.notifyError("Falha ao salvar ideia.");
    }
  };

  const handleAddMeeting = async () => {
    if(!newMeet.title || !newMeet.date || !newMeet.time) return alertHook.notifyError("Preencha Título, Data e Hora.");
    try {
      const dateTime = new Date(`${newMeet.date}T${newMeet.time}`);
      await appService.createMeeting({ 
        title: newMeet.title, 
        meeting_date: dateTime.toISOString(),
        link: newMeet.link,
        participants: newMeet.participants,
        description: newMeet.description
      });
      setModals({...modals, meeting: false}); 
      setNewMeet({ title: '', date: '', time: '', link: '', participants: '', description: '' });
      loadData();
      alertHook.notify("Reunião sincronizada na agenda.");
    } catch (e) {
      alertHook.notifyError("Erro ao agendar reunião.");
    }
  };

  const handleDeleteMeeting = async (id) => {
    if(await alertHook.confirm("Cancelar Reunião?", "A ação não poderá ser desfeita.")) {
      await appService.deleteMeeting(id);
      loadData();
      alertHook.notify("Reunião removida com sucesso.", "success");
    }
  };

  const currency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  // --- DADOS RECHARTS ---
  const priorityData = [
    { name: 'Alta', value: data.demands.filter(d => d.priority === 'high').length, color: 'var(--alert-red)' },
    { name: 'Média', value: data.demands.filter(d => d.priority === 'medium').length, color: 'var(--alert-yellow)' },
    { name: 'Baixa', value: data.demands.filter(d => d.priority === 'low').length, color: 'var(--neon-green)' },
  ].filter(item => item.value > 0);

  const financialPieData = [
    { name: 'Receitas', value: data.kpis.incomeTotal, color: 'var(--neon-green)' },
    { name: 'Despesas', value: data.kpis.spentTotal, color: 'var(--neon-purple)' }
  ];

  const avgQuality = data.projects.reduce((acc, p) => acc + (p.quality_score || 50), 0) / (data.projects.length || 1);
  const avgTime = data.projects.reduce((acc, p) => acc + (p.time_score || 50), 0) / (data.projects.length || 1);
  const avgScope = data.projects.reduce((acc, p) => acc + (p.scope_score || 50), 0) / (data.projects.length || 1);

  const radarData = [
    { subject: 'Qualidade', A: Math.round(avgQuality), fullMark: 100 },
    { subject: 'Prazo', A: Math.round(avgTime), fullMark: 100 },
    { subject: 'Escopo', A: Math.round(avgScope), fullMark: 100 },
  ];

  const areaData = data.transactions.slice(0, 7).reverse().map((t, index) => ({
    name: t.created_at ? new Date(t.created_at).toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'}) : `T-${index}`,
    Entrada: t.type === 'income' ? Number(t.amount) : 0,
    Saída: t.type === 'expense' ? Number(t.amount) : 0,
  }));

  const CustomChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="chart-tooltip-label">{label || payload[0].name}</p>
          {payload.map((p, i) => (
            <p key={i} style={{color: p.color || p.payload.fill, margin: 0, fontWeight: 'bold'}}>
              {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const saasRoadmap = [
    { phase: "1. Ideação", items: ["Descoberta do Problema", "Pesquisa de Mercado", "Seleção de Nicho", "Análise de Concorrentes", "Mapeamento de Oportunidades"] },
    { phase: "2. Validação", items: ["Entrevistas com Clientes", "Teste de Landing Page", "Lista de Espera", "Pré-vendas", "Teste de Demanda"] },
    { phase: "3. Planejamento", items: ["Roadmap do Produto", "Priorização de Recursos", "Escopo do MVP", "Stack Tecnológica", "Plano de Desenvolvimento"] },
    { phase: "4. Design UX/UI", items: ["Wireframes", "Design de Interface (UI)", "Fluxos de Usuário (UX)", "Protótipo Interativo", "Design System"] },
    { phase: "5. Desenvolvimento", items: ["Frontend", "Backend", "Estrutura de APIs", "Banco de Dados", "Autenticação", "Integrações"] },
    { phase: "6. Infraestrutura", items: ["Hospedagem em Nuvem", "DevOps", "CI/CD Pipeline", "Monitoramento", "Segurança da Informação"] },
    { phase: "7. Testes (QA)", items: ["Testes Unitários", "Testes de Integração", "Correção de Bugs", "Testes de Performance", "Testes Beta"] },
    { phase: "8. Lançamento", items: ["Otimização de Landing Page", "Product Hunt", "Usuários Beta", "Early Adopters", "Lançamento Público"] },
    { phase: "9. Aquisição", items: ["Vitórias em SEO", "Marketing de Conteúdo", "Redes Sociais", "Cold Email", "Influenciadores", "Marketing de Afiliados"] },
    { phase: "10. Distribuição", items: ["Diretórios", "Marketplaces de SaaS", "Comunidades Nativas", "Parcerias Estratégicas", "Marketplaces de Integração"] },
    { phase: "11. Conversão", items: ["Funil de Vendas", "Período de Teste Grátis", "Modelo Freemium", "Estratégia de Precificação", "Otimização de Checkout"] },
    { phase: "12. Receita", items: ["Assinaturas Mensais", "Upsells na Plataforma", "Add-ons", "Planos Anuais", "Contratos Enterprise (B2B)"] },
    { phase: "13. Dados (Analytics)", items: ["Rastreamento de Usuários", "Análise de Funil", "Análise de Cohort", "Dashboard de KPIs", "Testes A/B em Massa"] },
    { phase: "14. Retenção", items: ["Onboarding de Usuários", "Automação de E-mails", "Suporte ao Cliente Ágil", "Adoção de Funcionalidades", "Estratégias Anti-Churn"] },
    { phase: "15. Crescimento", items: ["Programas de Indicação", "Construção de Comunidade", "Product Led Growth (PLG)", "Loops Virais", "Estratégia de Expansão"] },
    { phase: "16. Escalonamento", items: ["Automação de Processos", "Contratação de Talentos", "Sistemas Distribuídos", "Expansão Global", "Estratégia de Saída (Exit)"] }
  ];

  return (
    <div className="dashboard-wrapper">
      <Navbar />

      <main className="dashboard-content fade-in">
        <header className="page-header">
          <div className="header-info">
            <h1 className="page-title"><Activity className="title-icon"/> Centro de Comando</h1>
            <p className="last-update">{today}</p>
          </div>
          
          <div className="header-actions">
              <button className="action-btn outline" onClick={() => navigate('/dashboard/financial')}>
                <TrendingUp size={16}/> Gerenciar Caixa
              </button>
              <button className="action-btn yellow" onClick={() => setModals({...modals, idea: true})}>
                <Lightbulb size={16}/> Nova Ideia
              </button>
              <button className="action-btn blue" onClick={() => setModals({...modals, meeting: true})}>
                <CalendarDays size={16}/> Agendar
              </button>
              <button className="action-btn purple" onClick={() => setModals({...modals, task: true})}>
                <Plus size={16}/> Demanda
              </button>
          </div>
        </header>

        {loading ? (
           <div className="loading-state">
              <div className="loader-spinner"></div>
              <p>Sincronizando métricas estruturais...</p>
           </div>
        ) : (
          <div className="overview-grid">
            
            {/* --- KPIs (LINHA 1 - 4 colunas) --- */}
            <div className="widget-card kpi-card">
              <span className="widget-title">Receita Global</span>
              <div className="kpi-value text-neon-green">{currency(data.kpis.incomeTotal)}</div>
            </div>
            
            <div className="widget-card kpi-card">
              <span className="widget-title">Despesa Global</span>
              <div className="kpi-value text-neon-purple">{currency(data.kpis.spentTotal)}</div>
            </div>
            
            <div className="widget-card kpi-card">
              <span className="widget-title">ROI Projetado</span>
              <div className={`kpi-value ${Number(data.kpis.roiProjected) >= 0 ? 'text-neon-green' : 'text-alert-red'}`}>
                {Number(data.kpis.roiProjected) > 0 ? '+' : ''}{data.kpis.roiProjected}%
              </div>
            </div>
            
            <div className="widget-card kpi-card">
              <span className="widget-title">Orçamento Projetos</span>
              <div className="kpi-value text-primary">{currency(data.kpis.budgetTotal)}</div>
            </div>

            {/* --- LINHA 2: FOMENTO (50%) E DEMANDAS (50%) --- */}
            
            <div className="widget-card fomento-widget col-span-2 pulse-border">
              <div className="fomento-banner">
                <div className="fomento-info">
                  <h3><Rocket size={24} className="text-alert-yellow" /> Base de Aceleração e Inovação</h3>
                  <p>Estruture seu projeto, decifre a execução financeira e prepare-se para editais e fundos de investimento.</p>
                </div>
                <button className="btn-primary bg-yellow text-black fomento-btn" onClick={() => setModals({...modals, fomento: true})}>
                  <Map size={18} className="mr-2"/> Acessar Trilhas Estratégicas
                </button>
              </div>
            </div>

            <div className="widget-card chart-card col-span-2">
              <div className="widget-header">
                <span className="widget-title"><Target size={16}/> Distribuição de Demandas</span>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={priorityData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                      {priorityData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <RechartsTooltip content={<CustomChartTooltip />} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '0.85rem', color: '#a0a0ab'}}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* --- LINHA 3: LIQUIDEZ (50%) E TRÍADE (50%) --- */}
            <div className="widget-card chart-card col-span-2">
              <div className="widget-header">
                <span className="widget-title"><TrendingUp size={16}/> Balanço de Liquidez</span>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={financialPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                      {financialPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <RechartsTooltip content={<CustomChartTooltip />} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '0.85rem', color: '#a0a0ab'}}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="widget-card chart-card col-span-2">
              <div className="widget-header">
                <span className="widget-title"><Briefcase size={16}/> Eficiência de Tríade (Média)</span>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                    <PolarGrid stroke="#333" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#a0a0ab', fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Performance Global" dataKey="A" stroke="var(--neon-purple)" fill="var(--neon-purple)" fillOpacity={0.5} />
                    <RechartsTooltip content={<CustomChartTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* --- LINHA 4: TIMELINE FULL WIDTH (100%) --- */}
            <div className="widget-card chart-card col-span-full">
              <div className="widget-header">
                <span className="widget-title"><Activity size={16}/> Tendência de Caixa (Timeline)</span>
              </div>
              <div className="chart-container" style={{height: '280px'}}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={areaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--neon-green)" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="var(--neon-green)" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--alert-red)" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="var(--alert-red)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <XAxis dataKey="name" tick={{fill:'#888', fontSize: 10}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fill:'#888', fontSize: 10}} axisLine={false} tickLine={false} tickFormatter={(value) => `R$${value}`} />
                    <RechartsTooltip content={<CustomChartTooltip />} />
                    <Area type="monotone" dataKey="Entrada" stroke="var(--neon-green)" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                    <Area type="monotone" dataKey="Saída" stroke="var(--alert-red)" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* --- TABELAS E LISTAS --- */}
            <div className="widget-card table-card col-span-full md-col-span-2">
              <div className="widget-header">
                <span className="widget-title"><Layers size={16}/> Projetos em Execução</span>
              </div>
              <div className="table-responsive">
                <table className="custom-table">
                  <thead><tr><th>Projeto</th><th>Budget Previsto</th><th>Deadline</th></tr></thead>
                  <tbody>
                    {data.projects.slice(0, 4).map(proj => (
                      <tr key={proj.id} className="table-row-hover">
                        <td className="font-bold text-white">{proj.title}</td>
                        <td className="text-cyber-blue">{currency(proj.budget_estimated)}</td>
                        <td className="text-alert-yellow">
                          {proj.deadline ? new Date(proj.deadline).toLocaleDateString() : 'Não definido'}
                        </td>
                      </tr>
                    ))}
                    {data.projects.length === 0 && <tr><td colSpan="3" className="empty-state">O ecossistema não possui projetos ativos.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="widget-card list-card col-span-full md-col-span-1">
              <div className="widget-header">
                <span className="widget-title text-cyber-blue"><CalendarDays size={16}/> Reuniões e Sprints</span>
                <button className="btn-link-small" onClick={() => setModals({...modals, manageMeetings: true})}>Gerenciar</button>
              </div>
              <div className="list-container custom-scrollbar">
                {data.meetings.length === 0 ? <p className="empty-state">Agenda corporativa livre.</p> : 
                  data.meetings.slice(0,4).map(meet => (
                    <div key={meet.id} className="list-item">
                      <div className="list-item-content">
                        <span className="list-item-meta text-cyber-blue">{new Date(meet.meeting_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        <h4 className="list-item-title">{meet.title}</h4>
                      </div>
                      {meet.link && <a href={meet.link} target="_blank" rel="noreferrer" className="btn-action-small"><Play size={12} className="mr-1"/> Sala</a>}
                    </div>
                  ))
                }
              </div>
            </div>

            <div className="widget-card table-card col-span-full md-col-span-2">
              <div className="widget-header">
                <span className="widget-title"><FolderKanban size={16}/> Fila de Demandas (Backlog)</span>
              </div>
              <div className="table-responsive">
                <table className="custom-table">
                  <thead><tr><th>Descrição da Tarefa</th><th>Estado (Status)</th><th>Vínculo</th></tr></thead>
                  <tbody>
                    {data.demands.slice(0, 4).map(task => (
                      <tr key={task.id} className="table-row-hover">
                        <td className="text-white">{task.title}</td>
                        <td>
                          <span className={`status-badge ${task.status}`}>
                            {translateStatus(task.status).toUpperCase()}
                          </span>
                        </td>
                        <td><span className="project-badge">{task.projects?.title || 'Backlog Global'}</span></td>
                      </tr>
                    ))}
                    {data.demands.length === 0 && <tr><td colSpan="3" className="empty-state">Sem tarefas em fila.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="widget-card list-card col-span-full md-col-span-1">
              <div className="widget-header">
                <span className="widget-title text-alert-yellow"><Lightbulb size={16}/> Cofre de Ideias</span>
              </div>
              <div className="list-container custom-scrollbar">
                {data.ideas.length === 0 ? <p className="empty-state">Cofre de inovações vazio.</p> :
                  data.ideas.slice(0,4).map(idea => (
                    <div key={idea.id} className="idea-item">
                      <p className="idea-content">"{idea.content}"</p>
                      <div className="idea-meta">Pitch por: {idea.author_name}</div>
                    </div>
                  ))
                }
              </div>
            </div>

          </div>
        )}

        {/* ==========================================================================
            MODAIS DE OPERAÇÃO
            ========================================================================== */}
        
        {/* MODAL FOMENTO E ACELERAÇÃO (COMPLETO) */}
        <Modal 
          isOpen={modals.fomento} 
          onClose={() => setModals({...modals, fomento: false})} 
          title="Hub de Fomento & Aceleração" 
          centerOnMobile={true} 
          maxWidth="950px"       
        >
          <div>
            <div className="fomento-tabs custom-scrollbar">
              <button className={`tab-btn ${fomentoTab === 'editais' ? 'active' : ''}`} onClick={() => setFomentoTab('editais')}>
                <Landmark size={16}/> Editais Estaduais e Nacionais
              </button>
              <button className={`tab-btn ${fomentoTab === 'roadmap' ? 'active' : ''}`} onClick={() => setFomentoTab('roadmap')}>
                <Map size={16}/> Blueprint de SaaS (Roadmap)
              </button>
              <button className={`tab-btn ${fomentoTab === 'financeiro' ? 'active' : ''}`} onClick={() => setFomentoTab('financeiro')}>
                <TrendingUp size={16}/> Execução Financeira de Edital
              </button>
            </div>

            <div className="fomento-content-area">
              
              {fomentoTab === 'editais' && (
                <div className="fade-in">
                  <h3 className="tab-title text-neon-green">Programas de Fomento à Inovação</h3>
                  <p className="tab-desc">Conheça as principais iniciativas governamentais e privadas para captar recursos, acelerar seu produto e integrar-se ao ecossistema tecnológico.</p>
                  
                  <div className="edital-cards-grid">
                    
                    <div className="edital-card hover-glow-yellow">
                      <div className="edital-card-header">
                        <Lightbulb size={24} className="text-alert-yellow" />
                        <h4>Programa Centelha</h4>
                      </div>
                      <p className="edital-text">Iniciativa federal operada pela FAPERO em Rondônia. Focado em empreendimentos nascentes. Oferece subvenção econômica e bolsas do CNPq para transformar ideias inovadoras em empresas reais.</p>
                      <span className="edital-badge yellow">Fase: Ideação & Validação</span>
                    </div>

                    <div className="edital-card hover-glow-purple">
                      <div className="edital-card-header">
                        <Rocket size={24} className="text-neon-purple" />
                        <h4>Tecnova III (Fapero / Finep)</h4>
                      </div>
                      <p className="edital-text">Desenvolvido para empresas inovadoras já estabelecidas. Fornece recursos pesados de subvenção para aceleração tecnológica, desenvolvimento de produtos e processos de internacionalização.</p>
                      <span className="edital-badge purple">Fase: Tração & Escala</span>
                    </div>

                    <div className="edital-card hover-glow-blue">
                      <div className="edital-card-header">
                        <Target size={24} className="text-cyber-blue" />
                        <h4>Sebrae Startups / Hub.RO</h4>
                      </div>
                      <p className="edital-text">O Hub.RO e o Sebrae Startups oferecem programas gratuitos de pré-aceleração, mentorias exclusivas, coworking e batalhas de pitch (como o Startup Connect) com prêmios em dinheiro para MVP.</p>
                      <span className="edital-badge blue">Fase: Conexão & Mentoria</span>
                    </div>

                    <div className="edital-card hover-glow-green">
                      <div className="edital-card-header">
                        <TrendingUp size={24} className="text-neon-green" />
                        <h4>Editais Nacionais (InovAtiva, etc)</h4>
                      </div>
                      <p className="edital-text">Maior programa de aceleração do Brasil. Conecta empreendedores a mentores, investidores (Venture Capital / Angels) e grandes empresas para gerar negócios e escalabilidade.</p>
                      <span className="edital-badge green">Fase: Crescimento Nacional</span>
                    </div>

                  </div>
                </div>
              )}

              {fomentoTab === 'roadmap' && (
                <div className="fade-in">
                  <h3 className="tab-title text-cyber-blue">Trilha Estratégica (SaaS Blueprint)</h3>
                  <p className="tab-desc">O passo a passo cronológico e definitivo para arquitetar, lançar e escalar uma startup de software, evitando os abismos clássicos de desenvolvimento e rejeição de mercado.</p>
                  
                  <div className="roadmap-tree-container">
                    {saasRoadmap.map((phase, i) => (
                      <div key={i} className="roadmap-phase-card fade-in" style={{animationDelay: `${i * 0.05}s`}}>
                        <h4 className="phase-title"><ChevronRight size={18} className="text-neon-purple mr-2"/> {phase.phase}</h4>
                        <div className="phase-items">
                          {phase.items.map((item, j) => (
                            <span key={j} className="phase-tag">{item}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {fomentoTab === 'financeiro' && (
                <div className="fade-in">
                  <h3 className="tab-title text-alert-yellow">Engenharia Financeira de Fomento</h3>
                  <p className="tab-desc">Programas de fomento governamental (como Tecnova e Centelha) exigem precisão absoluta. Aprenda a categorizar e justificar seus gastos nas rubricas corretas para evitar reprovação de contas.</p>

                  <div className="finance-guide-grid">
                    <div className="finance-box border-purple">
                      <h4><Briefcase size={20} className="text-neon-purple"/> Despesas de Capital (CAPEX)</h4>
                      <p>Equipamentos duráveis e patrimônios físicos que serão integrados permanentemente à estrutura da startup.</p>
                      <ul>
                        <li><CheckCircle2 size={14} className="text-neon-purple"/> Computadores, Workstations e Servidores Físicos.</li>
                        <li><CheckCircle2 size={14} className="text-neon-purple"/> Maquinários industriais e Ferramentas técnicas.</li>
                        <li><CheckCircle2 size={14} className="text-neon-purple"/> Mobiliário e adaptações essenciais do escritório base.</li>
                      </ul>
                    </div>

                    <div className="finance-box border-green">
                      <h4><FileText size={20} className="text-neon-green"/> Despesas de Custeio (OPEX)</h4>
                      <p>Despesas rotineiras de manutenção, serviços em nuvem, consumo e pagamentos operacionais.</p>
                      <ul>
                        <li><CheckCircle2 size={14} className="text-neon-green"/> Servidores em Nuvem (AWS, Supabase, Vercel).</li>
                        <li><CheckCircle2 size={14} className="text-neon-green"/> Contratação de Softwares, APIs de terceiros e Licenças.</li>
                        <li><CheckCircle2 size={14} className="text-neon-green"/> Serviços de Consultoria, Desenvolvedores PJ, Jurídico.</li>
                        <li><CheckCircle2 size={14} className="text-neon-green"/> Marketing Digital, passagens e materiais de consumo.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="edital-tip-box" style={{marginTop: '20px'}}>
                    <strong><AlertTriangle size={18} className="text-alert-yellow mr-2" style={{display:'inline-block', verticalAlign:'middle'}}/>Regra de Ouro (Compliance):</strong> Jamais realoque recursos da rubrica de Capital para Custeio (ou vice-versa) sem autorização prévia, documentada e formal do órgão concedente. Use as "Categorias" no módulo Financeiro do Data-Planner para isolar exatamente os gastos vinculados ao seu Edital.
                  </div>
                </div>
              )}
            </div>
          </div>
        </Modal>

        {/* MODAIS CLÁSSICOS (Nova Ideia, Reunião, Tarefa) */}
        <Modal isOpen={modals.idea} onClose={() => setModals({...modals, idea: false})} title="Registrar Nova Ideia">
          <div className="modal-body">
            <div className="input-group">
              <label>Descrição Criativa</label>
              <textarea className="custom-input textarea" placeholder="Descreva sua ideia ou solução..." value={newIdea.content} onChange={e => setNewIdea({...newIdea, content: e.target.value})} />
            </div>
            <div className="input-group">
              <label>Autor</label>
              <input className="custom-input" placeholder="Seu nome (Opcional)" value={newIdea.author} onChange={e => setNewIdea({...newIdea, author: e.target.value})} />
            </div>
            <button className="btn-primary w-100 bg-yellow text-black" onClick={handleAddIdea}>Salvar Ideia</button>
          </div>
        </Modal>

        <Modal isOpen={modals.meeting} onClose={() => setModals({...modals, meeting: false})} title="Sincronizar Reunião">
          <div className="modal-body">
            <div className="input-group">
              <label>Assunto (Título)</label>
              <input className="custom-input" placeholder="Ex: Sync Semanal, Review de Sprint" value={newMeet.title} onChange={e => setNewMeet({...newMeet, title: e.target.value})} />
            </div>
            <div className="form-row">
              <div className="input-group"><label>Data de Início</label><input type="date" className="custom-input" value={newMeet.date} onChange={e => setNewMeet({...newMeet, date: e.target.value})} /></div>
              <div className="input-group"><label>Hora de Início</label><input type="time" className="custom-input" value={newMeet.time} onChange={e => setNewMeet({...newMeet, time: e.target.value})} /></div>
            </div>
            <div className="input-group">
              <label>Local ou Sala (Link Web)</label>
              <input className="custom-input" placeholder="https://meet.google.com/..." value={newMeet.link} onChange={e => setNewMeet({...newMeet, link: e.target.value})} />
            </div>
            <button className="btn-primary w-100 bg-blue text-black mt-2" onClick={handleAddMeeting}>Confirmar Evento</button>
          </div>
        </Modal>

        <Modal isOpen={modals.manageMeetings} onClose={() => setModals({...modals, manageMeetings: false})} title="Painel de Agendamentos">
          <div className="modal-list-container custom-scrollbar">
            {data.meetings.length === 0 ? <p className="empty-state">Sua agenda está livre.</p> : (
              data.meetings.map(m => (
                <div key={m.id} className="manage-list-item">
                  <div className="manage-info">
                    <h3 className="text-cyber-blue">{m.title}</h3>
                    <span>{new Date(m.meeting_date).toLocaleString('pt-BR', { weekday:'short', day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })}</span>
                  </div>
                  <button className="btn-delete-icon" onClick={() => handleDeleteMeeting(m.id)} title="Cancelar e Excluir">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </Modal>

        <Modal isOpen={modals.task} onClose={() => setModals({...modals, task: false})} title="Alocação Estratégica (Task)">
          <div className="modal-body">
            <div className="input-group"><label>Título da Demanda</label><input className="custom-input" placeholder="Ex: Refatorar API de pagamentos" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} /></div>
            <div className="input-group"><label>Especificações Técnicas</label><textarea className="custom-input textarea" placeholder="Critérios de aceite e detalhes operacionais..." value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} /></div>
            <div className="form-row">
               <div className="input-group"><label>Deadline (Prazo)</label><input type="date" className="custom-input" value={newTask.due_date} onChange={e => setNewTask({...newTask, due_date: e.target.value})} /></div>
               <div className="input-group"><label>Grau de Prioridade</label>
                  <select className="custom-input" value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
                    <option value="low">Operacional (Baixa)</option>
                    <option value="medium">Importante (Média)</option>
                    <option value="high">Crítica (Alta)</option>
                  </select>
               </div>
            </div>
            <button className="btn-primary w-100 mt-2" onClick={handleCreateTask}>Criar e Injetar no Kanban</button>
          </div>
        </Modal>

      </main>
    </div>
  );
}