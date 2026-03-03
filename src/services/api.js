// Usamos variables de entorno para producción, o localhost para desarrollo
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5035";

const getAuthHeaders = () => {
  const headers = { "Content-Type": "application/json" };
  const usuarioGuardado = localStorage.getItem("usuarioObras");
  
  if (usuarioGuardado) {
    const usuario = JSON.parse(usuarioGuardado);
    const token = usuario.token || usuario.Token;
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
};

// =========================================
// 🚀 NUEVO: INTERCEPTOR DE RESPUESTAS
// =========================================
const handleResponse = async (res) => {
  // Si el token expiró o es inválido
  if (res.status === 401) {
    // Disparamos un evento global que el App.jsx escuchará
    window.dispatchEvent(new Event("session_expired"));
    throw new Error("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Error en la petición al servidor");
  }

  // Si la respuesta es un 204 (No Content), típico en DELETE o PUT, no intentamos parsear JSON
  if (res.status === 204) return null;

  return res.json();
};

// =========================
// 📦 MATERIALES
// =========================

export const getMateriales = async () => {
  const res = await fetch(`${API_URL}/mats`, { headers: getAuthHeaders() });
  return handleResponse(res); // Usamos nuestra nueva función
};

export const createMaterial = async (data) => {
  const res = await fetch(`${API_URL}/mats`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const deleteMaterial = async (id) => {
  const res = await fetch(`${API_URL}/mats/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const updateEstadoMaterial = async (id, estado) => {
  const res = await fetch(`${API_URL}/mats/${id}/estado`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ estado }),
  });
  return handleResponse(res);
};

// =========================
// 📦 ALMACÉN
// =========================

export const getAlmacen = async () => {
  const res = await fetch(`${API_URL}/almacen`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

export const createAlmacenItem = async (data) => {
  const res = await fetch(`${API_URL}/almacen`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const deleteAlmacenItem = async (id) => {
  const res = await fetch(`${API_URL}/almacen/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// =========================
// 👤 USUARIOS (Login)
// =========================

export const loginUser = async (credentials) => {
  const res = await fetch(`${API_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  
  // Para el login, mantenemos la lógica específica de errores
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Usuario o contraseña incorrectos");
  }
  return res.json();
};