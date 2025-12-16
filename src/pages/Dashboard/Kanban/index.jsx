import React, { useState, useEffect } from 'react';
import Navbar from '../../../components/Navbar';
import Modal from '../../../components/Modal';
import { appService } from '../../../services/appService';
import { useAlert } from '../../../hooks/useAlert';
import './index.css';

export default function Kanban() {
  const alertHook = useAlert();
  
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const activeProject = projects.find(p => p.id === selectedProjectId);

  const [modalType, setModalType] = useState(null); 
  
  const [projectForm, setProjectForm] = useState({ 
    title: '', client: '', budget: '', deadline: '', description: '' 
  });

  const [taskForm, setTaskForm] = useState({ 
    id: null, title: '', description: '', assignee: '', 
    due_date: '', due_time: '', status: 'todo', priority: 'medium' 
  });
  
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  const loadData = async () => {
    try {
      // Não ativamos o loading full se já tiver dados (para evitar piscar)
      // Mas se for troca de projeto, ativamos.
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
      alertHook.notifyError("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [selectedProjectId]);

  // --- ACTIONS ---
  const openNewProject = () => {
    setProjectForm({ title: '', client: '', budget: '', deadline: '', description: '' });
    setModalType('createProject');
  };

  const openEditProject = () => {
    if (!activeProject) return;
    setProjectForm({
      title: activeProject.title,
      description: activeProject.description || '',
      budget: activeProject.budget_estimated,
      deadline: activeProject.deadline ? activeProject.deadline.split('T')[0] : '',
      client: '' 
    });
    setModalType('editProject');
  };

  const handleCreateProject = async () => {
    if (!projectForm.title) return alertHook.notifyError("Nome obrigatório.");
    const fullDesc = projectForm.client ? `Cliente: ${projectForm.client} | ${projectForm.description}` : projectForm.description;

    try {
      const newProj = await appService.createProjectWithDemands({
        title: projectForm.title,
        description: fullDesc,
        budget_estimated: parseFloat(projectForm.budget) || 0,
        deadline: projectForm.deadline || null,
        quality_score: 50, time_score: 50, scope_score: 50
      }, []);

      setModalType(null);
      setSelectedProjectId(newProj.id);
      loadData();
      alertHook.notify("Projeto criado!");
    } catch (error) { alertHook.notifyError("Erro ao criar."); }
  };

  const handleUpdateProject = async () => {
    if (!activeProject) return;
    try {
      await appService.updateProject(activeProject.id, {
        title: projectForm.title,
        description: projectForm.description,
        budget_estimated: parseFloat(projectForm.budget),
        deadline: projectForm.deadline
      });
      setModalType(null);
      loadData();
      alertHook.notify("Atualizado com sucesso.");
    } catch (error) { alertHook.notifyError("Erro ao atualizar."); }
  };

  const handleDeleteProject = async () => {
    if (!activeProject) return;
    if (await alertHook.confirm("Excluir Projeto?", "Todas as tarefas serão perdidas.")) {
      try {
        await appService.deleteProject(activeProject.id);
        setSelectedProjectId(null);
        loadData();
        alertHook.notify("Projeto excluído.");
      } catch (error) { alertHook.notifyError("Erro ao excluir."); }
    }
  };

  const handleDragStart = (e, taskId) => { setDraggedTaskId(taskId); };
  const handleDragOver = (e) => { e.preventDefault(); };
  
  const handleDrop = async (e, status) => {
    if (draggedTaskId) {
      setTasks(tasks.map(t => t.id === draggedTaskId ? { ...t, status } : t));
      await appService.updateDemandStatus(draggedTaskId, status);
      setDraggedTaskId(null);
    }
  };

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
    if (!taskForm.title) return alertHook.notifyError("Título obrigatório");
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
        alertHook.notify("Tarefa atualizada.");
      } else {
        await appService.createDemand({ ...payload, project_id: selectedProjectId });
        alertHook.notify("Tarefa criada.");
      }
      setModalType(null);
      loadData();
    } catch (e) { alertHook.notifyError("Erro ao salvar."); }
  };

  const handleCompleteTask = async () => {
    if (!taskForm.id) return;
    try {
      await appService.updateDemandStatus(taskForm.id, 'done');
      setModalType(null);
      loadData();
      alertHook.notify("Tarefa concluída!");
    } catch (e) { alertHook.notifyError("Erro ao concluir."); }
  };

  const handleDeleteTask = async () => {
    if (await alertHook.confirm("Excluir Tarefa?", "Confirmar exclusão.")) {
      await appService.deleteDemand(taskForm.id);
      setModalType(null);
      loadData();
      alertHook.notify("Tarefa removida.");
    }
  };

  const getPriorityColor = (p) => {
    if(p === 'high') return '#ff0055';
    if(p === 'medium') return '#ffcc00';
    return '#00ff94';
  };

  const columns = { todo: 'A Fazer', doing: 'Em Andamento', done: 'Concluído' };

  // --- COMPONENTE SKELETON (LOADING) ---
  const renderSkeleton = () => (
    <div className="kanban-board skeleton-board">
      {[1, 2, 3].map((i) => (
        <div key={i} className="kanban-column skeleton-column">
          <div className="skeleton-header"></div>
          <div className="skeleton-content">
            <div className="skeleton-card"></div>
            <div className="skeleton-card short"></div>
            <div className="skeleton-card"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="kanban-container">
      <Navbar />

      <div className="kanban-header">
        <div className="header-info">
          <h1 className="subtitle">Gestão Visual</h1>
          <h2 className="project-title">{activeProject ? activeProject.title : "Selecione..."}</h2>
        </div>
        
        <div className="project-controls">
          {/* Select Customizado via CSS */}
          <div className="custom-select-wrapper">
            <select className="project-select modern-select-trigger" value={selectedProjectId || ''} onChange={(e) => setSelectedProjectId(e.target.value)}>
              <option value="" disabled>Carregando projetos...</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>

          <div className="btn-group">
            <button className="btn-new-proj" onClick={openNewProject}>+ Novo</button>
            <button className="btn-icon" onClick={openEditProject} disabled={!activeProject}>✏️</button>
            <button className="btn-icon btn-delete" onClick={handleDeleteProject} disabled={!activeProject}>🗑️</button>
          </div>

          <button className="btn-add-task" onClick={() => openTaskModal()} disabled={!activeProject}>+ Tarefa</button>
        </div>
      </div>

      {loading ? renderSkeleton() : (
        <div className="kanban-board">
          {Object.entries(columns).map(([key, label]) => (
            <div key={key} className={`kanban-column column-${key}`} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, key)}>
              <div className={`col-title ${key}`}>
                {label} <span className="count-badge">{tasks.filter(t=>t.status===key).length}</span>
              </div>
              
              <div className="col-tasks">
                {tasks.filter(t => t.status === key).map(task => (
                  <div key={task.id} className="task-card" draggable onDragStart={(e) => handleDragStart(e, task.id)} onClick={() => openTaskModal(task)}>
                    <div className="task-header-mini">
                      <span className="task-id">#{task.id.toString().slice(0,4)}</span>
                      <div className="priority-dot" style={{background: getPriorityColor(task.priority)}} title={`Prioridade ${task.priority}`}></div>
                    </div>
                    <div className="card-title">{task.title}</div>
                    <div className="card-meta">
                      {task.assignee ? <div className="assignee-badge">👤 {task.assignee.split(' ')[0]}</div> : <div></div>}
                      {task.due_date && (
                        <div className={`date-badge ${new Date(task.due_date) < new Date() && task.status !== 'done' ? 'late' : ''}`}>
                          {new Date(task.due_date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- MODAL PROJETO --- */}
      <Modal isOpen={modalType === 'createProject' || modalType === 'editProject'} onClose={() => setModalType(null)} title={modalType === 'createProject' ? "Novo Projeto" : "Editar Projeto"}>
        <div className="modal-content-grid">
          <div className="full-width">
            <label className="input-label">Nome do Projeto</label>
            <input className="modern-input" value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} autoFocus placeholder="Ex: App Delivery" />
          </div>
          
          {modalType === 'createProject' && (
            <div className="full-width">
              <label className="input-label">Cliente / Empresa</label>
              <input className="modern-input" value={projectForm.client} onChange={e => setProjectForm({...projectForm, client: e.target.value})} placeholder="Nome do Cliente" />
            </div>
          )}

          <div className="full-width">
            <label className="input-label">Descrição / Escopo</label>
            <textarea className="modern-textarea" rows="4" value={projectForm.description} onChange={e => setProjectForm({...projectForm, description: e.target.value})} placeholder="Detalhes do que será feito..." />
          </div>

          <div className="half-width">
            <label className="input-label">Orçamento (R$)</label>
            <input type="number" className="modern-input" value={projectForm.budget} onChange={e => setProjectForm({...projectForm, budget: e.target.value})} placeholder="0,00" />
          </div>

          <div className="half-width">
            <label className="input-label">Prazo de Entrega</label>
            <input type="date" className="modern-input" value={projectForm.deadline} onChange={e => setProjectForm({...projectForm, deadline: e.target.value})} />
          </div>

          <div className="full-width modal-actions-right">
            <button className="btn-primary-large" onClick={modalType === 'createProject' ? handleCreateProject : handleUpdateProject}>
              {modalType === 'createProject' ? '🚀 Criar Projeto' : '💾 Salvar Alterações'}
            </button>
          </div>
        </div>
      </Modal>

      {/* --- MODAL TAREFA --- */}
      <Modal isOpen={modalType === 'task'} onClose={() => setModalType(null)} title={taskForm.id ? "Editar Tarefa" : "Nova Tarefa"}>
        <div className="modal-content-grid">
          <div className="full-width">
            <label className="input-label">Título da Tarefa</label>
            <input className="modern-input" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} placeholder="O que precisa ser feito?" autoFocus />
          </div>

          <div className="half-width">
            <label className="input-label">Responsável</label>
            <input className="modern-input" value={taskForm.assignee} onChange={e => setTaskForm({...taskForm, assignee: e.target.value})} placeholder="Nome do dev" />
          </div>

          <div className="half-width">
            <label className="input-label">Prioridade</label>
            <div className="custom-select-wrapper">
              <select className="modern-select" value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})}>
                <option value="low">Baixa 🧊</option>
                <option value="medium">Média ⚡</option>
                <option value="high">Alta 🔥</option>
              </select>
            </div>
          </div>

          <div className="half-width">
            <label className="input-label">Data Limite</label>
            <input type="date" className="modern-input" value={taskForm.due_date} onChange={e => setTaskForm({...taskForm, due_date: e.target.value})} />
          </div>

          <div className="half-width">
            <label className="input-label">Hora Limite</label>
            <input type="time" className="modern-input" value={taskForm.due_time} onChange={e => setTaskForm({...taskForm, due_time: e.target.value})} />
          </div>

          <div className="full-width">
            <label className="input-label">Descrição Detalhada</label>
            <textarea className="modern-textarea" rows="5" value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} placeholder="Checklist, requisitos, links..." />
          </div>

          <div className="full-width">
            <label className="input-label">Status Atual</label>
            <div className="custom-select-wrapper">
              <select className="modern-select" value={taskForm.status} onChange={e => setTaskForm({...taskForm, status: e.target.value})}>
                <option value="todo">📋 A Fazer</option>
                <option value="doing">💻 Em Andamento</option>
                <option value="done">✅ Concluído</option>
              </select>
            </div>
          </div>

          <div className="full-width modal-footer-actions">
            {taskForm.id ? (
              <button className="btn-text-danger" onClick={handleDeleteTask}>Excluir</button>
            ) : <span></span>}
            
            <div className="right-actions">
              {taskForm.id && taskForm.status !== 'done' && (
                <button className="btn-outline-success" onClick={handleCompleteTask}>Marcar Concluído</button>
              )}
              <button className="btn-primary-large" onClick={handleSaveTask}>Salvar Tarefa</button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}