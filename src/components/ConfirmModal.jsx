import React from 'react';

// ¡NUEVO! Agregamos la propiedad isLoading
function ConfirmModal({ isOpen, onClose, onConfirm, mensaje, isLoading }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>⚠️ Confirmar Acción</h3>
        <p>{mensaje}</p>
        <div className="modal-actions">
          {/* Bloqueamos el botón de cancelar si está cargando para que no se escape */}
          <button 
            className="btn" 
            style={{ backgroundColor: '#e5e7eb', color: '#374151' }} 
            onClick={onClose}
            disabled={isLoading} 
          >
            Cancelar
          </button>
          
          {/* Bloqueamos el botón de confirmar y cambiamos su texto */}
          <button 
            className="btn btn-danger" 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Eliminando... ⏳' : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;