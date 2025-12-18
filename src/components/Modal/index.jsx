import React, { useEffect } from 'react';
import './index.css';

export default function Modal({ isOpen, onClose, title, children, centerOnMobile = false }) {
  
  // Efeito para fechar com ESC e travar o scroll do fundo
  useEffect(() => {
    if (!isOpen) return;

    // 1. Função para capturar tecla ESC
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    // 2. Travar o scroll do body
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    // 3. Limpeza ao fechar (destrava scroll e remove listener)
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className={`modal-overlay ${centerOnMobile ? 'mobile-centered' : ''}`} 
      onClick={onClose}
    >
      {/* stopPropagation impede que clicar DENTRO do modal feche ele */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="btn-close" onClick={onClose} aria-label="Fechar">
            &times;
          </button>
        </div>
        
        <div className="modal-body">
          {children}
        </div>

      </div>
    </div>
  );
}