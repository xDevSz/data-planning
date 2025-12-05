import React, { useState, useEffect } from 'react';
import Navbar from '../../../components/Navbar';
import Modal from '../../../components/Modal'; 
import { appService } from '../../../services/appService';
import './index.css';

export default function InfoProfile() {
  const [activeTab, setActiveTab] = useState('wiki');
  const [loading, setLoading] = useState(true);

  // DADOS REAIS
  const [user, setUser] = useState({ id: '', name: '', email: '', role: '', startupCnpj: '', startupLogo: null });
  const [members, setMembers] = useState([]);
  const [notes, setNotes] = useState([]);
  const [milestones, setMilestones] = useState([]);
  
  // MODAIS
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false);
  
  // INPUTS
  const [newMember, setNewMember] = useState({ name: '', role: '', email: '' });
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [newMilestone, setNewMilestone] = useState({ date: '', title: '', desc: '' });

  // --- CARREGAR DADOS ---
  const loadData = async () => {
    try {
      setLoading(true);
      const data = await appService.getProfileData();
      const savedData = JSON.parse(localStorage.getItem('user_data') || '{}');
      
      setUser({
        id: data.profile.id,
        name: data.profile.full_name,
        email: data.profile.email || savedData.email,
        role: data.profile.role,
        startupCnpj: savedData.startupCnpj || 'CNPJ não informado',
        startupLogo: savedData.startupLogo // Pega a logo salva no login
      });

      setMembers(data.members || []);
      setNotes(data.notes || []);
      setMilestones(data.milestones || []);

    } catch (error) {
      console.error("Erro ao carregar:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // --- ACTIONS (BOTÕES SALVAR) ---

  const handleUpdateProfile = async () => {
    if(!user.name) return alert("O nome não pode estar vazio.");
    try {
      await appService.updateProfile({ full_name: user.name });
      alert("Perfil salvo com sucesso!");
    } catch (e) { alert("Erro ao salvar perfil."); }
  };

  const handleAddMember = async () => {
    if (!newMember.name || !newMember.role) return alert("Preencha nome e função.");
    try {
      await appService.createMemberProfile({ ...newMember });
      setIsAddMemberOpen(false);
      setNewMember({ name: '', role: '', email: '' });
      loadData();
      alert("Membro adicionado!");
    } catch (e) { alert("Erro ao adicionar membro."); }
  };

  const handleRemoveMember = async (id) => {
    if (window.confirm("Remover este membro da equipe?")) {
      try {
        await appService.deleteMember(id);
        loadData();
      } catch (e) { alert("Erro ao remover."); }
    }
  };

  const handleAddNote = async () => {
    if (!newNote.title) return alert("Título obrigatório.");
    try {
      await appService.createNote(newNote);
      setNewNote({ title: '', content: '' });
      setIsAddNoteOpen(false);
      loadData();
    } catch (e) { alert("Erro ao salvar nota."); }
  };

  const handleAddMilestone = async () => {
    if (!newMilestone.title || !newMilestone.date) return alert("Título e Data obrigatórios.");
    try {
      await appService.createMilestone({
        title: newMilestone.title,
        description: newMilestone.desc,
        due_date: new Date(newMilestone.date).toISOString()
      });
      setNewMilestone({ date: '', title: '', desc: '' });
      setIsAddMilestoneOpen(false);
      loadData();
    } catch (e) { alert("Erro ao salvar marco."); }
  };

  // Helper de Data
  const formatDateForMilestone = (isoString) => {
    if (!isoString) return { day: '--', month: '---' };
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');
    return { day, month };
  };

  return (
    <div className="info-container">
      <Navbar />

      <div className="info-content">
        <div className="tabs-header">
          <button className={`tab-btn ${activeTab === 'wiki' ? 'active' : ''}`} onClick={() => setActiveTab('wiki')}>📚 Wiki & Calendário</button>
          <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>👤 Perfil & Equipe</button>
        </div>

        {loading ? <div style={{color:'#fff', padding:'20px'}}>Carregando...</div> : (
          <>
            {/* --- ABA WIKI --- */}
            {activeTab === 'wiki' && (
              <div className="wiki-section">
                {/* NOTAS */}
                <div>
                  <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
                     <h2 style={{color:'#fff'}}>Wiki</h2>
                     <button className="btn-save" style={{width:'auto', marginTop:0, padding:'8px 15px'}} onClick={() => setIsAddNoteOpen(true)}>+ Nota</button>
                  </div>
                  {notes.length === 0 && <p style={{color:'#666'}}>Nenhuma nota.</p>}
                  {notes.map(note => (
                    <div key={note.id} className="wiki-block">
                      <div className="wiki-header">
                        <span className="wiki-title">{note.title}</span>
                        <span className="wiki-date">{new Date(note.created_at).toLocaleDateString()}</span>
                      </div>
                      <p style={{color:'var(--text-secondary)'}}>{note.content}</p>
                    </div>
                  ))}
                </div>

                {/* MARCOS */}
                <div>
                  <h2 style={{color:'#fff', marginBottom:'20px'}}>Marcos</h2>
                  <div className="wiki-block">
                    {milestones.length === 0 && <p style={{color:'#666', textAlign:'center'}}>Sem marcos.</p>}
                    {milestones.map(m => {
                      const { day, month } = formatDateForMilestone(m.due_date);
                      return (
                        <div key={m.id} className="milestone-item">
                          <div className="milestone-date"><div>{day}</div><div>{month}</div></div>
                          <div className="milestone-content"><h4>{m.title}</h4><p>{m.description}</p></div>
                        </div>
                      );
                    })}
                    <div style={{marginTop:'15px', textAlign:'center', color:'var(--neon-green)', cursor:'pointer'}} onClick={() => setIsAddMilestoneOpen(true)}>+ Novo Marco</div>
                  </div>
                </div>
              </div>
            )}

            {/* --- ABA PERFIL --- */}
            {activeTab === 'profile' && (
              <div className="profile-grid">
                
                {/* IDENTIDADE (Com Logo) */}
                <div className="profile-card">
                  <h2 style={{color:'#fff', marginBottom:'20px'}}>Identidade</h2>
                  
                  {/* LOGO AREA */}
                  <div className="logo-display-area">
                    {user.startupLogo ? (
                      <img src={user.startupLogo} alt="Logo" className="profile-logo-img" />
                    ) : (
                      <div className="profile-logo-placeholder">{user.name.charAt(0)}</div>
                    )}
                    <div className="cnpj-badge">
                      {user.startupCnpj}
                    </div>
                  </div>

                  <label className="input-label">Seu Nome</label>
                  <input className="profile-input" value={user.name} onChange={(e) => setUser({...user, name: e.target.value})} />
                  
                  <label className="input-label">Email</label>
                  <input className="profile-input" value={user.email} disabled style={{opacity: 0.6, cursor: 'not-allowed'}} />

                  <button className="btn-save" onClick={handleUpdateProfile}>Salvar Alterações</button>
                </div>

                {/* EQUIPE (Sem travas) */}
                <div className="profile-card">
                  <h2 style={{color:'#fff'}}>Equipe</h2>
                  <div className="members-list">
                    {members.map(m => (
                      <div key={m.id} className="member-item">
                        <div>
                          <div style={{fontWeight:'bold', color:'#fff'}}>{m.full_name} {m.id === user.id ? '(Você)' : ''}</div>
                          <div style={{fontSize:'0.8rem', color:'#888'}}>{m.role}</div>
                        </div>
                        {/* Botão Remover para todos */}
                        {m.id !== user.id && (
                            <button className="btn-remove" onClick={() => handleRemoveMember(m.id)}>🗑️</button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button className="btn-save" style={{background:'transparent', border:'1px dashed var(--neon-purple)', color:'var(--neon-purple)'}} onClick={() => setIsAddMemberOpen(true)}>
                    + Adicionar Membro
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* --- MODAIS --- */}
      <Modal isOpen={isAddMemberOpen} onClose={() => setIsAddMemberOpen(false)} title="Adicionar Membro">
        <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
          <input className="profile-input" placeholder="Nome Completo" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} />
          <input className="profile-input" placeholder="Função" value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value})} />
          <input className="profile-input" placeholder="Email (Opcional)" value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} />
          <button className="btn-save" onClick={handleAddMember}>Salvar</button>
        </div>
      </Modal>

      <Modal isOpen={isAddNoteOpen} onClose={() => setIsAddNoteOpen(false)} title="Nova Nota">
         <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
           <input className="profile-input" placeholder="Título" value={newNote.title} onChange={e => setNewNote({...newNote, title: e.target.value})} />
           <textarea className="profile-input" placeholder="Conteúdo..." value={newNote.content} onChange={e => setNewNote({...newNote, content: e.target.value})} />
           <button className="btn-save" onClick={handleAddNote}>Salvar</button>
         </div>
      </Modal>

      <Modal isOpen={isAddMilestoneOpen} onClose={() => setIsAddMilestoneOpen(false)} title="Novo Marco">
         <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
           <input type="date" className="profile-input" value={newMilestone.date} onChange={e => setNewMilestone({...newMilestone, date: e.target.value})} />
           <input className="profile-input" placeholder="Título" value={newMilestone.title} onChange={e => setNewMilestone({...newMilestone, title: e.target.value})} />
           <input className="profile-input" placeholder="Descrição" value={newMilestone.desc} onChange={e => setNewMilestone({...newMilestone, desc: e.target.value})} />
           <button className="btn-save" onClick={handleAddMilestone}>Salvar</button>
         </div>
      </Modal>
    </div>
  );
}