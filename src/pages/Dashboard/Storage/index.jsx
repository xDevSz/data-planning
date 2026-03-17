import React, { useState, useEffect } from 'react';
import Navbar from '../../../components/Navbar';
import Modal from '../../../components/Modal';
import { appService } from '../../../services/appService';
import { useAlert } from '../../../hooks/useAlert';
import { 
  FolderPlus, UploadCloud, FileText, Image as ImageIcon, 
  Video, File, Folder, Download, Trash2, ArrowRight,
  User, LayoutGrid, HardDrive, ChevronRight,
  Code, TableProperties, Archive 
} from 'lucide-react';
import './index.css';

export default function Storage() {
  const alertHook = useAlert();
  
  // Estados de Dados
  const [files, setFiles] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Estados de Navegação e Contexto
  const [currentFolder, setCurrentFolder] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: 'Vault Principal' }]);
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Contexto de quem é o dono da pasta (Global ou Membro Específico)
  const [selectedProfileId, setSelectedProfileId] = useState('global');

  // Estados de Modal/Input
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  // Filtro Visual
  const [filterType, setFilterType] = useState('all');

  // --- CARREGAMENTO INICIAL ---
  const loadData = async (folderId, profileId) => {
    setLoading(true);
    try {
      const data = await appService.getFiles(folderId);
      let filteredData = Array.isArray(data) ? data : [];
      
      // Simulação de isolamento por perfil para o UI
      if (profileId !== 'global') {
         // Futuro: filteredData = filteredData.filter(f => f.assignee_id === profileId)
      }

      setFiles(filteredData);

      const profileData = await appService.getProfileData();
      setTeamMembers(profileData.team || []);

    } catch (error) {
      console.error(error);
      alertHook.notifyError("Falha de sincronização com o cofre.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentFolder(null);
    setBreadcrumbs([{ id: null, name: selectedProfileId === 'global' ? 'Vault Principal' : 'Workspace Privado' }]);
    setSelectedFile(null);
    loadData(null, selectedProfileId);
  }, [selectedProfileId]);

  useEffect(() => {
    loadData(currentFolder, selectedProfileId);
    setSelectedFile(null);
  }, [currentFolder]);

  // --- NAVEGAÇÃO ---
  const handleEnterFolder = (folder) => {
    setCurrentFolder(folder.id);
    setBreadcrumbs([...breadcrumbs, { id: folder.id, name: folder.name }]);
  };

  const handleBreadcrumb = (index) => {
    const target = breadcrumbs[index];
    if (target.id === currentFolder) return;
    const newHistory = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newHistory);
    setCurrentFolder(target.id);
  };

  // --- SMART CLICK (Windows/Mac Feel) ---
  const handleCardClick = (file) => {
    if (selectedFile?.id === file.id) {
        if (file.is_folder) handleEnterFolder(file);
        else window.open(file.file_url, '_blank');
    } else {
        setSelectedFile(file);
    }
  };

  // --- AÇÕES ---
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      await appService.uploadFile(file, currentFolder);
      alertHook.notify("Arquivo injetado no cofre!", "success");
      await loadData(currentFolder, selectedProfileId);
    } catch (error) {
      alertHook.notifyError("Falha na transferência de rede.");
    } finally {
      setUploading(false);
      e.target.value = ''; 
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return alertHook.notifyError("Nome de diretório inválido.");
    try {
      await appService.createFolder(newFolderName, currentFolder);
      setNewFolderName('');
      setIsNewFolderOpen(false);
      await loadData(currentFolder, selectedProfileId);
      alertHook.notify("Diretório criado com sucesso.");
    } catch (error) {
      alertHook.notifyError("Erro de integridade ao criar pasta.");
    }
  };

  const handleDelete = async () => {
    if (!selectedFile) return;
    const confirm = await alertHook.confirm(
      "Confirmar Exclusão?", 
      selectedFile.is_folder ? "Apagar a pasta e incinerar todo o conteúdo dentro dela?" : "Excluir arquivo permanentemente do servidor?"
    );

    if (confirm) {
      try {
        await appService.deleteFile(selectedFile.id, selectedFile.file_url, selectedFile.is_folder);
        setSelectedFile(null);
        await loadData(currentFolder, selectedProfileId);
        alertHook.notify("Item erradicado.", "success");
      } catch (error) {
        alertHook.notifyError("Erro ao processar exclusão.");
      }
    }
  };

  // =================================================================================
  // --- LÓGICA DE FILTROS INTELIGENTES ---
  // =================================================================================
  const getFilteredFiles = () => {
    if (filterType === 'all') return files;
    
    // Pastas sempre aparecem para não quebrar a navegação do usuário
    return files.filter(f => {
      if (f.is_folder) return true;
      
      const fileType = f.file_type || '';
      const fileName = (f.name || '').toLowerCase();

      switch (filterType) {
        case 'pdf': 
          return fileType === 'pdf' || fileName.includes('.pdf');
        case 'docs': 
          return ['doc', 'docx', 'txt', 'rtf'].includes(fileType) || fileName.includes('.doc') || fileName.includes('.txt');
        case 'sheets': 
          return ['bi', 'csv', 'xlsx', 'xls'].includes(fileType) || fileName.includes('.csv') || fileName.includes('.xls');
        case 'images': 
          return fileType === 'image' || fileName.match(/\.(jpg|jpeg|png|gif|svg|webp)$/);
        case 'media': 
          return fileType === 'video' || fileName.match(/\.(mp4|mov|avi|mkv|mp3|wav)$/);
        case 'code': 
          return fileType === 'code' || fileName.match(/\.(js|jsx|css|html|json|ts|sql|py)$/);
        case 'archives': 
          return fileType === 'zip' || fileName.match(/\.(zip|rar|7z|tar)$/);
        case 'other': 
          return fileType === 'other';
        default: 
          return true;
      }
    });
  };

  const renderIcon = (file) => {
    if (file.is_folder) return <Folder size={48} strokeWidth={1.5} className="text-cyber-blue" />;
    
    const fType = file.file_type || '';
    const fName = (file.name || '').toLowerCase();

    if (fType === 'image' || fName.match(/\.(jpg|jpeg|png|svg)$/)) return <ImageIcon size={48} strokeWidth={1.5} className="text-neon-purple" />;
    if (fType === 'pdf' || fName.includes('.pdf')) return <FileText size={48} strokeWidth={1.5} className="text-alert-red" />;
    if (fType === 'video' || fName.match(/\.(mp4|mov)$/)) return <Video size={48} strokeWidth={1.5} className="text-alert-yellow" />;
    if (['bi', 'csv', 'xlsx'].includes(fType) || fName.includes('.csv') || fName.includes('.xls')) return <TableProperties size={48} strokeWidth={1.5} className="text-neon-green" />;
    if (fType === 'code' || fName.match(/\.(js|jsx|json|html|css|sql)$/)) return <Code size={48} strokeWidth={1.5} className="text-cyber-blue" />;
    if (fType === 'zip' || fName.match(/\.(zip|rar)$/)) return <Archive size={48} strokeWidth={1.5} className="text-text-dim" />;
    
    return <File size={48} strokeWidth={1.5} className="text-text-dim" />;
  };

  const displayedFiles = getFilteredFiles();

  return (
    <div className="storage-container">
      <Navbar />
      
      {/* HEADER ISOLADO DO STORAGE */}
      <header className="storage-top-bar fade-in">
        <div className="st-info">
          <h1 className="st-title"><HardDrive className="text-cyber-blue mr-2"/> Cloud Vault</h1>
          <p className="st-subtitle">Gerenciamento seguro de ativos da startup.</p>
        </div>

        <div className="st-profile-selector">
          <User size={18} className="text-text-dim" />
          <select value={selectedProfileId} onChange={(e) => setSelectedProfileId(e.target.value)}>
            <option value="global">Cofre Global (Startup)</option>
            {teamMembers.map(member => (
              <option key={member.id} value={member.id}>Workspace: {member.name.split(' ')[0]}</option>
            ))}
          </select>
        </div>
      </header>

      <div className="storage-content fade-in">
        
        {/* SIDEBAR DE CONTROLE */}
        <div className="storage-sidebar custom-scrollbar">
          
          <div className="sidebar-section">
            <h4 className="sb-title">Ações do Cofre</h4>
            <div className="sidebar-actions">
              <button className="btn-sidebar outline" onClick={() => setIsNewFolderOpen(true)}>
                <FolderPlus size={18}/> Novo Diretório
              </button>
              
              <label className={`btn-sidebar primary ${uploading ? 'disabled' : ''}`}>
                <UploadCloud size={18}/> {uploading ? 'Transferindo...' : 'Fazer Upload'}
                <input type="file" hidden onChange={handleUpload} disabled={uploading} />
              </label>
            </div>
          </div>
          
          <div className="sb-separator"></div>
          
          <div className="sidebar-section">
            <h4 className="sb-title">Filtros Inteligentes</h4>
            <div className="sidebar-filters custom-scrollbar">
              
              <button className={`filter-btn ${filterType === 'all' ? 'active' : ''}`} onClick={() => setFilterType('all')}>
                <LayoutGrid size={16}/> Mostrar Tudo
              </button>
              
              <button className={`filter-btn ${filterType === 'pdf' ? 'active' : ''}`} onClick={() => setFilterType('pdf')}>
                <FileText size={16} className="text-alert-red"/> PDFs & Contratos
              </button>

              <button className={`filter-btn ${filterType === 'sheets' ? 'active' : ''}`} onClick={() => setFilterType('sheets')}>
                <TableProperties size={16} className="text-neon-green"/> Planilhas & BI
              </button>

              <button className={`filter-btn ${filterType === 'images' ? 'active' : ''}`} onClick={() => setFilterType('images')}>
                <ImageIcon size={16} className="text-neon-purple"/> Imagens & Design
              </button>

              <button className={`filter-btn ${filterType === 'media' ? 'active' : ''}`} onClick={() => setFilterType('media')}>
                <Video size={16} className="text-alert-yellow"/> Vídeos & Áudio
              </button>

              <button className={`filter-btn ${filterType === 'code' ? 'active' : ''}`} onClick={() => setFilterType('code')}>
                <Code size={16} className="text-cyber-blue"/> Códigos & Scripts
              </button>

              <button className={`filter-btn ${filterType === 'archives' ? 'active' : ''}`} onClick={() => setFilterType('archives')}>
                <Archive size={16}/> Arquivos ZIP/RAR
              </button>

              <button className={`filter-btn ${filterType === 'docs' ? 'active' : ''}`} onClick={() => setFilterType('docs')}>
                <File size={16}/> Textos Diversos (DOCX)
              </button>
              
            </div>
          </div>

        </div>

        {/* ÁREA PRINCIPAL DO EXPLORER */}
        <div className="storage-main">
          
          {/* Breadcrumbs de Navegação */}
          <div className="breadcrumbs">
            {breadcrumbs.map((crumb, idx) => (
              <span key={idx} className="crumb-wrapper">
                <span className="crumb-item" onClick={() => handleBreadcrumb(idx)}>
                  {crumb.name}
                </span>
                {idx < breadcrumbs.length - 1 && <ChevronRight size={14} className="crumb-sep" />}
              </span>
            ))}
          </div>

          {/* Grid de Arquivos */}
          <div className="files-area custom-scrollbar">
            {loading ? <div className="state-msg pulse">Sincronizando setor...</div> : 
             displayedFiles.length === 0 ? (
               <div className="empty-cloud">
                 <UploadCloud size={48} className="text-text-dim mb-3 opacity-50"/>
                 <p>Nenhum ativo encontrado neste filtro.</p>
                 <span>Faça o upload de novos arquivos ou altere o filtro lateral.</span>
               </div>
             ) : (
              <div className="files-grid">
                {displayedFiles.map(file => (
                  <div 
                    key={file.id} 
                    className={`file-card ${selectedFile?.id === file.id ? 'selected' : ''}`}
                    onClick={() => handleCardClick(file)}
                  >
                    <div className="card-icon-area">{renderIcon(file)}</div>
                    <div className="card-info-area">
                      <span className="file-name" title={file.name}>{file.name}</span>
                      <span className="file-meta">{file.is_folder ? 'Diretório' : file.size_text || 'Arquivo'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* BARRA DE AÇÕES FLUTUANTE (WINDOWS/MAC STYLE) */}
          {selectedFile && (
            <div className="floating-action-bar">
              <div className="selected-info-box">
                <span className="action-label">Item Selecionado:</span>
                <span className="selected-text">{selectedFile.name}</span>
              </div>
              
              <div className="action-buttons-group">
                {selectedFile.is_folder ? (
                  <button className="act-btn open" onClick={() => handleEnterFolder(selectedFile)} title="Abrir Diretório">
                    <ArrowRight size={20}/> <span className="hide-mobile">Abrir</span>
                  </button>
                ) : (
                  <button className="act-btn download" onClick={() => window.open(selectedFile.file_url)} title="Fazer Download">
                    <Download size={20}/> <span className="hide-mobile">Baixar</span>
                  </button>
                )}
                
                <button className="act-btn delete" onClick={handleDelete} title="Excluir Definitivamente">
                  <Trash2 size={20}/>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL CRIAR PASTA */}
      <Modal isOpen={isNewFolderOpen} onClose={() => setIsNewFolderOpen(false)} title="Novo Diretório" centerOnMobile={true}>
        <div className="modal-body-simple">
          <div className="input-group">
            <label>Nome da Pasta</label>
            <input className="modern-input" placeholder="Ex: Contratos 2024..." value={newFolderName} onChange={e => setNewFolderName(e.target.value)} autoFocus />
          </div>
          <button className="btn-primary w-100 mt-4" onClick={handleCreateFolder}>Criar Diretório</button>
        </div>
      </Modal>
    </div>
  );
}