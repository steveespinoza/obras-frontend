import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMateriales, deleteMaterial, updateEstadoMaterial } from '../services/api';
import * as XLSX from 'xlsx';

function ListaMateriales({ usuarioActual = {} }) {
  const [materiales, setMateriales] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    cargarMateriales();
  }, []);

  const cargarMateriales = async () => {
    try {
      const data = await getMateriales();
      setMateriales(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setMateriales([]);
    }
  };

  const eliminarMaterial = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este material?")) return;
    try {
      await deleteMaterial(id);
      await cargarMateriales();
    } catch (error) {
      alert("Error al eliminar material");
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await updateEstadoMaterial(id, nuevoEstado);
      await cargarMateriales();
    } catch (error) {
      alert("Error al actualizar el estado");
    }
  };

  const listaSegura = Array.isArray(materiales) ? materiales : [];
  const isAdmin = usuarioActual?.isAdmin || false;
  const userName = usuarioActual?.name || "";

  let materialesVisibles = isAdmin
    ? listaSegura
    : listaSegura.filter(mat => mat.trabajador === userName);

  if (busqueda.trim() !== "") {
    const textoMinusculas = busqueda.toLowerCase();
    materialesVisibles = materialesVisibles.filter(mat => 
      (mat.trabajador && mat.trabajador.toLowerCase().includes(textoMinusculas)) ||
      (mat.name && mat.name.toLowerCase().includes(textoMinusculas))
    );
  }

  const exportarAExcel = () => {
    const datosParaExcel = materialesVisibles.map(mat => ({
      "ID": mat.id,
      "Material": mat.name,
      "Marca": mat.brand,
      "Cantidad": mat.quantity,
      "Unidad": mat.unit,
      "Estado": mat.estado,
      "Responsable": mat.trabajador || mat.Trabajador,
      "Especialidad": mat.especialidad || mat.Especialidad || "Sin definir"
    }));

    const hoja = XLSX.utils.json_to_sheet(datosParaExcel);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Requerimientos");
    XLSX.writeFile(libro, "Lista_Requerimientos_Obras.xlsx");
  };

  // ¡AQUÍ ESTÁ LA NUEVA FUNCIÓN! 
  // Devuelve el nombre de la clase CSS en lugar del código de color.
  const getStatusClass = (estado) => {
    if (estado === "Aprobado") return "status-aprobado";
    if (estado === "Rechazado") return "status-rechazado";
    return "status-pendiente";
  };

  return (
    <div className="card">
      <div className="list-header">
        <h2 style={{ margin: 0 }}>{isAdmin ? "Todos los Requerimientos" : "Mis Requerimientos"}</h2>

        <div className="actions-group">
          {isAdmin && (
            <button className="btn btn-success" onClick={exportarAExcel}>
              📊 Exportar a Excel
            </button>
          )}

          {!isAdmin && (
            <Link to="/nuevo" className="btn btn-primary">
              + Agregar Nuevo
            </Link>
          )}
        </div>
      </div>

      <div className="search-container">
        <input 
          type="text" 
          placeholder={isAdmin ? "🔍 Buscar por trabajador o material..." : "🔍 Buscar material..."}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Material</th>
              <th>Marca</th>
              <th>Cantidad</th>
              <th>Unidad</th>
              <th>Estado</th>
              {isAdmin && <th>Responsable</th>}
              {isAdmin && <th>Especialidad</th>}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {materialesVisibles.map((mat) => (
              <tr key={mat.id}>
                <td data-label="ID">{mat.id}</td>
                <td data-label="Material">{mat.name}</td>
                <td data-label="Marca">{mat.brand}</td>
                <td data-label="Cantidad">{mat.quantity}</td>
                <td data-label="Unidad">{mat.unit}</td>
                
                <td data-label="Estado">
                  {isAdmin ? (
                    <select 
                      value={mat.estado || "Pendiente"} 
                      onChange={(e) => cambiarEstado(mat.id, e.target.value)}
                      /* Usamos template literals para combinar la clase base y la clase de color */
                      className={`select-status ${getStatusClass(mat.estado || "Pendiente")}`}
                    >
                      <option value="Pendiente">Pendiente ⏳</option>
                      <option value="Aprobado">Aprobado ✅</option>
                      <option value="Rechazado">Rechazado ❌</option>
                    </select>
                  ) : (
                    /* Lo mismo para el usuario, pero con la clase 'badge' */
                    <span className={`badge ${getStatusClass(mat.estado || "Pendiente")}`}>
                      {mat.estado || "Pendiente"}
                    </span>
                  )}
                </td>
                
                {isAdmin && <td data-label="Responsable">{mat.trabajador}</td>}
                {isAdmin && <td data-label="Especialidad">{mat.especialidad || mat.Especialidad || "⚠️ Vacío"}</td>}
                
                <td data-label="Acciones">
                  <button className="btn btn-danger" onClick={() => eliminarMaterial(mat.id)}>
                    🗑️ Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {materialesVisibles.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 9 : 7} className="text-center">
                  No se encontraron requerimientos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ListaMateriales;