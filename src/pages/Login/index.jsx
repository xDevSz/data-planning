import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAlert } from '../../hooks/useAlert';
import { 
  Eye, EyeOff, Mail, KeyRound, ArrowLeft, Send, ShieldAlert, Copy, CheckCircle2 
} from 'lucide-react';
import './index.css';

import logoPlanner from '../../assets/logo.png'; // Logo do Sistema

export default function Login() {
  const navigate = useNavigate();
  const alertHook = useAlert();
  
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [keepLogged, setKeepLogged] = useState(false); // Manter conectado
  const [copied, setCopied] = useState(false); // Feedback visual do copy
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    console.log('%c[DATA-PLANNER] %cMódulo de Autenticação Ativo 🔒', 'color: #7000ff; font-weight: bold;', 'color: #00ff94;');
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!formData.email.trim() || !formData.password.trim()) {
      alertHook.notifyError('Preencha as credenciais corporativas.');
      return;
    }

    setLoading(true);

    try {
      console.log('%c[DATA-PLANNER] Autenticando usuário...', 'color: #00e5ff;');
      
      const response = await authService.login({
        email: formData.email,
        password: formData.password
      });

      // Lógica de Manter Conectado (Opcional, depende de como o Supabase está configurado localmente)
      if (keepLogged) {
         localStorage.setItem('keep_logged', 'true');
      } else {
         localStorage.removeItem('keep_logged');
      }

      console.log('%c[DATA-PLANNER] Autenticação bem-sucedida.', 'color: #00ff94; font-weight: bold;');
      
      const userName = response.profile?.name || 'Gestor';
      alertHook.notify(`Acesso Liberado. Bem-vindo(a), ${userName}!`);
      
      navigate('/dashboard/overview');

    } catch (err) {
      console.warn('%c[DATA-PLANNER] Falha na Autenticação:', 'color: #ffb800;', err.message);
      
      if (err.message.includes('Invalid login credentials')) {
        alertHook.notifyError("E-mail ou senha incorretos.");
      } else if (err.message.includes('Email not confirmed')) {
        alertHook.notifyError("Seu e-mail ainda não foi validado.");
      } else {
        alertHook.notifyError("Falha de conexão. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("contato@dataro-it.com.br");
    setCopied(true);
    alertHook.notify("E-mail copiado para a área de transferência!");
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="login-container">
      {/* Background Shapes animadas para consistência com a Home */}
      <div className="bg-shape shape-1"></div>
      <div className="bg-shape shape-2"></div>
      
      <div className="login-card fade-in">
        
        <div className="login-logo-wrapper">
          <img src={logoPlanner} alt="Data-Planner Logo" className="login-logo" />
        </div>

        <div className="login-header">
          <h2>{recoveryMode ? 'Recuperar Acesso' : 'Acesso Corporativo'}</h2>
          <p>{recoveryMode ? 'Central de suporte DATA-RO.' : 'Entre com suas credenciais protegidas.'}</p>
        </div>

        {!recoveryMode ? (
          <form onSubmit={handleLogin} className="fade-in">
            
            <div className="input-group">
              <label>E-mail</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input 
                  type="email" 
                  name="email" 
                  className="custom-input with-icon" 
                  placeholder="gestor@startup.com" 
                  value={formData.email} 
                  onChange={handleChange} 
                  autoFocus
                  disabled={loading}
                />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: '15px' }}>
              <label>Senha</label>
              <div className="input-wrapper">
                <KeyRound className="input-icon" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  className="custom-input with-icon" 
                  placeholder="••••••••" 
                  value={formData.password} 
                  onChange={handleChange} 
                  disabled={loading}
                />
                <button 
                  type="button" 
                  className="btn-toggle-pass"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  tabIndex="-1" 
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Manter conectado e Esqueci a senha na mesma linha */}
            <div className="login-options-row">
               <label className="checkbox-container">
                  <input 
                    type="checkbox" 
                    checked={keepLogged} 
                    onChange={() => setKeepLogged(!keepLogged)}
                    disabled={loading}
                  />
                  <span className="checkmark"></span>
                  <span className="checkbox-label">Manter-me conectado</span>
               </label>
               
               <button type="button" className="btn-link-small" onClick={() => setRecoveryMode(true)}>
                 Esqueceu a senha?
               </button>
            </div>

            <button type="submit" className="btn-primary login-submit-btn" disabled={loading}>
              {loading ? <div className="loader-spinner small"></div> : 'Autenticar ➔'}
            </button>
            
            <div className="login-footer-actions">
              <button type="button" className="btn-back-home" onClick={() => navigate('/')}>
                <ArrowLeft size={16} /> Voltar para o Início
              </button>
            </div>
          </form>
        ) : (
          <div className="recovery-content fade-in">
            <div className="recovery-icon-box pulse-slow">
              <ShieldAlert size={48} className="text-alert-yellow" />
            </div>
            
            <p className="recovery-instruction">
              Para garantir a rigorosa segurança da sua organização, a redefinição de senhas administradoras é feita <strong>exclusivamente pela equipe de infraestrutura.</strong>
            </p>
            <p className="recovery-sub">
              Solicite a alteração de credencial enviando um e-mail para nossa central:
            </p>
            
            <div className={`recovery-email-box ${copied ? 'copied' : ''}`} onClick={handleCopyEmail} title="Clique para copiar">
              <span>contato@dataro-it.com.br</span>
              {copied ? <CheckCircle2 size={20} className="text-neon-green" /> : <Copy size={20} />}
            </div>

            <button type="button" className="btn-primary w-100 mb-3" onClick={() => window.location.href = "mailto:contato@dataro-it.com.br"}>
               <Send size={18} style={{marginRight: '8px'}} /> Abrir E-mail
            </button>
            
            <button type="button" className="btn-back-home w-100 justify-center mt-2" onClick={() => setRecoveryMode(false)}>
              <ArrowLeft size={16} /> Retornar ao Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}