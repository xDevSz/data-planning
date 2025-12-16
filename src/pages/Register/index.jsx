import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAlert } from '../../hooks/useAlert';
import './index.css';

export default function Register() {
  const navigate = useNavigate();
  const alertHook = useAlert();
  
  const [timeLeft, setTimeLeft] = useState(600);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    cnpj: '',
    companyName: '',
    logo: null,
    ceoName: '',
    ceoEmail: '',
    confirmEmail: '', // Novo campo
    ceoPassword: '',
    confirmPassword: '', // Novo campo
  });

  useEffect(() => {
    if (timeLeft === 0) { 
        alertHook.notifyError("Tempo esgotado! Redirecionando...");
        setTimeout(() => navigate('/'), 2000);
    }
    const timerId = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, navigate]);

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        if(file.size > 2 * 1024 * 1024) return alertHook.notifyError("A logo deve ter no máximo 2MB.");
        setFormData({ ...formData, logo: file });
        alertHook.notify("Logo selecionada!");
    }
  };

  const handleCNPJChange = (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length <= 14) v = v.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2');
    setFormData({ ...formData, cnpj: v });
  };

  const handleNext = async () => {
    // VALIDAÇÃO ETAPA 1
    if (step === 1) {
      if (formData.cnpj.length < 18) return alertHook.notifyError("CNPJ inválido (mínimo 14 dígitos).");
      if (!formData.companyName.trim()) return alertHook.notifyError("O nome da empresa é obrigatório.");
      setStep(2);
    } 
    // VALIDAÇÃO ETAPA 2 (SUBMIT)
    else if (step === 2) {
      if (!formData.ceoName.trim()) return alertHook.notifyError("Preencha seu nome completo.");
      
      // Validação de Email
      if (!formData.ceoEmail.includes('@') || !formData.ceoEmail.includes('.')) return alertHook.notifyError("E-mail inválido.");
      if (formData.ceoEmail !== formData.confirmEmail) return alertHook.notifyError("Os e-mails não conferem.");

      // Validação de Senha
      if (formData.ceoPassword.length < 6) return alertHook.notifyError("A senha deve ter pelo menos 6 caracteres.");
      if (formData.ceoPassword !== formData.confirmPassword) return alertHook.notifyError("As senhas não conferem.");
      
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
        
        alertHook.notify("Cadastro realizado com sucesso!");
        setStep(3);
      } catch (error) {
        console.error(error);
        alertHook.notifyError("Erro ao cadastrar: " + (error.message || "Tente novamente."));
      } finally {
        setLoading(false);
      }
    } 
    // FINAL
    else {
      navigate('/login');
    }
  };

  return (
    <div className="register-container">
      <div className={`timer-display ${timeLeft < 60 ? 'timer-critical' : ''}`}>
        TEMPO: {formatTime(timeLeft)}
      </div>

      <div className="form-card">
        <div className="form-header">
          <h2>
             {step === 1 && "1. Dados da Empresa"}
             {step === 2 && "2. Dados do CEO"}
             {step === 3 && "3. Concluído"}
          </h2>
          <div className="step-indicator">
             <div className={`step-dot ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}></div>
             <div className={`step-dot ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}></div>
             <div className={`step-dot ${step >= 3 ? 'active' : ''}`}></div>
          </div>
        </div>

        {step === 1 && (
          <div className="step-content">
            <div className="input-group">
              <label>Nome da Startup</label>
              <input type="text" name="companyName" className="custom-input" value={formData.companyName} onChange={handleChange} autoFocus placeholder="Ex: Nexus Tech" />
            </div>
            <div className="input-group">
              <label>CNPJ</label>
              <input type="text" name="cnpj" className="custom-input" value={formData.cnpj} onChange={handleCNPJChange} maxLength="18" placeholder="00.000.000/0001-00" />
            </div>
            <div className="input-group">
              <label>Logo (Opcional - Max 2MB)</label>
              <div className="file-input-wrapper">
                  <button className="btn-upload">{formData.logo ? `✅ ${formData.logo.name}` : '📁 Selecionar Imagem'}</button>
                  <input type="file" onChange={handleLogoChange} accept="image/*" />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-content">
            <div className="input-group">
              <label>Seu Nome Completo</label>
              <input type="text" name="ceoName" className="custom-input" value={formData.ceoName} onChange={handleChange} placeholder="Roberto Silva" />
            </div>
            
            <div className="input-group">
              <label>Seu E-mail Corporativo</label>
              <input type="email" name="ceoEmail" className="custom-input" value={formData.ceoEmail} onChange={handleChange} placeholder="roberto@nexus.tech" />
            </div>
            <div className="input-group">
              <label>Confirme o E-mail</label>
              <input type="email" name="confirmEmail" className="custom-input" value={formData.confirmEmail} onChange={handleChange} placeholder="Repita o e-mail" onPaste={(e) => e.preventDefault()} />
            </div>

            <div className="input-group">
              <label>Crie uma Senha Forte</label>
              <input type="password" name="ceoPassword" className="custom-input" value={formData.ceoPassword} onChange={handleChange} placeholder="******" />
            </div>
            <div className="input-group">
              <label>Confirme a Senha</label>
              <input type="password" name="confirmPassword" className="custom-input" value={formData.confirmPassword} onChange={handleChange} placeholder="Repita a senha" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step-content">
            <div style={{ padding: '40px', border: '1px solid var(--neon-green)', borderRadius: '8px', textAlign: 'center', background: 'rgba(0,255,148,0.05)' }}>
              <div style={{fontSize:'3rem', marginBottom:'20px'}}>🚀</div>
              <h2 style={{ color: 'var(--neon-green)', fontSize: '1.8rem', marginBottom: '15px' }}>CADASTRO REALIZADO!</h2>
              <p style={{color: '#ddd', fontSize:'1.1rem'}}>Sua startup <strong>{formData.companyName}</strong> já está ativa.</p>
              <p style={{color: '#888', fontSize:'0.9rem', marginTop:'20px'}}>Você será redirecionado para o login em instantes.</p>
            </div>
          </div>
        )}

        <div className="form-actions">
          {step > 1 && step < 3 && <button className="btn-back" onClick={() => setStep(step - 1)}>← Voltar</button>}
          
          <button className="btn-next" onClick={handleNext} disabled={loading} style={{marginLeft: step === 1 ? 'auto' : ''}}>
            {loading ? 'Processando...' : step === 3 ? 'Ir para Login ➔' : 'Próximo ➔'}
          </button>
        </div>
      </div>
    </div>
  );
}