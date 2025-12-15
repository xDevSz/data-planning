import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import Modal from '../../../components/Modal';
import { appService } from '../../../services/appService';
import { useAlert } from '../../../hooks/useAlert'; // Import useAlert
import './index.css';

export default function Overview() {
  const navigate = useNavigate();
  const alertHook = useAlert(); // Initialize useAlert
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  
  const [data, setData] = useState({
    kpis: { budgetTotal: 0, spentTotal: 0, incomeTotal: 0, burnRate: 0, roiProjected: 0, teamCount: 0 },
    projects: [], demands: [], meetings: [], transactions: [], ideas: [], profiles: []
  });
  const [loading, setLoading] = useState(true);

  // Modais
  const [modals, setModals] = useState({ 
    task: false, 
    meeting: false, 
    manageMeetings: false, 
    idea: false 
  });
  
  // Inputs
  const [newIdea, setNewIdea] = useState({ content: '', author: '' });
  
  // Input Tarefa Completa
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    due_date: '', 
    assignee: '', // Agora é texto livre
    priority: 'medium' 
  });
  
  // Input Reunião
  const [newMeet, setNewMeet] = useState({ 
    title: '', date: '', time: '', link: '', participants: '', description: '' 
  });

  const loadData = async () => {
    try {
      const result = await appService.getFullOverview();
      setData(result);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  // --- TRADUTOR DE STATUS ---
  const translateStatus = (status) => {
    const map = {
      'todo': 'A Fazer',
      'doing': 'Em Andamento',
      'blocked': 'Bloqueado',
      'done': 'Concluído'
    };
    return map[status] || status;
  };

  // --- HANDLERS ---

  // Criar Tarefa Completa
  const handleCreateTask = async () => {
    if(!newTask.title) return alertHook.notifyError("Título é obrigatório."); // SweetAlert
    
    const defaultProject = data.projects[0]?.id; 
    
    // Aqui enviamos 'assignee' como texto. 
    // Nota: Certifique-se que sua tabela 'demands' tem uma coluna de texto para isso 
    // ou estamos salvando na descrição para garantir.
    await appService.createDemand({ 
      title: newTask.title, 
      description: `${newTask.description} \n\nResponsável: ${newTask.assignee}`, // Salvando no corpo caso não tenha coluna
      due_date: newTask.due_date || null,
      project_id: defaultProject, 
      status: 'todo', 
      priority: newTask.priority 
    });
    
    setModals({...modals, task: false}); 
    setNewTask({ title: '', description: '', due_date: '', assignee: '', priority: 'medium' });
    loadData();
    alertHook.notify("Demanda criada com sucesso!"); // SweetAlert
  };

  // Ideias
  const handleAddIdea = async () => {
    if(!newIdea.content) return;
    await appService.createIdea(newIdea.content, newIdea.author || 'Anônimo');
    setModals({...modals, idea: false}); setNewIdea({content:'', author:''}); loadData();
    alertHook.notify("Ideia adicionada!"); // SweetAlert
  };

  // Reuniões (Criar)
  const handleAddMeeting = async () => {
    if(!newMeet.title || !newMeet.date || !newMeet.time) return alertHook.notifyError("Preencha Título, Data e Hora."); // SweetAlert
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
    alertHook.notify("Reunião agendada!"); // SweetAlert
  };

  // Reuniões (Excluir)
  const handleDeleteMeeting = async (id) => {
    if(await alertHook.confirm("Cancelar Reunião?", "Tem certeza que deseja cancelar esta reunião?")) { // SweetAlert Confirm
      await appService.deleteMeeting(id);
      loadData();
      alertHook.notify("Reunião cancelada.");
    }
  };

  const currency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

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
              <button className="action-btn-outline" onClick={() => navigate('/dashboard/financial')}>
                📊 Gerenciar Gastos
              </button>

              <button className="action-btn-yellow" onClick={() => setModals({...modals, idea: true})}>
                💡 Nova Ideia
              </button>

              <button className="action-btn-blue" onClick={() => setModals({...modals, meeting: true})}>
                📅 + Reunião
              </button>

              <button className="action-btn-purple" onClick={() => setModals({...modals, task: true})}>
                + Tarefa
              </button>
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

            {/* LINHA 2: PROJETOS E AGENDA */}
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
                <button 
                  onClick={() => setModals({...modals, manageMeetings: true})}
                  style={{background:'none', border:'none', color:'#ccc', cursor:'pointer', fontSize:'0.8rem', textDecoration:'underline'}}
                >
                  Ver Tudo
                </button>
              </div>
              <div style={{display:'flex', flexDirection:'column', gap:'10px', marginTop:'10px'}}>
                {data.meetings.length === 0 ? <p style={{color:'#666', fontSize:'0.8rem'}}>Vazio.</p> : 
                  data.meetings.slice(0,3).map(meet => (
                    <div key={meet.id} className="meeting-item">
                      <div style={{flex:1}}>
                        <div style={{fontSize:'0.75rem', color:'var(--cyber-blue)', fontWeight:'bold'}}>
                           {new Date(meet.meeting_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                        <h4 style={{fontSize:'0.9rem', margin:'2px 0'}}>{meet.title}</h4>
                      </div>
                      {meet.link && <a href={meet.link} target="_blank" rel="noreferrer" className="btn-meet">Entrar</a>}
                    </div>
                  ))
                }
              </div>
            </div>

            {/* LINHA 3: DEMANDAS DETALHADAS (TRADUZIDO) */}
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
                        <td>
                          <span style={{color: task.status === 'done' ? 'var(--neon-green)' : 'var(--cyber-blue)', fontSize: '0.7rem'}}>
                            {translateStatus(task.status).toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span style={{fontSize:'0.7rem', background:'#222', padding:'2px 5px', borderRadius:'4px'}}>{task.projects?.title || 'Geral'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* LINHA 4: CAIXA DE IDEIAS */}
            <div className="widget-card col-span-2 tablet-col-span-2 mobile-col-span-1">
              <div className="widget-header">
                <span className="widget-title" style={{color: 'var(--alert-yellow)'}}>Caixa de Ideias</span>
              </div>
              <div style={{maxHeight:'200px', overflowY:'auto'}}>
                {data.ideas.length === 0 ? <p style={{color:'#666', padding:'10px'}}>Nenhuma ideia pendente.</p> :
                  data.ideas.map(idea => (
                    <div key={idea.id} style={{background: 'rgba(255,214,0,0.05)', padding:'10px', borderRadius:'4px', marginBottom:'8px', borderLeft:'3px solid var(--alert-yellow)'}}>
                      <p style={{color:'#ddd', fontStyle:'italic', fontSize:'0.9rem'}}>"{idea.content}"</p>
                      <div style={{marginTop:'5px', fontSize:'0.7rem', color:'var(--alert-yellow)'}}>
                        Autor: {idea.author_name} • {new Date(idea.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>

          </div>
        )}

        {/* --- MODAIS --- */}

        {/* 1. NOVA IDEIA */}
        <Modal isOpen={modals.idea} onClose={() => setModals({...modals, idea: false})} title="Nova Ideia 💡">
          <div className="modal-form">
            <textarea className="modal-textarea" placeholder="Descreva sua ideia..." value={newIdea.content} onChange={e => setNewIdea({...newIdea, content: e.target.value})} />
            <input className="modal-input" placeholder="Seu Nome (Opcional)" value={newIdea.author} onChange={e => setNewIdea({...newIdea, author: e.target.value})} />
            <button className="btn-primary" onClick={handleAddIdea} style={{background:'var(--alert-yellow)', color:'#000'}}>Salvar Ideia</button>
          </div>
        </Modal>

        {/* 2. AGENDAR REUNIÃO */}
        <Modal isOpen={modals.meeting} onClose={() => setModals({...modals, meeting: false})} title="Agendar Reunião">
          <div className="modal-form">
            <div className="modal-label">Título</div>
            <input className="modal-input" placeholder="Ex: Daily Sprint" value={newMeet.title} onChange={e => setNewMeet({...newMeet, title: e.target.value})} />
            
            <div className="form-row">
              <div>
                <div className="modal-label">Data</div>
                <input type="date" className="modal-input" value={newMeet.date} onChange={e => setNewMeet({...newMeet, date: e.target.value})} />
              </div>
              <div>
                <div className="modal-label">Hora</div>
                <input type="time" className="modal-input" value={newMeet.time} onChange={e => setNewMeet({...newMeet, time: e.target.value})} />
              </div>
            </div>

            <div className="modal-label">Link da Reunião (Meet/Zoom)</div>
            <input className="modal-input" placeholder="https://..." value={newMeet.link} onChange={e => setNewMeet({...newMeet, link: e.target.value})} />

            <div className="modal-label">Participantes</div>
            <input className="modal-input" placeholder="Nomes separados por vírgula" value={newMeet.participants} onChange={e => setNewMeet({...newMeet, participants: e.target.value})} />

            <div className="modal-label">Descrição / Pauta</div>
            <textarea className="modal-textarea" style={{minHeight:'80px'}} value={newMeet.description} onChange={e => setNewMeet({...newMeet, description: e.target.value})} />

            <button className="btn-primary" onClick={handleAddMeeting} style={{background:'var(--cyber-blue)', color:'#000'}}>Agendar</button>
          </div>
        </Modal>

        {/* 3. GERENCIAR REUNIÕES (VER TUDO) - CORRIGIDO VISUAL */}
        <Modal isOpen={modals.manageMeetings} onClose={() => setModals({...modals, manageMeetings: false})} title="Gerenciar Agenda Completa">
          <div style={{maxHeight:'500px', overflowY:'auto', paddingRight:'5px'}}>
            {data.meetings.length === 0 ? <p style={{color:'#666'}}>Nenhuma reunião agendada.</p> : (
              <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                {data.meetings.map(m => (
                  <div key={m.id} style={{background:'#1a1a1a', border:'1px solid #333', borderRadius:'8px', padding:'15px'}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                      <h3 style={{color:'var(--cyber-blue)', fontSize:'1.1rem', margin:'0 0 5px 0'}}>{m.title}</h3>
                      <button 
                        onClick={() => handleDeleteMeeting(m.id)}
                        style={{background:'transparent', border:'none', color:'#ff0055', cursor:'pointer', fontSize:'1.2rem'}}
                        title="Excluir Reunião"
                      >
                        🗑️
                      </button>
                    </div>
                    
                    <div style={{fontSize:'0.9rem', color:'#fff', marginBottom:'10px'}}>
                      <strong>Data:</strong> {new Date(m.meeting_date).toLocaleDateString()} às {new Date(m.meeting_date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                    </div>

                    {m.link && (
                      <div style={{marginBottom:'10px'}}>
                        <a href={m.link} target="_blank" rel="noreferrer" style={{color:'var(--neon-green)', textDecoration:'none', borderBottom:'1px solid var(--neon-green)'}}>
                          🔗 Acessar Link da Reunião
                        </a>
                      </div>
                    )}

                    {m.participants && (
                      <div style={{marginBottom:'10px', color:'#ccc', fontSize:'0.85rem'}}>
                        <strong>Participantes:</strong> {m.participants}
                      </div>
                    )}

                    {m.description && (
                      <div style={{background:'#111', padding:'10px', borderRadius:'4px', color:'#888', fontSize:'0.85rem', fontStyle:'italic'}}>
                        <strong>Pauta:</strong><br/>
                        {m.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>

        {/* 4. NOVA DEMANDA (COM CAMPO DE NOME LIVRE) */}
        <Modal isOpen={modals.task} onClose={() => setModals({...modals, task: false})} title="Nova Demanda">
          <div className="modal-form">
            <div className="modal-label">Título da Tarefa</div>
            <input className="modal-input" placeholder="O que precisa ser feito?" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
            
            <div className="modal-label">Descrição</div>
            <textarea className="modal-textarea" placeholder="Detalhes..." value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} />

            <div className="form-row">
               <div>
                 <div className="modal-label">Prazo Final</div>
                 <input type="date" className="modal-input" value={newTask.due_date} onChange={e => setNewTask({...newTask, due_date: e.target.value})} />
               </div>
               <div>
                 {/* CAMPO DE TEXTO LIVRE PARA O RESPONSÁVEL */}
                 <div className="modal-label">Responsável (Nome)</div>
                 <input 
                   className="modal-input" 
                   placeholder="Digite o nome..." 
                   value={newTask.assignee} 
                   onChange={e => setNewTask({...newTask, assignee: e.target.value})} 
                 />
               </div>
            </div>

            <div className="modal-label">Prioridade</div>
            <select className="modal-select" value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
               <option value="low">Baixa</option>
               <option value="medium">Média</option>
               <option value="high">Alta</option>
            </select>

            <button className="btn-primary" onClick={handleCreateTask}>Criar Tarefa</button>
          </div>
        </Modal>

      </div>
    </div>
  );
}