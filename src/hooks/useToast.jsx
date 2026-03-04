import { useState } from 'react';

function useToast() {
  const [toast, setToast] = useState({ visible: false, mensaje: '', tipo: '' });

  const mostrarNotificacion = (mensaje, tipo) => {
    setToast({ visible: true, mensaje, tipo });
    
    // Oculta el toast después de 3 segundos
    setTimeout(() => {
      setToast({ visible: false, mensaje: '', tipo: '' });
    }, 3000);
  };

  // Creamos un mini-componente interno que ya sabe cómo renderizarse
  const ToastComponent = () => {
    if (!toast.visible) return null;
    
    return (
      <div className={`toast-container toast-${toast.tipo}`}>
        {toast.mensaje}
      </div>
    );
  };

  // El hook devuelve la función para mostrar y el componente para renderizar
  return { mostrarNotificacion, ToastComponent };
}

export default useToast;