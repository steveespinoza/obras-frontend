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

export const getReporteMaterial = async (material, inicio, fin) => {
  // Usamos encodeURIComponent por si el material tiene espacios (ej. "Arena Fina")
  const res = await fetch(
    `${API_URL}/requerimientos/reporte?material=${encodeURIComponent(material)}&inicio=${inicio}&fin=${fin}`, 
    { headers: getAuthHeaders() }
  );
  return handleResponse(res);
};

// =========================
// 📦 ALMACÉN
// =========================

// =========================
// 📦 ALMACÉN
// =========================

export const getAlmacen = async () => {
  // 1. Revisamos si ya tenemos el catálogo guardado en esta sesión
  const catalogoGuardado = sessionStorage.getItem('catalogoAlmacen');
  
  if (catalogoGuardado) {
    // Si existe, lo devolvemos inmediatamente sin llamar al servidor
    return JSON.parse(catalogoGuardado);
  }

  // 2. Si no existe, hacemos la petición normal al servidor
  const res = await fetch(`${API_URL}/almacen`, { headers: getAuthHeaders() });
  const data = await handleResponse(res);

  // 3. Antes de devolver los datos, los guardamos para la próxima vez
  if (data) {
    sessionStorage.setItem('catalogoAlmacen', JSON.stringify(data));
  }

  return data;
};

export const createAlmacenItem = async (data) => {
  const res = await fetch(`${API_URL}/almacen`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  // 🧹 Borramos el caché porque el catálogo cambió
  sessionStorage.removeItem('catalogoAlmacen');
  
  return handleResponse(res);
};

export const deleteAlmacenItem = async (id) => {
  const res = await fetch(`${API_URL}/almacen/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  
  // 🧹 Borramos el caché porque el catálogo cambió
  sessionStorage.removeItem('catalogoAlmacen');
  
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


// Llamada para registrar un nuevo usuario
export const registerUser = async (userData) => {
  const res = await fetch(`${API_URL}/users/registro`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(userData),
  });
  return handleResponse(res);
};

export const getUsuarios = async () => {
  const res = await fetch(`${API_URL}/users`, { headers: getAuthHeaders() });
  return handleResponse(res);
};