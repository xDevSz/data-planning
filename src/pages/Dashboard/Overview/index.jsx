import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import Modal from '../../../components/Modal';
import { appService } from '../../../services/appService';
import { useAlert } from '../../../hooks/useAlert';
import './index.css';

// IMPORTANDO OS NOVOS GRÁFICOS DO RECHARTS
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, // Novo: Radar
  AreaChart, Area, XAxis, YAxis, CartesianGrid // Novo: Área
} from 'recharts';

export default function Overview() {
  const navigate = useNavigate();
  const alertHook = useAlert();
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  
  const [data, setData] = useState({
    kpis: { budgetTotal: 0, spentTotal: 0, incomeTotal: 0, burnRate: 0, roiProjected: 0, teamCount: 0 },
    projects: [], demands: [], meetings: [], transactions: [], ideas: [], profiles: []
  });
  const [loading, setLoading] = useState(true);

  const [modals, setModals] = useState({ task: false, meeting: false, manageMeetings: false, idea: false });
  const [newIdea, setNewIdea] = useState({ content: '', author: '' });
  const [newTask, setNewTask] = useState({ title: '', description: '', due_date: '', assignee: '', priority: 'medium' });
  const [newMeet, setNewMeet] = useState({ title: '', date: '', time: '', link: '', participants: '', description: '' });

  const loadData = async () => {
    try {
      const result = await appService.getFullOverview();
      setData(result);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const translateStatus = (status) => {
    const map = { 'todo': 'A Fazer', 'doing': 'Em Andamento', 'blocked': 'Bloqueado', 'done': 'Concluído' };
    return map[status] || status;
  };

  // --- HANDLERS (Mantidos 100% iguais) ---
  const handleCreateTask = async () => {
    if(!newTask.title) return alertHook.notifyError("Título é obrigatório.");
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
    alertHook.notify("Demanda criada com sucesso!");
  };

  const handleAddIdea = async () => {
    if(!newIdea.content) return;
    await appService.createIdea(newIdea.content, newIdea.author || 'Anônimo');
    setModals({...modals, idea: false}); setNewIdea({content:'', author:''}); loadData();
    alertHook.notify("Ideia adicionada!");
  };

  const handleAddMeeting = async () => {
    if(!newMeet.title || !newMeet.date || !newMeet.time) return alertHook.notifyError("Preencha Título, Data e Hora.");
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
    alertHook.notify("Reunião agendada!");
  };

  const handleDeleteMeeting = async (id) => {
    if(await alertHook.confirm("Cancelar Reunião?", "Tem certeza que deseja cancelar esta reunião?")) {
      await appService.deleteMeeting(id);
      loadData();
      alertHook.notify("Reunião cancelada.");
    }
  };

  const currency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  // --- DADOS PARA OS GRÁFICOS ---
  
  // 1. Pizza (Prioridades)
  const priorityData = [
    { name: 'Alta', value: data.demands.filter(d => d.priority === 'high').length, color: '#ff0055' },
    { name: 'Média', value: data.demands.filter(d => d.priority === 'medium').length, color: '#ffcc00' },
    { name: 'Baixa', value: data.demands.filter(d => d.priority === 'low').length, color: '#00ff94' },
  ].filter(item => item.value > 0);

  // 2. Pizza (Financeiro Resumo)
  const financialPieData = [
    { name: 'Entradas', value: data.kpis.incomeTotal, color: '#00ff94' },
    { name: 'Saídas', value: data.kpis.spentTotal, color: '#b026ff' }
  ];

  // --- NOVOS DADOS (INOVAÇÃO) ---

  // 3. Radar (Saúde dos Projetos - Média da Tríade)
  const avgQuality = data.projects.reduce((acc, p) => acc + (p.quality_score || 50), 0) / (data.projects.length || 1);
  const avgTime = data.projects.reduce((acc, p) => acc + (p.time_score || 50), 0) / (data.projects.length || 1);
  const avgScope = data.projects.reduce((acc, p) => acc + (p.scope_score || 50), 0) / (data.projects.length || 1);

  const radarData = [
    { subject: 'Qualidade Téc.', A: Math.round(avgQuality), fullMark: 100 },
    { subject: 'Prazo (Velocidade)', A: Math.round(avgTime), fullMark: 100 },
    { subject: 'Volume Escopo', A: Math.round(avgScope), fullMark: 100 },
  ];

  // 4. Área (Fluxo de Caixa - Tendência)
  // Pega as últimas transações e simula uma linha do tempo simples
  const areaData = data.transactions.slice(0, 7).reverse().map((t, index) => ({
    name: t.created_at ? new Date(t.created_at).toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'}) : `T-${index}`,
    Entrada: t.type === 'income' ? t.amount : 0,
    Saída: t.type === 'expense' ? t.amount : 0,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{background: '#1a1a1a', border: '1px solid #333', padding: '10px', borderRadius: '5px', fontSize:'0.8rem'}}>
          <p style={{color:'#ccc', marginBottom:'5px'}}>{label ? label : payload[0].name}</p>
          {payload.map((p, i) => (
            <p key={i} style={{color: p.color || p.payload.fill, margin: 0}}>
              {p.name}: <strong>{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard-container">
      <Navbar />

      <div className="dashboard-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Centro de Comando</h1>
            <p className="last-update">Hoje, {today}</p>
          </div>
          
          <div className="header-actions">
              <button className="action-btn-outline" onClick={() => navigate('/dashboard/financial')}>📊 Gerenciar Gastos</button>
              <button className="action-btn-yellow" onClick={() => setModals({...modals, idea: true})}>💡 Nova Ideia</button>
              <button className="action-btn-blue" onClick={() => setModals({...modals, meeting: true})}>📅 + Reunião</button>
              <button className="action-btn-purple" onClick={() => setModals({...modals, task: true})}>+ Tarefa</button>
          </div>
        </div>

        {loading ? <div style={{color:'#fff', textAlign: 'center', marginTop: '20px'}}>Carregando...</div> : (
          <div className="overview-grid">
            
            {/* LINHA 1: KPIs */}
            <div className="widget-card col-span-1">
              <span className="widget-title">Receita (Entradas)</span>
              <div className="kpi-value" style={{color: 'var(--neon-green)'}}>{currency(data.kpis.incomeTotal)}</div>
            </div>
            <div className="widget-card col-span-1">
              <span className="widget-title">Gasto (Saídas)</span>
              <div className="kpi-value" style={{color: 'var(--neon-purple)'}}>{currency(data.kpis.spentTotal)}</div>
            </div>
            <div className="widget-card col-span-1">
              <span className="widget-title">ROI Real</span>
              <div className="kpi-value positive">{data.kpis.roiProjected}%</div>
            </div>
            <div className="widget-card col-span-1">
              <span className="widget-title">Orçamento Projetos</span>
              <div className="kpi-value">{currency(data.kpis.budgetTotal)}</div>
            </div>

            {/* --- LINHA 2: GRÁFICOS ORIGINAIS (PIZZA) --- */}
            <div className="widget-card col-span-2 tablet-col-span-1 mobile-col-span-1" style={{minHeight: '300px'}}>
              <div className="widget-header"><span className="widget-title">Demandas por Prioridade</span></div>
              <div style={{width: '100%', height: '100%'}}>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={priorityData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                      {priorityData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="widget-card col-span-2 tablet-col-span-1 mobile-col-span-1" style={{minHeight: '300px'}}>
              <div className="widget-header"><span className="widget-title">Balanço Financeiro</span></div>
              <div style={{width: '100%', height: '100%'}}>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={financialPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                      {financialPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* --- LINHA 3: NOVOS GRÁFICOS INOVADORES --- */}
            
            {/* Gráfico de Radar (Tríade de Ferro) */}
            <div className="widget-card col-span-2 tablet-col-span-1 mobile-col-span-1" style={{minHeight: '320px'}}>
              <div className="widget-header"><span className="widget-title">Equilíbrio da Tríade (Médio)</span></div>
              <div style={{width: '100%', height: '100%'}}>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#444" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Performance" dataKey="A" stroke="var(--neon-purple)" fill="var(--neon-purple)" fillOpacity={0.4} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico de Área (Fluxo de Caixa) */}
            <div className="widget-card col-span-2 tablet-col-span-1 mobile-col-span-1" style={{minHeight: '320px'}}>
              <div className="widget-header"><span className="widget-title">Tendência Financeira (Últimos Movimentos)</span></div>
              <div style={{width: '100%', height: '100%'}}>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={areaData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00ff94" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#00ff94" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff0055" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ff0055" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                    <XAxis dataKey="name" tick={{fill:'#666', fontSize: 10}} />
                    <YAxis tick={{fill:'#666', fontSize: 10}} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="Entrada" stroke="#00ff94" fillOpacity={1} fill="url(#colorIncome)" />
                    <Area type="monotone" dataKey="Saída" stroke="#ff0055" fillOpacity={1} fill="url(#colorExpense)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* LINHA 4: TABELAS E LISTAS (Mantidas) */}
            <div className="widget-card col-span-3 tablet-col-span-2 mobile-col-span-1">
              <div className="widget-header">
                <span className="widget-title">Projetos em Andamento</span>
              </div>
              <div className="table-responsive">
                <table className="demands-table">
                  <thead><tr><th>Projeto</th><th>Orçamento</th><th>Prazo</th></tr></thead>
                  <tbody>
                    {data.projects.slice(0, 3).map(proj => (
                      <tr key={proj.id}>
                        <td style={{fontWeight: 'bold'}}>{proj.title}</td>
                        <td>{currency(proj.budget_estimated)}</td>
                        <td style={{color: 'var(--alert-yellow)'}}>
                          {proj.deadline ? new Date(proj.deadline).toLocaleDateString() : 'N/D'}
                        </td>
                      </tr>
                    ))}
                    {data.projects.length === 0 && <tr><td colSpan="3" style={{textAlign:'center', color:'#666'}}>Sem projetos.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="widget-card col-span-1 tablet-col-span-2 mobile-col-span-1">
              <div className="widget-header">
                <span className="widget-title" style={{color: 'var(--cyber-blue)'}}>Agenda</span>
                <button onClick={() => setModals({...modals, manageMeetings: true})} style={{background:'none', border:'none', color:'#ccc', cursor:'pointer', fontSize:'0.8rem', textDecoration:'underline'}}>Ver Tudo</button>
              </div>
              <div style={{display:'flex', flexDirection:'column', gap:'10px', marginTop:'10px'}}>
                {data.meetings.length === 0 ? <p style={{color:'#666', fontSize:'0.8rem'}}>Vazio.</p> : 
                  data.meetings.slice(0,3).map(meet => (
                    <div key={meet.id} className="meeting-item">
                      <div style={{flex:1}}>
                        <div style={{fontSize:'0.75rem', color:'var(--cyber-blue)', fontWeight:'bold'}}>{new Date(meet.meeting_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        <h4 style={{fontSize:'0.9rem', margin:'2px 0'}}>{meet.title}</h4>
                      </div>
                      {meet.link && <a href={meet.link} target="_blank" rel="noreferrer" className="btn-meet">Entrar</a>}
                    </div>
                  ))
                }
              </div>
            </div>

            <div className="widget-card col-span-2 tablet-col-span-2 mobile-col-span-1">
              <div className="widget-header">
                <span className="widget-title">Últimas Demandas</span>
              </div>
              <div className="table-responsive">
                <table className="demands-table">
                  <thead><tr><th>Tarefa</th><th>Status</th><th>Projeto</th></tr></thead>
                  <tbody>
                    {data.demands.slice(0, 5).map(task => (
                      <tr key={task.id}>
                        <td>{task.title}</td>
                        <td><span style={{color: task.status === 'done' ? 'var(--neon-green)' : 'var(--cyber-blue)', fontSize: '0.7rem'}}>{translateStatus(task.status).toUpperCase()}</span></td>
                        <td><span style={{fontSize:'0.7rem', background:'#222', padding:'2px 5px', borderRadius:'4px'}}>{task.projects?.title || 'Geral'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="widget-card col-span-2 tablet-col-span-2 mobile-col-span-1">
              <div className="widget-header">
                <span className="widget-title" style={{color: 'var(--alert-yellow)'}}>Caixa de Ideias</span>
              </div>
              <div style={{maxHeight:'200px', overflowY:'auto'}}>
                {data.ideas.length === 0 ? <p style={{color:'#666', padding:'10px'}}>Nenhuma ideia pendente.</p> :
                  data.ideas.map(idea => (
                    <div key={idea.id} style={{background: 'rgba(255,214,0,0.05)', padding:'10px', borderRadius:'4px', marginBottom:'8px', borderLeft:'3px solid var(--alert-yellow)'}}>
                      <p style={{color:'#ddd', fontStyle:'italic', fontSize:'0.9rem'}}>"{idea.content}"</p>
                      <div style={{marginTop:'5px', fontSize:'0.7rem', color:'var(--alert-yellow)'}}>Autor: {idea.author_name} • {new Date(idea.created_at).toLocaleDateString()}</div>
                    </div>
                  ))
                }
              </div>
            </div>

          </div>
        )}

        {/* --- MODAIS MANTIDOS --- */}
        <Modal isOpen={modals.idea} onClose={() => setModals({...modals, idea: false})} title="Nova Ideia 💡">
          <div className="modal-form">
            <textarea className="modal-textarea" placeholder="Descreva sua ideia..." value={newIdea.content} onChange={e => setNewIdea({...newIdea, content: e.target.value})} />
            <input className="modal-input" placeholder="Seu Nome (Opcional)" value={newIdea.author} onChange={e => setNewIdea({...newIdea, author: e.target.value})} />
            <button className="btn-primary" onClick={handleAddIdea} style={{background:'var(--alert-yellow)', color:'#000'}}>Salvar Ideia</button>
          </div>
        </Modal>

        <Modal isOpen={modals.meeting} onClose={() => setModals({...modals, meeting: false})} title="Agendar Reunião">
          <div className="modal-form">
            <div className="modal-label">Título</div>
            <input className="modal-input" placeholder="Ex: Daily Sprint" value={newMeet.title} onChange={e => setNewMeet({...newMeet, title: e.target.value})} />
            <div className="form-row">
              <div><div className="modal-label">Data</div><input type="date" className="modal-input" value={newMeet.date} onChange={e => setNewMeet({...newMeet, date: e.target.value})} /></div>
              <div><div className="modal-label">Hora</div><input type="time" className="modal-input" value={newMeet.time} onChange={e => setNewMeet({...newMeet, time: e.target.value})} /></div>
            </div>
            <div className="modal-label">Link da Reunião</div>
            <input className="modal-input" placeholder="https://..." value={newMeet.link} onChange={e => setNewMeet({...newMeet, link: e.target.value})} />
            <div className="modal-label">Participantes</div>
            <input className="modal-input" placeholder="Nomes separados por vírgula" value={newMeet.participants} onChange={e => setNewMeet({...newMeet, participants: e.target.value})} />
            <div className="modal-label">Descrição</div>
            <textarea className="modal-textarea" style={{minHeight:'80px'}} value={newMeet.description} onChange={e => setNewMeet({...newMeet, description: e.target.value})} />
            <button className="btn-primary" onClick={handleAddMeeting} style={{background:'var(--cyber-blue)', color:'#000'}}>Agendar</button>
          </div>
        </Modal>

        <Modal isOpen={modals.manageMeetings} onClose={() => setModals({...modals, manageMeetings: false})} title="Gerenciar Agenda">
          <div style={{maxHeight:'500px', overflowY:'auto', paddingRight:'5px'}}>
            {data.meetings.length === 0 ? <p style={{color:'#666'}}>Nenhuma reunião.</p> : (
              <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                {data.meetings.map(m => (
                  <div key={m.id} style={{background:'#1a1a1a', border:'1px solid #333', borderRadius:'8px', padding:'15px'}}>
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                      <h3 style={{color:'var(--cyber-blue)', fontSize:'1.1rem', margin:'0 0 5px 0'}}>{m.title}</h3>
                      <button onClick={() => handleDeleteMeeting(m.id)} style={{background:'transparent', border:'none', color:'#ff0055', cursor:'pointer'}}>🗑️</button>
                    </div>
                    <div style={{fontSize:'0.9rem', color:'#fff'}}><strong>Data:</strong> {new Date(m.meeting_date).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>

        <Modal isOpen={modals.task} onClose={() => setModals({...modals, task: false})} title="Nova Demanda">
          <div className="modal-form">
            <div className="modal-label">Título</div>
            <input className="modal-input" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
            <div className="modal-label">Descrição</div>
            <textarea className="modal-textarea" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} />
            <div className="form-row">
               <div><div className="modal-label">Prazo</div><input type="date" className="modal-input" value={newTask.due_date} onChange={e => setNewTask({...newTask, due_date: e.target.value})} /></div>
               <div><div className="modal-label">Responsável</div><input className="modal-input" value={newTask.assignee} onChange={e => setNewTask({...newTask, assignee: e.target.value})} /></div>
            </div>
            <div className="modal-label">Prioridade</div>
            <select className="modal-select" value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
               <option value="low">Baixa</option>
               <option value="medium">Média</option>
               <option value="high">Alta</option>
            </select>
            <button className="btn-primary" onClick={handleCreateTask}>Criar</button>
          </div>
        </Modal>

      </div>
    </div>
  );
}