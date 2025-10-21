import { useState } from 'react';
import { servicioCompra } from '../services/entradasService';

export const useCompraEntradas = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const procesarCompra = async (datosCompra) => {
    setLoading(true);
    setError(null);
    
    try {
      const compraProcesada = await servicioCompra.procesarCompra(datosCompra);
      
      // Mensaje de confirmación para el email
      const mensajeMail = `
        ¡Gracias por tu compra en EcoHarmony Park!
        
        Detalles de tu reserva:
        - Fecha de visita: ${new Date(datosCompra.fecha).toLocaleDateString('es-ES')}
        - Hora: ${datosCompra.hora}
        - Cantidad de entradas: ${datosCompra.cantidad}
        - Total: $${datosCompra.total}
        - Método de pago: ${datosCompra.formaPago === 'tarjeta' ? 'Tarjeta' : 'Efectivo'}
        
        Presenta este comprobante en la entrada del parque.
        ¡Te esperamos!
      `;

      return { compra: compraProcesada, mensajeMail };
    } catch (err) {
      const errorMessage = err.response?.data || 'Error al procesar la compra';
      setError(errorMessage);
      throw errorMessage;
    } finally {
      setLoading(false);
    }
  };

  return {
    procesarCompra,
    loading,
    error
  };
};