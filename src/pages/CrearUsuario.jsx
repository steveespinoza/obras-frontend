import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, getUsuarios } from '../services/api';
import './CrearUsuario.css';
import './VistasListado.css';

// 1. IMPORTAMOS EL CUSTOM HOOK
import useToast from '../hooks/useToast';

function CrearUsuario() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // 2. USAMOS EL HOOK
  const { mostrarNotificacion, ToastComponent } = useToast();
  
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(true);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    username: '',
    password: '',
    especialidad: 'Construcción',
    telefono: ''
  });

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const data = await getUsuarios();
      setListaUsuarios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener usuarios", error);
    } finally {
      setCargandoUsuarios(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await registerUser(formData);
      mostrarNotificacion('¡Usuario creado con éxito! 🏗️', 'success');
      
      setFormData({
        nombre: '', apellido: '', username: '', password: '', especialidad: 'Construcción', telefono: ''
      });

      await cargarUsuarios();
      
    } catch (error) {
      mostrarNotificacion(error.message || 'Error al crear el usuario', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card cu-container">
      {/* 3. RENDERIZAMOS EL TOAST */}
      <ToastComponent />

      <div className="list-header">
        <h2 className="cu-title">👤 Gestión de Trabajadores</h2>
      </div>

      {/* SECCIÓN 1: FORMULARIO DE REGISTRO */}
      <form onSubmit={handleSubmit} className="cu-form-section">
        <h4 className="cu-section-title">Registrar Nuevo Usuario</h4>
        
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
            <label className="cu-label">Usuario (Login)</label>
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
            <select name="especialidad" value={formData.especialidad} onChange={handleChange}>
              <option value="Construcción">Construcción</option>
              <option value="Administración">Administración</option>
              <option value="Almacén">Almacén</option>
              <option value="Electricidad">Electricidad</option>
              <option value="Gasfitería">Gasfitería</option>
            </select>
          </div>
          <div className="cu-form-group">
            <label className="cu-label">Teléfono</label>
            <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="Ej. 999888777" />
          </div>
        </div>

        <div className="cu-form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
            Volver al Inicio
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Guardando...' : '💾 Registrar Usuario'}
          </button>
        </div>
      </form>

      {/* SECCIÓN 2: TABLA DE USUARIOS EXISTENTES */}
      <div className="cu-table-section">
        <h3 className="cu-section-title">📋 Usuarios Registrados ({listaUsuarios.length})</h3>
        
        {cargandoUsuarios ? (
          <p className="cu-loading-text">Cargando usuarios... ⏳</p>
        ) : (
          <div className="table-responsive cu-table-wrapper">
            <table className="table" style={{ margin: 0 }}>
              <thead className="cu-thead">
                <tr>
                  <th>Nombre Completo</th>
                  <th>Usuario (Login)</th>
                  <th>Especialidad</th>
                  <th>Teléfono</th>
                </tr>
              </thead>
              <tbody>
                {listaUsuarios.map(user => (
                  <tr key={user.id} className="cu-tbody-tr">
                    <td data-label="Nombre Completo"><strong>{user.nombreCompleto}</strong></td>
                    <td data-label="Usuario">
                      <span className="cu-username-badge">
                        {user.username}
                      </span>
                    </td>
                    <td data-label="Especialidad">{user.especialidad}</td>
                    <td data-label="Teléfono">{user.telefono || '-'}</td>
                  </tr>
                ))}
                {listaUsuarios.length === 0 && (
                  <tr>
                    <td colSpan="4" className="cu-empty-cell">
                      No hay usuarios registrados.
                    </td>
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