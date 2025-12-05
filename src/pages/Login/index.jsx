import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import './index.css';

export default function Login() {
  const navigate = useNavigate();
  const [recoveryMode, setRecoveryMode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    recoveryEmail: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.email || !formData.password) {
      setError('Preencha e-mail e senha.');
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

      navigate('/dashboard/overview');

    } catch (err) {
      console.error(err);
      setError("Falha no login. Verifique e-mail e senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-bg-effect"></div>
      
      <div className="login-card">
        <div className="login-header">
          <h2>{recoveryMode ? 'Recuperar Senha' : 'Acesso Corporativo'}</h2>
          <p>{recoveryMode ? 'Informe seu e-mail.' : 'Entre com suas credenciais.'}</p>
        </div>

        {error && <div className="error-msg">⚠️ {error}</div>}

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
              <input 
                type="password" 
                name="password" 
                className="custom-input" 
                placeholder="••••••••" 
                value={formData.password} 
                onChange={handleChange} 
              />
            </div>

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? 'Autenticando...' : 'Entrar'}
            </button>
            
            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <button type="button" className="btn-link" onClick={() => { setRecoveryMode(true); setError(''); }}>Esqueci minha Senha</button>
            </div>
            <button type="button" className="btn-link back-home" onClick={() => navigate('/')}>← Voltar para Home</button>
          </form>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); alert("Instruções enviadas!"); setRecoveryMode(false); }}>
            <div className="input-group">
              <label>E-mail Corporativo</label>
              <input type="email" name="recoveryEmail" className="custom-input" placeholder="seu.email@empresa.com" value={formData.recoveryEmail} onChange={handleChange} autoFocus />
            </div>
            <button type="submit" className="btn-login">Enviar Recuperação</button>
            <button type="button" className="btn-link" onClick={() => { setRecoveryMode(false); setError(''); }}>Cancelar</button>
          </form>
        )}
      </div>
    </div>
  );
}