import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAlert } from '../../hooks/useAlert';
import { 
  Eye, EyeOff, Info, CheckCircle2, XCircle, 
  Building2, User, KeyRound, ShieldAlert, Mail, ArrowLeft 
} from 'lucide-react';
import './index.css';

// Componente de Tooltip Interno
const Tooltip = ({ text }) => (
  <div className="tooltip-container">
    <Info size={14} className="text-neon-purple tooltip-icon" />
    <span className="tooltip-text">{text}</span>
  </div>
);

export default function Register() {
  const navigate = useNavigate();
  const alertHook = useAlert();
  
  const [timeLeft, setTimeLeft] = useState(600);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Toggles de UI
  const [hasCnpj, setHasCnpj] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [cnpjLoading, setCnpjLoading] = useState(false);

  // Estado para receber dados da API e ir pro Banco
  const [formData, setFormData] = useState({
    cnpj: '',
    companyName: '',
    cnae: '',
    address: '',
    legalStatus: '',
    logo: null,
    ceoName: '',
    ceoEmail: '',
    confirmEmail: '',
    ceoPassword: '',
    confirmPassword: '',
  });

  const [emailValid, setEmailValid] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false, upper: false, lower: false, num: false, special: false
  });

  useEffect(() => {
    console.log('%c[DATA-PLANNER] %cMódulo de Cadastro Seguro Inicializado 🚀', 'color: #7000ff; font-weight: bold;', 'color: #00ff94;');
    
    if (timeLeft === 0) { 
        console.warn('%c[DATA-PLANNER] Timeout: Sessão de cadastro expirada.', 'color: #ffb800;');
        alertHook.notifyError("Tempo esgotado por segurança! Redirecionando...");
        setTimeout(() => navigate('/'), 2000);
    }
    const timerId = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, navigate]);

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'ceoEmail') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setEmailValid(emailRegex.test(value));
    }

    if (name === 'ceoPassword') {
      setPasswordStrength({
        length: value.length >= 6,
        upper: /[A-Z]/.test(value),
        lower: /[a-z]/.test(value),
        num: /[0-9]/.test(value),
        special: /[^A-Za-z0-9]/.test(value)
      });
    }
  };
  
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        if(file.size > 2 * 1024 * 1024) {
          return alertHook.notifyError("A logo deve ter no máximo 2MB.");
        }
        setFormData({ ...formData, logo: file });
        alertHook.notify("Logo anexada com sucesso!");
    }
  };

  const handleCNPJChange = async (e) => {
    let v = e.target.value.replace(/\D/g, '');
    
    if (v.length <= 14) {
      let formatted = v;
      if (v.length > 2) formatted = v.replace(/^(\d{2})(\d)/, '$1.$2');
      if (v.length > 5) formatted = formatted.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      if (v.length > 8) formatted = formatted.replace(/\.(\d{3})(\d)/, '.$1/$2');
      if (v.length > 12) formatted = formatted.replace(/(\d{4})(\d)/, '$1-$2');
      
      setFormData({ ...formData, cnpj: formatted });

      if (v.length === 14) {
        setCnpjLoading(true);
        try {
          const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${v}`);
          if (!response.ok) throw new Error("CNPJ não encontrado ou irregular.");
          
          const data = await response.json();
          const fullAddress = `${data.logradouro}, ${data.numero}, ${data.bairro}, ${data.municipio}-${data.uf}`;
          
          setFormData(prev => ({ 
            ...prev, 
            companyName: data.razao_social,
            cnae: data.cnae_fiscal_descricao,
            address: fullAddress,
            legalStatus: data.descricao_situacao_cadastral
          }));
          
          alertHook.notify("CNPJ validado! Dados da instituição importados.");
        } catch (error) {
          alertHook.notifyError("Erro ao buscar CNPJ. Verifique o número.");
          setFormData(prev => ({ ...prev, companyName: '', cnae: '', address: '', legalStatus: '' }));
        } finally {
          setCnpjLoading(false);
        }
      }
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      if (hasCnpj && formData.cnpj.length < 18) return alertHook.notifyError("Preencha os 14 dígitos do CNPJ.");
      if (!formData.companyName.trim()) return alertHook.notifyError("A Razão Social é obrigatória.");
      if (hasCnpj && formData.legalStatus && formData.legalStatus !== 'ATIVA') {
        alertHook.notify("Atenção: O status na Receita não é 'ATIVA'.", 'warning');
      }
      setStep(2);
    } 
    else if (step === 2) {
      if (!formData.ceoName.trim()) return alertHook.notifyError("Seu nome é obrigatório.");
      if (!emailValid) return alertHook.notifyError("E-mail corporativo inválido.");
      if (formData.ceoEmail !== formData.confirmEmail) return alertHook.notifyError("Os e-mails diferem.");
      
      const allPasswordRulesMet = Object.values(passwordStrength).every(Boolean);
      if (!allPasswordRulesMet) return alertHook.notifyError("A senha não atende aos requisitos.");
      if (formData.ceoPassword !== formData.confirmPassword) return alertHook.notifyError("As senhas não coincidem.");
      
      setLoading(true);
      
      try {
        await authService.registerStartup({
          email: formData.ceoEmail,
          password: formData.ceoPassword,
          companyName: formData.companyName,
          cnpj: formData.cnpj,
          ceoName: formData.ceoName,
          cnae: formData.cnae,
          address: formData.address,
          legalStatus: formData.legalStatus,
          logoFile: formData.logo
        });
        
        alertHook.notify("Infraestrutura alocada com sucesso!");
        setStep(3);

      } catch (error) {
        if (error.message === "CNPJ_EXISTS") alertHook.notifyError("Este CNPJ já possui uma conta ativa.");
        else if (error.message === "EMAIL_EXISTS") alertHook.notifyError("Este e-mail já está vinculado a outro cadastro.");
        else alertHook.notifyError("Falha de conexão com a base de dados. Tente novamente.");
      } finally {
        setLoading(false);
      }
    } 
    else {
      navigate('/login');
    }
  };

  return (
    <div className="register-wrapper">
      {/* Botão de Voltar para Home FIXO */}
      <button className="btn-back-home-fixed" onClick={() => navigate('/')}>
        <ArrowLeft size={16} /> Início
      </button>

      {/* Timer de Sessão */}
      <div className={`timer-display ${timeLeft < 60 ? 'timer-critical' : ''}`}>
        <ShieldAlert size={16} style={{marginRight: '8px'}} />
        SESSÃO: {formatTime(timeLeft)}
      </div>

      {/* Shapes de Fundo (Mesmo estilo do Login) */}
      <div className="bg-shape shape-1"></div>
      <div className="bg-shape shape-2"></div>

      <div className="register-card">
        <div className="form-header">
          <h2>
             {step === 1 && <><Building2 className="mr-2 text-neon-purple"/> Dados da Instituição</>}
             {step === 2 && <><User className="mr-2 text-cyber-blue"/> Credenciais de Acesso</>}
             {step === 3 && <><CheckCircle2 className="mr-2 text-neon-green"/> Infraestrutura Pronta</>}
          </h2>
          <div className="step-indicator">
             <div className={`step-dot ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}></div>
             <div className={`step-dot ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}></div>
             <div className={`step-dot ${step >= 3 ? 'active' : ''}`}></div>
          </div>
        </div>

        {step === 1 && (
          <div className="step-content fade-in">
            
            <div className="cnpj-toggle-group">
              <label className="toggle-label">A instituição possui CNPJ?</label>
              <div className="toggle-switch" onClick={() => {
                setHasCnpj(!hasCnpj);
                if(hasCnpj) setFormData({...formData, cnpj: '', companyName: '', cnae: '', address: '', legalStatus: ''});
              }}>
                <div className={`toggle-slider ${hasCnpj ? 'on' : 'off'}`}></div>
                <span className="toggle-text">{hasCnpj ? 'SIM' : 'NÃO'}</span>
              </div>
            </div>

            {hasCnpj && (
              <div className="input-group">
                <label>CNPJ Oficial <Tooltip text="Apenas números. Buscaremos o CNAE, Situação e Endereço automaticamente via Brasil API." /></label>
                <div className="input-wrapper">
                  <input type="text" name="cnpj" className="custom-input" value={formData.cnpj} onChange={handleCNPJChange} maxLength="18" placeholder="00.000.000/0001-00" />
                  {cnpjLoading && <div className="loader-spinner"></div>}
                </div>
              </div>
            )}

            <div className="input-group">
              <label>{hasCnpj ? 'Razão Social' : 'Nome da Organização'} <Tooltip text="Nome principal do projeto ou empresa." /></label>
              <input 
                type="text" 
                name="companyName" 
                className={`custom-input ${hasCnpj && formData.companyName ? 'input-locked' : ''}`} 
                value={formData.companyName} 
                onChange={handleChange} 
                readOnly={hasCnpj && formData.companyName !== ''}
                placeholder={hasCnpj ? "Preenchimento automático via CNPJ" : "Ex: Nexus Inteligência"} 
                maxLength="80"
              />
            </div>

            {hasCnpj && formData.cnae && (
              <div className="api-data-display fade-in">
                <div className="data-row"><span className="label">CNAE:</span> {formData.cnae}</div>
                <div className="data-row"><span className="label">Endereço:</span> {formData.address}</div>
                <div className="data-row"><span className="label">Situação:</span> <span className={formData.legalStatus === 'ATIVA' ? 'text-neon-green' : 'text-red'}>{formData.legalStatus}</span></div>
              </div>
            )}

            <div className="input-group">
              <label>Identidade Visual (Logo) <span className="label-optional">(Opcional)</span> <Tooltip text="Recomendado: PNG ou JPG com fundo transparente." /></label>
              <div className="file-input-wrapper">
                  <button className="btn-upload">{formData.logo ? `✅ ${formData.logo.name}` : '📁 Selecionar Arquivo (Max 2MB)'}</button>
                  <input type="file" onChange={handleLogoChange} accept="image/png, image/jpeg" />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-content fade-in">
            <div className="input-group">
              <label>Nome do Administrador Principal <Tooltip text="Este será o perfil do proprietário (Owner) da workspace." /></label>
              <input type="text" name="ceoName" className="custom-input" value={formData.ceoName} onChange={handleChange} placeholder="Roberto Silva" maxLength="60" />
            </div>
            
            <div className="input-row">
              <div className="input-group w-50">
                <label>E-mail de Acesso Corporativo</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input type="email" name="ceoEmail" className="custom-input with-icon" value={formData.ceoEmail} onChange={handleChange} placeholder="roberto@empresa.com" maxLength="60" />
                  {emailValid === true && <CheckCircle2 size={18} className="status-icon text-neon-green" />}
                  {emailValid === false && formData.ceoEmail.length > 0 && <XCircle size={18} className="status-icon text-red" />}
                </div>
              </div>

              <div className="input-group w-50">
                <label>Confirmação de E-mail <Tooltip text="Ação de segurança (O botão Colar está desativado)." /></label>
                <input type="email" name="confirmEmail" className="custom-input" value={formData.confirmEmail} onChange={handleChange} placeholder="Digite novamente" onPaste={(e) => { e.preventDefault(); alertHook.notifyError("Digite o e-mail manualmente por segurança."); }} maxLength="60" />
              </div>
            </div>

            <div className="input-row">
              <div className="input-group w-50">
                <label>Senha Criptografada <Tooltip text="Sua senha será protegida em nossa base com Salt+Hash." /></label>
                <div className="input-wrapper">
                  <KeyRound className="input-icon" size={18} />
                  <input type={showPassword ? "text" : "password"} name="ceoPassword" className="custom-input with-icon" value={formData.ceoPassword} onChange={handleChange} placeholder="Sua senha" maxLength="32" />
                  <button type="button" className="btn-toggle-pass" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="input-group w-50">
                <label>Confirmação de Senha</label>
                <div className="input-wrapper">
                  <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" className="custom-input" value={formData.confirmPassword} onChange={handleChange} placeholder="Repita a senha" maxLength="32" />
                  <button type="button" className="btn-toggle-pass" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Painel de Força da Senha */}
            <div className="password-rules-panel">
              <p className="rules-title">A matriz de segurança exige:</p>
              <ul className="rules-list">
                <li className={passwordStrength.length ? 'valid' : ''}>{passwordStrength.length ? '✓' : '○'} Mínimo 6 caracteres</li>
                <li className={passwordStrength.upper ? 'valid' : ''}>{passwordStrength.upper ? '✓' : '○'} Letra Maiúscula</li>
                <li className={passwordStrength.lower ? 'valid' : ''}>{passwordStrength.lower ? '✓' : '○'} Letra Minúscula</li>
                <li className={passwordStrength.num ? 'valid' : ''}>{passwordStrength.num ? '✓' : '○'} Pelo menos 1 número</li>
                <li className={passwordStrength.special ? 'valid' : ''}>{passwordStrength.special ? '✓' : '○'} Símbolo Especial (@, #, !)</li>
              </ul>
            </div>

          </div>
        )}

        {step === 3 && (
          <div className="step-content fade-in">
            <div className="success-panel">
              <div className="success-icon pulse-animation">🚀</div>
              <h2 className="success-title">ACESSO LIBERADO!</h2>
              <p className="success-text">O banco de dados e a infraestrutura da <strong>{formData.companyName}</strong> foram criados com sucesso.</p>
              <div className="success-divider"></div>
              <p className="success-subtext">Você já pode acessar o sistema utilizando o seu e-mail e senha cadastrados.</p>
            </div>
          </div>
        )}

        <div className="form-actions">
          {step > 1 && step < 3 && <button className="btn-back" onClick={() => setStep(step - 1)}>← Corrigir Dados</button>}
          
          <button className={`btn-next ${step === 1 && !hasCnpj ? 'w-100' : ''}`} onClick={handleNext} disabled={loading} style={{marginLeft: step === 1 ? 'auto' : ''}}>
            {loading ? <div className="loader-spinner small"></div> : step === 3 ? 'Acessar Plataforma ➔' : 'Validar e Avançar ➔'}
          </button>
        </div>
      </div>
    </div>
  );
}