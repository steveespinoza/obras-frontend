import { useState } from "react";
import { loginUser } from "../services/api";



function Login({ onLogin }) {
  const [form, setForm] = useState({
    username: "", 
    password: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const usuario = await loginUser(form);
      onLogin(usuario);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Iniciar Sesión</h2>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username" 
            placeholder="Nombre de usuario"
            value={form.username}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            required
          />

          {/* ÚNICO CAMBIO: Agregamos className="btn btn-primary" */}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Ingresando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;