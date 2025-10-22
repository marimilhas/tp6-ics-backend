import React, { useMemo } from "react";

const ResumenCompra = ({ compra, onEditar, onConfirmar }) => {
  
  const { edadesAgrupadas, cantidadRegulares, cantidadVIP } = useMemo(() => {
    const edades = compra.entradas
      .map(e => e.edad)
      .sort((a, b) => a - b)
      .reduce((acc, edad) => {
        acc[edad] = (acc[edad] || 0) + 1;
        return acc;
      }, {});

    return {
      edadesAgrupadas: Object.entries(edades),
      cantidadRegulares: compra.entradas.filter(e => e.pase === "regular").length,
      cantidadVIP: compra.entradas.filter(e => e.pase === "VIP").length
    };
  }, [compra]);

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-green-light">
      <h2 className="text-2xl font-bold text-green-dark mb-6 text-center">
        Resumen de tu Compra
      </h2>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-pale/25 p-4 rounded-lg">
            <h3 className="font-semibold text-green-dark mb-2">Fecha de Visita</h3>
            <p className="text-lg">{new Date(compra.fecha).toLocaleDateString('es-ES')}</p>
          </div>

          <div className="bg-green-pale/25 p-4 rounded-lg">
            <h3 className="font-semibold text-green-dark mb-2">Cantidad de Entradas</h3>
            <p className="text-lg">{compra.cantidad}</p>
          </div>
        </div>

        <div className="bg-green-pale/25 p-4 rounded-lg">
          <h3 className="font-semibold text-green-dark mb-3">Detalles</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Pases regulares:</span>
              <span className="font-medium">{cantidadRegulares}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium">Pases VIP:</span>
              <span className="font-medium">{cantidadVIP}</span>
            </div>

            <div className="flex justify-between items-start">
              <span className="font-medium">Edades:</span>
              <div className="flex flex-wrap gap-2 justify-end">
                {edadesAgrupadas.map(([edad, cantidad], index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-green-pale/70 rounded text-sm"
                  >
                    {cantidad > 1 ? `${cantidad}×${edad}` : edad} {edad === '1' ? 'año' : 'años'}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <span className="font-medium">Método de Pago:</span>
              <span className="font-medium capitalize">
                {compra.formaPago === 'tarjeta' ? 'Tarjeta (Mercado Pago)' : 'Efectivo'}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Email:</span>
              <span className="font-medium">{compra.mail}</span>
            </div>
          </div>
        </div>

        <div className="bg-green-light/20 border border-green-light rounded-lg p-4">
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total a Pagar:</span>
            <span className="text-green-dark">${compra.total}</span>
          </div>
        </div>

        <div className="bg-green-light/20 border border-green-light rounded-lg p-4">
          <h4 className="font-bold text-green-dark mb-2">Información Importante</h4>
          <ul className="text-sm text-green-dark space-y-1">
            <li>• Presentar este resumen en la entrada del parque</li>
            <li>• Llegar 15 minutos antes de la hora programada</li>
            {compra.formaPago === 'efectivo' && (
              <li>• Pago en efectivo se realiza al ingresar al parque</li>
            )}
            {compra.formaPago === 'tarjeta' && (
              <li>• Serás redirigido a Mercado Pago para el pago</li>
            )}
          </ul>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={onEditar}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 rounded-lg transition-colors"
          >
            Editar Compra
          </button>
          <button
            onClick={onConfirmar}
            className="flex-1 bg-green-forest hover:bg-green-dark text-white font-medium py-3 rounded-lg transition-colors"
          >
            Confirmar Compra
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumenCompra;