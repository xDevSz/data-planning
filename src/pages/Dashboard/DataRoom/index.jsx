import React, { useState, useEffect } from 'react';
import Navbar from '../../../components/Navbar';
import Modal from '../../../components/Modal';
import { appService } from '../../../services/appService';
import { useAlert } from '../../../hooks/useAlert';
import { 
  FileText, Download, Briefcase, Eye, Save, Rocket, ShieldAlert, CheckCircle2 
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend 
} from 'recharts';
import './index.css';

export default function DataRoom() {
  const alertHook = useAlert();
  const [loading, setLoading] = useState(true);
  
  const [data, setData] = useState(null);
  const [startupData, setStartupData] = useState({}); 
  const [teamMembers, setTeamMembers] = useState([]); 
  const [pitchData, setPitchData] = useState(null);
  const [printMode, setPrintMode] = useState(null); 

  const [isPitchModalOpen, setIsPitchModalOpen] = useState(false);
  const [pitchForm, setPitchForm] = useState({
    elevatorPitch: '', problem: '', solution: '', target: '', differential: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const fullData = await appService.getFullOverview();
      const savedPitch = await appService.getStartupPitch();
      const profileData = await appService.getProfileData();
      
      setData(fullData);
      setStartupData(profileData.user.startups || {});
      setTeamMembers(profileData.team || []); 

      if (savedPitch) {
        setPitchData(savedPitch);
        setPitchForm({
          elevatorPitch: savedPitch.elevator_pitch || '',
          problem: savedPitch.problem || '',
          solution: savedPitch.solution || '',
          target: savedPitch.target_market || '',
          differential: savedPitch.differential || ''
        });
      } else {
        setPitchData(null);
      }
    } catch (e) {
      alertHook.notifyError("Erro ao compilar o Data Room.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Mágica para mudar o nome do arquivo PDF dinamicamente
  useEffect(() => {
    if (printMode) {
      const originalTitle = document.title;
      const safeName = startupData.name ? startupData.name.replace(/\s+/g, '_') : 'Startup';
      
      const docName = printMode === 'full' 
        ? `Dossie_Auditoria_${safeName}`
        : `One_Pager_${safeName}`;
      
      document.title = docName;

      setTimeout(() => {
        window.print();
        document.title = originalTitle; 
        setPrintMode(null); 
      }, 800); 
    }
  }, [printMode, startupData.name]);

  const handleSavePitch = async () => {
    if (!pitchForm.elevatorPitch || !pitchForm.problem) return alertHook.notifyError("Preencha ao menos o Resumo e o Problema.");
    try {
      await appService.saveStartupPitch(pitchForm);
      alertHook.notify("Apresentação pública salva com sucesso!", "success");
      setIsPitchModalOpen(false);
      loadData();
    } catch (e) {
      alertHook.notifyError("Erro ao salvar apresentação.");
    }
  };

  const handleDeletePitch = async () => {
    if (await alertHook.confirm("Excluir Apresentação?", "A apresentação atual será deletada permanentemente.")) {
      try {
        await appService.deleteStartupPitch();
        setPitchForm({ elevatorPitch: '', problem: '', solution: '', target: '', differential: '' });
        alertHook.notify("Apresentação excluída.", "success");
        setIsPitchModalOpen(false);
        loadData();
      } catch (e) {
        alertHook.notifyError("Erro ao excluir.");
      }
    }
  };

  const handlePrintFull = () => setPrintMode('full');
  const handlePrintPublic = () => {
    if (!pitchData) {
      alertHook.notifyError("Você precisa preencher a Apresentação Pública primeiro.");
      setIsPitchModalOpen(true);
      return;
    }
    setPrintMode('public');
  };

  const currency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  if (loading || !data) return <div className="dr-wrapper"><Navbar /><div className="dr-loading">Compilando dados corporativos...</div></div>;

  const startupName = startupData.name || "Nossa Startup";
  const logoUrl = startupData.logo_url || null;

  // --- PREPARAÇÃO DE DADOS PARA OS GRÁFICOS ---
  
  // 1. Gráfico de Projetos (Paleta Institucional: Azul, Roxo, Vermelho)
  const projectsCount = { active: 0, paused: 0, done: 0 };
  data.projects.forEach(p => { if (projectsCount[p.status] !== undefined) projectsCount[p.status]++; });
  const projectChartData = [
    { name: 'Em Andamento', value: projectsCount.active, color: '#00d9ff' },
    { name: 'Concluídos', value: projectsCount.done, color: '#7000ff' },
    { name: 'Pausados', value: projectsCount.paused, color: '#ff0055' }
  ].filter(d => d.value > 0);

  // 2. Gráfico de Demandas (Paleta de Produtividade: Amarelo, Laranja, Verde)
  const demandsCount = { todo: 0, doing: 0, done: 0 };
  data.demands.forEach(d => { if (demandsCount[d.status] !== undefined) demandsCount[d.status]++; });
  const demandChartData = [
    { name: 'A Fazer', value: demandsCount.todo, color: '#ffcc00' },
    { name: 'Em Progresso', value: demandsCount.doing, color: '#ff8800' },
    { name: 'Entregues', value: demandsCount.done, color: '#00cc6a' }
  ].filter(d => d.value > 0);

  // 3. Gráfico Financeiro (Auditoria)
  const financeChartData = [
    { name: 'Entradas', valor: data.kpis.incomeTotal, fill: '#00cc6a' },
    { name: 'Saídas', valor: data.kpis.spentTotal, fill: '#ff0055' }
  ];

  return (
    <div className="dr-wrapper">
      
      <div className="no-print">
        <Navbar />
        <main className="dr-content fade-in">
          <header className="page-header">
            <div className="header-info">
              <h1 className="page-title"><Briefcase className="text-neon-purple mr-2"/> Data Room & Relatórios</h1>
              <p className="page-subtitle">Extraia o dossiê completo da startup para auditoria ou gere uma apresentação pública para investidores com gráficos automatizados.</p>
            </div>
          </header>

          <div className="dr-grid">
            <div className="glass-card dr-card">
              <div className="dr-card-icon bg-red-glow"><ShieldAlert size={32} className="text-alert-red"/></div>
              <h2>Dossiê Corporativo Completo</h2>
              <p>Extrai <strong>absolutamente todos os dados</strong> operacionais, gráficos financeiros, projetos e equipe completa. (Uso interno / Auditoria).</p>
              <div className="dr-actions">
                <button className="btn-primary w-100 bg-red" onClick={handlePrintFull}>
                  <Download size={18} className="mr-2"/> Gerar PDF Restrito
                </button>
              </div>
            </div>

            <div className="glass-card dr-card">
              <div className="dr-card-icon bg-green-glow"><Rocket size={32} className="text-neon-green"/></div>
              <h2>Apresentação Pública (One-Pager)</h2>
              <p>Um documento visual contendo o <strong>Resumo do Negócio, Gráficos Operacionais e Demandas</strong>. Sem métricas financeiras sensíveis expostas.</p>
              
              <div className="dr-actions">
                {pitchData ? (
                  <div className="dr-btn-group">
                    <button className="btn-outline-green w-100" onClick={() => setIsPitchModalOpen(true)}>
                      <Eye size={18} className="mr-2"/> Editar Apresentação
                    </button>
                    <button className="btn-primary w-100 bg-green text-black" onClick={handlePrintPublic}>
                      <Download size={18} className="mr-2"/> Gerar PDF Público
                    </button>
                  </div>
                ) : (
                  <button className="btn-outline-green w-100 mt-auto" onClick={() => setIsPitchModalOpen(true)}>
                    <CheckCircle2 size={18} className="mr-2"/> Criar Apresentação Inicial
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* =========================================================
          ÁREA DE IMPRESSÃO (PDF CUSTOMIZADO COM CORES DO SISTEMA)
          ========================================================= */}
      {printMode && (
        <div className="print-area">
          
          {/* CAPA DO DOCUMENTO */}
          <div className="print-cover">
             <div className="cover-brand">
               {logoUrl ? <img src={logoUrl} alt="Logo" className="cover-logo" /> : <h1 className="cover-title-fallback">{startupName}</h1>}
             </div>
             <h1 className="cover-title">{printMode === 'full' ? 'Dossiê Corporativo e Auditoria' : 'Apresentação Executiva (One-Pager)'}</h1>
             <div className="cover-meta">
               <p><strong>Gerado em:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
               <p><strong>Nível de Acesso:</strong> {printMode === 'full' ? 'Confidencial / Restrito' : 'Público / Investidores'}</p>
             </div>
          </div>

          <div className="print-page-break"></div>

          {/* CABEÇALHO PADRÃO */}
          <div className="print-header">
            <div className="print-header-brand">
               {logoUrl ? <img src={logoUrl} alt="Logo" /> : <h2>{startupName}</h2>}
            </div>
            <div className="print-header-info">
               <strong>IDENTIFICAÇÃO CORPORATIVA</strong>
               <p><strong>Razão Social:</strong> {startupName}</p>
               <p><strong>CNPJ:</strong> {startupData.cnpj || 'Não cadastrado'}</p>
               <p><strong>CNAE Principal:</strong> {startupData.cnae || 'Não cadastrado'}</p>
               <p><strong>Endereço Sede:</strong> {startupData.address || 'Não cadastrado'}</p>
               <p><strong>Situação Cadastral:</strong> {startupData.legal_status || 'Não informada'}</p>
            </div>
          </div>

          {/* SEÇÃO 1: O PITCH */}
          {(printMode === 'public' || printMode === 'full') && pitchData && (
            <div className="print-section">
              <div className="print-section-header cyber-blue"><h2>Resumo do Negócio</h2></div>
              <div className="print-pitch-hero">
                <h3>O que fazemos</h3>
                <p>{pitchData.elevator_pitch}</p>
              </div>
              <div className="print-pitch-grid">
                <div className="pitch-box"><h4>O Problema</h4><p>{pitchData.problem}</p></div>
                <div className="pitch-box"><h4>A Nossa Solução</h4><p>{pitchData.solution}</p></div>
                <div className="pitch-box"><h4>Mercado-Alvo</h4><p>{pitchData.target_market}</p></div>
                <div className="pitch-box"><h4>Diferencial Competitivo</h4><p>{pitchData.differential}</p></div>
              </div>
            </div>
          )}

          {/* SEÇÃO 2: GRÁFICOS OPERACIONAIS E PROJETOS */}
          <div className="print-section">
            <div className="print-section-header neon-purple"><h2>Desempenho Operacional e Projetos</h2></div>
            
            <div className="print-charts-row">
              {projectChartData.length > 0 && (
                <div className="print-chart-box">
                  <h4>Distribuição de Projetos</h4>
                  <PieChart width={380} height={280}>
                    <Pie data={projectChartData} cx="50%" cy="45%" innerRadius={60} outerRadius={90} dataKey="value" isAnimationActive={false} label>
                      {projectChartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend verticalAlign="bottom" height={40} wrapperStyle={{ paddingTop: '20px' }}/>
                  </PieChart>
                </div>
              )}
              {demandChartData.length > 0 && (
                <div className="print-chart-box">
                  <h4>Desempenho de Demandas (Sprints)</h4>
                  <PieChart width={380} height={280}>
                    <Pie data={demandChartData} cx="50%" cy="45%" innerRadius={0} outerRadius={90} dataKey="value" isAnimationActive={false} label>
                      {demandChartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend verticalAlign="bottom" height={40} wrapperStyle={{ paddingTop: '20px' }}/>
                  </PieChart>
                </div>
              )}
            </div>

            <table className="print-table mt-4">
              <thead><tr><th>Nome do Projeto</th><th>Descrição Técnica</th><th>Situação</th><th>Prazo Limite</th></tr></thead>
              <tbody>
                {data.projects.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.title}</strong></td>
                    <td style={{fontSize:'9pt', color:'#444'}}>{p.description || 'Sem descrição'}</td>
                    <td><span className={`print-badge ${p.status}`}>{p.status === 'active' ? 'EM ANDAMENTO' : p.status === 'paused' ? 'PAUSADO' : 'CONCLUÍDO'}</span></td>
                    <td>{p.deadline ? new Date(p.deadline).toLocaleDateString('pt-BR') : '-'}</td>
                  </tr>
                ))}
                {data.projects.length === 0 && <tr><td colSpan="4">Nenhum projeto registrado.</td></tr>}
              </tbody>
            </table>
          </div>

          <div className="print-section">
            <div className="print-section-header neon-purple"><h2>Fila de Demandas Técnicas</h2></div>
            <table className="print-table">
              <thead><tr><th>Tarefa / Demanda</th><th>Projeto Vinculado</th><th>Responsável</th><th>Situação</th></tr></thead>
              <tbody>
                {data.demands.slice(0, 20).map(d => ( // Limite de 20 para não estourar o PDF de investidor
                  <tr key={d.id}>
                    <td><strong>{d.title}</strong></td>
                    <td>{d.projects?.title || 'Geral'}</td>
                    <td>{d.assignee || 'Não atribuído'}</td>
                    <td>{d.status === 'todo' ? 'A FAZER' : d.status === 'doing' ? 'EM PROGRESSO' : 'CONCLUÍDO'}</td>
                  </tr>
                ))}
                {data.demands.length === 0 && <tr><td colSpan="4">Nenhuma demanda registrada.</td></tr>}
              </tbody>
            </table>
          </div>

          {/* SEÇÃO PRIVADA (FINANCEIRO & EQUIPE COMPLETA) */}
          {printMode === 'full' && (
            <>
              <div className="print-page-break"></div>
              
              <div className="print-section">
                <div className="print-section-header danger"><h2>Auditoria Financeira Confidencial</h2></div>
                
                <div className="print-charts-row mb-4">
                  <div className="print-chart-box full-width">
                     <h4>Balanço de Capital: Entradas vs Saídas</h4>
                     <BarChart width={600} height={250} data={financeChartData} margin={{top: 20, right: 30, left: 20, bottom: 5}} isAnimationActive={false}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee"/>
                        <XAxis dataKey="name" tick={{fill: '#333', fontWeight: 'bold'}}/>
                        <YAxis tickFormatter={(val) => `R$${val}`} tick={{fill: '#666'}}/>
                        <RechartsTooltip formatter={(val) => currency(val)} />
                        <Bar dataKey="valor" fill="#8884d8" isAnimationActive={false}>
                          {financeChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                  </div>
                </div>
                
                <div className="print-kpi-container">
                  <div className="print-kpi-box green"><span>Total de Entradas</span><strong>{currency(data.kpis.incomeTotal)}</strong></div>
                  <div className="print-kpi-box red"><span>Total de Saídas</span><strong>{currency(data.kpis.spentTotal)}</strong></div>
                  <div className="print-kpi-box dark"><span>Saldo em Caixa</span><strong>{currency(data.kpis.incomeTotal - data.kpis.spentTotal)}</strong></div>
                </div>

                <h3 style={{marginTop: '20px', fontSize: '13pt', color: '#111', fontWeight: '900'}}>Livro Caixa Detalhado</h3>
                <table className="print-table striped">
                  <thead><tr><th>Data da Operação</th><th>Histórico</th><th>Natureza</th><th style={{textAlign: 'right'}}>Valor (R$)</th></tr></thead>
                  <tbody>
                    {data.transactions.map(t => (
                      <tr key={t.id}>
                        <td>{new Date(t.created_at).toLocaleDateString('pt-BR')}</td>
                        <td>{t.description}</td>
                        <td style={{color: t.type === 'income' ? '#00cc6a' : '#ff0055', fontWeight: 'bold'}}>{t.type === 'income' ? 'RECEITA' : 'DESPESA'}</td>
                        <td style={{textAlign: 'right', fontWeight: 'bold'}}>{currency(t.amount)}</td>
                      </tr>
                    ))}
                    {data.transactions.length === 0 && <tr><td colSpan="4">Nenhuma movimentação financeira.</td></tr>}
                  </tbody>
                </table>
              </div>

              {/* A EQUIPE COMPLETA */}
              <div className="print-section">
                <div className="print-section-header"><h2>Quadro Societário e Equipe Operacional</h2></div>
                <table className="print-table">
                  <thead><tr><th>Nome Completo</th><th>Cargo / Setor</th><th>Vínculo</th></tr></thead>
                  <tbody>
                    {/* Founder / CEO */}
                    {data.profiles.map(p => (
                      <tr key={p.id}>
                        <td><strong>{p.full_name}</strong></td>
                        <td>{p.role}</td>
                        <td><span style={{color: '#7000ff', fontWeight: 'bold'}}>Founder / Admin</span></td>
                      </tr>
                    ))}
                    {/* Resto da Equipe */}
                    {teamMembers.map(m => (
                      <tr key={m.id}>
                        <td>{m.name}</td>
                        <td>{m.role}</td>
                        <td>Membro (Convidado)</td>
                      </tr>
                    ))}
                    {(data.profiles.length === 0 && teamMembers.length === 0) && <tr><td colSpan="3">Nenhum membro registrado.</td></tr>}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* MODAL DO PITCH */}
      <Modal isOpen={isPitchModalOpen} onClose={() => setIsPitchModalOpen(false)} title="Configurar Apresentação Pública" centerOnMobile={true} maxWidth="850px">
        <div className="dr-modal-grid custom-scrollbar" style={{maxHeight: '70vh', overflowY: 'auto', paddingRight: '10px'}}>
          <div className="input-group full-w">
            <label>O que fazemos (Resumo do Negócio)</label>
            <input className="modern-input" value={pitchForm.elevatorPitch} onChange={e => setPitchForm({...pitchForm, elevatorPitch: e.target.value})} placeholder="Somos a plataforma que..." autoFocus/>
          </div>
          <div className="input-group half-w">
            <label>O Problema no Mercado</label>
            <textarea className="modern-textarea" rows="4" value={pitchForm.problem} onChange={e => setPitchForm({...pitchForm, problem: e.target.value})} placeholder="Hoje, as empresas sofrem muito com..." />
          </div>
          <div className="input-group half-w">
            <label>A Nossa Solução</label>
            <textarea className="modern-textarea" rows="4" value={pitchForm.solution} onChange={e => setPitchForm({...pitchForm, solution: e.target.value})} placeholder="Através da nossa tecnologia, nós entregamos..." />
          </div>
          <div className="input-group half-w">
            <label>Público-Alvo e Mercado</label>
            <textarea className="modern-textarea" rows="3" value={pitchForm.target} onChange={e => setPitchForm({...pitchForm, target: e.target.value})} placeholder="Nosso foco são pequenas e médias empresas do setor..." />
          </div>
          <div className="input-group half-w">
            <label>Diferencial Competitivo</label>
            <textarea className="modern-textarea" rows="3" value={pitchForm.differential} onChange={e => setPitchForm({...pitchForm, differential: e.target.value})} placeholder="Diferente da concorrência, nosso sistema..." />
          </div>
          
          <div className="full-w modal-footer mt-2">
            {pitchData && (
               <button className="btn-text-danger" onClick={handleDeletePitch}>Excluir Apresentação</button>
            )}
            <button className="btn-primary" onClick={handleSavePitch}>
              <Save size={18} className="mr-2"/> Gravar Informações
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}