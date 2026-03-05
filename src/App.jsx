import { BrowserRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ListaRequerimientos from './pages/ListaRequerimientos';
import FormularioRequerimiento from './pages/FormularioRequerimiento';
import Almacen from './pages/Almacen';
import Login from './pages/Login';
import Reportes from './pages/Reportes';
import GestionProyectos from './pages/GestionProyectos';
// 1. IMPORTAMOS LA NUEVA PANTALLA
import UsuariosAdmin from './pages/UsuariosAdmin';
import logoEmpresa from './assets/logoJ&M.jpeg'
import CrearUsuario from './pages/CrearUsuario';
import DetalleProyectoJefe from './pages/DetalleProyectoJefe';

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
    navigate('/');
  };

  useEffect(() => {
    const handleSessionExpired = () => {
      setUsuarioActual(null);
      localStorage.removeItem('usuarioObras');
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
              <span className={`role-tag ${usuarioActual.isAdmin ? 'role-admin' : 'role-user'}`}>
                {usuarioActual.isAdmin ? 'Admin' : 'Encargado'}
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
        <Routes>
          {/* Ruta base: Si es Jefe, lo mandamos a sus Proyectos, si no, a los Pedidos */}
          <Route path="/" element={
            usuarioActual.role === 'Jefe' 
              ? <GestionProyectos /> 
              : <ListaRequerimientos usuarioActual={usuarioActual} />
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
                  : <UsuariosAdmin />
              } 
            />
          )}
        </Routes>
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