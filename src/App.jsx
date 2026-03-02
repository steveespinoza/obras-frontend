import { BrowserRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ListaMateriales from './pages/ListaMateriales';
import FormularioMaterial from './pages/FormularioMaterial';
import Almacen from './pages/Almacen';
import Login from './pages/Login';

function MainApp() {
  // 🔐 Persistencia de sesión
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

  if (!usuarioActual) {
    return <Login onLogin={manejarLogin} />;
  }

  // Obtenemos la inicial del usuario para el avatar visual
  const inicialUsuario = usuarioActual?.name ? usuarioActual.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="container">

      {/* HEADER PREMIUM OSCURO */}
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
          {/* NavLink nos permite aplicar la clase 'active' automáticamente */}
          <NavLink 
            to="/" 
            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
          >
            Requerimientos
          </NavLink>
          
          {!usuarioActual.isAdmin && (
            <NavLink 
              to="/nuevo" 
              className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
            >
              Pedir Material
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

          {/* Botón Salir adaptado al fondo oscuro */}
          <button className="btn btn-outline-danger" onClick={manejarLogout}>
            Salir
          </button>
        </nav>
      </header>

      {/* CONTENIDO PRINCIPAL (Con fondo claro) */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<ListaMateriales usuarioActual={usuarioActual} />} />

          {!usuarioActual.isAdmin && (
            <Route path="/nuevo" element={<FormularioMaterial usuarioActual={usuarioActual} />} />
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