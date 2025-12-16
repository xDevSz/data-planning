import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAlert } from '../../hooks/useAlert';
import './index.css';

// Ícones SVG simples para o olhinho
const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);
const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
);

export default function Login() {
  const navigate = useNavigate();
  const alertHook = useAlert();
  
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Estado do olhinho
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.email || !formData.password) {
      alertHook.notifyError('Preencha e-mail e senha.');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.login({
        email: formData.email,
        password: formData.password
      });

      if (response.profile) {
        localStorage.setItem('user_data', JSON.stringify(response.profile));
      }

      alertHook.notify(`Bem-vindo, ${response.profile?.full_name || 'Usuário'}!`);
      navigate('/dashboard/overview');

    } catch (err) {
      console.error(err);
      alertHook.notifyError("Falha no login. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("contato@dataro-it.com.br");
    alertHook.notify("E-mail copiado!");
  };

  return (
    <div className="login-container">
      <div className="login-bg-effect"></div>
      
      <div className="login-card">
        <div className="login-header">
          <h2>{recoveryMode ? 'Recuperar Acesso' : 'Acesso Corporativo'}</h2>
          <p>{recoveryMode ? 'Entre em contato com o suporte.' : 'Entre com suas credenciais.'}</p>
        </div>

        {!recoveryMode ? (
          <form onSubmit={handleLogin}>
            
            <div className="input-group">
              <label>E-mail</label>
              <input 
                type="email" 
                name="email" 
                className="custom-input" 
                placeholder="seu@email.com" 
                value={formData.email} 
                onChange={handleChange} 
                autoFocus
              />
            </div>

            <div className="input-group">
              <label>Senha</label>
              <div className="password-wrapper" style={{position: 'relative'}}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  className="custom-input" 
                  placeholder="••••••••" 
                  value={formData.password} 
                  onChange={handleChange} 
                  style={{paddingRight: '40px'}} // Espaço para o ícone
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#888',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? 'Autenticando...' : 'Entrar'}
            </button>
            
            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <button type="button" className="btn-link" onClick={() => setRecoveryMode(true)}>Esqueci minha Senha</button>
            </div>
            <button type="button" className="btn-link back-home" onClick={() => navigate('/')}>← Voltar para Home</button>
          </form>
        ) : (
          <div className="recovery-content" style={{textAlign: 'center', padding: '10px 0'}}>
            <div style={{fontSize: '3rem', marginBottom: '15px'}}>📧</div>
            <p style={{color: '#ddd', marginBottom: '20px', lineHeight: '1.5'}}>
              Para garantir a segurança dos dados da sua organização, a redefinição de senha é feita manualmente.
            </p>
            <p style={{color: '#888', fontSize: '0.9rem', marginBottom: '25px'}}>
              Por favor, envie um e-mail para:
            </p>
            
            <div 
              onClick={handleCopyEmail}
              style={{
                background: 'rgba(112, 0, 255, 0.1)', 
                padding: '12px', 
                borderRadius: '6px', 
                border: '1px dashed var(--neon-purple)',
                color: 'var(--neon-purple)',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginBottom: '30px',
                transition: '0.2s'
              }}
              title="Clique para copiar"
            >
              contato@dataro-it.com.br
            </div>

            <button type="button" className="btn-login" onClick={() => window.location.href = "mailto:contato@dataro-it.com.br"}>
               Abrir E-mail
            </button>
            <button type="button" className="btn-link" onClick={() => setRecoveryMode(false)} style={{marginTop: '15px'}}>
              Voltar ao Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}