import React from 'react';

function RequerimientoForm({ formData, editIndex, almacen, onChange, onSubmit, onCancel }) {
  return (
    <form onSubmit={onSubmit} className={`form-layout req-form-box ${editIndex !== null ? 'is-editing' : ''}`}>
      <h4 className={`req-form-title ${editIndex !== null ? 'is-editing' : ''}`}>
        {editIndex !== null ? '✏️ Modificando material...' : '➕ Agregar material al pedido'}
      </h4>
      
      <input 
        type="text" name="name" list="lista-almacen" 
        placeholder="Escribe para buscar..." 
        value={formData.name} onChange={onChange} required 
      />
      <datalist id="lista-almacen">
        {almacen.map(mat => <option key={mat.id} value={mat.name} />)}
      </datalist>
      
      <input 
        type="text" name="brand" 
        placeholder="Marca (Deja vacío para Genérico)" 
        value={formData.brand} onChange={onChange} 
      />
      
      <div className="form-row">
        <input 
          type="number" name="quantity" step="0.01" 
          placeholder="Cantidad" value={formData.quantity} 
          onChange={onChange} required 
        />
        <select name="unit" value={formData.unit} onChange={onChange}>
          <option value="unidades">Unidades</option>
          <option value="kg">Kilogramos (kg)</option>
          <option value="m3">Metros Cúbicos (m3)</option>
          <option value="bolsas">Bolsas</option>
        </select>
      </div>

      <div className="req-form-actions">
        <button type="submit" className={editIndex !== null ? "btn btn-primary" : "btn btn-success"}>
          {editIndex !== null ? '💾 Confirmar Cambio' : '+ Añadir a la lista'}
        </button>
        {editIndex !== null && (
          <button type="button" className="btn btn-cancel" onClick={onCancel}>Cancelar</button>
        )}
      </div>
    </form>
  );
}

export default RequerimientoForm;