import { useState, useEffect } from 'react';
import { registerUser, getUsuarios } from '../services/api';
import useToast from '../hooks/useToast';

// ¡Magia! Importamos el MISMO CSS, así que el diseño será idéntico
import './CrearUsuario.css'; 

function UsuariosAdmin({ usuarioActual }) {
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(true);
  const [loading, setLoading] = useState(false);
  const { mostrarNotificacion } = useToast();

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    username: '',
    password: '',
    // El Admin generalmente contrata personal de campo, no a otros Admins
    especialidad: 'Construcción', 
    telefono: ''
  });
  // Verificamos si tiene un proyecto asignado (que no sea null ni 0)
  const tieneObraAsignada = usuarioActual?.proyectoId && usuarioActual.proyectoId > 0;

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
      // Mandamos los datos limpios. El backend ya sabe (por el token)
      // a qué obra pertenece este Admin y asignará al trabajador ahí automáticamente.
      await registerUser(formData);
      mostrarNotificacion('¡Trabajador añadido a tu obra con éxito! 👷‍♂️', 'success');
      
      setFormData({ nombre: '', apellido: '', username: '', password: '', especialidad: 'Construcción', telefono: '' });
      await cargarUsuarios();
    } catch (error) {
      mostrarNotificacion(error.message || 'Error al registrar', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card cu-container">
      <div className="list-header">
        <h2 className="cu-title">👥 Mi Equipo de Obra</h2>
      </div>

      {/* FORMULARIO SIMPLIFICADO */}
      {tieneObraAsignada ? (
      <form onSubmit={handleSubmit} className="cu-form-section">
        <h4 className="cu-section-title">Registrar Nuevo Trabajador</h4>
        
        <div className="cu-form-row">
          <div className="cu-form-group">
            <label className="cu-label">Nombre</label>
            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
          </div>
          <div className="cu-form-group">
            <label className="cu-label">Apellido</label>
            <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} required />
          </div>
        </div>

        <div className="cu-form-row">
          <div className="cu-form-group">
            <label className="cu-label">Usuario (Login)</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} required />
          </div>
          <div className="cu-form-group">
            <label className="cu-label">Contraseña</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>
        </div>

        <div className="cu-form-row">
          <div className="cu-form-group">
            <label className="cu-label">Especialidad</label>
            <select name="especialidad" value={formData.especialidad} onChange={handleChange}>
                {/* Fíjate que "Administración" NO ESTÁ en esta lista */}
                <option value="Construcción">Construcción</option>
                <option value="Almacén">Almacén</option>
                <option value="Electricidad">Electricidad</option>
                <option value="Gasfitería">Gasfitería</option>
            </select>
          </div>
          <div className="cu-form-group">
            <label className="cu-label">Teléfono</label>
            <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} />
          </div>
        </div>

        <div className="cu-form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Guardando...' : '💾 Registrar a mi Obra'}
          </button>
        </div>
      </form>
      ) : (
        <div className="cu-form-section" style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
          <h3 style={{ color: '#d97706', marginBottom: '10px' }}>⚠️ No tienes una obra asignada</h3>
          <p style={{ color: '#92400e' }}>
            Actualmente no estás a cargo de ningún proyecto. Comunícate con la Gerencia para que te asignen una obra antes de comenzar a registrar a tu equipo de campo.
          </p>
        </div>
      )}

      {/* TABLA DE SU EQUIPO */}
      <div className="cu-table-section">
        <h3 className="cu-section-title">📋 Mi Personal Asignado ({listaUsuarios.length})</h3>
        {cargandoUsuarios ? <p>Cargando... ⏳</p> : (
          <div className="table-responsive cu-table-wrapper">
            <table className="table" style={{ margin: 0 }}>
              <thead className="cu-thead">
                <tr>
                  <th>Nombre Completo</th>
                  <th>Usuario</th>
                  <th>Especialidad</th>
                </tr>
              </thead>
              <tbody>
                {listaUsuarios.map(user => (
                  <tr key={user.id} className="cu-tbody-tr">
                    <td data-label="Nombre"><strong>{user.nombreCompleto}</strong></td>
                    <td data-label="Usuario"><span className="cu-username-badge">{user.username}</span></td>
                    <td data-label="Especialidad">{user.especialidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default UsuariosAdmin;