import { useState, useEffect } from 'react';
import { getProyectos, createProyecto, getUsuarios } from '../services/api';
import useToast from '../hooks/useToast';
import './CrearUsuario.css'; // Reutilizamos los mismos estilos limpios
import { useNavigate } from 'react-router-dom';


function GestionProyectos() {
  const [proyectos, setProyectos] = useState([]);
  //const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const { mostrarNotificacion } = useToast();
  const navigate = useNavigate();

const [formData, setFormData] = useState({
    nombre: '',
    ubicacion: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

    const cargarDatos = async () => {
        try {
        // 1. Traemos las obras y los usuarios al mismo tiempo
        const [proyectosData, usuariosData] = await Promise.all([
            getProyectos(),
            getUsuarios()
        ]);
        
        const proyectosArray = Array.isArray(proyectosData) ? proyectosData : [];
        const usuariosArray = Array.isArray(usuariosData) ? usuariosData : [];
        
        setProyectos(proyectosArray);
        
        // ==========================================
        // LÓGICA DE VALIDACIÓN DE ADMINS DISPONIBLES



        } catch (error) {
        console.error("Error al cargar datos", error);
        }
    };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

// En GestionProyectos.jsx, cambia tu handleSubmit:
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
        // Siempre nace sin Admin, forzando a usar el botón "Gestionar"
        await createProyecto({
            nombre: formData.nombre,
            ubicacion: formData.ubicacion,
            adminId: null 
        });

        mostrarNotificacion('¡Obra creada! Haz clic en "⚙️ Gestionar" para asignarle un Administrador.', 'success');
        
        setFormData({ nombre: '', ubicacion: '' }); // Limpiamos
        await cargarDatos(); // Recargamos la tabla
        
        } catch (error) {
        mostrarNotificacion(error.message || 'Error al crear la obra', 'error');
        } finally {
        setLoading(false);
        }
    };
  
  return (
    <div className="card cu-container">
      <div className="list-header">
        <h2 className="cu-title">🏢 Gestión de Proyectos (Obras)</h2>
      </div>

      {/* FORMULARIO DE NUEVA OBRA */}
      <form onSubmit={handleSubmit} className="cu-form-section">
        <h4 className="cu-section-title">Aperturar Nueva Obra</h4>
        
        <div className="cu-form-row">
          <div className="cu-form-group">
            <label className="cu-label">Nombre del Proyecto</label>
            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required placeholder="Ej. Residencial Las Palmas" />
          </div>
          <div className="cu-form-group">
            <label className="cu-label">Ubicación</label>
            <input type="text" name="ubicacion" value={formData.ubicacion} onChange={handleChange} required placeholder="Ej. Av. Javier Prado 123" />
          </div>
        </div>

        <div className="cu-form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Guardando...' : '🏗️ Crear Obra'}
          </button>
        </div>
      </form>

{/* TABLA DE OBRAS EXISTENTES */}
      <div className="cu-table-section">
        <h3 className="cu-section-title">📋 Obras Activas ({proyectos.length})</h3>
        <div className="table-responsive cu-table-wrapper">
          <table className="table" style={{ margin: 0 }}>
            <thead className="cu-thead">
              <tr>
                <th>ID</th>
                <th>Nombre del Proyecto</th>
                <th>Ubicación</th>
                <th>Administrador Responsable</th> 
              </tr>
            </thead>
            <tbody>
              {proyectos.map(p => (
                <tr key={p.id} className="cu-tbody-tr">
                  <td data-label="ID">#{p.id}</td>
                  <td data-label="Nombre"><strong>{p.nombre}</strong></td>
                  <td data-label="Ubicación">{p.ubicacion}</td>

                    <td data-label="Admin a cargo">
                        {p.adminId ? <span className="badge role-admin">Asignado ({p.adminNombre})</span> : <span className="badge status-pendiente">Sin asignar</span>}
                    </td>
                    <td data-label="Acciones">
                        <button className="btn btn-primary" onClick={() => navigate(`/proyectos/${p.id}`)}>
                        ⚙️ Gestionar
                        </button>
                     </td>
                </tr>
              ))}
              {proyectos.length === 0 && (
                <tr><td colSpan="4" className="cu-empty-cell">No hay proyectos registrados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default GestionProyectos;