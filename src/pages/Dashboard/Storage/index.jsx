import React, { useState, useEffect } from 'react';
import Navbar from '../../../components/Navbar';
import Modal from '../../../components/Modal';
import { appService } from '../../../services/appService';
import { useAlert } from '../../../hooks/useAlert'; // Se não tiver, use alert() normal
import './index.css';

export default function Storage() {
  const alertHook = useAlert(); // Hook de alerta (opcional)
  
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Controle de Pastas (Navegação)
  const [currentFolder, setCurrentFolder] = useState(null); // ID da pasta atual (null = raiz)
  const [folderHistory, setFolderHistory] = useState([{ id: null, name: 'Início' }]); // Breadcrumb
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [filterType, setFilterType] = useState('all');
  
  // Modais
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  
  const [newFolderName, setNewFolderName] = useState('');
  const [uploading, setUploading] = useState(false);

  // --- 1. CARREGAR ARQUIVOS ---
  const loadFiles = async () => {
    try {
      setLoading(true);
      // Busca arquivos onde parent_id = currentFolder
      const data = await appService.getFiles(currentFolder);
      setFiles(data);
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    loadFiles(); 
    setSelectedFile(null); // Limpa seleção ao mudar de pasta
  }, [currentFolder]);

  // --- 2. NAVEGAÇÃO ---
  const handleEnterFolder = (folder) => {
    setCurrentFolder(folder.id);
    setFolderHistory([...folderHistory, { id: folder.id, name: folder.name }]);
  };

  const handleBreadcrumbClick = (index) => {
    const newHistory = folderHistory.slice(0, index + 1);
    setFolderHistory(newHistory);
    setCurrentFolder(newHistory[newHistory.length - 1].id);
  };

  // --- 3. FILTROS VISUAIS ---
  const getFilteredFiles = () => {
    let filtered = files;
    if (filterType === 'docs') filtered = filtered.filter(f => ['pdf', 'contract', 'folder'].includes(f.file_type));
    else if (filterType === 'media') filtered = filtered.filter(f => ['image', 'video', 'folder'].includes(f.file_type));
    else if (filterType === 'dev') filtered = filtered.filter(f => ['code', 'zip', 'bi', 'folder'].includes(f.file_type));
    return filtered;
  };

  // --- 4. AÇÕES (Upload, Criar, Deletar) ---

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    try {
      setUploading(true);
      await appService.uploadFile(uploadedFile, currentFolder);
      setIsUploadOpen(false);
      loadFiles();
      alertHook ? alertHook.notify("Upload concluído!") : alert("Upload concluído!");
    } catch (e) {
      console.error(e);
      alertHook ? alertHook.notifyError("Erro no upload.") : alert("Erro no upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      await appService.createFolder(newFolderName, currentFolder);
      setNewFolderName('');
      setIsNewFolderOpen(false);
      loadFiles();
    } catch (e) { alert("Erro ao criar pasta."); }
  };

  const handleDelete = async () => {
    if (!selectedFile) return;
    const msg = selectedFile.is_folder ? "Excluir pasta e conteúdo?" : "Excluir arquivo permanentemente?";
    
    // Uso do confirm do navegador ou seu hook
    let confirmed = false;
    if (alertHook) {
        confirmed = await alertHook.confirm("Excluir?", msg);
    } else {
        confirmed = window.confirm(msg);
    }

    if (confirmed) {
      try {
        await appService.deleteFile(selectedFile.id, selectedFile.file_url, selectedFile.is_folder);
        setSelectedFile(null);
        loadFiles();
      } catch (e) { alert("Erro ao excluir."); }
    }
  };

  // Ícones
  const getIcon = (type) => {
    switch(type) {
      case 'folder': return <span className="file-icon icon-folder">📁</span>;
      case 'pdf': return <span className="file-icon icon-pdf">📄</span>;
      case 'image': return <span className="file-icon icon-img">🖼️</span>;
      case 'video': return <span className="file-icon icon-video">🎬</span>;
      case 'zip': return <span className="file-icon icon-zip">📦</span>;
      case 'code': return <span className="file-icon icon-code">👨‍💻</span>;
      case 'bi': return <span className="file-icon icon-bi">📊</span>;
      default: return <span className="file-icon">📄</span>;
    }
  };

  const displayedFiles = getFilteredFiles();

  return (
    <div className="storage-container">
      <Navbar />
      
      <div className="storage-content">
        <div className="storage-sidebar">
          <button className="btn-new-folder" onClick={() => setIsNewFolderOpen(true)}>+ Nova Pasta</button>
          
          <button className={`sidebar-btn ${filterType === 'all' ? 'active' : ''}`} onClick={() => setFilterType('all')}>📂 Tudo</button>
          <button className={`sidebar-btn ${filterType === 'docs' ? 'active' : ''}`} onClick={() => setFilterType('docs')}>📜 Docs</button>
          <button className={`sidebar-btn ${filterType === 'dev' ? 'active' : ''}`} onClick={() => setFilterType('dev')}>💾 Dev & BI</button>
          <button className={`sidebar-btn ${filterType === 'media' ? 'active' : ''}`} onClick={() => setFilterType('media')}>🖼️ Mídia</button>

          <div className="upload-zone-mini" onClick={() => setIsUploadOpen(true)}>
            {uploading ? '⏳ Enviando...' : '☁️ Upload'}
          </div>
        </div>

        <div className="storage-main">
          {/* Breadcrumbs */}
          <div className="breadcrumbs">
            {folderHistory.map((item, index) => (
              <React.Fragment key={item.id || 'root'}>
                <span 
                  className="breadcrumb-item" 
                  onClick={() => handleBreadcrumbClick(index)}
                  style={{ color: index === folderHistory.length - 1 ? 'var(--neon-purple)' : '' }}
                >
                  {item.name}
                </span>
                {index < folderHistory.length - 1 && <span className="breadcrumb-separator">/</span>}
              </React.Fragment>
            ))}
          </div>

          {/* Grid de Arquivos */}
          <div className="files-grid">
            {loading && <div style={{color:'#888'}}>Carregando...</div>}
            
            {!loading && displayedFiles.length === 0 && (
              <div style={{gridColumn:'1/-1', textAlign:'center', color:'#666', marginTop:'40px'}}>
                Pasta vazia. Crie uma pasta ou faça upload.
              </div>
            )}

            {!loading && displayedFiles.map(file => (
              <div 
                key={file.id} 
                className={`file-card ${selectedFile?.id === file.id ? 'selected' : ''}`}
                onClick={() => setSelectedFile(file)}
                onDoubleClick={() => file.is_folder ? handleEnterFolder(file) : window.open(file.file_url, '_blank')}
              >
                {getIcon(file.file_type)}
                <div className="file-name">{file.name}</div>
                <div className="file-meta">
                   {file.is_folder ? 'PASTA' : `${file.file_type.toUpperCase()} • ${file.size_text}`}
                </div>
              </div>
            ))}
          </div>

          {/* Barra de Ações */}
          {selectedFile && (
            <div className="file-actions">
              <div style={{color: '#fff', marginRight: 'auto'}}>
                 Selecionado: <strong>{selectedFile.name}</strong>
              </div>
              
              {!selectedFile.is_folder && (
                <a href={selectedFile.file_url} target="_blank" rel="noreferrer" className="action-btn" style={{textDecoration:'none', color:'inherit'}}>
                   ⬇️ Baixar
                </a>
              )}
              
              <button className="action-btn" style={{borderColor:'#ff0055', color:'#ff0055'}} onClick={handleDelete}>
                 🗑️ Excluir
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL PASTA */}
      <Modal isOpen={isNewFolderOpen} onClose={() => setIsNewFolderOpen(false)} title="Nova Pasta">
        <div className="modal-form">
          <input className="modal-input" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder="Nome da pasta" autoFocus />
          <button className="btn-primary" onClick={handleCreateFolder} style={{marginTop:'10px'}}>Criar</button>
        </div>
      </Modal>

      {/* MODAL UPLOAD */}
      <Modal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} title="Upload de Arquivo">
        <div style={{textAlign:'center', padding:'30px', border:'2px dashed #444', borderRadius:'8px', color:'#aaa'}}>
          {uploading ? (
             <div style={{color:'var(--neon-green)'}}>Enviando arquivo... Aguarde.</div>
          ) : (
             <>
                <p style={{marginBottom: '20px'}}>Destino: <strong>{folderHistory[folderHistory.length - 1].name}</strong></p>
                <label className="btn-primary" style={{cursor: 'pointer', display: 'inline-block'}}>
                  Selecionar do Computador
                  <input type="file" style={{display: 'none'}} onChange={handleFileUpload} />
                </label>
             </>
          )}
        </div>
      </Modal>
    </div>
  );
}