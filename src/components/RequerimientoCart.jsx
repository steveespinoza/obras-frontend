import React from 'react';

function RequerimientoCart({ carrito, editIndex, onEdit, onRemove,loading }) {
  return (
    <div className="req-cart-section">
      <h4 className="req-cart-header">
        📦 Materiales en este Pedido 
        <span className="req-cart-badge">{carrito.length}</span>
      </h4>
      
      {carrito.length === 0 ? (
        <div className="req-cart-empty">
          <p className="empty-text-main">Aún no has agregado materiales a este requerimiento.</p>
          <p className="empty-text-sub">Usa el formulario de arriba para empezar a añadir.</p>
        </div>
      ) : (
        <div className="req-cart-list">
          {carrito.map((item, index) => (
            <div key={index} className={`req-cart-item ${editIndex === index ? 'is-editing' : ''}`}>
              
              <div className="req-item-info">
                <h5 className="req-item-name">{item.name}</h5>
                <span className="req-item-brand">
                  🏷️ Marca: {item.brand}
                </span>
              </div>

              <div className="req-item-qty-box">
                <div className="req-item-qty">{item.quantity}</div>
                <div className="req-item-unit">{item.unit}</div>
              </div>

              <div className="req-item-actions">
                <button 
                  type="button" 
                  className="btn-edit-item" 
                  onClick={() => onEdit(index)}
                  disabled={loading} // <--- Bloqueamos si está guardando
                >
                  ✏️ Editar
                </button>

                <button 
                  type="button" 
                  className="btn-delete-item" 
                  onClick={() => onRemove(index)}
                  disabled={loading} // <--- Bloqueamos si está guardando
                >
                  🗑️ Quitar
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RequerimientoCart;