import { useEffect, useState } from 'react';
import { getAlmacen, createAlmacenItem, deleteAlmacenItem } from '../services/api';

function Almacen() {
  const [materialesBase, setMaterialesBase] = useState([]);
  const [nuevoNombre, setNuevoNombre] = useState('');

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
      alert("El nombre no puede estar vacío");
      return;
    }

    try {
      const nuevo = await createAlmacenItem({ name: nuevoNombre });
      setMaterialesBase(prev => [...prev, nuevo]);
      setNuevoNombre('');
    } catch (error) {
      alert("Error al guardar en el almacén");
    }
  };

  const eliminarMaterial = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este material?")) return;

    try {
      await deleteAlmacenItem(id);
      setMaterialesBase(prev => prev.filter(mat => mat.id !== id));
    } catch (error) {
      alert("Error al eliminar");
    }
  };

  return (
    <div className="card">
      <h2>Catálogo de Almacén</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
        Agrega los materiales base para que luego estén disponibles en los requerimientos.
      </p>

      {/* Formulario usando la clase reutilizable form-row y search-container para los márgenes */}
      <div className="search-container">
        <form onSubmit={agregarMaterial} className="form-row">
          <input
            type="text"
            placeholder="Ej: Arena Fina"
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            required
          />

          <button type="submit" className="btn btn-success">
            + Agregar
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
                    onClick={() => eliminarMaterial(mat.id)}
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