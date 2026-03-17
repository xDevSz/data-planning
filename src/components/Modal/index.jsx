import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './index.css';

export default function Modal({ isOpen, onClose, title, children, centerOnMobile = false, maxWidth }) {
  
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // A MÁGICA: createPortal injeta o modal direto na raiz do site, 
  // imune a qualquer bug de CSS das divs de trás.
  return createPortal(
    <div 
      className={`modal-overlay ${centerOnMobile ? 'mobile-centered' : ''}`} 
      onClick={onClose}
    >
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={maxWidth ? { maxWidth: maxWidth } : {}}
      >
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
    </div>,
    document.body
  );
}