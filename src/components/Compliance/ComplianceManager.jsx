import React, { useState, useEffect } from 'react';
import Modal from '../Modal'; // Certifique-se que o caminho está certo
import { TERMS_AND_CONDITIONS, PRIVACY_POLICY } from '../../utils/LegalTexts';
import './Compliance.css'; // Seu CSS do banner de cookies continua aqui

export default function ComplianceManager() {
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);

  useEffect(() => {
    // 1. Checa Cookies
    const consent = localStorage.getItem('dataplanning_consent');
    if (!consent) {
      setShowCookieBanner(true);
    }

    // 2. Checa se já fizemos o "Setup Inicial" (Permissões)
    const setupDone = localStorage.getItem('dataplanning_setup');
    if (consent && !setupDone) {
      setTimeout(() => setShowPermissionsModal(true), 1000); 
    }
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem('dataplanning_consent', 'true');
    setShowCookieBanner(false);
    setTimeout(() => setShowPermissionsModal(true), 500);
  };

  const handleOptimizationFinish = () => {
    localStorage.setItem('dataplanning_setup', 'true');
    if ('Notification' in window) {
      Notification.requestPermission();
    }
    setShowPermissionsModal(false);
  };

  const renderText = (text) => {
    return text.split('\n').map((line, i) => (
      <p key={i} className={`legal-line ${line.startsWith('**') ? 'legal-title' : ''}`}>
        {line.replace(/\*\*/g, '')}
      </p>
    ));
  };

  return (
    <>
      {/* BANNER DE COOKIES (Rodapé) */}
      {showCookieBanner && (
        <div className="cookie-banner-overlay">
          <div className="cookie-banner">
            <div className="cookie-content">
              <h3>🍪 Privacidade e Transparência</h3>
              <p>
                A <strong>DATA-RO</strong> utiliza cookies para garantir o desempenho.
                Ao continuar, você concorda com nossa{' '}
                <button className="link-btn" onClick={() => setShowPrivacyModal(true)}>Política de Privacidade</button>
                {' '}e{' '}
                <button className="link-btn" onClick={() => setShowTermsModal(true)}>Termos de Uso</button>.
              </p>
            </div>
            <div className="cookie-actions">
              <button className="btn-accept" onClick={handleAcceptCookies}>Aceitar e Continuar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE OTIMIZAÇÃO / PERMISSÕES */}
      {/* AQUI ESTÁ A MÁGICA: centerOnMobile={true} */}
      <Modal 
        isOpen={showPermissionsModal} 
        onClose={() => {}} 
        title="Otimizando Experiência 🚀"
        centerOnMobile={true}
      >
        <div className="opt-modal-content">
          <p className="opt-desc">Para que o <strong>Data Planning</strong> funcione com performance máxima, precisamos configurar seu ambiente.</p>
          
          <div className="opt-list">
            <div className="opt-item">
              <span className="opt-icon">💾</span>
              <div>
                <strong>Cache Local</strong>
                <small>Carregamento instantâneo.</small>
              </div>
              <span className="check-icon">✅</span>
            </div>
            <div className="opt-item">
              <span className="opt-icon">🔔</span>
              <div>
                <strong>Notificações</strong>
                <small>Alertas de tarefas (requer permissão).</small>
              </div>
              <span className="status-pending">Pendente</span>
            </div>
            <div className="opt-item">
              <span className="opt-icon">🔒</span>
              <div>
                <strong>Segurança SSL</strong>
                <small>Conexão criptografada ativa.</small>
              </div>
              <span className="check-icon">✅</span>
            </div>
          </div>

          <button className="btn-optimize" onClick={handleOptimizationFinish}>
            Autorizar e Iniciar
          </button>
        </div>
      </Modal>

      {/* MODAL TERMOS (Sem a prop, então cola no fundo no mobile) */}
      <Modal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} title="Termos de Uso">
        <div className="legal-scroll-area">
          {renderText(TERMS_AND_CONDITIONS)}
        </div>
        <div className="legal-footer">
          <button className="btn-legal-close" onClick={() => setShowTermsModal(false)}>Entendi</button>
        </div>
      </Modal>

      {/* MODAL PRIVACIDADE */}
      <Modal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} title="Política de Privacidade">
        <div className="legal-scroll-area">
          {renderText(PRIVACY_POLICY)}
        </div>
        <div className="legal-footer">
          <button className="btn-legal-close" onClick={() => setShowPrivacyModal(false)}>Entendi</button>
        </div>
      </Modal>
    </>
  );
}