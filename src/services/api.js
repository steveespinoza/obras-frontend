// Usamos variables de entorno para producción, o localhost para desarrollo
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5035";

// =========================================
// 🔐 FUNCIÓN AUXILIAR DE SEGURIDAD
// =========================================
// Esta función revisa si hay un usuario logueado y saca su token.
const getAuthHeaders = () => {
  const headers = { "Content-Type": "application/json" };
  const usuarioGuardado = localStorage.getItem("usuarioObras");
  
  if (usuarioGuardado) {
    const usuario = JSON.parse(usuarioGuardado);
    // .NET Minimal APIs suele convertir la primera letra a minúscula (camelCase)
    const token = usuario.token || usuario.Token; 
    
    if (token) {
      // Aquí "adjuntamos" el pase VIP
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
};

// =========================
// 📦 MATERIALES
// =========================

export const getMateriales = async () => {
  const res = await fetch(`${API_URL}/mats`, {
    headers: getAuthHeaders(), // <-- Agregamos el Token aquí
  });
  if (!res.ok) throw new Error("Error al obtener materiales");
  return res.json();
};

export const createMaterial = async (data) => {
  const res = await fetch(`${API_URL}/mats`, {
    method: "POST",
    headers: getAuthHeaders(), // <-- Y aquí
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Error al crear material");
  return res.json();
};

export const deleteMaterial = async (id) => {
  const res = await fetch(`${API_URL}/mats/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(), // <-- Para borrar es obligatorio
  });

  if (!res.ok) throw new Error("Error al eliminar material");
};

export const updateEstadoMaterial = async (id, estado) => {
  const res = await fetch(`${API_URL}/mats/${id}/estado`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ estado }),
  });

  if (!res.ok) throw new Error("Error al cambiar el estado");
};

// =========================
// 📦 ALMACÉN
// =========================

export const getAlmacen = async () => {
  const res = await fetch(`${API_URL}/almacen`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al obtener almacén");
  return res.json();
};

export const createAlmacenItem = async (data) => {
  const res = await fetch(`${API_URL}/almacen`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Error al crear material base");
  return res.json();
};

export const deleteAlmacenItem = async (id) => {
  const res = await fetch(`${API_URL}/almacen/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error("Error al eliminar material base");
};

// =========================
// 👤 USUARIOS (Login)
// =========================

export const getUsers = async () => {
  const res = await fetch(`${API_URL}/users`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al obtener usuarios");
  return res.json();
};

// ⚠️ El Login NO lleva getAuthHeaders() porque aún no tenemos token al iniciar sesión
export const loginUser = async (credentials) => {
  const res = await fetch(`${API_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    // Intentamos capturar el error exacto que mande el backend si existe
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Usuario o contraseña incorrectos");
  }

  return res.json();
};