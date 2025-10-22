import React from "react";

const Confirmacion = ({ mensaje, compra }) => {
  // Contar cantidad de pases por tipo
  const cantidadRegulares = compra.entradas.filter(e => e.pase === "regular").length;
  const cantidadVIP = compra.entradas.filter(e => e.pase === "VIP").length;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-green-light text-center">
      <div className="w-16 h-16 bg-green-light/30 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-green-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-green-dark mb-4">
        ¡Compra Confirmada!
      </h2>

      <div className="bg-green-light/20 border border-green-light rounded-lg p-6 mb-6">
        <p className="text-green-dark mb-4">{mensaje}</p>

        {compra && (
          <div className="text-sm text-green-dark space-y-2 text-left">
            <div className="flex justify-between">
              <strong>Fecha de visita:</strong>
              <span>{new Date(compra.fecha).toLocaleDateString('es-ES')}</span>
            </div>
            <div className="flex justify-between">
              <strong>Cantidad de entradas:</strong>
              <span>{compra.cantidad} ({cantidadRegulares} regulares y {cantidadVIP} VIP)</span>
            </div>
            <div className="flex justify-between">
              <strong>Método de pago:</strong>
              <span>{compra.formaPago === 'tarjeta' ? 'Tarjeta (Mercado Pago)' : 'Efectivo'}</span>
            </div>
            <div className="flex justify-between">
              <strong>Total:</strong>
              <span className="font-bold">${compra.total}</span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800 text-sm">
          <strong>¡Importante!</strong> Se ha enviado un email de confirmación con los detalles de tu compra.
          {compra?.formaPago === 'tarjeta' && ' El pago se procesó exitosamente a través de Mercado Pago.'}
          {compra?.formaPago === 'efectivo' && ' Recuerda llevar el comprobante para pagar en boletería.'}
        </p>
      </div>

      {/* Botón para nueva compra */}
      <div className="mt-6">
        <button
          onClick={() => window.location.reload()}
          className="bg-green-forest hover:bg-green-dark text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Realizar Nueva Compra
        </button>
      </div>
    </div>
  );
};

export default Confirmacion;