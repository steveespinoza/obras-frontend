import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
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

  return (
    <div className="container">

      {/* HEADER PROFESIONAL (Sin estilos en línea) */}
      <header className="header">
        <div className="header-info">
          <h1 className="header-title">
            Sistema de Gestión de Inventario
          </h1>
          <small className="header-subtitle">
            Usuario: <strong>{usuarioActual.name}</strong> | 
            Rol: {usuarioActual.isAdmin ? ' Administrador' : ' Encargado'}
          </small>
        </div>

        <nav className="nav-links">
          <Link to="/">Requerimientos</Link>
          
          {!usuarioActual.isAdmin && (
            <Link to="/nuevo">Pedir Material</Link>
          )}

          {usuarioActual.isAdmin && (
            <Link to="/almacen">Catálogo Almacén</Link>
          )}

          <button className="btn btn-danger" onClick={manejarLogout}>
            Salir
          </button>
        </nav>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <Routes>
        <Route path="/" element={<ListaMateriales usuarioActual={usuarioActual} />} />

        {!usuarioActual.isAdmin && (
          <Route path="/nuevo" element={<FormularioMaterial usuarioActual={usuarioActual} />} />
        )}

        {usuarioActual.isAdmin && (
          <Route path="/almacen" element={<Almacen />} />
        )}
      </Routes>

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