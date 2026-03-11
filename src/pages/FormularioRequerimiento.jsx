import { useEffect, useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { getAlmacen, createRequerimiento, getRequerimientoById, updateRequerimientoCompleto } from '../services/api';
import useToast from '../hooks/useToast';
import './FormularioRequerimiento.css'; 
import RequerimientoForm from '../components/RequerimientoForm';
import RequerimientoCart from '../components/RequerimientoCart';

function FormularioRequerimiento({ usuarioActual }) {
  const [almacen, setAlmacen] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams(); 
  const { mostrarNotificacion } = useToast(); 
  
  const [loading, setLoading] = useState(false);
  const [cargandoPedidoInicial, setCargandoPedidoInicial] = useState(false);

  // 1. CLAVE DINÁMICA: Diferenciamos si es un borrador nuevo o una edición
  const keyLocal = id ? `carritoEdit_${id}_${usuarioActual?.id}` : `carritoBorrador_${usuarioActual?.id}`;
  
  // 2. INICIALIZAR CARRITO: Buscamos el borrador directamente
  const [carrito, setCarrito] = useState(() => {
    // IMPORTANTE: Aquí ya NO debe estar la línea "if (id) return [];"
    const borrador = localStorage.getItem(keyLocal);
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

  // 3. EFECTO: TRAER DATOS DE LA BASE DE DATOS
  useEffect(() => {
    getAlmacen().then(data => setAlmacen(data)).catch(err => console.error(err));

    if (id) {
      const borrador = localStorage.getItem(keyLocal);
      
      // SOLO llamamos a la base de datos si NO hay un borrador guardado, 
      // o si el borrador guardado es un array vacío "[]"
      if (!borrador || JSON.parse(borrador).length === 0) {
        setCargandoPedidoInicial(true);
        getRequerimientoById(id)
          .then(data => {
            if (data.estado !== "Pendiente") {
              alert("Solo se pueden editar pedidos Pendientes.");
              navigate('/');
              return;
            }
            setCarrito(data.detalles); // Esto llenará el carrito con la BD
          })
          .catch(err => console.error("Error cargando pedido:", err))
          .finally(() => setCargandoPedidoInicial(false));
      }
    }
  }, [id, navigate, keyLocal]);

  // 4. EFECTO: AUTO-GUARDAR EL CARRITO EN LOCALSTORAGE
  useEffect(() => {
    if (usuarioActual?.id) {
      // Evitamos guardar un array vacío en localStorage justo al cargar la página de edición, 
      // porque eso pisaría la lógica del efecto anterior.
      if (id && carrito.length === 0) return;
      
      localStorage.setItem(keyLocal, JSON.stringify(carrito));
    }
  }, [carrito, id, keyLocal, usuarioActual]);

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
        // MODO EDICIÓN
        await updateRequerimientoCompleto(id, datosParaEnviar);
        mostrarNotificacion('¡Pedido actualizado con éxito! ✏️', 'success');
        
        // ¡NUEVO! Limpiamos el borrador de edición al terminar
        localStorage.removeItem(keyLocal); 
      } else {
        // MODO CREACIÓN
        await createRequerimiento(datosParaEnviar);
        mostrarNotificacion('¡Requerimiento creado con éxito! 🚀', 'success');
        
        // Limpiamos el borrador nuevo
        localStorage.removeItem(keyLocal);
      }
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      mostrarNotificacion(error.message || 'Hubo un error al guardar el requerimiento.', 'error');
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
        loading={loading}
      />

      {/* 2. USAMOS EL COMPONENTE DEL CARRITO */}
      <RequerimientoCart 
        carrito={carrito}
        editIndex={editIndex}
        onEdit={editarDelCarrito}
        onRemove={quitarDelCarrito}
        loading={loading}
      />

      <div className="req-submit-section">
        <button 
          type="button" 
          className="btn btn-success btn-submit-req" 
          onClick={enviarRequerimientoCompleto} 
          disabled={loading || carrito.length === 0 || editIndex !== null}
        >
          {loading ? 'Procesando...' : id ? '💾 Guardar Pedido Actualizado' : ' Enviar Pedido a Revisión'}
        </button>
      </div>
    </div>
  );
}

export default FormularioRequerimiento;