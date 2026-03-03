import { useState, useEffect } from 'react';
import { getAlmacen, getReporteMaterial } from '../services/api';

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
    <div className="card" style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1' }}>
      <div className="list-header" style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#1e293b' }}>📊 Reporte de Materiales Solicitados</h2>
      </div>

      {/* FORMULARIO DE FILTROS */}
      <form onSubmit={buscarReporte} className="card" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.04)' }}>
        <div className="form-row" style={{ alignItems: 'flex-end' }}>
          
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#475569' }}>Material a consultar:</label>
            <input 
              type="text" name="material" list="lista-almacen-reporte"
              placeholder="Ej. Cemento Sol..." value={filtros.material} onChange={handleChange} required 
            />
            <datalist id="lista-almacen-reporte">
              {almacen.map(mat => <option key={mat.id} value={mat.name} />)}
            </datalist>
          </div>

          <div style={{ flex: '1 1 150px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#475569' }}>Fecha Inicio:</label>
            <input type="date" name="inicio" value={filtros.inicio} onChange={handleChange} required />
          </div>

          <div style={{ flex: '1 1 150px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#475569' }}>Fecha Fin:</label>
            <input type="date" name="fin" value={filtros.fin} onChange={handleChange} required />
          </div>

          <div style={{ flex: '0 0 auto' }}>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '10px 20px', height: '42px' }}>
              {loading ? 'Consultando...' : '🔍 Buscar'}
            </button>
          </div>

        </div>
      </form>

      {/* RESULTADOS */}
      {buscado && (
        <div style={{ marginTop: '20px' }}>
          {resultados.length === 0 ? (
            <div className="card text-center" style={{ padding: '40px', color: '#64748b', backgroundColor: '#ffffff', border: '1px dashed #cbd5e1' }}>
              <div style={{ fontSize: '30px', marginBottom: '10px' }}>📉</div>
              <p style={{ margin: 0 }}>No se encontraron pedidos de <strong>"{filtros.material}"</strong> en este rango de fechas.</p>
            </div>
          ) : (
            <div className="table-responsive" style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
              <table className="table" style={{ margin: 0 }}>
                <thead style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                  <tr>
                    <th>Material Encontrado</th>
                    <th>Unidad de Medida</th>
                    <th>Total Solicitado (Aprobados y Pendientes)</th>
                  </tr>
                </thead>
                <tbody>
                  {resultados.map((res, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td data-label="Material"><strong>{res.material}</strong></td>
                      <td data-label="Unidad"><span style={{ backgroundColor: '#e2e8f0', padding: '4px 8px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>{res.unidad}</span></td>
                      <td data-label="Total Solicitado">
                        <span style={{ fontSize: '18px', fontWeight: '900', color: '#16a34a' }}>{res.totalSolicitado}</span>
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