import React from 'react';

function ConfirmModal({ isOpen, onClose, onConfirm, mensaje }) {
  if (!isOpen) return null; // Si no está abierto, no renderiza nada

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>⚠️ Confirmar Acción</h3>
        <p>{mensaje}</p>
        <div className="modal-actions">
          {/* Botón para cancelar */}
          <button className="btn" style={{ backgroundColor: '#e5e7eb', color: '#374151' }} onClick={onClose}>
            Cancelar
          </button>
          {/* Botón para confirmar (Eliminar) */}
          <button className="btn btn-danger" onClick={onConfirm}>
            Sí, eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;