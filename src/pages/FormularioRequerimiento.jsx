import { useEffect, useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { getAlmacen, createRequerimiento, getRequerimientoById, updateRequerimientoCompleto } from '../services/api';

function FormularioRequerimiento({ usuarioActual }) {
  const [almacen, setAlmacen] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams(); 

  const [toast, setToast] = useState({ visible: false, mensaje: '', tipo: '' });
  const [loading, setLoading] = useState(false);
  const [cargandoPedidoInicial, setCargandoPedidoInicial] = useState(false);
  
  const [carrito, setCarrito] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const [formData, setFormData] = useState({
    id: null, 
    name: '', brand: '', quantity: '', unit: 'unidades'
  });

  useEffect(() => {
    getAlmacen().then(data => setAlmacen(data)).catch(err => console.error(err));

    if (id) {
      setCargandoPedidoInicial(true);
      getRequerimientoById(id)
        .then(data => {
          if (data.estado !== "Pendiente") {
            alert("Solo se pueden editar pedidos Pendientes.");
            navigate('/');
            return;
          }
          setCarrito(data.detalles);
        })
        .catch(err => console.error("Error cargando pedido:", err))
        .finally(() => setCargandoPedidoInicial(false));
    }
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'quantity' ? Number(value) : value
    });
  };

  const mostrarNotificacion = (mensaje, tipo) => {
    setToast({ visible: true, mensaje, tipo });
    setTimeout(() => setToast({ visible: false, mensaje: '', tipo: '' }), 3000);
  };

  const procesarFormulario = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.quantity || !formData.brand) return;

    if (editIndex !== null) {
      const nuevoCarrito = [...carrito];
      nuevoCarrito[editIndex] = formData;
      setCarrito(nuevoCarrito);
      setEditIndex(null);
    } else {
      setCarrito([...carrito, formData]);
    }
    setFormData({ id: null, name: '', brand: '', quantity: '', unit: 'unidades' });
  };

  const editarDelCarrito = (index) => {
    setFormData(carrito[index]);
    setEditIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicion = () => {
    setFormData({ id: null, name: '', brand: '', quantity: '', unit: 'unidades' });
    setEditIndex(null);
  };

  const quitarDelCarrito = (index) => {
    setCarrito(carrito.filter((_, i) => i !== index));
    if (editIndex === index) cancelarEdicion();
    else if (editIndex !== null && editIndex > index) setEditIndex(editIndex - 1);
  };

  const enviarRequerimientoCompleto = async () => {
    if (carrito.length === 0) return;
    setLoading(true);

    const datosParaEnviar = {
      trabajadorId: usuarioActual.id,
      detalles: carrito 
    };

    try {
      if (id) {
        await updateRequerimientoCompleto(id, datosParaEnviar);
        mostrarNotificacion('¡Pedido actualizado con éxito! ✏️', 'success');
      } else {
        await createRequerimiento(datosParaEnviar);
        mostrarNotificacion('¡Requerimiento creado con éxito! 🚀', 'success');
      }
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      mostrarNotificacion('Hubo un error al guardar el requerimiento.', 'error');
      setLoading(false);
    }
  };

  if (cargandoPedidoInicial) {
    return <div className="card text-center"><h3>Cargando tu pedido... ⏳</h3></div>;
  }

  return (
    <div className="card">
      {toast.visible && <div className={`toast-container toast-${toast.tipo}`}>{toast.mensaje}</div>}

      <div className="form-header">
        <h2>{id ? `Editando Pedido #${id}` : 'Crear Nuevo Requerimiento'}</h2>
        <Link to="/">⬅ Volver a la lista</Link>
      </div>

      <form onSubmit={procesarFormulario} className="form-layout" style={{ 
        padding: '20px', backgroundColor: editIndex !== null ? '#eff6ff' : '#f8fafc',
        borderRadius: '12px', border: editIndex !== null ? '2px solid #3b82f6' : '1px dashed #cbd5e1',
        transition: 'all 0.3s'
      }}>
        <h4 style={{ marginTop: 0, color: editIndex !== null ? '#1d4ed8' : '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {editIndex !== null ? '✏️ Modificando material...' : '➕ Agregar material al pedido'}
        </h4>
        
        <input type="text" name="name" list="lista-almacen" placeholder="Escribe para buscar..." value={formData.name} onChange={handleChange} required />
        <datalist id="lista-almacen">
          {almacen.map(mat => <option key={mat.id} value={mat.name} />)}
        </datalist>
        <input type="text" name="brand" placeholder="Marca (ej. Sol, Aceros Arequipa)" value={formData.brand} onChange={handleChange} required />
        
        <div className="form-row">
          <input type="number" name="quantity" step="0.01" placeholder="Cantidad" value={formData.quantity} onChange={handleChange} required />
          <select name="unit" value={formData.unit} onChange={handleChange}>
            <option value="unidades">Unidades</option>
            <option value="kg">Kilogramos (kg)</option>
            <option value="m3">Metros Cúbicos (m3)</option>
            <option value="bolsas">Bolsas</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
          <button type="submit" className={editIndex !== null ? "btn btn-primary" : "btn btn-success"}>
            {editIndex !== null ? '💾 Confirmar Cambio' : '+ Añadir a la lista'}
          </button>
          {editIndex !== null && <button type="button" className="btn" style={{backgroundColor: '#e2e8f0'}} onClick={cancelarEdicion}>Cancelar</button>}
        </div>
      </form>

      {/* ============================================================
          NUEVA SECCIÓN DE MATERIALES (DISEÑO DE TARJETAS MODERNAS)
          ============================================================ */}
      <div style={{ marginTop: '40px' }}>
        <h4 style={{ color: '#334155', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px', marginBottom: '20px' }}>
          📦 Materiales en este Pedido <span style={{ backgroundColor: '#2563eb', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '14px', marginLeft: '8px' }}>{carrito.length}</span>
        </h4>
        
        {carrito.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            <p style={{ color: '#64748b', fontSize: '16px', margin: 0 }}>Aún no has agregado materiales a este requerimiento.</p>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '8px' }}>Usa el formulario de arriba para empezar a añadir.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {carrito.map((item, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                backgroundColor: editIndex === index ? '#eff6ff' : '#ffffff',
                border: editIndex === index ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                transition: 'all 0.2s ease',
                flexWrap: 'wrap', // Permite que en móviles se adapte
                gap: '15px'
              }}>
                
                {/* 1. Información del Material */}
                <div style={{ flex: '1 1 250px' }}>
                  <h5 style={{ margin: '0 0 6px 0', fontSize: '17px', color: '#0f172a' }}>{item.name}</h5>
                  <span style={{ fontSize: '13px', color: '#475569', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontWeight: '500' }}>
                    🏷️ Marca: {item.brand}
                  </span>
                </div>

                {/* 2. Cantidad destacada */}
                <div style={{ padding: '0 15px', textAlign: 'center', minWidth: '100px' }}>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: '#2563eb' }}>{item.quantity}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>{item.unit}</div>
                </div>

                {/* 3. Botones de Acción Estilizados */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  {/* Botón Editar Suave */}
                  <button 
                    type="button" 
                    onClick={() => editarDelCarrito(index)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '8px 14px', borderRadius: '8px',
                      border: '1px solid #cbd5e1', backgroundColor: '#ffffff',
                      color: '#475569', fontWeight: '600', cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.color = '#3b82f6'; e.currentTarget.style.backgroundColor = '#eff6ff'; }}
                    onMouseOut={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#475569'; e.currentTarget.style.backgroundColor = '#ffffff'; }}
                  >
                    ✏️ Editar
                  </button>

                  {/* Botón Eliminar Suave */}
                  <button 
                    type="button" 
                    onClick={() => quitarDelCarrito(index)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '8px 14px', borderRadius: '8px',
                      border: 'none', backgroundColor: '#fee2e2',
                      color: '#b91c1c', fontWeight: '600', cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#fecaca'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#fee2e2'; }}
                  >
                    🗑️ Quitar
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '40px', borderTop: '2px solid #f1f5f9', paddingTop: '25px', display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          type="button" 
          className="btn btn-success" 
          onClick={enviarRequerimientoCompleto} 
          disabled={loading || carrito.length === 0 || editIndex !== null}
          style={{ padding: '14px 28px', fontSize: '16px', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(22, 163, 74, 0.2)' }}
        >
          {loading ? 'Procesando...' : id ? '💾 Guardar Pedido Actualizado' : '🚀 Enviar Pedido a Revisión'}
        </button>
      </div>
    </div>
  );
}

export default FormularioRequerimiento;