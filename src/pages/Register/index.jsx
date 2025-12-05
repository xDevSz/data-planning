import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import './index.css';

export default function Register() {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(600);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    cnpj: '',
    companyName: '',
    logo: null,
    ceoName: '',
    ceoEmail: '',
    ceoPassword: '',
  });

  useEffect(() => {
    if (timeLeft === 0) { navigate('/'); }
    const timerId = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, navigate]);

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) setFormData({ ...formData, logo: file });
  };

  const handleCNPJChange = (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length <= 14) v = v.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2');
    setFormData({ ...formData, cnpj: v });
  };

  const handleNext = async () => {
    if (step === 1) {
      if (formData.cnpj.length < 18 || !formData.companyName) return alert("Preencha a empresa.");
      setStep(2);
    } 
    else if (step === 2) {
      if (!formData.ceoName || !formData.ceoEmail || !formData.ceoPassword) {
        return alert("Preencha todos os dados.");
      }
      
      setLoading(true);
      try {
        await authService.registerStartup({
          email: formData.ceoEmail,
          password: formData.ceoPassword,
          companyName: formData.companyName,
          cnpj: formData.cnpj,
          ceoName: formData.ceoName,
          logoFile: formData.logo
        });
        setStep(3);
      } catch (error) {
        console.error(error);
        alert("Erro ao cadastrar: " + error.message);
      } finally {
        setLoading(false);
      }
    } 
    else {
      navigate('/login');
    }
  };

  return (
    <div className="register-container">
      <div className="timer-display">TEMPO: {formatTime(timeLeft)}</div>

      <div className="form-card">
        <div className="form-header">
          <h2>{step === 1 ? "1. Empresa" : step === 2 ? "2. CEO & Acesso" : "3. Concluído"}</h2>
        </div>

        {step === 1 && (
          <div className="step-content">
            <div className="input-group">
              <label>Nome da Startup</label>
              <input type="text" name="companyName" className="custom-input" value={formData.companyName} onChange={handleChange} autoFocus />
            </div>
            <div className="input-group">
              <label>CNPJ</label>
              <input type="text" name="cnpj" className="custom-input" value={formData.cnpj} onChange={handleCNPJChange} maxLength="18" />
            </div>
            <div className="input-group">
              <label>Logo (Opcional)</label>
              <div className="file-input-wrapper">
                  <button className="btn-upload">{formData.logo ? `Arquivo: ${formData.logo.name}` : 'Selecionar Logo'}</button>
                  <input type="file" onChange={handleLogoChange} accept="image/*" />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-content">
            <div className="input-group">
              <label>Nome Completo</label>
              <input type="text" name="ceoName" className="custom-input" value={formData.ceoName} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>E-mail</label>
              <input type="email" name="ceoEmail" className="custom-input" value={formData.ceoEmail} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label>Senha</label>
              <input type="password" name="ceoPassword" className="custom-input" value={formData.ceoPassword} onChange={handleChange} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step-content">
            <div style={{ padding: '30px', border: '1px solid var(--neon-green)', borderRadius: '8px', textAlign: 'center' }}>
              <h2 style={{ color: 'var(--neon-green)', fontSize: '1.5rem', marginBottom: '10px' }}>CADASTRO SUCESSO!</h2>
              <p style={{color: '#ddd'}}>Sua startup foi registrada.</p>
              <p style={{color: '#888', fontSize:'0.9rem', marginTop:'10px'}}>Use seu <strong>E-mail</strong> e <strong>Senha</strong> para entrar.</p>
            </div>
          </div>
        )}

        <div className="form-actions">
          {step > 1 && step < 3 && <button className="btn-back" onClick={() => setStep(step - 1)}>Voltar</button>}
          <button className="btn-next" onClick={handleNext} disabled={loading}>
            {loading ? 'Salvando...' : step === 3 ? 'Ir para Login' : 'Próximo'}
          </button>
        </div>
      </div>
    </div>
  );
}