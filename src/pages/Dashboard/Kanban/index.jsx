import React, { useState, useEffect } from 'react';
import Navbar from '../../../components/Navbar';
import Modal from '../../../components/Modal';
import { appService } from '../../../services/appService';
import { useAlert } from '../../../hooks/useAlert';
import { 
  Search, Plus, MoreVertical, Clock, User, 
  AlignLeft, CheckCircle2, CircleDashed, ArrowRightCircle,
  Calendar, GripVertical, Rocket, LayoutGrid, 
  Activity, DollarSign, Target, ChevronDown, ChevronUp, AlertTriangle
} from 'lucide-react';
import './index.css';

export default function Kanban() {
  const alertHook = useAlert();
  
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); 
  const [showProjectDetails, setShowProjectDetails] = useState(true); // Toggle do painel de controle
  
  const activeProject = projects.find(p => p.id === selectedProjectId);

  const [modalType, setModalType] = useState(null); 
  
  const [projectForm, setProjectForm] = useState({ 
    title: '', client: '', description: '', 
    budget_estimated: '', budget_spent: '', deadline: '', 
    quality_score: 50, time_score: 50, scope_score: 50, status: 'active'
  });

  const [taskForm, setTaskForm] = useState({ 
    id: null, title: '', description: '', assignee: '', 
    due_date: '', due_time: '', status: 'todo', priority: 'medium' 
  });
  
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [draggedOverCol, setDraggedOverCol] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const projData = await appService.getProjects();
      setProjects(projData);

      let currentId = selectedProjectId;
      if (projData.length > 0 && !currentId) {
        currentId = projData[0].id;
        setSelectedProjectId(currentId);
      } else if (projData.length === 0) {
        setSelectedProjectId(null);
      }

      if (currentId) {
        const demandsData = await appService.getDemands(currentId);
        setTasks(demandsData);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error(error);
      alertHook.notifyError("Erro ao carregar o board.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [selectedProjectId]);

  // --- ACTIONS DE PROJETO ---
  const openNewProject = () => {
    setProjectForm({ 
      title: '', client: '', description: '', budget_estimated: '', budget_spent: 0, 
      deadline: '', quality_score: 50, time_score: 50, scope_score: 50, status: 'active' 
    });
    setModalType('createProject');
  };

  const openEditProject = () => {
    if (!activeProject) return;
    setProjectForm({
      title: activeProject.title,
      description: activeProject.description || '',
      budget_estimated: activeProject.budget_estimated || 0,
      budget_spent: activeProject.budget_spent || 0,
      deadline: activeProject.deadline ? activeProject.deadline.split('T')[0] : '',
      quality_score: activeProject.quality_score || 50,
      time_score: activeProject.time_score || 50,
      scope_score: activeProject.scope_score || 50,
      status: activeProject.status || 'active',
      client: '' 
    });
    setModalType('editProject');
  };

  const handleCreateProject = async () => {
    if (!projectForm.title) return alertHook.notifyError("Nome do projeto é obrigatório.");
    const fullDesc = projectForm.client ? `Cliente: ${projectForm.client} | ${projectForm.description}` : projectForm.description;

    try {
      const newProj = await appService.createProjectWithDemands({
        title: projectForm.title,
        description: fullDesc,
        budget_estimated: parseFloat(projectForm.budget_estimated) || 0,
        budget_spent: parseFloat(projectForm.budget_spent) || 0,
        deadline: projectForm.deadline || null,
        quality_score: projectForm.quality_score, 
        time_score: projectForm.time_score, 
        scope_score: projectForm.scope_score,
        status: projectForm.status
      }, []);

      setModalType(null);
      setSelectedProjectId(newProj.id);
      loadData();
      alertHook.notify("Projeto estruturado com sucesso!", "success");
    } catch (error) { alertHook.notifyError("Erro ao criar projeto."); }
  };

  const handleUpdateProject = async () => {
    if (!activeProject) return;
    try {
      await appService.updateProject(activeProject.id, {
        title: projectForm.title,
        description: projectForm.description,
        budget_estimated: parseFloat(projectForm.budget_estimated) || 0,
        budget_spent: parseFloat(projectForm.budget_spent) || 0,
        deadline: projectForm.deadline || null,
        quality_score: projectForm.quality_score, 
        time_score: projectForm.time_score, 
        scope_score: projectForm.scope_score,
        status: projectForm.status
      });
      setModalType(null);
      loadData();
      alertHook.notify("Configurações e Tríade atualizadas.");
    } catch (error) { alertHook.notifyError("Erro ao atualizar."); }
  };

  const handleDeleteProject = async () => {
    if (!activeProject) return;
    if (await alertHook.confirm("Excluir Projeto?", "Isso apagará o projeto, suas tarefas e impacto nos gráficos para sempre.")) {
      try {
        await appService.deleteProject(activeProject.id);
        setSelectedProjectId(null);
        loadData();
        alertHook.notify("Projeto desintegrado.");
      } catch (error) { alertHook.notifyError("Erro ao excluir."); }
    }
  };

  // --- DRAG AND DROP ---
  const handleDragStart = (e, taskId) => { 
    setDraggedTaskId(taskId); 
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => { e.target.classList.add('dragging'); }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('dragging');
    setDraggedOverCol(null);
  };

  const handleDragOver = (e, colId) => { 
    e.preventDefault(); 
    if (draggedOverCol !== colId) setDraggedOverCol(colId);
  };
  
  const handleDrop = async (e, status) => {
    e.preventDefault();
    setDraggedOverCol(null);
    if (draggedTaskId) {
      setTasks(tasks.map(t => t.id === draggedTaskId ? { ...t, status } : t));
      await appService.updateDemandStatus(draggedTaskId, status);
      setDraggedTaskId(null);
    }
  };

  // --- TAREFAS ---
  const openTaskModal = (task = null) => {
    if (task) {
      let dDate = ''; let dTime = '';
      if (task.due_date) {
        const dateObj = new Date(task.due_date);
        dDate = dateObj.toISOString().split('T')[0];
        dTime = dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      }
      setTaskForm({ ...task, due_date: dDate, due_time: dTime, assignee: task.assignee || '' }); 
    } else {
      setTaskForm({ id: null, title: '', description: '', assignee: '', due_date: '', due_time: '', status: 'todo', priority: 'medium' }); 
    }
    setModalType('task');
  };

  const handleSaveTask = async () => {
    if (!taskForm.title) return alertHook.notifyError("O título da demanda é obrigatório");
    let finalIsoDate = null;
    if (taskForm.due_date) {
      const timePart = taskForm.due_time || '12:00';
      finalIsoDate = new Date(`${taskForm.due_date}T${timePart}`).toISOString();
    }
    const payload = {
      title: taskForm.title, description: taskForm.description, priority: taskForm.priority,
      status: taskForm.status, due_date: finalIsoDate, assignee: taskForm.assignee 
    };

    try {
      if (taskForm.id) {
        await appService.updateDemand(taskForm.id, payload);
        alertHook.notify("Demanda atualizada.");
      } else {
        await appService.createDemand({ ...payload, project_id: selectedProjectId });
        alertHook.notify("Nova demanda alocada.");
      }
      setModalType(null);
      loadData();
    } catch (e) { alertHook.notifyError("Erro ao salvar demanda."); }
  };

  const handleCompleteTask = async () => {
    if (!taskForm.id) return;
    try {
      await appService.updateDemandStatus(taskForm.id, 'done');
      setModalType(null);
      loadData();
      alertHook.notify("Missão cumprida! ✅", "success");
    } catch (e) { alertHook.notifyError("Erro ao atualizar status."); }
  };

  const handleDeleteTask = async () => {
    if (await alertHook.confirm("Excluir Demanda?", "A tarefa será excluída do backlog.")) {
      await appService.deleteDemand(taskForm.id);
      setModalType(null);
      loadData();
      alertHook.notify("Demanda removida do board.");
    }
  };

  // --- HELPERS E INTELIGÊNCIA ---
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].substring(0,2).toUpperCase();
  };

  const columns = [
    { id: 'todo', label: 'Backlog / A Fazer', icon: <CircleDashed size={16} className="text-alert-yellow" />, color: 'var(--alert-yellow)' },
    { id: 'doing', label: 'Em Andamento', icon: <ArrowRightCircle size={16} className="text-cyber-blue" />, color: 'var(--cyber-blue)' },
    { id: 'done', label: 'Concluído', icon: <CheckCircle2 size={16} className="text-neon-green" />, color: 'var(--neon-green)' }
  ];

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (t.assignee && t.assignee.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Progress Calculations
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  const budgetEst = activeProject?.budget_estimated || 0;
  const budgetSpent = activeProject?.budget_spent || 0;
  const budgetHealth = budgetEst > 0 ? (budgetSpent / budgetEst) * 100 : 0;
  const isOverBudget = budgetHealth > 100;

  const currency = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="k-wrapper">
      <Navbar />

      <header className="k-header fade-in">
        <div className="k-header-left">
          <div>
            <h1 className="k-title"><LayoutGrid className="text-neon-purple mr-2"/> Agile Board</h1>
            <p className="k-subtitle">Mapeie o fluxo de valor, acompanhe sprints e elimine gargalos.</p>
          </div>
        </div>
        
        <div className="k-header-controls">
          <div className="k-search-box">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Buscar tarefa ou dev..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>

          <div className="k-project-selector">
            <select value={selectedProjectId || ''} onChange={(e) => setSelectedProjectId(e.target.value)}>
              <option value="" disabled>Selecione um projeto...</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>

          <div className="k-actions-group">
            <button className="k-btn outline" onClick={openNewProject} title="Criar novo projeto"><Plus size={18}/></button>
            <button className="k-btn outline" onClick={openEditProject} disabled={!activeProject} title="Configurações do Projeto"><MoreVertical size={18}/></button>
            <button className="k-btn primary" onClick={() => openTaskModal()} disabled={!activeProject}><Plus size={18} className="mr-1"/> Nova Demanda</button>
          </div>
        </div>
      </header>

      {/* --- PAINEL DE INTELIGÊNCIA DO PROJETO --- */}
      {activeProject && (
        <div className="project-health-wrapper fade-in">
          <div className="health-toggle" onClick={() => setShowProjectDetails(!showProjectDetails)}>
            <span className="health-title">Visão Geral: <strong>{activeProject.title}</strong></span>
            <div className="health-badges">
              <span className={`status-pill ${activeProject.status}`}>{activeProject.status === 'active' ? 'Em Execução' : activeProject.status === 'paused' ? 'Pausado' : 'Finalizado'}</span>
              <span className="progress-pill">{progressPercent}% Concluído</span>
              {showProjectDetails ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
            </div>
          </div>
          
          {showProjectDetails && (
            <div className="health-dashboard">
              
              <div className="health-card">
                <div className="hc-title"><Activity size={16} className="text-cyber-blue"/> Progresso da Sprint</div>
                <div className="hc-progress-bar"><div className="hc-fill bg-blue" style={{width: `${progressPercent}%`}}></div></div>
                <div className="hc-meta">{doneTasks} de {totalTasks} demandas entregues.</div>
              </div>

              <div className="health-card">
                <div className="hc-title"><DollarSign size={16} className={isOverBudget ? 'text-alert-red' : 'text-neon-green'}/> Saúde Financeira (Burn Rate)</div>
                <div className="hc-budget-stats">
                  <div className="budget-box"><span>Gasto:</span> <strong className={isOverBudget ? 'text-alert-red' : 'text-white'}>{currency(budgetSpent)}</strong></div>
                  <div className="budget-box"><span>Previsto:</span> <strong>{currency(budgetEst)}</strong></div>
                </div>
                <div className="hc-progress-bar"><div className={`hc-fill ${isOverBudget ? 'bg-red' : 'bg-green'}`} style={{width: `${Math.min(budgetHealth, 100)}%`}}></div></div>
              </div>

              <div className="health-card">
                <div className="hc-title"><Target size={16} className="text-alert-yellow"/> Desempenho da Tríade</div>
                <div className="triad-mini-stats">
                  <div className="tm-row"><span>Qualidade</span> <div className="tm-bar"><div className="tm-fill bg-purple" style={{width: `${activeProject.quality_score}%`}}></div></div></div>
                  <div className="tm-row"><span>Tempo</span> <div className="tm-bar"><div className="tm-fill bg-yellow" style={{width: `${activeProject.time_score}%`}}></div></div></div>
                  <div className="tm-row"><span>Escopo</span> <div className="tm-bar"><div className="tm-fill bg-blue" style={{width: `${activeProject.scope_score}%`}}></div></div></div>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="k-board skeleton-board">
          {[1, 2, 3].map((i) => (
            <div key={i} className="k-column skeleton-col"><div className="skel-header"></div><div className="skel-card"></div><div className="skel-card short"></div></div>
          ))}
        </div>
      ) : (
        <main className="k-board fade-in custom-scrollbar">
          {columns.map(col => (
            <div key={col.id} className={`k-column ${draggedOverCol === col.id ? 'drag-over' : ''}`} onDragOver={(e) => handleDragOver(e, col.id)} onDragLeave={() => setDraggedOverCol(null)} onDrop={(e) => handleDrop(e, col.id)}>
              <div className="k-col-header" style={{borderTopColor: col.color}}>
                <div className="k-col-title">
                  {col.icon} {col.label} 
                  <span className="k-count">{filteredTasks.filter(t=>t.status === col.id).length}</span>
                </div>
              </div>
              <div className="k-col-body custom-scrollbar">
                {filteredTasks.filter(t => t.status === col.id).length === 0 && <div className="k-empty-state">Sem demandas.</div>}
                
                {filteredTasks.filter(t => t.status === col.id).map(task => (
                  <div key={task.id} className={`k-card priority-${task.priority}`} draggable onDragStart={(e) => handleDragStart(e, task.id)} onDragEnd={handleDragEnd} onClick={() => openTaskModal(task)}>
                    <div className="k-card-top">
                      <span className="k-card-id">#{task.id.toString().slice(0,4)}</span>
                      <GripVertical size={14} className="k-drag-handle" />
                    </div>
                    <h4 className="k-card-title">{task.title}</h4>
                    {task.description && <div className="k-card-desc"><AlignLeft size={12} className="mr-1"/> {task.description.substring(0, 40)}...</div>}
                    <div className="k-card-footer">
                      {task.due_date ? (
                        <div className={`k-date ${new Date(task.due_date) < new Date() && task.status !== 'done' ? 'late' : ''}`}>
                          <Calendar size={12} className="mr-1"/> 
                          {new Date(task.due_date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                        </div>
                      ) : <div></div>}
                      {task.assignee && <div className="k-avatar" title={task.assignee}>{getInitials(task.assignee)}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </main>
      )}

      {/* --- MODAL PROJETO (CONTROLE COMPLETO) --- */}
      <Modal isOpen={modalType === 'createProject' || modalType === 'editProject'} onClose={() => setModalType(null)} title={modalType === 'createProject' ? "Estruturar Novo Projeto" : "Controle Completo do Projeto"} centerOnMobile={true} maxWidth="850px">
        <div className="modal-grid advanced-project-grid">
          
          {/* Lado Esquerdo: Metadados */}
          <div className="ap-col">
            <h4 className="ap-section-title">Metadados e Prazos</h4>
            <div className="input-group">
              <label>Nome Operacional</label>
              <input className="modern-input" value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} autoFocus />
            </div>
            
            <div className="input-group">
              <label>Escopo Geral / Descrição</label>
              <textarea className="modern-textarea" rows="3" value={projectForm.description} onChange={e => setProjectForm({...projectForm, description: e.target.value})} />
            </div>

            <div className="modal-grid-inner">
              <div className="input-group">
                <label>Deadline (Prazo Fatal)</label>
                <input type="date" className="modern-input" value={projectForm.deadline} onChange={e => setProjectForm({...projectForm, deadline: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Status do Projeto</label>
                <select className="modern-select" value={projectForm.status} onChange={e => setProjectForm({...projectForm, status: e.target.value})}>
                  <option value="active">🟢 Em Execução</option>
                  <option value="paused">⏸️ Pausado / Bloqueado</option>
                  <option value="done">✅ Finalizado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lado Direito: Financeiro e Tríade */}
          <div className="ap-col ap-col-right">
            <h4 className="ap-section-title">Financeiro & Desempenho (Tríade)</h4>
            
            <div className="modal-grid-inner">
              <div className="input-group">
                <label>Orçamento Previsto (R$)</label>
                <input type="number" className="modern-input" value={projectForm.budget_estimated} onChange={e => setProjectForm({...projectForm, budget_estimated: e.target.value})} placeholder="0,00" />
              </div>
              <div className="input-group">
                <label>Caixa Queimado (Gasto)</label>
                <input type="number" className="modern-input text-alert-red font-bold" value={projectForm.budget_spent} onChange={e => setProjectForm({...projectForm, budget_spent: e.target.value})} placeholder="0,00" />
              </div>
            </div>

            <div className="ap-triad-sliders mt-3">
              <div className="slider-group-mini">
                <div className="sl-head"><span className="text-neon-purple">Qualidade (Acabamento)</span> <span>{projectForm.quality_score}%</span></div>
                <input type="range" min="0" max="100" value={projectForm.quality_score} onChange={e=>setProjectForm({...projectForm, quality_score: e.target.value})} className="styled-slider purple" />
              </div>
              <div className="slider-group-mini">
                <div className="sl-head"><span className="text-alert-yellow">Prazo (Velocidade)</span> <span>{projectForm.time_score}%</span></div>
                <input type="range" min="0" max="100" value={projectForm.time_score} onChange={e=>setProjectForm({...projectForm, time_score: e.target.value})} className="styled-slider yellow" />
              </div>
              <div className="slider-group-mini">
                <div className="sl-head"><span className="text-cyber-blue">Escopo (Volume)</span> <span>{projectForm.scope_score}%</span></div>
                <input type="range" min="0" max="100" value={projectForm.scope_score} onChange={e=>setProjectForm({...projectForm, scope_score: e.target.value})} className="styled-slider blue" />
              </div>
              <p className="ap-hint"><AlertTriangle size={12}/> O ajuste nestes sliders altera diretamente o gráfico de radar no Dashboard Overview em tempo real.</p>
            </div>
          </div>

          <div className="full-w flex-end ap-footer mt-2">
            {modalType === 'editProject' && (
              <button className="btn-text-danger mr-auto" onClick={handleDeleteProject}>Desintegrar Projeto</button>
            )}
            <button className="btn-primary" onClick={modalType === 'createProject' ? handleCreateProject : handleUpdateProject}>
              {modalType === 'createProject' ? <><Rocket size={18} className="mr-2"/> Lançar Projeto</> : 'Salvar Arquitetura do Projeto'}
            </button>
          </div>
        </div>
      </Modal>

      {/* --- MODAL TAREFA --- */}
      <Modal isOpen={modalType === 'task'} onClose={() => setModalType(null)} title={taskForm.id ? "Detalhes da Demanda" : "Nova Demanda de Sprint"} centerOnMobile={true}>
        <div className="modal-grid">
          <div className="input-group full-w"><label>Título da Demanda</label><input className="modern-input" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} autoFocus /></div>
          <div className="input-group full-w"><label>Especificações Técnicas</label><textarea className="modern-textarea" rows="4" value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} /></div>
          <div className="input-group half-w"><label>Responsável</label><input className="modern-input" value={taskForm.assignee} onChange={e => setTaskForm({...taskForm, assignee: e.target.value})} /></div>
          <div className="input-group half-w">
            <label>Prioridade</label>
            <select className="modern-select" value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})}>
              <option value="low">Baixa (Backlog) 🧊</option><option value="medium">Média (Padrão) ⚡</option><option value="high">Alta (Urgente) 🔥</option>
            </select>
          </div>
          <div className="input-group half-w"><label>Data Limite</label><input type="date" className="modern-input" value={taskForm.due_date} onChange={e => setTaskForm({...taskForm, due_date: e.target.value})} /></div>
          <div className="input-group half-w">
            <label>Estágio Atual</label>
            <select className="modern-select" value={taskForm.status} onChange={e => setTaskForm({...taskForm, status: e.target.value})}>
              <option value="todo">📋 A Fazer</option><option value="doing">💻 Em Andamento</option><option value="done">✅ Concluído</option>
            </select>
          </div>
          <div className="full-w modal-footer">
            {taskForm.id ? <button className="btn-text-danger" onClick={handleDeleteTask}>Descartar Tarefa</button> : <span></span>}
            <div className="footer-actions">
              {taskForm.id && taskForm.status !== 'done' && <button className="btn-outline-green" onClick={handleCompleteTask}><CheckCircle2 size={16} className="mr-2"/> Concluir</button>}
              <button className="btn-primary" onClick={handleSaveTask}>Salvar Demanda</button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}