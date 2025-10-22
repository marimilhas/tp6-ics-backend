// src/App.jsx
import React, { useState } from "react";
import FormularioCompra from "./components/FormularioCompra";
import ResumenCompra from "./components/ResumenCompra";
import Confirmacion from "./components/Confirmacion";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./App.css";

function App() {
  const [compra, setCompra] = useState(null);
  const [mensajeMail, setMensajeMail] = useState("");
  const [pasoActual, setPasoActual] = useState("formulario");
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [error, setError] = useState(null);

  const manejarCompraExitosa = (compraData, mailMsg) => {
    setCompra(compraData);
    setMensajeMail(mailMsg);
    setPasoActual("resumen");
    setError(null); // Limpiar errores anteriores
  };

  const manejarConfirmacion = async () => {
    setProcesandoPago(true);
    setError(null);
    
    try {
      // Aquí integrarías con Mercado Pago si es pago con tarjeta
      if (compra && compra.formaPago === 'tarjeta') {
        console.log("Integrando con Mercado Pago...");
        // Simular integración con Mercado Pago
        // await mercadoPagoService.procesarPago(compra);
        
        // Simular éxito después de un breve delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // En un caso real, aquí procesarías el pago y obtendrías la respuesta
        console.log("Pago procesado exitosamente");
      } else if (compra && compra.formaPago === 'efectivo') {
        // Para efectivo, solo confirmamos inmediatamente
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      setPasoActual("confirmacion");
      
    } catch (error) {
      console.error('Error en confirmación:', error);
      setError(error.message || "Error al procesar el pago. Por favor, intente nuevamente.");
    } finally {
      setProcesandoPago(false);
    }
  };

  const manejarNuevaCompra = () => {
    setCompra(null);
    setMensajeMail("");
    setPasoActual("formulario");
    setError(null);
  };

  const manejarVolverAFormulario = () => {
    setPasoActual("formulario");
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col app-background">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Indicador de Pasos */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-center">
            {/* Paso 1: Formulario */}
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                pasoActual === "formulario" 
                  ? "bg-green-forest border-green-dark text-white" 
                  : pasoActual === "resumen" || pasoActual === "confirmacion"
                  ? "bg-green-medium border-green-forest text-white"
                  : "bg-white border-green-light text-green-medium"
              }`}>
                1
              </div>
              <span className={`ml-2 font-medium ${
                pasoActual === "formulario" ? "text-green-dark" : "text-green-medium"
              }`}>
                Compra
              </span>
            </div>

            <div className={`w-16 h-1 mx-2 ${
              pasoActual === "resumen" || pasoActual === "confirmacion" 
                ? "bg-green-medium" 
                : "bg-green-light"
            }`}></div>

            {/* Paso 2: Resumen */}
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                pasoActual === "resumen" 
                  ? "bg-green-forest border-green-dark text-white" 
                  : pasoActual === "confirmacion"
                  ? "bg-green-medium border-green-forest text-white"
                  : "bg-white border-green-light text-gray-400"
              }`}>
                2
              </div>
              <span className={`ml-2 font-medium ${
                pasoActual === "resumen" ? "text-green-dark" : "text-gray-500"
              }`}>
                Resumen
              </span>
            </div>

            <div className={`w-16 h-1 mx-2 ${
              pasoActual === "confirmacion" 
                ? "bg-green-medium" 
                : "bg-green-light"
            }`}></div>

            {/* Paso 3: Confirmación */}
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                pasoActual === "confirmacion" 
                  ? "bg-green-forest border-green-dark text-white" 
                  : "bg-white border-green-light text-gray-400"
              }`}>
                3
              </div>
              <span className={`ml-2 font-medium ${
                pasoActual === "confirmacion" ? "text-green-dark" : "text-gray-500"
              }`}>
                Confirmación
              </span>
            </div>
          </div>
        </div>

        {/* Mostrar error global */}
        {error && (
          <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        <h1 className="text-4xl font-extrabold text-center text-green-dark mb-12">
          EcoHarmony Park - Entradas
        </h1>

        {/* Contenido Dinámico */}
        {pasoActual === "formulario" && (
          <FormularioCompra 
            onCompra={manejarCompraExitosa} 
          />
        )}

        {pasoActual === "resumen" && compra && (
          <div className="max-w-4xl mx-auto">
            <ResumenCompra 
              compra={compra} 
              onEditar={manejarVolverAFormulario}
              onConfirmar={manejarConfirmacion}
            />
            <div className="flex gap-4 justify-center mt-6">
              <button
                onClick={manejarVolverAFormulario}
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg shadow transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={procesandoPago}
              >
                ← Editar Compra
              </button>
              <button
                onClick={manejarConfirmacion}
                disabled={procesandoPago}
                className="bg-green-forest hover:bg-green-dark text-white font-semibold py-3 px-6 rounded-lg shadow transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {procesandoPago ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  </>
                ) : (
                  <>
                    {compra.formaPago === 'tarjeta' ? 'Pagar con Tarjeta' : 'Confirmar Compra'} →
                  </>
                )}
              </button>
            </div>
            
            {/* Información adicional según método de pago */}
            {compra.formaPago === 'tarjeta' && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700 text-center">
                  <strong>Pago con tarjeta:</strong> Serás redirigido a Mercado Pago para completar el pago de manera segura.
                </p>
              </div>
            )}
            
            {compra.formaPago === 'efectivo' && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700 text-center">
                  <strong>Pago en efectivo:</strong> Realizarás el pago al ingresar al parque. Presenta tu comprobante de reserva.
                </p>
              </div>
            )}
          </div>
        )}

        {pasoActual === "confirmacion" && compra && mensajeMail && (
          <div className="max-w-4xl mx-auto">
            <Confirmacion 
              mensaje={mensajeMail} 
              compra={compra} 
            />
            <div className="text-center mt-8">
              <div className="bg-green-pale/20 border border-green-light rounded-lg p-6 mb-6">
                <h3 className="font-bold text-green-dark mb-2">¿Qué sigue?</h3>
                <ul className="text-sm text-green-dark space-y-1 text-left">
                  <li>• Revisa tu email: Hemos enviado los detalles de tu compra a <strong>{compra.mail}</strong></li>
                  <li>• Guarda tu comprobante: Preséntalo al ingresar al parque</li>
                  {compra.formaPago === 'efectivo' && (
                    <li>• Pago en efectivo: Realiza el pago al llegar al parque</li>
                  )}
                  <li>• Horario: Llega 15 minutos antes de tu horario programado</li>
                </ul>
              </div>
              
              <button
                onClick={manejarNuevaCompra}
                className="bg-green-forest hover:bg-green-dark text-white font-semibold py-3 px-8 rounded-lg shadow transition-all inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Realizar Nueva Compra
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;