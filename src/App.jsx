import { BrowserRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense } from 'react'; // <-- Añadimos lazy y Suspense

// 1. IMPORTACIONES ESTÁTICAS (Lo que se necesita inmediatamente)
import Login from './pages/Login';
import logoEmpresa from './assets/logoJ&M.jpeg';

// 2. IMPORTACIONES DINÁMICAS (Carga Perezosa)
// Estos archivos JavaScript solo se descargarán cuando el usuario navegue hacia ellos
const MisPedidos = lazy(() => import('./pages/misPedidos'));
const PanelPedidosAdmin = lazy(() => import('./pages/PanelPedidosAdmin'));
const FormularioRequerimiento = lazy(() => import('./pages/FormularioRequerimiento'));
const Almacen = lazy(() => import('./pages/Almacen'));
const Reportes = lazy(() => import('./pages/Reportes'));
const GestionProyectos = lazy(() => import('./pages/GestionProyectos'));
const UsuariosAdmin = lazy(() => import('./pages/UsuariosAdmin'));
const CrearUsuario = lazy(() => import('./pages/CrearUsuario'));
const DetalleProyectoJefe = lazy(() => import('./pages/DetalleProyectoJefe'));

function MainApp() {
  const [usuarioActual, setUsuarioActual] = useState(() => {
    const usuarioGuardado = localStorage.getItem('usuarioObras');
    return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  });

  const navigate = useNavigate();

  const manejarLogin = (usuario) => {
      setUsuarioActual(usuario);
      localStorage.setItem('usuarioObras', JSON.stringify(usuario));
      navigate('/');
  };

  const manejarLogout = () => {
    setUsuarioActual(null);
    localStorage.removeItem('usuarioObras');
    sessionStorage.clear(); // <--- ¡AÑADE ESTA LÍNEA AQUÍ! Limpia el catálogo
    navigate('/');
  };

  useEffect(() => {
    const handleSessionExpired = () => {
      setUsuarioActual(null);
      localStorage.removeItem('usuarioObras');
      sessionStorage.clear(); // <--- ¡AÑADE ESTA LÍNEA AQUÍ TAMBIÉN!
      navigate('/');
      alert("Tu sesión de seguridad ha expirado. Por favor, ingresa tus credenciales nuevamente.");
    };

    window.addEventListener("session_expired", handleSessionExpired);
    return () => window.removeEventListener("session_expired", handleSessionExpired);
  }, [navigate]);

  if (!usuarioActual) {
    return <Login onLogin={manejarLogin} />;
  }

  const inicialUsuario = usuarioActual?.name ? usuarioActual.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="container">
      <header className="header">
        <div className="header-brand">
          {/* Reemplazamos el emoji por tu imagen */}
          <img src={logoEmpresa} alt="JyM Grupo Inmobiliario" className="logo-img" />
          
          <div className="header-info">
            {/* Eliminamos el h1 "Gestión de Inventario" */}
            
            <div className="user-badge">
              <span className="avatar">{inicialUsuario}</span>
              <span className="user-name">{usuarioActual.name}</span>
              
              {/* Comparamos el rol correctamente */}
              <span className={`role-tag ${
                usuarioActual.role === 'Admin' || usuarioActual.role === 'Jefe' 
                  ? 'role-admin' 
                  : 'role-user'
              }`}>
                {/* Mostramos el texto exacto según su rol */}
                {usuarioActual.role === 'Jefe' ? 'Jefe' : usuarioActual.role === 'Admin' ? 'Admin' : 'Operario'}
              </span>
            </div>
          </div>
        </div>

        <nav className="nav-links">
          {/* Si NO es Jefe, ve la lista de Pedidos (El Jefe no hace pedidos) */}
          {usuarioActual.role !== 'Jefe' && (
            <NavLink to="/" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              Pedidos
            </NavLink>
          )}
          
          {/* Si es un Usuario Normal (Trabajador de campo) */}
          {usuarioActual.role === 'User' && (
            <NavLink to="/nuevo" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              Crear Pedido
            </NavLink>
          )}

          {/* Si es Administrador de Obra */}
          {usuarioActual.role === 'Admin' && (
            <>
              <NavLink to="/almacen" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>Catálogo</NavLink>
              <NavLink to="/reportes" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>Reportes</NavLink>
            </>
          )}

          {/* Si es el Jefe Supremo */}
          {usuarioActual.role === 'Jefe' && (
            <NavLink to="/proyectos" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              🏢 Proyectos
            </NavLink>
          )}

          {/* Tanto el Admin como el Jefe pueden gestionar usuarios */}
          {(usuarioActual.role === 'Admin' || usuarioActual.role === 'Jefe') && (
            <NavLink to="/usuarios/nuevo" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              👥 Usuarios
            </NavLink>
          )}

          <button className="btn btn-outline-danger" onClick={manejarLogout}>Salir</button>
        </nav>
      </header>
      <main className="main-content">
        {/* El fallback es lo que se muestra mientras el navegador descarga la pantalla */}
        <Suspense fallback={
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: '#64748b' }}>
            <h3>Cargando módulo... ⏳</h3>
          </div>
        }>
          <Routes>
            {/* Ruta base dividida inteligentemente por el rol */}
            <Route path="/" element={
              usuarioActual.role === 'Jefe' 
                ? <GestionProyectos /> 
                : usuarioActual.role === 'Admin'
                  ? <PanelPedidosAdmin />
                  : <MisPedidos />
            } />

            {/* Rutas de Trabajador Normal */}
            {usuarioActual.role === 'User' && (
              <>
                <Route path="/nuevo" element={<FormularioRequerimiento usuarioActual={usuarioActual} />} />
                <Route path="/editar/:id" element={<FormularioRequerimiento usuarioActual={usuarioActual} />} />
              </>
            )}

            {/* Rutas de Administrador */}
            {usuarioActual.role === 'Admin' && (
              <>
                <Route path="/almacen" element={<Almacen />} />
                <Route path="/reportes" element={<Reportes />} />
              </>
            )}

            {/* Rutas de Jefe */}
            {usuarioActual.role === 'Jefe' && (
              <>
                <Route path="/proyectos" element={<GestionProyectos />} />
                <Route path="/proyectos/:id" element={<DetalleProyectoJefe />} />
              </>
            )}

{/* Ruta Inteligente de Usuarios */}
            {(usuarioActual.role === 'Admin' || usuarioActual.role === 'Jefe') && (
              <Route 
                path="/usuarios/nuevo" 
                element={
                  usuarioActual.role === 'Jefe' 
                    ? <CrearUsuario /> 
                    // ¡AQUÍ! Le pasamos el usuarioActual al componente
                    : <UsuariosAdmin usuarioActual={usuarioActual} /> 
                } 
              />
            )}
          </Routes>
        </Suspense>
      </main>

    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <MainApp />
    </BrowserRouter>
  );
}

export default App;