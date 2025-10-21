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

  const manejarCompraExitosa = (compraData, mailMsg) => {
    setCompra(compraData);
    setMensajeMail(mailMsg);
    setPasoActual("resumen");
  };

  const manejarConfirmacion = async () => {
    setProcesandoPago(true);
    
    try {
      // Aquí integrarías con Mercado Pago si es pago con tarjeta
      if (compra && compra.forma_pago === 'TAR') {
        console.log("Integrando con Mercado Pago...");
        // Redirigir a Mercado Pago o procesar pago
        // await mercadoPagoService.procesarPago(compra);
      }
      
      // Simular éxito después de un breve delay
      setTimeout(() => {
        setPasoActual("confirmacion");
        setProcesandoPago(false);
      }, 2000);
    } catch (error) {
      console.error('Error en confirmación:', error);
      setProcesandoPago(false);
    }
  };

  const manejarNuevaCompra = () => {
    setCompra(null);
    setMensajeMail("");
    setPasoActual("formulario");
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
                  ? "bg-color-medium-green border-color-dark-green text-white" 
                  : pasoActual === "resumen" || pasoActual === "confirmacion"
                  ? "bg-color-light-green border-color-medium-green text-white"
                  : "bg-white border-color-light-green text-color-medium-green"
              }`}>
                1
              </div>
              <span className={`ml-2 font-medium ${
                pasoActual === "formulario" ? "text-color-dark-green" : "text-color-medium-green"
              }`}>
                Compra
              </span>
            </div>

            <div className="w-16 h-1 bg-color-lime-green mx-2"></div>

            {/* Paso 2: Resumen */}
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                pasoActual === "resumen" 
                  ? "bg-color-medium-green border-color-dark-green text-white" 
                  : pasoActual === "confirmacion"
                  ? "bg-color-light-green border-color-medium-green text-white"
                  : "bg-white border-color-lime-green text-gray-400"
              }`}>
                2
              </div>
              <span className={`ml-2 font-medium ${
                pasoActual === "resumen" ? "text-color-dark-green" : "text-gray-500"
              }`}>
                Resumen
              </span>
            </div>

            <div className="w-16 h-1 bg-color-lime-green mx-2"></div>

            {/* Paso 3: Confirmación */}
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                pasoActual === "confirmacion" 
                  ? "bg-color-medium-green border-color-dark-green text-white" 
                  : "bg-white border-color-lime-green text-gray-400"
              }`}>
                3
              </div>
              <span className={`ml-2 font-medium ${
                pasoActual === "confirmacion" ? "text-color-dark-green" : "text-gray-500"
              }`}>
                Confirmación
              </span>
            </div>
          </div>
        </div>

        <h1 className="text-4xl font-extrabold text-center text-color-dark-green mb-12">
          EcoHarmony Park - Entradas
        </h1>

        {/* Contenido Dinámico */}
        {pasoActual === "formulario" && (
          <FormularioCompra onCompra={manejarCompraExitosa} />
        )}

        {pasoActual === "resumen" && compra && (
          <div className="max-w-4xl mx-auto">
            <ResumenCompra compra={compra} />
            <div className="flex gap-4 justify-center mt-6">
              <button
                onClick={() => setPasoActual("formulario")}
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg shadow transition-all"
                disabled={procesandoPago}
              >
                ← Volver Atrás
              </button>
              <button
                onClick={manejarConfirmacion}
                disabled={procesandoPago}
                className="bg-color-medium-green hover:bg-color-dark-green text-white font-semibold py-3 px-6 rounded-lg shadow transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {procesandoPago ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  </div>
                ) : (
                  'Confirmar Compra →'
                )}
              </button>
            </div>
          </div>
        )}

        {pasoActual === "confirmacion" && compra && mensajeMail && (
          <div className="max-w-4xl mx-auto">
            <Confirmacion mensaje={mensajeMail} compra={compra} />
            <div className="text-center mt-6">
              <button
                onClick={manejarNuevaCompra}
                className="bg-color-medium-green hover:bg-color-dark-green text-white font-semibold py-3 px-8 rounded-lg shadow transition-all"
              >
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