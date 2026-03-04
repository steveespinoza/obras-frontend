import { useState, useEffect } from 'react';
import { getAlmacen, getReporteMaterial } from '../services/api';

// IMPORTAMOS NUESTRO NUEVO CSS
import './Reportes.css';

function Reportes() {
  const [almacen, setAlmacen] = useState([]);
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buscado, setBuscado] = useState(false);

  const [filtros, setFiltros] = useState({
    material: '',
    inicio: '',
    fin: ''
  });

  useEffect(() => {
    // Cargamos el catálogo para el autocompletado
    getAlmacen().then(data => setAlmacen(data)).catch(err => console.error(err));
  }, []);

  const handleChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const buscarReporte = async (e) => {
    e.preventDefault();
    if (!filtros.material || !filtros.inicio || !filtros.fin) return;

    setLoading(true);
    setBuscado(true);
    
    try {
      const data = await getReporteMaterial(filtros.material, filtros.inicio, filtros.fin);
      setResultados(data);
    } catch (error) {
      console.error("Error al obtener reporte", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card reportes-container">
      <div className="list-header" style={{ marginBottom: '20px' }}>
        <h2 className="reportes-title">📊 Reporte de Materiales Solicitados</h2>
      </div>

      {/* FORMULARIO DE FILTROS */}
      <form onSubmit={buscarReporte} className="card reportes-form">
        <div className="form-row reportes-form-row">
          
          <div className="reportes-form-group">
            <label className="reportes-label">Material a consultar:</label>
            <input 
              type="text" name="material" list="lista-almacen-reporte"
              placeholder="Ej. Cemento Sol..." value={filtros.material} onChange={handleChange} required 
            />
            <datalist id="lista-almacen-reporte">
              {almacen.map(mat => <option key={mat.id} value={mat.name} />)}
            </datalist>
          </div>

          <div className="reportes-form-group-small">
            <label className="reportes-label">Fecha Inicio:</label>
            <input type="date" name="inicio" value={filtros.inicio} onChange={handleChange} required />
          </div>

          <div className="reportes-form-group-small">
            <label className="reportes-label">Fecha Fin:</label>
            <input type="date" name="fin" value={filtros.fin} onChange={handleChange} required />
          </div>

          <div className="reportes-form-action">
            <button type="submit" className="btn btn-primary btn-search" disabled={loading}>
              {loading ? 'Consultando...' : '🔍 Buscar'}
            </button>
          </div>

        </div>
      </form>

      {/* RESULTADOS */}
      {buscado && (
        <div className="reportes-results">
          {resultados.length === 0 ? (
            <div className="card text-center reportes-empty">
              <div className="reportes-empty-icon">📉</div>
              <p>No se encontraron pedidos de <strong>"{filtros.material}"</strong> en este rango de fechas.</p>
            </div>
          ) : (
            <div className="table-responsive reportes-table-wrapper">
              <table className="table reportes-table">
                <thead className="reportes-thead">
                  <tr>
                    <th>Material Encontrado</th>
                    <th>Unidad de Medida</th>
                    <th>Total Solicitado (Aprobados y Pendientes)</th>
                  </tr>
                </thead>
                <tbody>
                  {resultados.map((res, index) => (
                    <tr key={index} className="reportes-tbody-tr">
                      <td data-label="Material"><strong>{res.material}</strong></td>
                      <td data-label="Unidad">
                        <span className="badge-unidad">{res.unidad}</span>
                      </td>
                      <td data-label="Total Solicitado">
                        <span className="texto-total-solicitado">{res.totalSolicitado}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Reportes;