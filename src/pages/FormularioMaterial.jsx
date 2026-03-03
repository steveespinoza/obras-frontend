import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAlmacen, createMaterial } from '../services/api';

function FormularioMaterial({ usuarioActual }) {
  const [almacen, setAlmacen] = useState([]);
  const navigate = useNavigate();

  // Estado para el Toast (Notificación)
  const [toast, setToast] = useState({ visible: false, mensaje: '', tipo: '' });
  
  // NUEVO: Estado de carga para evitar doble envío
  const [loading, setLoading] = useState(false);

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

  const mostrarNotificacion = (mensaje, tipo) => {
    setToast({ visible: true, mensaje, tipo });
    setTimeout(() => {
      setToast({ visible: false, mensaje: '', tipo: '' });
    }, 3000);
  };

  const handleSubmit = async (e) => {
      e.preventDefault();

      if (loading) return; // Protección extra por si acaso

      setLoading(true); // Bloqueamos el botón inmediatamente

      const datosParaEnviar = {
        ...formData,
        trabajadorId: usuarioActual.id
      };

      try {
        await createMaterial(datosParaEnviar);
        mostrarNotificacion('¡Requerimiento agregado con éxito! 🚀', 'success');
        
        // Retrasamos la navegación 1.5s para que vea el mensaje
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } catch (error) {
        mostrarNotificacion('Hubo un error al agregar el requerimiento.', 'error');
        setLoading(false); // Solo reactivamos el botón si hay error (si hay éxito, se va de la vista)
      }
  };

  return (
    <div className="card">
      {toast.visible && (
        <div className={`toast-container toast-${toast.tipo}`}>
          {toast.mensaje}
        </div>
      )}

      <div className="form-header">
        <h2>Agregar Nuevo Requerimiento</h2>
        <Link to="/">⬅ Volver a la lista</Link>
      </div>

      <form onSubmit={handleSubmit} className="form-layout">
        
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

        {/* MODIFICADO: Aplicamos el disabled y cambiamos el texto dinámicamente */}
        <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }} disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar Requerimiento'}
        </button>
      </form>
    </div>
  );
}

export default FormularioMaterial;