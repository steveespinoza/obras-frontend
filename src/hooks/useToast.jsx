// src/hooks/useToast.js
import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext';

function useToast() {
  const context = useContext(ToastContext);
  
  // Buena práctica: avisar si olvidamos envolver la app en el provider
  if (!context) {
    throw new Error("useToast debe usarse dentro de un ToastProvider");
  }
  
  return context; // Esto devuelve directamente { mostrarNotificacion }
}

export default useToast;