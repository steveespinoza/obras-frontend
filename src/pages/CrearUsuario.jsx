import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// ¡NUEVO!: Importamos getProyectos
import { registerUser, getUsuarios, getProyectos } from '../services/api';
import './CrearUsuario.css';
import './VistasListado.css';

import useToast from '../hooks/useToast';

function CrearUsuario() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { mostrarNotificacion } = useToast();
  
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(true);
  
  // ¡NUEVO!: Estado para los proyectos
  const [listaProyectos, setListaProyectos] = useState([]);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    username: '',
    password: '',
    especialidad: 'Administración', // <-- Forzado a Administración
    telefono: '',
    proyectoId: '' 
  });

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    try {
      const [usuariosData, proyectosData] = await Promise.all([
        getUsuarios(),
        getProyectos() // Traemos los proyectos en paralelo
      ]);
      
      // ==========================================
      // ¡AQUÍ APLICAMOS EL FILTRO!
      // Nos quedamos SOLO con los usuarios cuya especialidad sea "Administración"
      // ==========================================
      const soloAdmins = (Array.isArray(usuariosData) ? usuariosData : [])
        .filter(user => user.especialidad === 'Administración');

      // Guardamos la lista filtrada en lugar de la lista completa
      setListaUsuarios(soloAdmins); 
      
      setListaProyectos(Array.isArray(proyectosData) ? proyectosData : []);
      

    } catch (error) {
      console.error("Error al obtener datos iniciales", error);
    } finally {
      setCargandoUsuarios(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ELIMINAMOS la validación if (!formData.proyectoId) para permitir admins sin obra

    setLoading(true);

    try {
      // ¡CORRECCIÓN AQUÍ!: Si hay un proyectoId, lo convertimos a Número. Si está vacío (""), enviamos null.
      const datosParaEnviar = { 
        ...formData, 
        proyectoId: formData.proyectoId ? Number(formData.proyectoId) : null 
      };
      
      await registerUser(datosParaEnviar);
      
      mostrarNotificacion('¡Admin creado con éxito! 🏗️', 'success');
      
      // Limpiamos el formulario dejándolo sin asignar
      setFormData({
        nombre: '', apellido: '', username: '', password: '', especialidad: 'Administración', telefono: '',
        proyectoId: '' // <-- Lo dejamos vacío de nuevo
      });

      await cargarDatosIniciales();
      
    } catch (error) {
      mostrarNotificacion(error.message || 'Error al crear el admin', 'error');
    } finally {
      setLoading(false);
    }
  };
// Filtramos: Solo obras que NO tienen Admin asignado
  const proyectosDisponibles = listaProyectos.filter(p => p.adminId === null);
  return (
    <div className="card cu-container">
      <div className="list-header">
        <h2 className="cu-title">👤 Gestión de Trabajadores</h2>
      </div>

      <form onSubmit={handleSubmit} className="cu-form-section">
        <h4 className="cu-section-title">Registrar Nuevo Admin</h4>
        
        <div className="cu-form-row">
          <div className="cu-form-group">
            <label className="cu-label">Nombre</label>
            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required placeholder="Ej. Juan" />
          </div>
          <div className="cu-form-group">
            <label className="cu-label">Apellido</label>
            <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} required placeholder="Ej. Pérez" />
          </div>
        </div>

        <div className="cu-form-row">
          <div className="cu-form-group">
            <label className="cu-label">Admin (Login)</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} required placeholder="Ej. jperez" />
          </div>
          <div className="cu-form-group">
            <label className="cu-label">Contraseña</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="*****" />
          </div>
        </div>

        <div className="cu-form-row">
          <div className="cu-form-group">
            <label className="cu-label">Especialidad / Rol</label>
            {/* Lo cambiamos por un input bloqueado para que el Jefe lo tenga claro */}
            <input 
              type="text" 
              name="especialidad" 
              value="Administración" 
              disabled 
              style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed', color: '#6b7280' }}
            />
          </div>
          <div className="cu-form-group">
            <label className="cu-label">Teléfono</label>
            <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="Ej. 999888777" />
          </div>
        </div>

        {/* ¡NUEVO!: Fila para seleccionar el Proyecto */}
        <div className="cu-form-row">
          <div className="cu-form-group" style={{ width: '100%' }}>
            <label className="cu-label">Asignar a una Obra Disponible</label>
            <select name="proyectoId" value={formData.proyectoId} onChange={handleChange}>
              <option value="">-- Sin asignar / Asignar más adelante --</option>
              {/* Usamos nuestra nueva lista filtrada */}
              {proyectosDisponibles.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nombre} ({p.ubicacion})
                </option>
              ))}
            </select>
            {/* Pequeña ayuda visual si ya no hay obras libres */}
            {proyectosDisponibles.length === 0 && listaProyectos.length > 0 && (
              <small style={{ color: '#ef4444', marginTop: '5px', display: 'block' }}>
                *Todas las obras actuales ya tienen un Administrador asignado.
              </small>
            )}
          </div>
        </div>

        <div className="cu-form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
            Volver al Inicio
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Guardando...' : '💾 Registrar Admin'}
          </button>
        </div>
      </form>

      {/* TABLA DE USUARIOS EXISTENTES */}
      <div className="cu-table-section">
        <h3 className="cu-section-title">📋 Admins Registrados ({listaUsuarios.length})</h3>
        
        {cargandoUsuarios ? (
          <p className="cu-loading-text">Cargando Admin... ⏳</p>
        ) : (
          <div className="table-responsive cu-table-wrapper">
            <table className="table" style={{ margin: 0 }}>
              <thead className="cu-thead">
                <tr>
                  <th>Nombre Completo</th>
                  <th>Admin</th>
                  <th>Especialidad</th>
                  <th>Proyecto / Obra</th> 
                </tr>
              </thead>
              <tbody>
                {listaUsuarios.map(user => (
                  <tr key={user.id} className="cu-tbody-tr">
                    <td data-label="Nombre Completo"><strong>{user.nombreCompleto}</strong></td>
                    <td data-label="Usuario"><span className="cu-username-badge">{user.username}</span></td>
                    <td data-label="Especialidad">{user.especialidad}</td>
                    {/* Mostramos a qué proyecto pertenece */}
                    <td data-label="Proyecto">{user.proyectoNombre || `ID: ${user.proyectoId}`}</td>
                  </tr>
                ))}
                {listaUsuarios.length === 0 && (
                  <tr>
                    <td colSpan="4" className="cu-empty-cell">No hay admins registrados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default CrearUsuario;