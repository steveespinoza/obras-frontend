import { useEffect, useState } from 'react';
import { getAlmacen, createAlmacenItem, deleteAlmacenItem } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';

// 1. IMPORTAMOS NUESTRO CUSTOM HOOK
import useToast from '../hooks/useToast';

function Almacen() {
  const [materialesBase, setMaterialesBase] = useState([]);
  const [nuevoNombre, setNuevoNombre] = useState('');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [idAEliminar, setIdAEliminar] = useState(null);
  const [loading, setLoading] = useState(false);

  // 2. USAMOS EL HOOK (¡Mira qué limpio!)
  const { mostrarNotificacion, ToastComponent } = useToast();

  useEffect(() => {
    cargarAlmacen();
  }, []);

  const cargarAlmacen = async () => {
    try {
      const data = await getAlmacen();
      setMaterialesBase(data);
    } catch (error) {
      console.error(error);
    }
  };

  const agregarMaterial = async (e) => {
    e.preventDefault();

    if (!nuevoNombre.trim()) {
      mostrarNotificacion("El nombre no puede estar vacío", "error");
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      const nuevo = await createAlmacenItem({ name: nuevoNombre });
      setMaterialesBase(prev => [...prev, nuevo]);
      setNuevoNombre('');
      mostrarNotificacion("Material agregado al catálogo", "success");
    } catch (error) {
      mostrarNotificacion("Error al guardar en el almacén", "error");
    } finally {
      setLoading(false);
    }
  };

  const solicitarEliminar = (id) => {
    setIdAEliminar(id);
    setModalAbierto(true);
  };

  const confirmarEliminacion = async () => {
    try {
      await deleteAlmacenItem(idAEliminar);
      setMaterialesBase(prev => prev.filter(mat => mat.id !== idAEliminar));
      setModalAbierto(false);
      setIdAEliminar(null);
      mostrarNotificacion("Material eliminado del catálogo", "success");
    } catch (error) {
      mostrarNotificacion("Error al eliminar el material", "error");
      setModalAbierto(false);
    }
  };

  return (
    <div className="card">
      <ConfirmModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onConfirm={confirmarEliminacion}
        mensaje="¿Estás seguro de eliminar este material base del catálogo?"
      />

      {/* 3. RENDERIZAMOS EL COMPONENTE DEL HOOK */}
      <ToastComponent />

      <h2>Catálogo de Almacén</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
        Agrega los materiales base para que luego estén disponibles en los requerimientos.
      </p>

      <div className="search-container">
        <form onSubmit={agregarMaterial} className="form-row">
          <input
            type="text"
            placeholder="Ej: Arena Fina"
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            required
          />

          <button type="submit" className="btn btn-success" disabled={loading}>
            {loading ? 'Agregando...' : '+ Agregar'}
          </button>
        </form>
      </div>

      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre del Material</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {materialesBase.map((mat) => (
              <tr key={mat.id}>
                <td data-label="ID">{mat.id}</td>
                <td data-label="Material">{mat.name}</td>
                <td data-label="Acciones">
                  <button
                    className="btn btn-danger"
                    onClick={() => solicitarEliminar(mat.id)}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}

            {materialesBase.length === 0 && (
              <tr>
                <td colSpan="3" className="text-center">
                  El almacén está vacío.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Almacen;