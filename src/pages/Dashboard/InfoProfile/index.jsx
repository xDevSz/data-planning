import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import Modal from '../../../components/Modal';
import { appService } from '../../../services/appService';
import { useAlert } from '../../../hooks/useAlert';
import { 
  Building2, UserCircle, Users, BookOpen, Flag, Camera, 
  Trash2, Plus, Save, Mail, Briefcase, FileText, CalendarDays,
  AlertTriangle, MapPin, Hash, ShieldAlert, LogOut
} from 'lucide-react';
import './index.css';

export default function InfoProfile() {
  const alertHook = useAlert();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  // DADOS
  const [startupId, setStartupId] = useState(null);
  
  const [companyForm, setCompanyForm] = useState({ 
    name: '', cnpj: '', cnae: '', legal_status: '', address: '', description: '', logo_url: '' 
  });
  
  const [userForm, setUserForm] = useState({ full_name: '', role: '', email: '' });
  const [members, setMembers] = useState([]);
  const [notes, setNotes] = useState([]);
  const [milestones, setMilestones] = useState([]);
  
  // MODAIS
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false);
  
  // MODAIS DE PERIGO / SAÍDA
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [isLogoutOpen, setIsLogoutOpen] = useState(false); // NOVO: Modal de Deslogar

  const [newMember, setNewMember] = useState({ name: '', role: '', email: '' });
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [newMilestone, setNewMilestone] = useState({ date: '', title: '', desc: '' });

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await appService.getProfileData();
      
      setStartupId(data.user.startup_id);
      
      const startup = data.user.startups || {};
      
      setCompanyForm({
        name: startup.name || '',
        cnpj: startup.cnpj || '',
        cnae: startup.cnae || '',
        legal_status: startup.legal_status || '',
        address: startup.address || '',
        description: startup.description || '',
        logo_url: startup.logo_url || ''
      });
      setUserForm({
        full_name: data.user.full_name || '',
        role: data.user.role || '',
        email: data.user.email || ''
      });
      setMembers(data.team || []);
      setNotes(data.notes || []);
      setMilestones(data.milestones || []);
    } catch (error) {
      console.error(error);
      alertHook.notifyError("Erro ao sincronizar workspace.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // --- HANDLERS EMPRESA ---
  const handleLogoClick = () => fileInputRef.current.click();
  
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const objectUrl = URL.createObjectURL(file);
      setCompanyForm(prev => ({ ...prev, logo_url: objectUrl }));
      await appService.uploadStartupLogo(file, startupId);
      alertHook.notify("Identidade visual atualizada!", "success");
    } catch (error) { alertHook.notifyError("Erro no upload da imagem."); }
  };

  const handleSaveCompany = async () => {
    if (!companyForm.name) return alertHook.notifyError("Nome da startup é obrigatório.");
    try {
      await appService.updateStartupInfo(startupId, {
        name: companyForm.name, 
        cnpj: companyForm.cnpj, 
        cnae: companyForm.cnae,
        legal_status: companyForm.legal_status,
        address: companyForm.address,
        description: companyForm.description
      });
      alertHook.notify("Dados corporativos salvos com sucesso!", "success");
    } catch (e) { alertHook.notifyError("Falha ao salvar dados."); }
  };

  // --- HANDLERS USUÁRIO / EQUIPE ---
  const handleSaveUser = async () => {
    if (!userForm.full_name) return alertHook.notifyError("O Nome é obrigatório.");
    try {
      await appService.updateUserProfile({ full_name: userForm.full_name, role: userForm.role });
      alertHook.notify("Perfil de usuário atualizado!", "success");
    } catch (e) { alertHook.notifyError("Falha ao atualizar perfil."); }
  };

  const handleAddMember = async () => {
    if (!newMember.name || !newMember.role) return alertHook.notifyError("Preencha Nome e Cargo.");
    try {
      await appService.addTeamMember(newMember, startupId);
      setIsAddMemberOpen(false); setNewMember({ name: '', role: '', email: '' }); loadData();
      alertHook.notify("Novo membro integrado à equipe.", "success");
    } catch (e) { alertHook.notifyError("Erro ao convidar membro."); }
  };

  const handleRemoveMember = async (id) => {
    if (await alertHook.confirm("Remover acesso?", "Este membro perderá acesso ao painel da startup.")) {
      try { await appService.deleteMember(id); loadData(); alertHook.notify("Membro removido."); } 
      catch (e) { alertHook.notifyError("Erro ao remover acesso."); }
    }
  };

  // --- HANDLERS WIKI E MARCOS ---
  const handleAddNote = async () => {
    if(!newNote.title) return alertHook.notifyError("Título da nota é obrigatório.");
    await appService.createNote(newNote);
    setNewNote({title:'', content:''}); setIsAddNoteOpen(false); loadData();
    alertHook.notify("Documento salvo na Wiki.", "success");
  };

  const handleDeleteNote = async (id) => {
    if(await alertHook.confirm("Apagar documento?", "Esta ação é irreversível.")) {
      try { await appService.deleteNote(id); loadData(); } catch(e){ alertHook.notifyError("Erro ao excluir."); }
    }
  };

  const handleAddMilestone = async () => {
    if(!newMilestone.title || !newMilestone.date) return alertHook.notifyError("Preencha Título e Data.");
    await appService.createMilestone({
        title: newMilestone.title, description: newMilestone.desc, due_date: new Date(newMilestone.date).toISOString()
    });
    setNewMilestone({date:'', title:'', desc:''}); setIsAddMilestoneOpen(false); loadData();
    alertHook.notify("Novo marco temporal definido.", "success");
  };

  const handleDeleteMilestone = async (id) => {
    if(await alertHook.confirm("Excluir marco?", "Remover da timeline?")) {
      try { await appService.deleteMilestone(id); loadData(); } catch(e){ alertHook.notifyError("Erro ao excluir."); }
    }
  };

  // --- DESLOGAR DA CONTA (LOGOUT) ---
  const handleLogout = async () => {
    try {
      await appService.logoutUser();
      setIsLogoutOpen(false);
      navigate('/'); // Redireciona para a Home / Tela de Login
    } catch (e) {
      alertHook.notifyError("Erro ao tentar deslogar.");
    }
  };

  // --- EXCLUSÃO DA STARTUP (DELETAR BANCO) ---
  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== companyForm.name) {
      return alertHook.notifyError("O nome digitado não confere. Exclusão abortada.");
    }
    
    setIsDeleting(true);
    try {
      if(appService.deleteStartup) {
        await appService.deleteStartup();
      }
      setIsDeleteAccountOpen(false);
      navigate('/'); 
    } catch (e) {
      alertHook.notifyError("Erro crítico ao apagar banco de dados.");
      setIsDeleting(false);
    }
  };

  // --- FUNÇÕES AUXILIARES ---
  const formatDate = (iso) => {
    if (!iso) return { d: '--', m: '-' };
    const date = new Date(iso);
    return { d: String(date.getDate()).padStart(2,'0'), m: date.toLocaleString('pt-BR',{month:'short'}).toUpperCase() };
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].substring(0,2).toUpperCase();
  };

  const renderSkeleton = () => (
    <div className="info-grid">
      <div className="glass-card skeleton-card">
        <div className="sk-circle pulse"></div>
        <div className="sk-line title pulse"></div>
        <div className="sk-line pulse"></div>
        <div className="sk-line pulse"></div>
        <div className="sk-box pulse"></div>
        <div className="sk-btn pulse"></div>
      </div>
      <div className="info-col">
        <div className="glass-card skeleton-card">
          <div className="sk-line title pulse"></div>
          <div className="sk-row">
            <div className="sk-line pulse"></div>
            <div className="sk-line pulse"></div>
          </div>
          <div className="sk-btn pulse"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="info-wrapper">
      <Navbar />
      
      <main className="info-content fade-in">
        
        <header className="page-header">
          <div className="header-info">
            <h1 className="page-title"><Building2 className="text-neon-purple mr-2"/> Workspace & Configurações</h1>
            <p className="page-subtitle">Gerencie a identidade corporativa da startup, controle de acessos da equipe e a base de conhecimento (Wiki).</p>
          </div>
        </header>

        <div className="info-tabs custom-scrollbar">
          <button className={`i-tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            <UserCircle size={18}/> Perfil & Equipe
          </button>
          <button className={`i-tab-btn ${activeTab === 'wiki' ? 'active' : ''}`} onClick={() => setActiveTab('wiki')}>
            <BookOpen size={18}/> Wiki & Linha do Tempo
          </button>
        </div>

        {loading ? renderSkeleton() : (
          <>
            {activeTab === 'profile' && (
              <div className="info-grid fade-in">
                
                {/* COLUNA 1: EMPRESA */}
                <div className="glass-card">
                  <div className="card-header">
                    <h2 className="card-title"><Building2 size={20} className="text-cyber-blue"/> Dados da Startup</h2>
                  </div>
                  
                  <div className="logo-upload-section">
                    <div className="logo-circle" onClick={handleLogoClick}>
                      {companyForm.logo_url ? <img src={companyForm.logo_url} alt="Logo" /> : <span>{companyForm.name.charAt(0) || 'S'}</span>}
                      <div className="logo-overlay"><Camera size={24}/></div>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{display: 'none'}} accept="image/*" />
                    <span className="logo-hint">Clique para alterar a logo</span>
                  </div>

                  <div className="input-group">
                    <label>Razão Social / Nome Fantasia</label>
                    <input className="modern-input" value={companyForm.name} onChange={e => setCompanyForm({...companyForm, name: e.target.value})} placeholder="Nome da Startup" />
                  </div>
                  
                  <div className="form-row">
                    <div className="input-group">
                      <label>CNPJ</label>
                      <input className="modern-input" value={companyForm.cnpj} onChange={e => setCompanyForm({...companyForm, cnpj: e.target.value})} placeholder="00.000.000/0000-00" />
                    </div>
                    <div className="input-group">
                      <label>Situação Cadastral</label>
                      <div className="input-with-icon"><ShieldAlert size={18} className={companyForm.legal_status?.toLowerCase() === 'ativa' ? 'text-neon-green' : 'text-text-dim'}/><input className={`modern-input pl-40 ${companyForm.legal_status?.toLowerCase() === 'ativa' ? 'text-neon-green' : ''}`} value={companyForm.legal_status} onChange={e => setCompanyForm({...companyForm, legal_status: e.target.value})} placeholder="Ex: ATIVA" /></div>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="input-group">
                      <label>Código CNAE (Principal)</label>
                      <div className="input-with-icon"><Hash size={18}/><input className="modern-input pl-40" value={companyForm.cnae} onChange={e => setCompanyForm({...companyForm, cnae: e.target.value})} placeholder="Ex: 6204-0/00" /></div>
                    </div>
                    <div className="input-group">
                      <label>Endereço / Sede</label>
                      <div className="input-with-icon"><MapPin size={18}/><input className="modern-input pl-40" value={companyForm.address} onChange={e => setCompanyForm({...companyForm, address: e.target.value})} placeholder="Cidade, Estado" /></div>
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Pitch / Bio Curta</label>
                    <textarea className="modern-textarea" rows="4" value={companyForm.description} onChange={e => setCompanyForm({...companyForm, description: e.target.value})} placeholder="O que a sua startup faz em uma frase?" />
                  </div>
                  
                  <button className="btn-primary w-100 mt-2" onClick={handleSaveCompany}>
                    <Save size={18} className="mr-2"/> Salvar Dados Corporativos
                  </button>

                  {/* ZONA DE PERIGO */}
                  <div className="danger-zone">
                    <h4 className="danger-title"><AlertTriangle size={16}/> Zona de Perigo</h4>
                    <p className="danger-desc">A exclusão da conta apagará permanentemente todos os projetos, arquivos do cofre e dados financeiros.</p>
                    <button className="btn-outline-danger" onClick={() => setIsDeleteAccountOpen(true)}>Encerrar Operação e Excluir Startup</button>
                  </div>
                </div>

                {/* COLUNA 2: USUÁRIO E EQUIPE */}
                <div className="info-col">
                  
                  <div className="glass-card mb-4">
                    <div className="card-header">
                      <h2 className="card-title"><UserCircle size={20} className="text-alert-yellow"/> Meu Perfil (Logado)</h2>
                    </div>
                    <div className="form-row">
                      <div className="input-group"><label>Nome Completo</label><input className="modern-input" value={userForm.full_name} onChange={e => setUserForm({...userForm, full_name: e.target.value})} /></div>
                      <div className="input-group"><label>Cargo Operacional</label><input className="modern-input" value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})} placeholder="Ex: CEO, CTO" /></div>
                    </div>
                    <div className="input-group"><label>Email de Acesso</label><input className="modern-input disabled" value={userForm.email} disabled /></div>
                    
                    {/* BOTÕES DO PERFIL: Atualizar E Deslogar */}
                    <div className="form-row mt-2">
                      <button className="btn-outline-green w-100" onClick={handleSaveUser}>Atualizar Perfil</button>
                      <button className="btn-outline-danger w-100" onClick={() => setIsLogoutOpen(true)}><LogOut size={16} className="mr-2"/> Deslogar</button>
                    </div>
                  </div>

                  <div className="glass-card flex-1">
                    <div className="card-header-flex">
                      <h2 className="card-title"><Users size={20} className="text-neon-green"/> Controle de Equipe</h2>
                      <button className="btn-icon-add" onClick={() => setIsAddMemberOpen(true)} title="Adicionar Membro"><Plus size={18}/></button>
                    </div>
                    
                    <div className="team-list custom-scrollbar">
                      {members.length === 0 ? <p className="empty-state">Sem membros convidados. Espaço solo.</p> : 
                        members.map(m => (
                          <div key={m.id} className="team-member-card">
                            <div className="tm-avatar">{getInitials(m.name)}</div>
                            <div className="tm-info">
                              <span className="tm-name">{m.name}</span>
                              <span className="tm-role">{m.role}</span>
                            </div>
                            <button className="btn-delete-icon" onClick={() => handleRemoveMember(m.id)} title="Revogar Acesso"><Trash2 size={16}/></button>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'wiki' && (
              <div className="info-grid fade-in">
                {/* WIKI COLUMNS MANTIDAS IGUAIS */}
                <div className="glass-card col-flex">
                  <div className="card-header-flex">
                    <h2 className="card-title"><FileText size={20} className="text-cyber-blue"/> Base de Conhecimento (Wiki)</h2>
                    <button className="btn-save small" onClick={() => setIsAddNoteOpen(true)}><Plus size={16} className="mr-1"/> Nova Regra</button>
                  </div>
                  
                  <div className="wiki-list custom-scrollbar">
                    {notes.length === 0 ? <p className="empty-state">Sua Wiki corporativa está vazia. Crie manuais e regras aqui.</p> : 
                      notes.map(n => (
                        <div key={n.id} className="wiki-card">
                          <div className="wk-header">
                            <h4 className="wk-title">{n.title}</h4>
                            <button className="btn-trash-invisible" onClick={() => handleDeleteNote(n.id)}><Trash2 size={16}/></button>
                          </div>
                          <p className="wk-content">{n.content}</p>
                        </div>
                      ))
                    }
                  </div>
                </div>

                <div className="glass-card col-flex">
                  <div className="card-header-flex">
                    <h2 className="card-title"><Flag size={20} className="text-alert-yellow"/> Timeline (Marcos Históricos)</h2>
                    <button className="btn-save small bg-yellow text-black" onClick={() => setIsAddMilestoneOpen(true)}><Plus size={16} className="mr-1"/> Novo Marco</button>
                  </div>
                  
                  <div className="milestone-list custom-scrollbar">
                    {milestones.length === 0 ? <p className="empty-state">Sem eventos na linha do tempo.</p> : 
                      milestones.map(m => {
                        const { d, m: month } = formatDate(m.due_date);
                        return (
                          <div key={m.id} className="milestone-card">
                            <div className="ms-date-box">
                              <span className="ms-day">{d}</span>
                              <span className="ms-month">{month}</span>
                            </div>
                            <div className="ms-info">
                              <h4 className="ms-title">{m.title}</h4>
                              <p className="ms-desc">{m.description}</p>
                            </div>
                            <button className="btn-trash-invisible" onClick={() => handleDeleteMilestone(m.id)}><Trash2 size={16}/></button>
                          </div>
                        )
                      })
                    }
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* =========================================
          MODAIS DE INSERÇÃO E AVISOS
          ========================================= */}
          
      <Modal isOpen={isAddMemberOpen} onClose={() => setIsAddMemberOpen(false)} title="Convidar Membro" centerOnMobile={true}>
        <div className="modal-grid-single">
          <div className="input-group"><label>Nome Completo</label><div className="input-with-icon"><UserCircle size={18}/><input className="modern-input pl-40" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} placeholder="Nome do colaborador" autoFocus/></div></div>
          <div className="input-group"><label>Cargo ou Setor</label><div className="input-with-icon"><Briefcase size={18}/><input className="modern-input pl-40" value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value})} placeholder="Ex: Desenvolvedor Senior" /></div></div>
          <div className="input-group"><label>Email Corporativo</label><div className="input-with-icon"><Mail size={18}/><input className="modern-input pl-40" type="email" value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} placeholder="nome@startup.com" /></div></div>
          <button className="btn-primary w-100 mt-2" onClick={handleAddMember}>Enviar Convite</button>
        </div>
      </Modal>

      <Modal isOpen={isAddNoteOpen} onClose={() => setIsAddNoteOpen(false)} title="Adicionar Documento à Wiki" centerOnMobile={true}>
        <div className="modal-grid-single">
          <div className="input-group"><label>Título do Documento</label><input className="modern-input" placeholder="Ex: Padrão de Commits Git" value={newNote.title} onChange={e => setNewNote({...newNote, title: e.target.value})} autoFocus/></div>
          <div className="input-group"><label>Conteúdo / Regras</label><textarea className="modern-textarea" rows="6" placeholder="Escreva o manual ou regra aqui..." value={newNote.content} onChange={e => setNewNote({...newNote, content: e.target.value})} /></div>
          <button className="btn-primary w-100 mt-2" onClick={handleAddNote}>Publicar na Wiki</button>
        </div>
      </Modal>

      <Modal isOpen={isAddMilestoneOpen} onClose={() => setIsAddMilestoneOpen(false)} title="Novo Marco Temporal" centerOnMobile={true}>
        <div className="modal-grid-single">
          <div className="input-group"><label>Data do Evento</label><div className="input-with-icon"><CalendarDays size={18}/><input type="date" className="modern-input pl-40" value={newMilestone.date} onChange={e => setNewMilestone({...newMilestone, date: e.target.value})} /></div></div>
          <div className="input-group"><label>Nome do Marco</label><input className="modern-input" placeholder="Ex: Lançamento do MVP 1.0" value={newMilestone.title} onChange={e => setNewMilestone({...newMilestone, title: e.target.value})} /></div>
          <div className="input-group"><label>Descrição (Opcional)</label><input className="modern-input" placeholder="Detalhes do que foi ou será alcançado..." value={newMilestone.desc} onChange={e => setNewMilestone({...newMilestone, desc: e.target.value})} /></div>
          <button className="btn-primary w-100 mt-2 bg-yellow text-black" onClick={handleAddMilestone}>Salvar na Timeline</button>
        </div>
      </Modal>

      {/* MODAL DE SAIR DA CONTA (LOGOUT) */}
      <Modal isOpen={isLogoutOpen} onClose={() => setIsLogoutOpen(false)} title="Sair da Conta" centerOnMobile={true}>
        <div className="modal-grid-single">
          <p className="text-center text-text-dim" style={{lineHeight: 1.5, fontSize: '0.95rem'}}>
            Tem certeza que deseja sair do sistema? Você precisará fazer login novamente para acessar o workspace da startup.
          </p>
          <div className="form-row mt-2">
            <button className="btn-outline-green w-100" onClick={() => setIsLogoutOpen(false)}>Continuar Logado</button>
            <button className="btn-danger w-100" onClick={handleLogout}>Sim, Sair</button>
          </div>
        </div>
      </Modal>

      {/* MODAL: DUPLA CONFIRMAÇÃO DE EXCLUSÃO (DELETAR BANCO) */}
      <Modal isOpen={isDeleteAccountOpen} onClose={() => setIsDeleteAccountOpen(false)} title="Atenção Crítica" centerOnMobile={true}>
        <div className="modal-grid-single delete-warning-modal">
          <div className="delete-icon-wrapper"><ShieldAlert size={48} className="text-alert-red"/></div>
          <h3 className="text-alert-red text-center" style={{fontSize: '1.3rem'}}>Protocolo de Exclusão</h3>
          <p className="text-center text-text-dim" style={{lineHeight: 1.5, margin: '0 0 15px 0', fontSize: '0.9rem'}}>
            Todos os dados, incluindo <strong>Projetos, Kanban, Arquivos do Cloud Vault, Membros e Histórico Financeiro</strong> serão apagados permanentemente dos servidores.
          </p>
          
          <div className="input-group">
            <label className="text-center" style={{marginBottom: '10px'}}>Digite <strong className="text-white">'{companyForm.name || 'o nome da startup'}'</strong> para confirmar a exclusão:</label>
            <input 
              className="modern-input text-center font-bold" 
              placeholder="Digite o nome exato" 
              value={deleteConfirmationText} 
              onChange={e => setDeleteConfirmationText(e.target.value)} 
            />
          </div>
          
          <button 
            className="btn-danger w-100 mt-2" 
            onClick={handleDeleteAccount}
            disabled={deleteConfirmationText !== companyForm.name || isDeleting}
          >
            {isDeleting ? 'Apagando banco de dados...' : 'Excluir Minha Startup Permanentemente'}
          </button>
        </div>
      </Modal>

    </div>
  );
}