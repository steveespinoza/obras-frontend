import { useEffect, useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { getAlmacen, createRequerimiento, getRequerimientoById, updateRequerimientoCompleto } from '../services/api';
import useToast from '../hooks/useToast';
import './FormularioRequerimiento.css'; 

// IMPORTAMOS NUESTROS NUEVOS COMPONENTES HIJOS
import RequerimientoForm from '../components/RequerimientoForm';
import RequerimientoCart from '../components/RequerimientoCart';

function FormularioRequerimiento({ usuarioActual }) {
  const [almacen, setAlmacen] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams(); 

  const { mostrarNotificacion } = useToast(); 
  
  const [loading, setLoading] = useState(false);
  const [cargandoPedidoInicial, setCargandoPedidoInicial] = useState(false);
  
  const [carrito, setCarrito] = useState(() => {
  // Si estamos editando un pedido (hay un ID en la URL), empezamos vacío 
  // porque el useEffect de abajo se encargará de traer los datos de la BD.
    if (id) return [];
    
    // Si es un pedido NUEVO, buscamos si hay un borrador guardado
    const borrador = localStorage.getItem('carritoBorrador');
    return borrador ? JSON.parse(borrador) : [];
  });
  const [editIndex, setEditIndex] = useState(null);

  const [formData, setFormData] = useState({
    id: null, 
    name: '', 
    brand: 'Generico', 
    quantity: '', 
    unit: 'unidades'
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

  // Auto-guardar el carrito en localStorage (solo para pedidos nuevos)
  useEffect(() => {
    if (!id) {
      localStorage.setItem('carritoBorrador', JSON.stringify(carrito));
    }
  }, [carrito, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'quantity' ? Number(value) : value
    });
  };

  const procesarFormulario = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.quantity) {
      mostrarNotificacion("Completa el nombre y la cantidad del material", "error");
      return;
    }

    const materialAEnviar = {
      ...formData,
      brand: formData.brand.trim() === '' ? 'Generico' : formData.brand
    };

    if (editIndex !== null) {
      const nuevoCarrito = [...carrito];
      nuevoCarrito[editIndex] = materialAEnviar;
      setCarrito(nuevoCarrito);
      setEditIndex(null);
    } else {
      setCarrito([...carrito, materialAEnviar]);
    }
    setFormData({ id: null, name: '', brand: 'Generico', quantity: '', unit: 'unidades' });
  };

  const editarDelCarrito = (index) => {
    setFormData(carrito[index]);
    setEditIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicion = () => {
    setFormData({ id: null, name: '', brand: 'Generico', quantity: '', unit: 'unidades' });
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

    try {
      const datosParaEnviar = { trabajadorId: usuarioActual.id, detalles: carrito };
      if (id) {
        await updateRequerimientoCompleto(id, datosParaEnviar);
        mostrarNotificacion('¡Pedido actualizado con éxito! ✏️', 'success');
      } else {
        await createRequerimiento(datosParaEnviar);
        mostrarNotificacion('¡Requerimiento creado con éxito! 🚀', 'success');
        
        // ✨ ¡NUEVO! Borramos el borrador local porque ya se envió a la BD
        localStorage.removeItem('carritoBorrador');
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

      <div className="form-header">
        <h2>{id ? `Editando Pedido #${id}` : 'Crear Nuevo Requerimiento'}</h2>
        <Link to="/">⬅ Volver a la lista</Link>
      </div>

      {/* 1. USAMOS EL COMPONENTE DEL FORMULARIO */}
      <RequerimientoForm 
        formData={formData}
        editIndex={editIndex}
        almacen={almacen}
        onChange={handleChange}
        onSubmit={procesarFormulario}
        onCancel={cancelarEdicion}
      />

      {/* 2. USAMOS EL COMPONENTE DEL CARRITO */}
      <RequerimientoCart 
        carrito={carrito}
        editIndex={editIndex}
        onEdit={editarDelCarrito}
        onRemove={quitarDelCarrito}
      />

      <div className="req-submit-section">
        <button 
          type="button" 
          className="btn btn-success btn-submit-req" 
          onClick={enviarRequerimientoCompleto} 
          disabled={loading || carrito.length === 0 || editIndex !== null}
        >
          {loading ? 'Procesando...' : id ? '💾 Guardar Pedido Actualizado' : '🚀 Enviar Pedido a Revisión'}
        </button>
      </div>
    </div>
  );
}

export default FormularioRequerimiento;