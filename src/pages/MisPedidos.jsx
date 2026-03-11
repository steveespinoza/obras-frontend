import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRequerimientos, deleteRequerimiento, getRequerimientoById } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';
import './ListaRequerimientos.css';

function MisPedidos() {
  const [requerimientos, setRequerimientos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  
  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  
  // Modal Eliminar
  const [modalAbierto, setModalAbierto] = useState(false);
  const [idAEliminar, setIdAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  // Modal Detalles
  const [modalDetallesAbierto, setModalDetallesAbierto] = useState(false);
  const [detallesActuales, setDetallesActuales] = useState(null);
  const [cargandoDetalles, setCargandoDetalles] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [paginaActual]);

  const cargarDatos = async () => {
    try {
      const data = await getRequerimientos(paginaActual, 50);
      setRequerimientos(Array.isArray(data.items) ? data.items : []);
      setTotalPaginas(data.totalPaginas || 1);
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
    setEliminando(true);
    try {
      await deleteRequerimiento(idAEliminar);
      setModalAbierto(false);
      setIdAEliminar(null);

      // Si borramos el último de la página, retrocedemos
      if (requerimientos.length === 1 && paginaActual > 1) {
        setPaginaActual(paginaActual - 1);
      } else {
        await cargarDatos();
      }
    } catch (error) {
      console.error("Error al eliminar", error);
    } finally {
      setEliminando(false);
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

  // Filtrado de búsqueda visual por ID
  let requerimientosVisibles = requerimientos;
  if (busqueda.trim() !== "") {
    requerimientosVisibles = requerimientosVisibles.filter(req => req.id.toString().includes(busqueda));
  }

  const formatearFechaHora = (fechaIso) => {
    if (!fechaIso) return "";
    const fecha = new Date(fechaIso.endsWith('Z') ? fechaIso : `${fechaIso}Z`);
    return fecha.toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
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
        mensaje="¿Estás seguro de que deseas eliminar este pedido?"
        isLoading={eliminando}
      />

      {/* Modal Detalles */}
      {modalDetallesAbierto && (
        <div className="modal-overlay">
          <div className="modal-content modal-content-lg">
            <div className="modal-header">
              <h3 className="modal-title">📦 Detalles del Pedido #{detallesActuales?.id}</h3>
              <button className="btn btn-close-modal" onClick={cerrarDetalles}>Cerrar</button>
            </div>
            
            {cargandoDetalles ? <p>Cargando materiales...</p> : detallesActuales ? (
              <>
                <div className="info-box info-box-left">
                  <p className="info-text"><strong>Fecha y Hora:</strong> {formatearFechaHora(detallesActuales.fechaSolicitud)}</p>
                  <p className="info-text"><strong>Estado:</strong> <span className={`badge ${getStatusClass(detallesActuales.estado)}`}>{detallesActuales.estado}</span></p>
                </div>
                <div className="table-responsive">
                  <table className="table table-left">
                    <thead><tr><th>Material</th><th>Marca</th><th>Cantidad</th></tr></thead>
                    <tbody>
                      {detallesActuales.detalles.map(mat => (
                        <tr key={mat.id}><td>{mat.name}</td><td>{mat.brand}</td><td>{mat.quantity} {mat.unit}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : <p>Error al cargar la información.</p>}
          </div>
        </div>
      )}

      <div className="list-header">
        <h2 className="title-no-margin">Mis Pedidos</h2>
        <div className="actions-group">
          <Link to="/nuevo" className="btn btn-primary">+ Crear Nuevo Pedido</Link>
        </div>
      </div>

      <div className="search-container">
        <input type="text" placeholder="🔍 Buscar por ID de pedido..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
      </div>

      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr><th>ID Pedido</th><th>Fecha y Hora</th><th>Artículos</th><th>Estado</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {requerimientosVisibles.map((req) => (
              <tr key={req.id}>
                <td data-label="ID Pedido">#{req.id}</td>
                <td data-label="Fecha y Hora">{formatearFechaHora(req.fechaSolicitud)}</td>
                <td data-label="Artículos"><span className="items-count">{req.cantidadMaterialesDiferentes} items</span></td>
                <td data-label="Estado"><span className={`badge ${getStatusClass(req.estado)}`}>{req.estado}</span></td>
                <td data-label="Acciones" className="actions-cell">
                  <button className="btn btn-view" onClick={() => verDetalles(req.id)}>👁️ Ver</button>
                  {req.estado === "Pendiente" && <Link to={`/editar/${req.id}`} className="btn btn-edit">✏️ Editar</Link>}
                  <button className="btn btn-danger" onClick={() => solicitarEliminar(req.id)}>🗑️</button>
                </td>
              </tr>
            ))}
            {requerimientosVisibles.length === 0 && <tr><td colSpan="5" className="text-center">No se encontraron pedidos.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
          <button className="btn btn-secondary" disabled={paginaActual === 1} onClick={() => setPaginaActual(paginaActual - 1)}>⬅ Anterior</button>
          <span style={{ fontWeight: 'bold', color: '#475569' }}>Página {paginaActual} de {totalPaginas}</span>
          <button className="btn btn-primary" disabled={paginaActual === totalPaginas} onClick={() => setPaginaActual(paginaActual + 1)}>Siguiente ➡</button>
        </div>
      )}
    </div>
  );
}

export default MisPedidos;