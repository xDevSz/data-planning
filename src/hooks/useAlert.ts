import Swal, { SweetAlertIcon } from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export const useAlert = () => {
  
  // 1. Notificação Genérica (Toast no canto)
  const notify = (message: string, iconType: SweetAlertIcon = 'success') => {
    MySwal.fire({
      toast: true,
      position: 'top-end',
      icon: iconType,
      title: message,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      background: '#0a0a0a', 
      color: '#fff',
      iconColor: iconType === 'success' ? '#00ff94' : (iconType === 'warning' ? '#ffb800' : '#00e5ff')
    });
  };

  // 2. Notificação de Erro (Toast no canto)
  const notifyError = (message: string) => {
    MySwal.fire({
      toast: true,
      position: 'top-end',
      icon: 'error',
      title: message,
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      background: '#0a0a0a',
      color: '#fff',
      iconColor: '#ff0055'   // Neon Red
    });
  };

  // 3. Confirmação (Modal Central)
  const confirm = async (title: string, text: string, confirmBtnText: string = 'Sim, confirmar'): Promise<boolean> => {
    const result = await MySwal.fire({
      title: title,
      text: text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: confirmBtnText,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#00ff94', // Neon Green
      cancelButtonColor: '#ff0055',  // Neon Red
      background: '#0a0a0a',
      color: '#fff',
      iconColor: '#ffcc00', // Yellow
      reverseButtons: true,
      customClass: {
        popup: 'cyber-alert-popup'
      }
    });
    return result.isConfirmed;
  };

  // 4. Input de Texto (Ex: "Nome da Pasta")
  const prompt = async (title: string, placeholder: string = 'Digite aqui...'): Promise<string | undefined> => {
    const { value } = await MySwal.fire({
      title: title,
      input: 'text',
      inputPlaceholder: placeholder,
      showCancelButton: true,
      confirmButtonText: 'Salvar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#7000ff', // Neon Purple
      background: '#0a0a0a',
      color: '#fff',
      customClass: {
        input: 'cyber-alert-input'
      },
      inputValidator: (value) => {
        if (!value) {
          return 'Você precisa escrever algo!';
        }
        return null;
      }
    });
    return value;
  };

  return { notify, notifyError, confirm, prompt };
};