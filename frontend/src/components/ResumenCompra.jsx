import React from "react";

const ResumenCompra = ({ compra }) => {
  // Función para calcular precio individual - CORREGIDA
  const calcularPrecioIndividual = (edad, tipo) => {
    const PRECIOS = { regular: 5000, vip: 10000 };
    if (edad < 3) return 0; // Menores de 3 no pagan (0, 1, 2 años)
    if (edad < 10) return PRECIOS[tipo] * 0.5; // Menores de 10: 3-9 años (mitad)
    if (edad >= 60) return PRECIOS[tipo] * 0.5; // Mayores de 60: 60+ años (mitad)
    return PRECIOS[tipo]; // Precio completo: 10-59 años
  };

  // Calcular total
  const calcularTotal = () => {
    let total = 0;
    compra.edades.forEach((edad, index) => {
      total += calcularPrecioIndividual(edad, compra.tiposEntrada[index]);
    });
    return total;
  };

  // Obtener categoría por edad
  const obtenerCategoriaEdad = (edad) => {
    if (edad < 3) return { tipo: "Infante", descuento: "Gratis" };
    if (edad < 10) return { tipo: "Niño", descuento: "50% Desc" };
    if (edad < 60) return { tipo: "Adulto", descuento: "Precio Completo" };
    return { tipo: "Adulto Mayor", descuento: "50% Desc" };
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-green-100">
      <h2 className="text-2xl font-bold text-green-800 mb-6 text-center">
        Resumen de tu Compra
      </h2>

      <div className="space-y-6">
        {/* Información General */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Fecha de Visita</h3>
            <p className="text-lg">{new Date(compra.fecha).toLocaleDateString('es-ES')}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Hora de Visita</h3>
            <p className="text-lg">{compra.hora} hs</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Cantidad de Entradas</h3>
            <p className="text-lg">{compra.cantidad}</p>
          </div>
        </div>

        {/* Detalles de los Visitantes */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-3">Detalles de Visitantes</h3>
          <div className="space-y-3">
            {compra.edades.map((edad, index) => {
              const tipo = compra.tiposEntrada[index];
              const precio = calcularPrecioIndividual(edad, tipo);
              const categoria = obtenerCategoriaEdad(edad);
              
              return (
                <div key={index} className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium">Visitante {index + 1}</span>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        categoria.tipo === "Infante" ? "bg-green-100 text-green-800 border border-green-300" :
                        categoria.tipo === "Niño" ? "bg-blue-100 text-blue-800 border border-blue-300" :
                        categoria.tipo === "Adulto" ? "bg-purple-100 text-purple-800 border border-purple-300" :
                        "bg-orange-100 text-orange-800 border border-orange-300"
                      }`}>
                        {categoria.tipo}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span>{edad} años • </span>
                      <span className={`font-medium ${tipo === 'vip' ? 'text-purple-600' : 'text-blue-600'}`}>
                        {tipo.toUpperCase()}
                      </span>
                      <span> • {categoria.descuento}</span>
                    </div>
                  </div>
                  <span className="font-semibold text-lg">${precio}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Información de Pago */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-3">Información de Pago</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Método de Pago:</span>
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

        {/* Total */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total a Pagar:</span>
            <span className="text-green-800 text-xl">${calcularTotal()}</span>
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Información Importante</h4>
          <ul className="text-sm text-blue-700 space-y-1">
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
      </div>
    </div>
  );
};

export default ResumenCompra;