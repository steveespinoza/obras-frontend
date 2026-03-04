// src/context/ToastContext.jsx
import { createContext, useState } from 'react';

// 1. Creamos el contexto
export const ToastContext = createContext();

// 2. Creamos el proveedor que envolverá nuestra app
export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ visible: false, mensaje: '', tipo: '' });

  const mostrarNotificacion = (mensaje, tipo) => {
    setToast({ visible: true, mensaje, tipo });
    
    setTimeout(() => {
      setToast({ visible: false, mensaje: '', tipo: '' });
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ mostrarNotificacion }}>
      {children}
      
      {/* 3. Renderizamos el diseño del Toast a nivel global */}
      {toast.visible && (
        <div className={`toast-container toast-${toast.tipo}`}>
          {toast.mensaje}
        </div>
      )}
    </ToastContext.Provider>
  );
}