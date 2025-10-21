import api from './api';

export const entradasService = {
  // Pases
  getPases: () => api.get('/pases/'),
  getPaseById: (id) => api.get(`/pases/${id}/`),

  // Compras
  getCompras: () => api.get('/compras/'),
  getCompraById: (id) => api.get(`/compras/${id}/`),
  createCompra: (compraData) => api.post('/compras/', compraData),
  updateCompra: (id, compraData) => api.put(`/compras/${id}/`, compraData),
  deleteCompra: (id) => api.delete(`/compras/${id}/`),

  // Entradas
  getEntradas: () => api.get('/entradas/'),
  getEntradaById: (id) => api.get(`/entradas/${id}/`),
};

// Servicio para procesar compras con la lógica de negocio
export const servicioCompra = {
  procesarCompra: async (datosCompra) => {
    try {
      // Primero crear la compra
      const compraResponse = await entradasService.createCompra({
        fecha_visita: datosCompra.fecha,
        forma_pago: datosCompra.formaPago === 'tarjeta' ? 'TAR' : 'EFE',
        monto_total: datosCompra.total,
        estado_pago: 'PEN'
      });

      const compra = compraResponse.data;

      // Luego crear las entradas asociadas
      const entradasPromises = datosCompra.edades.map((edad, index) => {
        // Determinar el pase_id basado en el tipo de entrada
        const paseId = datosCompra.tiposEntrada[index] === 'vip' ? 2 : 1; // Ajusta según tus IDs
        
        return entradasService.createEntrada({
          compra: compra.id,
          pase: paseId,
          edad_visitante: edad,
          precio_calculado: datosCompra.preciosIndividuales?.[index] || 0
        });
      });

      await Promise.all(entradasPromises);

      return compra;
    } catch (error) {
      console.error('Error en procesarCompra:', error);
      throw error;
    }
  }
};