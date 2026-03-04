import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRequerimientos, deleteRequerimiento, updateEstadoRequerimiento, getRequerimientoById } from '../services/api';
import * as XLSX from 'xlsx';
import ConfirmModal from '../components/ConfirmModal';

// IMPORTAMOS NUESTRO NUEVO CSS
import './ListaRequerimientos.css';

function ListaRequerimientos({ usuarioActual = {} }) {
  const [requerimientos, setRequerimientos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  
  const [modalAbierto, setModalAbierto] = useState(false);
  const [idAEliminar, setIdAEliminar] = useState(null);

  const [modalDetallesAbierto, setModalDetallesAbierto] = useState(false);
  const [detallesActuales, setDetallesActuales] = useState(null);
  const [cargandoDetalles, setCargandoDetalles] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const data = await getRequerimientos();
      setRequerimientos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setRequerimientos([]);
    }
  };

  const solicitarEliminar = (id) => {
    setIdAEliminar(id);
    setModalAbierto(true);
  };

  const confirmarEliminacion = async () => {
    try {
      await deleteRequerimiento(idAEliminar);
      await cargarDatos();
      setModalAbierto(false);
      setIdAEliminar(null);
    } catch (error) {
      console.error("Error al eliminar", error);
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await updateEstadoRequerimiento(id, nuevoEstado);
      await cargarDatos();
    } catch (error) {
      console.error("Error al actualizar el estado", error);
    }
  };

  const verDetalles = async (id) => {
    setModalDetallesAbierto(true);
    setCargandoDetalles(true);
    try {
      const data = await getRequerimientoById(id);
      setDetallesActuales(data);
    } catch (error) {
      console.error("Error al cargar detalles", error);
    } finally {
      setCargandoDetalles(false);
    }
  };

  const cerrarDetalles = () => {
    setModalDetallesAbierto(false);
    setDetallesActuales(null);
  };

  const isAdmin = usuarioActual?.isAdmin || false;
  const userName = usuarioActual?.name || "";

  let requerimientosVisibles = isAdmin
    ? requerimientos
    : requerimientos.filter(req => req.trabajador === userName);

  if (busqueda.trim() !== "") {
    const texto = busqueda.toLowerCase();
    requerimientosVisibles = requerimientosVisibles.filter(req =>
      (req.trabajador && req.trabajador.toLowerCase().includes(texto)) ||
      (req.id.toString().includes(texto))
    );
  }

  const formatearFechaHora = (fechaIso) => {
    if (!fechaIso) return "";
    
    const fechaUTC = fechaIso.endsWith('Z') ? fechaIso : `${fechaIso}Z`;
    const fecha = new Date(fechaUTC);
    
    return fecha.toLocaleString('es-PE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const exportarAExcel = () => {
    const datosParaExcel = requerimientosVisibles.map(req => ({
      "ID Pedido": req.id,
      "Fecha y Hora": formatearFechaHora(req.fechaSolicitud),
      "Artículos Totales": req.cantidadMaterialesDiferentes,
      "Estado": req.estado,
      "Responsable": req.trabajador,
      "Especialidad": req.especialidad
    }));

    const hoja = XLSX.utils.json_to_sheet(datosParaExcel);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Pedidos");
    XLSX.writeFile(libro, "Lista_Pedidos_Obras.xlsx");
  };

  const getStatusClass = (estado) => {
    if (estado === "Listo") return "status-listo";
    if (estado === "Rechazado") return "status-rechazado";
    return "status-pendiente";
  };

  return (
    <div className="card">
      <ConfirmModal 
        isOpen={modalAbierto} 
        onClose={() => setModalAbierto(false)} 
        onConfirm={confirmarEliminacion}
        mensaje="¿Estás seguro de que deseas eliminar este pedido? Se borrarán todos los materiales incluidos en él."
      />

      {/* Modal de Detalles */}
      {modalDetallesAbierto && (
        <div className="modal-overlay">
          <div className="modal-content modal-content-lg">
            <div className="modal-header">
              <h3 className="modal-title">📦 Detalles del Pedido #{detallesActuales?.id}</h3>
              <button className="btn btn-close-modal" onClick={cerrarDetalles}>Cerrar</button>
            </div>
            
            {cargandoDetalles ? (
              <p>Cargando materiales...</p>
            ) : detallesActuales ? (
              <>
                <div className="info-box info-box-left">
                  <p className="info-text"><strong>Responsable:</strong> {detallesActuales.trabajador}</p>
                  <p className="info-text"><strong>Fecha y Hora:</strong> {formatearFechaHora(detallesActuales.fechaSolicitud)}</p>
                  <p className="info-text"><strong>Estado:</strong> <span className={`badge ${getStatusClass(detallesActuales.estado)}`}>{detallesActuales.estado}</span></p>
                </div>
                
                <div className="table-responsive">
                  <table className="table table-left">
                    <thead>
                      <tr>
                        <th>Material</th>
                        <th>Marca</th>
                        <th>Cantidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detallesActuales.detalles.map(mat => (
                        <tr key={mat.id}>
                          <td>{mat.name}</td>
                          <td>{mat.brand}</td>
                          <td>{mat.quantity} {mat.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p>Error al cargar la información.</p>
            )}
          </div>
        </div>
      )}

      <div className="list-header">
        <h2 className="title-no-margin">{isAdmin ? "Todos los Pedidos" : "Mis Pedidos"}</h2>

        <div className="actions-group">
          {isAdmin && (
            <button className="btn btn-success" onClick={exportarAExcel}>
              📊 Exportar a Excel
            </button>
          )}

          {!isAdmin && (
            <Link to="/nuevo" className="btn btn-primary">
              + Crear Nuevo Pedido
            </Link>
          )}
        </div>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder={isAdmin ? "🔍 Buscar por trabajador o ID de pedido..." : "🔍 Buscar por ID de pedido..."}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>ID Pedido</th>
              <th>Fecha y Hora</th>
              <th>Artículos</th>
              <th>Estado</th>
              {isAdmin && <th>Responsable</th>}
              {isAdmin && <th>Especialidad</th>}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {requerimientosVisibles.map((req) => (
              <tr key={req.id}>
                <td data-label="ID Pedido">#{req.id}</td>
                <td data-label="Fecha y Hora">{formatearFechaHora(req.fechaSolicitud)}</td>
                <td data-label="Artículos">
                  <span className="items-count">{req.cantidadMaterialesDiferentes} items</span>
                </td>
                
                <td data-label="Estado">
                  {isAdmin ? (
                    <select
                      value={req.estado || "Pendiente"}
                      onChange={(e) => cambiarEstado(req.id, e.target.value)}
                      className={`select-status ${getStatusClass(req.estado || "Pendiente")}`}
                    >
                      <option value="Pendiente">Pendiente ⏳</option>
                      <option value="Listo">Listo ✅</option>
                      <option value="Rechazado">Rechazado ❌</option>
                    </select>
                  ) : (
                    <span className={`badge ${getStatusClass(req.estado || "Pendiente")}`}>
                      {req.estado || "Pendiente"}
                    </span>
                  )}
                </td>
                
                {isAdmin && <td data-label="Responsable">{req.trabajador}</td>}
                {isAdmin && <td data-label="Especialidad">{req.especialidad}</td>}
                
                <td data-label="Acciones" className="actions-cell">
                  <button className="btn btn-view" onClick={() => verDetalles(req.id)}>
                    👁️ Ver
                  </button>

                  {!isAdmin && req.estado === "Pendiente" && (
                    <Link to={`/editar/${req.id}`} className="btn btn-edit">
                      ✏️ Editar
                    </Link>
                  )}

                  <button className="btn btn-danger" onClick={() => solicitarEliminar(req.id)}>
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
            {requerimientosVisibles.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 7 : 5} className="text-center">
                  No se encontraron pedidos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ListaRequerimientos;