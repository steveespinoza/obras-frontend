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
// INTERCEPTOR DE RESPUESTAS
// =========================================
const handleResponse = async (res) => {
  if (res.status === 401) {
    window.dispatchEvent(new Event("session_expired"));
    throw new Error("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Error en la petición al servidor");
  }

  if (res.status === 204) return null;

  return res.json();
};

// =========================
// 📦 REQUERIMIENTOS (Pedidos)
// =========================

export const getRequerimientos = async () => {
  const res = await fetch(`${API_URL}/requerimientos`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

export const getRequerimientoById = async (id) => {
  const res = await fetch(`${API_URL}/requerimientos/${id}`, { headers: getAuthHeaders() });
  return handleResponse(res);
};

export const createRequerimiento = async (data) => {
  const res = await fetch(`${API_URL}/requerimientos`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const deleteRequerimiento = async (id) => {
  const res = await fetch(`${API_URL}/requerimientos/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

export const updateEstadoRequerimiento = async (id, estado) => {
  const res = await fetch(`${API_URL}/requerimientos/${id}/estado`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ estado }),
  });
  return handleResponse(res);
};

export const updateRequerimientoCompleto = async (id, data) => {
  const res = await fetch(`${API_URL}/requerimientos/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
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
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Usuario o contraseña incorrectos");
  }
  return res.json();
};