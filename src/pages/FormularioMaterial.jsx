import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAlmacen, createMaterial } from '../services/api';

function FormularioMaterial({ usuarioActual }) {
  const [almacen, setAlmacen] = useState([]); 
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '', brand: '', quantity: '', unit: 'unidades'
  });

  useEffect(() => {
    getAlmacen()
      .then(data => setAlmacen(data))
      .catch(err => console.error("Error cargando almacén:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'quantity' ? Number(value) : value
    });
  };

  const handleSubmit = async (e) => {
      e.preventDefault();

      const datosParaEnviar = {
        ...formData,
        trabajadorId: usuarioActual.id
      };

      try {
        await createMaterial(datosParaEnviar);
        alert('¡Requerimiento agregado con éxito!');
        navigate('/');
      } catch (error) {
        alert('Hubo un error al agregar.');
      }
  };

  return (
    <div className="card">
      <div className="form-header">
        <h2>Agregar Nuevo Requerimiento</h2>
        <Link to="/">⬅ Volver a la lista</Link>
      </div>

      <form onSubmit={handleSubmit} className="form-layout">
        
        {/* Visualización del responsable */}
        <div className="info-box">
          👤 <strong>Responsable:</strong> {usuarioActual.name}
        </div>

        <input 
          type="text" 
          name="name" 
          list="lista-almacen" 
          placeholder="Escribe para buscar o selecciona un material..." 
          value={formData.name} 
          onChange={handleChange} 
          required 
        />
        
        <datalist id="lista-almacen">
          {almacen.map(mat => (
            <option key={mat.id} value={mat.name} />
          ))}
        </datalist>

        <input 
          type="text" 
          name="brand" 
          placeholder="Marca (ej. Sol)" 
          value={formData.brand} 
          onChange={handleChange} 
          required 
        />
        
        {/* Fila para Cantidad y Unidad */}
        <div className="form-row">
          <input 
            type="number" 
            name="quantity" 
            step="0.01" 
            placeholder="Cantidad" 
            value={formData.quantity} 
            onChange={handleChange} 
            required 
          />
          <select 
            name="unit" 
            value={formData.unit} 
            onChange={handleChange}
          >
            <option value="unidades">Unidades</option>
            <option value="kg">Kilogramos (kg)</option>
            <option value="m3">Metros Cúbicos (m3)</option>
            <option value="bolsas">Bolsas</option>
          </select>
        </div>

        {/* Botón usando las clases de nuestro sistema de diseño */}
        <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
          Guardar Requerimiento
        </button>
      </form>
    </div>
  );
}

export default FormularioMaterial;