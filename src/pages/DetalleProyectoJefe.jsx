import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProyectoById, registerUser, getUsuarios, updateProyectoAdmin, updateUser } from '../services/api';
import useToast from '../hooks/useToast';
import './CrearUsuario.css'; 

function DetalleProyectoJefe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { mostrarNotificacion } = useToast();
  
  const [proyecto, setProyecto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Estados para la interfaz (vista | editar_datos | cambiar_admin | crear_nuevo)
  const [modoActivo, setModoActivo] = useState('vista'); 
  const [adminsLibres, setAdminsLibres] = useState([]);
  const [nuevoAdminId, setNuevoAdminId] = useState('');

  // Formulario compartido (sirve tanto para Crear como para Editar)
  const [formData, setFormData] = useState({
    nombre: '', apellido: '', username: '', password: '', telefono: ''
  });

  useEffect(() => {
    cargarDetalle();
  }, [id]);

  const cargarDetalle = async () => {
    try {
      const data = await getProyectoById(id);
      setProyecto(data);
    } catch (error) {
      mostrarNotificacion("Error al cargar la obra", "error");
      navigate('/proyectos');
    } finally {
      setLoading(false);
    }
  };

  // --- FUNCIONES PREPARATORIAS ---
  const prepararCambioAdmin = async () => {
    setModoActivo('cambiar_admin');
    try {
      const usuarios = await getUsuarios();
      const libres = (Array.isArray(usuarios) ? usuarios : []).filter(u => 
        u.especialidad === 'Administración' && u.proyectoNombre === 'Sin proyecto'
      );
      setAdminsLibres(libres);
    } catch (error) { console.error(error); }
  };

  const prepararEdicionDatos = () => {
    // Llenamos el formulario con los datos actuales
    setFormData({
      nombre: proyecto.adminNombre || '',
      apellido: proyecto.adminApellido || '',
      username: proyecto.adminUsername || '',
      password: '', // Siempre vacío por seguridad
      telefono: proyecto.adminTelefono || ''
    });
    setModoActivo('editar_datos');
  };

  const prepararCrearNuevo = () => {
    setFormData({ nombre: '', apellido: '', username: '', password: '', telefono: '' });
    setModoActivo('crear_nuevo');
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // --- FUNCIONES DE GUARDADO ---
  const handleGuardarCambio = async () => {
    if (!nuevoAdminId) return mostrarNotificacion("Selecciona un administrador.", "error");
    setGuardando(true);
    try {
      await updateProyectoAdmin(id, { nuevoAdminId: Number(nuevoAdminId) });
      mostrarNotificacion('¡Administrador reasignado con éxito!', 'success');
      setModoActivo('vista');
      await cargarDetalle(); 
    } catch (error) { mostrarNotificacion(error.message, 'error'); } finally { setGuardando(false); }
  };

  const handleCrearAdmin = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await registerUser({ ...formData, especialidad: 'Administración', proyectoId: Number(id) });
      mostrarNotificacion('¡Nuevo Administrador creado y asignado!', 'success');
      setModoActivo('vista');
      await cargarDetalle(); 
    } catch (error) { mostrarNotificacion(error.message, 'error'); } finally { setGuardando(false); }
  };

  const handleEditarDatos = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      await updateUser(proyecto.adminId, formData);
      mostrarNotificacion('¡Datos del Administrador actualizados!', 'success');
      setModoActivo('vista');
      await cargarDetalle(); 
    } catch (error) { mostrarNotificacion(error.message, 'error'); } finally { setGuardando(false); }
  };

  // --- RENDERIZADO ---
  if (loading) return <div className="card text-center"><h3>Cargando sala de control... ⏳</h3></div>;
  if (!proyecto) return null;

  return (
    <div className="card cu-container">
      <div className="form-header" style={{ marginBottom: '20px' }}>
        <h2>🏢 Panel de Obra: {proyecto.nombre}</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/proyectos')}>⬅ Volver a Obras</button>
      </div>

      <div className="info-box info-box-left" style={{ marginBottom: '30px' }}>
        <p><strong>Ubicación:</strong> {proyecto.ubicacion}</p>
        <p>
          <strong>Estado: </strong>
          {proyecto.adminId ? <span className="badge role-admin">✅ Activa</span> : <span className="badge status-pendiente">⏳ Sin Administrador</span>}
        </p>
      </div>

      {/* RENDERIZADO CONDICIONAL DE LA ZONA DE ADMINISTRACIÓN */}
      <div className="cu-table-section">
        <h3 className="cu-section-title">👤 Administrador a Cargo</h3>

        {/* 1. MODO VISTA NORMAL (Con opciones para Editar o Cambiar si hay admin) */}
        {modoActivo === 'vista' && (
          proyecto.adminId ? (
            <div>
              <div className="table-responsive">
                <table className="table">
                  <thead><tr><th>Nombre Completo</th><th>Usuario</th><th>Teléfono</th><th>Acciones</th></tr></thead>
                  <tbody>
                    <tr>
                      <td><strong>{proyecto.adminNombreCompleto}</strong></td>
                      <td><span className="cu-username-badge">{proyecto.adminUsername}</span></td>
                      <td>{proyecto.adminTelefono || '-'}</td>
                      <td>
                        <button className="btn btn-outline-primary" style={{ marginRight: '8px', padding: '4px 8px' }} onClick={prepararEdicionDatos}>✏️ Editar Datos</button>
                        <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={prepararCambioAdmin}>🔄 Cambiar Residente</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div style={{ padding: '20px', border: '2px dashed #cbd5e1', textAlign: 'center', borderRadius: '8px' }}>
              <h4 style={{ color: '#0369a1', marginBottom: '15px' }}>⚠️ Esta obra necesita un Administrador</h4>
              <button className="btn btn-primary" style={{ marginRight: '10px' }} onClick={prepararCrearNuevo}>➕ Registrar Nuevo</button>
              <button className="btn btn-secondary" onClick={prepararCambioAdmin}>🔍 Seleccionar Existente</button>
            </div>
          )
        )}

        {/* 2. MODO CAMBIAR ADMIN (Seleccionar de una lista o crear uno nuevo) */}
        {modoActivo === 'cambiar_admin' && (
          <div style={{ padding: '15px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
            <label className="cu-label">Selecciona al nuevo Residente de Obra:</label>
            <select className="cu-form-group" style={{ width: '100%', marginBottom: '15px' }} value={nuevoAdminId} onChange={(e) => setNuevoAdminId(e.target.value)}>
              <option value="">-- Elige un Administrador libre --</option>
              {adminsLibres.map(admin => <option key={admin.id} value={admin.id}>{admin.nombreCompleto}</option>)}
            </select>
            
            {adminsLibres.length === 0 && (
              <small style={{ color: '#ef4444', display: 'block', marginBottom: '10px' }}>
                *No hay Administradores libres actualmente. Registra uno nuevo.
              </small>
            )}

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button className="btn btn-primary" onClick={handleGuardarCambio} disabled={guardando || !nuevoAdminId}>💾 Confirmar</button>
              <span style={{ margin: '0 10px' }}>o</span>
              <button className="btn btn-outline-primary" onClick={prepararCrearNuevo}>➕ Registrar Nuevo</button>
              <button className="btn btn-secondary" style={{ marginLeft: 'auto' }} onClick={() => setModoActivo('vista')}>Cancelar</button>
            </div>
          </div>
        )}

        {/* 3. MODO CREAR O EDITAR (Formulario reutilizable) */}
        {(modoActivo === 'crear_nuevo' || modoActivo === 'editar_datos') && (
          <form onSubmit={modoActivo === 'crear_nuevo' ? handleCrearAdmin : handleEditarDatos} style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <h4 className="cu-section-title" style={{ marginBottom: '15px' }}>
              {modoActivo === 'crear_nuevo' ? '➕ Registrar Nuevo Administrador' : '✏️ Editar Datos del Administrador'}
            </h4>
            
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
                <label className="cu-label">Contraseña {modoActivo === 'editar_datos' && '(Opcional)'}</label>
                <input 
                  type="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  required={modoActivo === 'crear_nuevo'} 
                  placeholder={modoActivo === 'editar_datos' ? 'Dejar en blanco para no cambiar' : '*****'} 
                />
              </div>
            </div>
            <div className="cu-form-row">
              <div className="cu-form-group">
                <label className="cu-label">Teléfono</label>
                <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button type="submit" className="btn btn-primary" disabled={guardando}>
                {guardando ? 'Guardando...' : '💾 Guardar'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setModoActivo('vista')} disabled={guardando}>
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default DetalleProyectoJefe;