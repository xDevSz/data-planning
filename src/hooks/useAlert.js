import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export const useAlert = () => {
  
  // 1. Notificação de Sucesso (Canto superior)
  const notify = (message) => {
    MySwal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: message,
      showConfirmButton: false,
      timer: 3000,
      background: '#111',
      color: '#fff',
      iconColor: '#00ff94' // Neon Green
    });
  };

  // 2. Notificação de Erro
  const notifyError = (message) => {
    MySwal.fire({
      toast: true,
      position: 'top-end',
      icon: 'error',
      title: message,
      showConfirmButton: false,
      timer: 4000,
      background: '#111',
      color: '#fff',
      iconColor: '#ff0055' // Neon Red
    });
  };

  // 3. Confirmação (Sim/Não) - Ótimo para Excluir
  const confirm = async (title, text) => {
    const result = await MySwal.fire({
      title: title,
      text: text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, confirmar',
      cancelButtonText: 'Cancelar',
      background: '#111',
      color: '#fff',
      iconColor: '#ffcc00', // Yellow
      reverseButtons: true
    });
    return result.isConfirmed;
  };

  return { notify, notifyError, confirm };
};