import React, { useState, useEffect } from 'react';
import Navbar from '../../../components/Navbar';
import Modal from '../../../components/Modal';
import { appService } from '../../../services/appService';
import { useAlert } from '../../../hooks/useAlert';
import './index.css';

export default function Storage() {
  const alertHook = useAlert();
  
  // Estados de Dados
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Estados de Navegação
  const [currentFolder, setCurrentFolder] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: 'Início' }]);
  const [selectedFile, setSelectedFile] = useState(null);

  // Estados de Modal/Input
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  // Filtro Visual
  const [filterType, setFilterType] = useState('all');

  // --- CARREGAMENTO ---
  const loadData = async (folderId) => {
    setLoading(true);
    try {
      const data = await appService.getFiles(folderId);
      setFiles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      alertHook.notifyError("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(currentFolder);
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

  // --- SMART CLICK (ESSENCIAL PARA MOBILE) ---
  const handleCardClick = (file) => {
    // Se clicou no arquivo que JÁ estava selecionado -> Abre
    if (selectedFile?.id === file.id) {
        if (file.is_folder) handleEnterFolder(file);
        else window.open(file.file_url, '_blank');
    } else {
        // Se for outro arquivo -> Seleciona apenas
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
      alertHook.notify("Arquivo enviado!");
      await loadData(currentFolder);
    } catch (error) {
      alertHook.notifyError("Falha no upload.");
    } finally {
      setUploading(false);
      e.target.value = ''; 
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return alertHook.notifyError("Nome inválido");
    try {
      await appService.createFolder(newFolderName, currentFolder);
      setNewFolderName('');
      setIsNewFolderOpen(false);
      await loadData(currentFolder);
      alertHook.notify("Pasta criada.");
    } catch (error) {
      alertHook.notifyError("Erro ao criar pasta.");
    }
  };

  const handleDelete = async () => {
    if (!selectedFile) return;
    const confirm = await alertHook.confirm(
      "Tem certeza?", 
      selectedFile.is_folder ? "Apagar a pasta e todo o conteúdo?" : "Excluir arquivo permanentemente?"
    );

    if (confirm) {
      try {
        await appService.deleteFile(selectedFile.id, selectedFile.file_url, selectedFile.is_folder);
        setSelectedFile(null);
        await loadData(currentFolder);
        alertHook.notify("Item excluído.");
      } catch (error) {
        alertHook.notifyError("Erro ao excluir.");
      }
    }
  };

  // --- RENDERIZADORES ---
  const getFilteredFiles = () => {
    if (filterType === 'all') return files;
    if (filterType === 'docs') return files.filter(f => ['pdf', 'doc', 'txt'].includes(f.file_type) || f.is_folder);
    if (filterType === 'media') return files.filter(f => ['image', 'video'].includes(f.file_type) || f.is_folder);
    return files;
  };

  const renderIcon = (file) => {
    if (file.is_folder) return <span className="icon-folder">📁</span>;
    if (file.file_type === 'image') return <span className="icon-img">🖼️</span>;
    if (file.file_type === 'pdf') return <span className="icon-pdf">📄</span>;
    if (file.file_type === 'video') return <span className="icon-video">🎬</span>;
    return <span className="icon-default">📦</span>;
  };

  const displayedFiles = getFilteredFiles();

  return (
    <div className="storage-container">
      <Navbar />
      
      <div className="storage-content">
        
        <div className="storage-sidebar">
          <div className="sidebar-actions">
            <button className="btn-new-folder" onClick={() => setIsNewFolderOpen(true)}>+ Pasta</button>
            <label className={`btn-upload ${uploading ? 'disabled' : ''}`}>
              {uploading ? 'Enviando...' : '☁️ Upload'}
              <input type="file" hidden onChange={handleUpload} disabled={uploading} />
            </label>
          </div>
          <div className="separator"></div>
          <div className="sidebar-filters">
            <button className={`filter-btn ${filterType === 'all' ? 'active' : ''}`} onClick={() => setFilterType('all')}>Tudo</button>
            <button className={`filter-btn ${filterType === 'docs' ? 'active' : ''}`} onClick={() => setFilterType('docs')}>Docs</button>
            <button className={`filter-btn ${filterType === 'media' ? 'active' : ''}`} onClick={() => setFilterType('media')}>Mídia</button>
          </div>
        </div>

        <div className="storage-main">
          {/* Breadcrumbs */}
          <div className="breadcrumbs">
            {breadcrumbs.map((crumb, idx) => (
              <span key={idx} className="crumb-item" onClick={() => handleBreadcrumb(idx)}>
                {crumb.name} {idx < breadcrumbs.length - 1 && <span className="sep">/</span>}
              </span>
            ))}
          </div>

          {/* Grid */}
          <div className="files-area">
            {loading ? <div className="state-msg">Carregando...</div> : 
             displayedFiles.length === 0 ? <div className="state-msg">Pasta vazia 📂</div> : (
              <div className="files-grid">
                {displayedFiles.map(file => (
                  <div 
                    key={file.id} 
                    className={`file-card ${selectedFile?.id === file.id ? 'selected' : ''}`}
                    onClick={() => handleCardClick(file)} // Usa o clique inteligente
                  >
                    <div className="card-icon">{renderIcon(file)}</div>
                    <div className="card-info">
                      <span className="file-name">{file.name}</span>
                      <span className="file-meta">{file.is_folder ? 'Pasta' : file.size_text || 'Arquivo'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Barra Flutuante Mobile-Friendly */}
          {selectedFile && (
            <div className="floating-actions">
              <div className="selected-info-box">
                <span className="action-label">Selecionado:</span>
                <span className="selected-text">{selectedFile.name}</span>
              </div>
              
              <div className="action-buttons">
                {/* Botão ABRIR explícito para pastas */}
                {selectedFile.is_folder && (
                  <button className="act-btn open" onClick={() => handleEnterFolder(selectedFile)} title="Abrir">📂</button>
                )}

                {!selectedFile.is_folder && (
                  <button className="act-btn download" onClick={() => window.open(selectedFile.file_url)} title="Baixar">⬇️</button>
                )}
                
                <button className="act-btn delete" onClick={handleDelete} title="Excluir">🗑️</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isNewFolderOpen} onClose={() => setIsNewFolderOpen(false)} title="Nova Pasta">
        <div className="modal-form">
          <input className="modal-input" placeholder="Nome da pasta..." value={newFolderName} onChange={e => setNewFolderName(e.target.value)} autoFocus />
          <button className="btn-primary" onClick={handleCreateFolder}>Criar</button>
        </div>
      </Modal>
    </div>
  );
}