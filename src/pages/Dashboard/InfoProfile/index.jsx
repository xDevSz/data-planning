import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../../../components/Navbar';
import Modal from '../../../components/Modal';
import { appService } from '../../../services/appService';
import { useAlert } from '../../../hooks/useAlert';
import './index.css';

export default function InfoProfile() {
  const alertHook = useAlert();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  // DADOS
  const [startupId, setStartupId] = useState(null);
  const [companyForm, setCompanyForm] = useState({ name: '', cnpj: '', description: '', logo_url: '' });
  const [userForm, setUserForm] = useState({ full_name: '', role: '', email: '' });
  const [members, setMembers] = useState([]);
  const [notes, setNotes] = useState([]);
  const [milestones, setMilestones] = useState([]);
  
  // MODAIS & INPUTS
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', role: '', email: '' });
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [newMilestone, setNewMilestone] = useState({ date: '', title: '', desc: '' });

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await appService.getProfileData();
      
      setStartupId(data.user.startup_id);
      setCompanyForm({
        name: data.user.startups?.name || '',
        cnpj: data.user.startups?.cnpj || '',
        description: data.user.startups?.description || '',
        logo_url: data.user.startups?.logo_url || ''
      });
      setUserForm({
        full_name: data.user.full_name || '',
        role: data.user.role || '',
        email: data.user.email || ''
      });
      setMembers(data.team);
      setNotes(data.notes);
      setMilestones(data.milestones);
    } catch (error) {
      console.error(error);
      alertHook.notifyError("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // --- HANDLERS ---
  const handleLogoClick = () => fileInputRef.current.click();
  
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const objectUrl = URL.createObjectURL(file);
      setCompanyForm(prev => ({ ...prev, logo_url: objectUrl }));
      await appService.uploadStartupLogo(file, startupId);
      alertHook.notify("Logo atualizada!");
    } catch (error) { alertHook.notifyError("Erro no upload."); }
  };

  const handleSaveCompany = async () => {
    if (!companyForm.name) return alertHook.notifyError("Nome obrigatório.");
    try {
      await appService.updateStartupInfo(startupId, {
        name: companyForm.name, cnpj: companyForm.cnpj, description: companyForm.description
      });
      alertHook.notify("Empresa atualizada!");
    } catch (e) { alertHook.notifyError("Erro ao salvar."); }
  };

  const handleSaveUser = async () => {
    if (!userForm.full_name) return alertHook.notifyError("Nome obrigatório.");
    try {
      await appService.updateUserProfile({ full_name: userForm.full_name, role: userForm.role });
      alertHook.notify("Perfil atualizado!");
    } catch (e) { alertHook.notifyError("Erro ao salvar."); }
  };

  const handleAddMember = async () => {
    if (!newMember.name || !newMember.role) return alertHook.notifyError("Preencha dados.");
    try {
      await appService.addTeamMember(newMember, startupId);
      setIsAddMemberOpen(false); setNewMember({ name: '', role: '', email: '' }); loadData();
      alertHook.notify("Membro adicionado.");
    } catch (e) { alertHook.notifyError("Erro ao adicionar."); }
  };

  const handleRemoveMember = async (id) => {
    if (await alertHook.confirm("Remover membro?")) {
      try { await appService.deleteMember(id); loadData(); alertHook.notify("Removido."); } 
      catch (e) { alertHook.notifyError("Erro ao remover."); }
    }
  };

  const handleAddNote = async () => {
    if(!newNote.title) return alertHook.notifyError("Título obrigatório.");
    await appService.createNote(newNote);
    setNewNote({title:'', content:''}); setIsAddNoteOpen(false); loadData();
    alertHook.notify("Nota criada.");
  };

  const handleDeleteNote = async (id) => {
    if(await alertHook.confirm("Excluir nota?")) {
      try { await appService.deleteNote(id); loadData(); } catch(e){ alertHook.notifyError("Erro."); }
    }
  };

  const handleAddMilestone = async () => {
    if(!newMilestone.title || !newMilestone.date) return alertHook.notifyError("Dados incompletos.");
    await appService.createMilestone({
        title: newMilestone.title, description: newMilestone.desc, due_date: new Date(newMilestone.date).toISOString()
    });
    setNewMilestone({date:'', title:'', desc:''}); setIsAddMilestoneOpen(false); loadData();
    alertHook.notify("Marco criado.");
  };

  const handleDeleteMilestone = async (id) => {
    if(await alertHook.confirm("Excluir marco?")) {
      try { await appService.deleteMilestone(id); loadData(); } catch(e){ alertHook.notifyError("Erro."); }
    }
  };

  const formatDate = (iso) => {
    if (!iso) return { d: '--', m: '-' };
    const date = new Date(iso);
    return { d: String(date.getDate()).padStart(2,'0'), m: date.toLocaleString('pt-BR',{month:'short'}).toUpperCase() };
  };

  // --- RENDERIZADOR DO SKELETON (LOADING BONITO) ---
  const renderSkeleton = () => (
    <div className="profile-grid">
      <div className="sk-card">
        <div className="skeleton-anim sk-circle"></div>
        <div className="skeleton-anim sk-title"></div>
        <div className="skeleton-anim sk-input"></div>
        <div className="skeleton-anim sk-input"></div>
        <div className="skeleton-anim sk-input" style={{height:'100px'}}></div>
        <div className="skeleton-anim sk-btn"></div>
      </div>
      <div className="flex-col-gap">
        <div className="sk-card">
          <div className="skeleton-anim sk-title"></div>
          <div className="sk-row">
            <div className="sk-col"><div className="skeleton-anim sk-input"></div></div>
            <div className="sk-col"><div className="skeleton-anim sk-input"></div></div>
          </div>
          <div className="skeleton-anim sk-input"></div>
          <div className="skeleton-anim sk-btn"></div>
        </div>
        <div className="sk-card" style={{height:'200px'}}>
          <div className="skeleton-anim sk-title"></div>
          <div className="skeleton-anim sk-input"></div>
          <div className="skeleton-anim sk-input"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="info-container">
      <Navbar />
      <div className="info-content">
        <div className="tabs-header">
          <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>🏢 Perfil & Gestão</button>
          <button className={`tab-btn ${activeTab === 'wiki' ? 'active' : ''}`} onClick={() => setActiveTab('wiki')}>📚 Wiki & Marcos</button>
        </div>

        {loading ? renderSkeleton() : (
          <>
            {activeTab === 'profile' && (
              <div className="profile-grid">
                {/* COLUNA 1: EMPRESA */}
                <div className="profile-card">
                  <h2 className="card-title">Dados da Startup</h2>
                  <div className="logo-section">
                    <div className="logo-circle" onClick={handleLogoClick}>
                      {companyForm.logo_url ? <img src={companyForm.logo_url} alt="Logo" /> : <span style={{fontSize:'2rem'}}>{companyForm.name.charAt(0)}</span>}
                      <div className="logo-overlay">📷</div>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{display: 'none'}} accept="image/*" />
                  </div>
                  <div className="form-group"><label>Nome</label><input className="profile-input" value={companyForm.name} onChange={e => setCompanyForm({...companyForm, name: e.target.value})} /></div>
                  <div className="form-group"><label>CNPJ</label><input className="profile-input" value={companyForm.cnpj} onChange={e => setCompanyForm({...companyForm, cnpj: e.target.value})} /></div>
                  <div className="form-group"><label>Descrição</label><textarea className="profile-textarea" rows="3" value={companyForm.description} onChange={e => setCompanyForm({...companyForm, description: e.target.value})} /></div>
                  <button className="btn-save" onClick={handleSaveCompany}>Salvar Empresa</button>
                </div>

                {/* COLUNA 2: USUÁRIO E EQUIPE */}
                <div className="flex-col-gap">
                  <div className="profile-card">
                    <h2 className="card-title">Meus Dados</h2>
                    <div className="form-row">
                      <div className="form-group"><label>Nome</label><input className="profile-input" value={userForm.full_name} onChange={e => setUserForm({...userForm, full_name: e.target.value})} /></div>
                      <div className="form-group"><label>Cargo</label><input className="profile-input" value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})} /></div>
                    </div>
                    <div className="form-group"><label>Email</label><input className="profile-input disabled" value={userForm.email} disabled /></div>
                    <button className="btn-save outline" onClick={handleSaveUser}>Atualizar Perfil</button>
                  </div>

                  <div className="profile-card">
                    <div className="card-header-row">
                      <h2 className="card-title">Equipe</h2>
                      <button className="btn-icon-add" onClick={() => setIsAddMemberOpen(true)}>+</button>
                    </div>
                    <div className="members-list">
                      {members.length === 0 && <p style={{color:'#666'}}>Apenas você.</p>}
                      {members.map(m => (
                        <div key={m.id} className="member-item">
                          <div className="member-info"><span className="member-name">{m.name}</span><span className="member-role">{m.role}</span></div>
                          <button className="btn-remove-mini" onClick={() => handleRemoveMember(m.id)}>🗑️</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'wiki' && (
              <div className="wiki-grid">
                <div className="profile-card full-height">
                  <div className="card-header-row"><h2 className="card-title">Wiki</h2><button className="btn-save small" onClick={() => setIsAddNoteOpen(true)}>+ Nota</button></div>
                  <div className="scroll-area">
                    {notes.map(n => (
                      <div key={n.id} className="wiki-item">
                        <div className="wiki-item-header"><strong>{n.title}</strong><button className="btn-trash" onClick={() => handleDeleteNote(n.id)}>🗑️</button></div>
                        <p>{n.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="profile-card full-height">
                  <div className="card-header-row"><h2 className="card-title">Marcos</h2><button className="btn-save small" onClick={() => setIsAddMilestoneOpen(true)}>+ Marco</button></div>
                  <div className="scroll-area">
                    {milestones.map(m => {
                      const { d, m: month } = formatDate(m.due_date);
                      return (
                        <div key={m.id} className="milestone-row">
                          <div className="date-box"><span>{d}</span><small>{month}</small></div>
                          <div className="milestone-text"><strong>{m.title}</strong><p>{m.description}</p></div>
                          <button className="btn-trash" onClick={() => handleDeleteMilestone(m.id)}>🗑️</button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAIS */}
      <Modal isOpen={isAddMemberOpen} onClose={() => setIsAddMemberOpen(false)} title="Adicionar Membro">
        <div className="modal-form-col">
          <label>Nome</label><input className="profile-input" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} />
          <label>Cargo</label><input className="profile-input" value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value})} />
          <label>Email</label><input className="profile-input" value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} />
          <button className="btn-save" onClick={handleAddMember}>Adicionar</button>
        </div>
      </Modal>

      <Modal isOpen={isAddNoteOpen} onClose={() => setIsAddNoteOpen(false)} title="Nova Nota">
        <div className="modal-form-col">
          <input className="profile-input" placeholder="Título" value={newNote.title} onChange={e => setNewNote({...newNote, title: e.target.value})} />
          <textarea className="profile-textarea" placeholder="Conteúdo" value={newNote.content} onChange={e => setNewNote({...newNote, content: e.target.value})} />
          <button className="btn-save" onClick={handleAddNote}>Salvar</button>
        </div>
      </Modal>

      <Modal isOpen={isAddMilestoneOpen} onClose={() => setIsAddMilestoneOpen(false)} title="Novo Marco">
        <div className="modal-form-col">
          <label>Data</label><input type="date" className="profile-input" value={newMilestone.date} onChange={e => setNewMilestone({...newMilestone, date: e.target.value})} />
          <input className="profile-input" placeholder="Título" value={newMilestone.title} onChange={e => setNewMilestone({...newMilestone, title: e.target.value})} />
          <input className="profile-input" placeholder="Descrição" value={newMilestone.desc} onChange={e => setNewMilestone({...newMilestone, desc: e.target.value})} />
          <button className="btn-save" onClick={handleAddMilestone}>Salvar</button>
        </div>
      </Modal>
    </div>
  );
}