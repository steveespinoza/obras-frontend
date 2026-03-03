import { BrowserRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ListaRequerimientos from './pages/ListaRequerimientos';
import FormularioRequerimiento from './pages/FormularioRequerimiento';
import Almacen from './pages/Almacen';
import Login from './pages/Login';

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
          <div className="logo-icon">📦</div>
          <div className="header-info">
            <h1 className="header-title">
              Gestión de Inventario
            </h1>
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
          <NavLink
            to="/"
            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
          >
            Pedidos
          </NavLink>
          
          {!usuarioActual.isAdmin && (
            <NavLink
              to="/nuevo"
              className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
            >
              Crear Pedido
            </NavLink>
          )}

          {usuarioActual.isAdmin && (
            <NavLink
              to="/almacen"
              className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
            >
              Catálogo
            </NavLink>
          )}

          <button className="btn btn-outline-danger" onClick={manejarLogout}>
            Salir
          </button>
        </nav>
      </header>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<ListaRequerimientos usuarioActual={usuarioActual} />} />

          {!usuarioActual.isAdmin && (
            <>
              <Route path="/nuevo" element={<FormularioRequerimiento usuarioActual={usuarioActual} />} />
              {/* NUEVA RUTA PARA EDITAR EL PEDIDO COMPLETO */}
              <Route path="/editar/:id" element={<FormularioRequerimiento usuarioActual={usuarioActual} />} />
            </>
          )}

          {usuarioActual.isAdmin && (
            <Route path="/almacen" element={<Almacen />} />
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