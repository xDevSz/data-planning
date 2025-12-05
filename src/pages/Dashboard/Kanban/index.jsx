import React, { useState, useEffect } from 'react';
import Navbar from '../../../components/Navbar';
import Modal from '../../../components/Modal';
import { appService } from '../../../services/appService';
import './index.css';

export default function Kanban() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const activeProject = projects.find(p => p.id === selectedProjectId);

  // --- MODAIS ---
  const [modalType, setModalType] = useState(null); // 'createProject', 'editProject', 'task'
  
  // --- STATES DE FORMULÁRIO ---
  
  // Projeto
  const [projectForm, setProjectForm] = useState({ 
    title: '', client: '', budget: '', deadline: '', description: '' 
  });

  // Tarefa (COMPLETO AGORA)
  const [taskForm, setTaskForm] = useState({ 
    id: null, 
    title: '', 
    description: '', 
    assignee: '', // Nome livre
    due_date: '', 
    due_time: '', 
    status: 'todo', 
    priority: 'medium' 
  });
  
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  // --- LOADS ---
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [selectedProjectId]);

  // --- ACTIONS: PROJETOS ---
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
    if (!projectForm.title) return alert("O projeto precisa de um nome.");
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
    } catch (error) { alert("Erro ao criar projeto."); }
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
    } catch (error) { alert("Erro ao atualizar."); }
  };

  const handleDeleteProject = async () => {
    if (!activeProject) return;
    if (window.confirm("Excluir projeto e todas as tarefas?")) {
      try {
        await appService.deleteProject(activeProject.id);
        setSelectedProjectId(null);
        loadData();
      } catch (error) { alert("Erro ao excluir."); }
    }
  };

  // --- ACTIONS: TAREFAS ---
  
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
      // EDICÃO: Extrair data e hora
      let dDate = '';
      let dTime = '';
      
      if (task.due_date) {
        const dateObj = new Date(task.due_date);
        dDate = dateObj.toISOString().split('T')[0];
        dTime = dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      }

      setTaskForm({ 
        ...task, 
        due_date: dDate, 
        due_time: dTime,
        assignee: task.assignee || '' // Campo livre (string)
      }); 
    } else {
      // CRIAÇÃO
      setTaskForm({ 
        id: null, 
        title: '', 
        description: '', 
        assignee: '', 
        due_date: '', 
        due_time: '', 
        status: 'todo', 
        priority: 'medium' 
      }); 
    }
    setModalType('task');
  };

  const handleSaveTask = async () => {
    if (!taskForm.title) return alert("Título obrigatório");

    // Monta Data ISO Completa
    let finalIsoDate = null;
    if (taskForm.due_date) {
      const timePart = taskForm.due_time || '12:00';
      finalIsoDate = new Date(`${taskForm.due_date}T${timePart}`).toISOString();
    }

    const payload = {
      title: taskForm.title,
      description: taskForm.description,
      priority: taskForm.priority,
      status: taskForm.status,
      due_date: finalIsoDate,
      // Salva o nome do responsável diretamente (se não tiver coluna, o supabase ignora ou você cria a coluna 'assignee' text no banco)
      // Como fallback, vou concatenar na descrição se der erro, mas o ideal é ter a coluna.
      // Vou assumir que você vai criar ou já criou: `alter table demands add column assignee text;`
      assignee: taskForm.assignee 
    };

    try {
      if (taskForm.id) {
        await appService.updateDemand(taskForm.id, payload);
      } else {
        await appService.createDemand({ ...payload, project_id: selectedProjectId });
      }
      setModalType(null);
      loadData();
    } catch (e) { alert("Erro ao salvar tarefa."); }
  };

  // Botão CONCLUIR TAREFA
  const handleCompleteTask = async () => {
    if (!taskForm.id) return;
    try {
      await appService.updateDemandStatus(taskForm.id, 'done');
      setModalType(null);
      loadData();
      alert("Tarefa concluída! 🎉");
    } catch (e) { alert("Erro ao concluir."); }
  };

  const handleDeleteTask = async () => {
    if (window.confirm("Excluir tarefa permanentemente?")) {
      await appService.deleteDemand(taskForm.id);
      setModalType(null);
      loadData();
    }
  };

  // HELPERS VISUAIS
  const getPriorityColor = (p) => {
    if(p === 'high') return '#ff0055';
    if(p === 'medium') return '#ffcc00';
    return '#00ff94';
  };

  const columns = { todo: 'A Fazer', doing: 'Em Andamento', done: 'Concluído' };

  return (
    <div className="kanban-container">
      <Navbar />

      <div className="kanban-header">
        <div>
          <h1 style={{fontSize: '1.2rem', color: '#888'}}>Gestão de Demandas</h1>
          <h2 style={{fontSize: '1.5rem', color: '#fff'}}>
            {activeProject ? activeProject.title : "Nenhum projeto selecionado"}
          </h2>
        </div>
        
        <div className="project-controls">
          <select 
            className="project-select" 
            value={selectedProjectId || ''} 
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            <option value="" disabled>Selecione um projeto...</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>

          <div className="btn-group">
            <button className="btn-new-proj" title="Novo Projeto" onClick={openNewProject}>+ Novo Proj.</button>
            <button className="btn-icon" title="Editar Projeto" onClick={openEditProject} disabled={!activeProject}>✏️</button>
            <button className="btn-icon btn-delete" title="Excluir Projeto" onClick={handleDeleteProject} disabled={!activeProject}>🗑️</button>
          </div>

          <div className="separator"></div>

          {/* BOTÃO + TAREFA AGORA ABRE MODAL COMPLETO */}
          <button 
            className="btn-add-task" 
            onClick={() => openTaskModal()} 
            disabled={!activeProject}
          >
            + Tarefa
          </button>
        </div>
      </div>

      <div className="kanban-board">
        {Object.entries(columns).map(([key, label]) => (
          <div key={key} className="kanban-column" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, key)}>
            <div className={`col-title ${key}`}>{label} <span>{tasks.filter(t=>t.status===key).length}</span></div>
            <div className="col-tasks">
              {tasks.filter(t => t.status === key).map(task => (
                <div 
                  key={task.id} 
                  className="task-card" 
                  draggable 
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onClick={() => openTaskModal(task)}
                >
                  <div className="task-header-mini">
                    <span className="task-id">#{task.id.toString().slice(0,4)}</span>
                    <div className="priority-dot" style={{background: getPriorityColor(task.priority)}} title={`Prioridade ${task.priority}`}></div>
                  </div>
                  
                  <div className="card-title">{task.title}</div>
                  
                  {/* Descrição Resumida */}
                  <div className="card-desc-preview">
                    {task.description ? (task.description.length > 40 ? task.description.substring(0,40)+'...' : task.description) : 'Sem descrição'}
                  </div>

                  <div className="card-meta">
                    {/* Exibe o nome do responsável se houver */}
                    <div className="assignee-badge">
                       👤 {task.assignee || 'Ninguém'}
                    </div>
                    {/* Exibe Data */}
                    {task.due_date && (
                      <div className="date-badge">
                        📅 {new Date(task.due_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* --- MODAL PROJETO --- */}
      <Modal isOpen={modalType === 'createProject' || modalType === 'editProject'} onClose={() => setModalType(null)} title={modalType === 'createProject' ? "Criar Novo Projeto" : "Editar Projeto"}>
        <div className="modal-form">
          <label>Nome do Projeto *</label>
          <input className="modal-input" value={projectForm.title} onChange={e => setProjectForm({...projectForm, title: e.target.value})} />
          {modalType === 'createProject' && (
            <>
              <label>Cliente / Para quem é?</label>
              <input className="modal-input" placeholder="Ex: Marketing Interno" value={projectForm.client} onChange={e => setProjectForm({...projectForm, client: e.target.value})} />
            </>
          )}
          <label>Descrição</label>
          <textarea className="modal-textarea" value={projectForm.description} onChange={e => setProjectForm({...projectForm, description: e.target.value})} />
          <div className="form-row">
            <div><label>Orçamento (R$)</label><input type="number" className="modal-input" value={projectForm.budget} onChange={e => setProjectForm({...projectForm, budget: e.target.value})} /></div>
            <div><label>Prazo</label><input type="date" className="modal-input" value={projectForm.deadline} onChange={e => setProjectForm({...projectForm, deadline: e.target.value})} /></div>
          </div>
          <div className="modal-actions">
            <button className="btn-primary" onClick={modalType === 'createProject' ? handleCreateProject : handleUpdateProject}>Salvar</button>
          </div>
        </div>
      </Modal>

      {/* --- MODAL TAREFA (EXPANDIDO E COMPLETO) --- */}
      <Modal isOpen={modalType === 'task'} onClose={() => setModalType(null)} title={taskForm.id ? "Detalhes da Demanda" : "Nova Tarefa"}>
        <div className="modal-form">
          <div className="modal-label">Título</div>
          <input className="modal-input" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} />
          
          <div className="form-row">
             <div>
                <div className="modal-label">Responsável (Nome)</div>
                <input className="modal-input" placeholder="Quem vai fazer?" value={taskForm.assignee} onChange={e => setTaskForm({...taskForm, assignee: e.target.value})} />
             </div>
             <div>
                <div className="modal-label">Prioridade</div>
                <select className="modal-select" value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})}>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                  <option value="low">Baixa</option>
                </select>
             </div>
          </div>

          <div className="form-row">
             <div><div className="modal-label">Data Limite</div><input type="date" className="modal-input" value={taskForm.due_date} onChange={e => setTaskForm({...taskForm, due_date: e.target.value})} /></div>
             <div><div className="modal-label">Hora Limite</div><input type="time" className="modal-input" value={taskForm.due_time} onChange={e => setTaskForm({...taskForm, due_time: e.target.value})} /></div>
          </div>

          <div className="modal-label">Descrição Completa</div>
          <textarea className="modal-textarea" style={{minHeight:'100px'}} value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} />

          <div className="form-row">
             <div>
               <div className="modal-label">Status Atual</div>
               <select className="modal-select" value={taskForm.status} onChange={e => setTaskForm({...taskForm, status: e.target.value})}>
                 <option value="todo">A Fazer</option>
                 <option value="doing">Em Andamento</option>
                 <option value="done">Concluído</option>
               </select>
             </div>
          </div>

          <div className="modal-actions" style={{justifyContent: 'space-between'}}>
            <div>
               {taskForm.id && <button className="btn-danger" onClick={handleDeleteTask}>Excluir</button>}
            </div>
            <div style={{display:'flex', gap:'10px'}}>
               {/* BOTÃO CONCLUIR TAREFA */}
               {taskForm.id && taskForm.status !== 'done' && (
                 <button 
                   className="btn-primary" 
                   style={{background: 'var(--neon-green)', color: '#000', border: '1px solid var(--neon-green)'}} 
                   onClick={handleCompleteTask}
                 >
                   ✅ Concluir Tarefa
                 </button>
               )}
               <button className="btn-primary" onClick={handleSaveTask}>Salvar Alterações</button>
            </div>
          </div>
        </div>
      </Modal>

    </div>
  );
}