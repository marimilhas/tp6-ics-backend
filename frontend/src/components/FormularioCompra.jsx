import React, { useState, useEffect } from "react";

const FormularioCompra = ({ onCompra }) => {
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [edades, setEdades] = useState([18]);
  const [tiposEntrada, setTiposEntrada] = useState(["regular"]);
  const [formaPago, setFormaPago] = useState("");
  const [mail, setMail] = useState("");
  const [errores, setErrores] = useState({});
  const [camposModificados, setCamposModificados] = useState({});
  const [formularioValido, setFormularioValido] = useState(false);
  
  // Horario del parque
  const HORA_APERTURA = 9;
  const HORA_CIERRE = 19;
  const DIAS_CERRADOS = [0]; // 0 = Domingo (0: Domingo, 1: Lunes, 2: Martes, etc.)

  // Precios base
  const PRECIOS = {
    regular: 5000,
    vip: 10000
  };

  useEffect(() => {
    validarFormularioCompleto();
  }, [fecha, hora, cantidad, edades, formaPago, mail, tiposEntrada]);

  const validarFecha = (fechaString) => {
    if (!fechaString) return { valido: false, mensaje: "La fecha de visita es obligatoria" };
    
    const fechaSeleccionada = new Date(fechaString);
    const fechaActual = new Date();
    fechaActual.setHours(0, 0, 0, 0);
    
    if (fechaSeleccionada < fechaActual) {
      return { valido: false, mensaje: "La fecha no puede ser anterior al día actual" };
    }
    
    const diaSemana = fechaSeleccionada.getDay();
    if (DIAS_CERRADOS.includes(diaSemana)) {
      return { valido: false, mensaje: "El parque está cerrado los Lunes" };
    }
    
    // CORREGIDO: Validar días festivos - usar el año de la fecha seleccionada
    const año = fechaSeleccionada.getFullYear();
    const mes = fechaSeleccionada.getMonth();
    const dia = fechaSeleccionada.getDate();
    
    // Validar 25 de diciembre del año seleccionado
    const navidad = new Date(año, 11, 24); // 25 de diciembre
    const añoNuevo = new Date(año, 0, 23);  // 1 de enero
    
    // Comparar las fechas sin la hora
    if (fechaSeleccionada.toDateString() === navidad.toDateString() || 
        fechaSeleccionada.toDateString() === añoNuevo.toDateString()) {
      return { valido: false, mensaje: "El parque está cerrado en días festivos (25 de diciembre y 1 de enero)" };
    }
    
    return { valido: true, mensaje: "" };
  };

  const validarHora = (horaString, fechaString) => {
    if (!horaString) return { valido: false, mensaje: "La hora de visita es obligatoria" };
    
    if (!fechaString) return { valido: true, mensaje: "" };
    
    const horaSeleccionada = parseInt(horaString.split(':')[0]);
    
    if (horaSeleccionada < HORA_APERTURA || horaSeleccionada >= HORA_CIERRE) {
      return { 
        valido: false, 
        mensaje: `El parque está abierto de ${HORA_APERTURA}:00 a ${HORA_CIERRE}:00 horas` 
      };
    }
    
    // Validar si es para el día actual, no permitir horas pasadas
    const fechaActual = new Date();
    const fechaSeleccionada = new Date(fechaString);
    
    if (fechaSeleccionada.toDateString() === fechaActual.toDateString()) {
      const horaActual = fechaActual.getHours();
      if (horaSeleccionada < horaActual) {
        return { valido: false, mensaje: "No se puede seleccionar una hora pasada" };
      }
    }
    
    return { valido: true, mensaje: "" };
  };

  const validarCantidad = (cant) => {
    if (cant < 1) return { valido: false, mensaje: "Debe comprar al menos 1 entrada" };
    if (cant > 10) return { valido: false, mensaje: "Máximo 10 entradas por compra" };
    return { valido: true, mensaje: "" };
  };

  const validarEdades = (eds) => {
    for (let i = 0; i < eds.length; i++) {
      if (!eds[i] && eds[i] !== 0) {
        return { 
          valido: false, 
          mensaje: `La edad del visitante ${i + 1} es obligatoria` 
        };
      }
      if (eds[i] < 0 || eds[i] > 120) {
        return { 
          valido: false, 
          mensaje: `Edad inválida para visitante ${i + 1} (0-120)` 
        };
      }
    }
    return { valido: true, mensaje: "" };
  };

  const validarFormaPago = (fp) => {
    if (!fp) return { valido: false, mensaje: "Seleccione un método de pago" };
    return { valido: true, mensaje: "" };
  };

  const validarEmail = (email) => {
    if (!email) return { valido: false, mensaje: "El email es obligatorio" };
    if (!/\S+@\S+\.\S+/.test(email)) return { valido: false, mensaje: "Email inválido" };
    return { valido: true, mensaje: "" };
  };

  const validarFormularioCompleto = () => {
    const nuevosErrores = {};
    let esValido = true;

    const validacionFecha = validarFecha(fecha);
    if (!validacionFecha.valido) {
      nuevosErrores.fecha = validacionFecha.mensaje;
      esValido = false;
    }

    const validacionHora = validarHora(hora, fecha);
    if (!validacionHora.valido) {
      nuevosErrores.hora = validacionHora.mensaje;
      esValido = false;
    }

    const validacionCantidad = validarCantidad(cantidad);
    if (!validacionCantidad.valido) {
      nuevosErrores.cantidad = validacionCantidad.mensaje;
      esValido = false;
    }

    const validacionEdades = validarEdades(edades);
    if (!validacionEdades.valido) {
      nuevosErrores.edades = validacionEdades.mensaje;
      esValido = false;
    }

    const validacionFormaPago = validarFormaPago(formaPago);
    if (!validacionFormaPago.valido) {
      nuevosErrores.formaPago = validacionFormaPago.mensaje;
      esValido = false;
    }

    const validacionEmail = validarEmail(mail);
    if (!validacionEmail.valido) {
      nuevosErrores.mail = validacionEmail.mensaje;
      esValido = false;
    }

    setErrores(nuevosErrores);
    setFormularioValido(esValido);
    return esValido;
  };

  const manejarCambioFecha = (valor) => {
    setCamposModificados(prev => ({ ...prev, fecha: true }));
    setFecha(valor);
    
    if (hora) {
      const validacionHora = validarHora(hora, valor);
      if (!validacionHora.valido) {
        setErrores(prev => ({ ...prev, hora: validacionHora.mensaje }));
      } else {
        setErrores(prev => ({ ...prev, hora: "" }));
      }
    }
    
    const validacion = validarFecha(valor);
    if (!validacion.valido) {
      setErrores(prev => ({ ...prev, fecha: validacion.mensaje }));
    } else {
      setErrores(prev => ({ ...prev, fecha: "" }));
    }
  };

  const manejarCambioHora = (valor) => {
    setCamposModificados(prev => ({ ...prev, hora: true }));
    setHora(valor);
    
    const validacion = validarHora(valor, fecha);
    if (!validacion.valido) {
      setErrores(prev => ({ ...prev, hora: validacion.mensaje }));
    } else {
      setErrores(prev => ({ ...prev, hora: "" }));
    }
  };

  const manejarCambio = (campo, valor) => {
    setCamposModificados(prev => ({ ...prev, [campo]: true }));
    
    switch (campo) {
      case 'cantidad':
        const nuevaCantidad = parseInt(valor) || 0;
        setCantidad(nuevaCantidad);
        
        if (nuevaCantidad > edades.length) {
          const nuevasEdades = [...edades];
          const nuevosTipos = [...tiposEntrada];
          for (let i = edades.length; i < nuevaCantidad; i++) {
            nuevasEdades.push(0); // Cambiado a 0 para que sea más claro que debe ingresar edad
            nuevosTipos.push("regular");
          }
          setEdades(nuevasEdades);
          setTiposEntrada(nuevosTipos);
        } else if (nuevaCantidad < edades.length) {
          setEdades(edades.slice(0, nuevaCantidad));
          setTiposEntrada(tiposEntrada.slice(0, nuevaCantidad));
        }
        break;
      case 'formaPago':
        setFormaPago(valor);
        break;
      case 'mail':
        setMail(valor);
        break;
    }
  };

  const manejarCambioEdad = (index, valor) => {
    setCamposModificados(prev => ({ ...prev, edades: true }));
    const nuevasEdades = [...edades];
    nuevasEdades[index] = valor === "" ? "" : parseInt(valor) || 0;
    setEdades(nuevasEdades);
  };

  const manejarCambioTipoEntrada = (index, tipo) => {
    const nuevosTipos = [...tiposEntrada];
    nuevosTipos[index] = tipo;
    setTiposEntrada(nuevosTipos);
  };

  const generarOpcionesHora = () => {
    const opciones = [];
    for (let i = HORA_APERTURA; i < HORA_CIERRE; i++) {
      opciones.push(`${i.toString().padStart(2, '0')}:00`);
    }
    return opciones;
  };

  // CORREGIDO: Función para calcular precio individual según edad y tipo
  const calcularPrecioIndividual = (edad, tipo) => {
    if (edad < 3) return 0; // Menores de 3 no pagan (0, 1, 2 años)
    if (edad < 10) return PRECIOS[tipo] * 0.5; // Menores de 10: 3-9 años (mitad)
    if (edad > 60) return PRECIOS[tipo] * 0.5; // Mayores de 60: 60+ años (mitad), es decir a partir de los 61 se aplica el descuento
    return PRECIOS[tipo]; // Precio completo: 10-59 años
  };

  // CORREGIDO: Obtener categoría por edad con información de precio
  const obtenerCategoriaEdad = (edad, tipoEntrada) => {
    const precio = calcularPrecioIndividual(edad, tipoEntrada);
    
    if (edad < 3) return { 
      tipo: "Infante", 
      color: "bg-green-100 border-green-300", 
      puntoColor: "bg-green-500",
      badgeColor: "bg-green-100 text-green-800 border-green-300",
      descuento: "Entrada Gratuita",
      precio: "$0",
      descripcion: "Menores de 3 años"
    };
    if (edad < 10) return { 
      tipo: "Niño", 
      color: "bg-blue-100 border-blue-300", 
      puntoColor: "bg-blue-500",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-300",
      descuento: "50% Descuento",
      precio: `$${precio}`,
      descripcion: "Menores de 10 años"
    };
    if (edad <= 60) return { 
      tipo: "Adulto", 
      color: "bg-purple-100 border-purple-300", 
      puntoColor: "bg-purple-500",
      badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
      descuento: "Precio Completo",
      precio: `$${precio}`,
      descripcion: "10-59 años"
    };
    return { 
      tipo: "Adulto Mayor", 
      color: "bg-orange-100 border-orange-300", 
      puntoColor: "bg-orange-500",
      badgeColor: "bg-orange-100 text-orange-800 border-orange-300",
      descuento: "50% Descuento",
      precio: `$${precio}`,
      descripcion: "Mayores de 60 años"
    };
  };

  const calcularTotal = () => {
    let total = 0;
    
    edades.forEach((edad, index) => {
      if (edad !== "" && !isNaN(edad)) {
        total += calcularPrecioIndividual(edad, tiposEntrada[index]);
      }
    });
    
    return total;
  };

  const obtenerNombreDia = (fechaString) => {
    if (!fechaString) return "";
    const fecha = new Date(fechaString);
    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    return dias[fecha.getDay()];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validarFormularioCompleto()) {
      setCamposModificados({
        fecha: true,
        hora: true,
        cantidad: true,
        edades: true,
        formaPago: true,
        mail: true
      });
      return;
    }
    
    const compraData = {
      fecha,
      hora,
      cantidad,
      edades,
      tiposEntrada,
      formaPago,
      mail,
      total: calcularTotal()
    };
    
    if (onCompra) {
      onCompra(compraData);
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-8 border border-color-lime-green">
      <h2 className="text-3xl font-bold text-color-dark-green mb-8 text-center">
        Comprar Entradas
      </h2>

      {/* Información de Horarios */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Horarios del Parque</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span><strong>Horario:</strong> 9:00 - 19:00 hs</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
            <span><strong>Cierra:</strong> Lunes, 25 Dic y 1 Ene</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
            <span><strong>Festivos:</strong> 25 Dic y 1 Ene</span>
          </div>
        </div>
      </div>

      {/* Tabla de Precios y Beneficios */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Precios y Beneficios</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="border-2 border-gray-200 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-lg font-bold text-gray-800">Pase Regular</h4>
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                ${PRECIOS.regular}
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-color-medium-green rounded-full"></span>
                <span>Acceso general al parque</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-color-medium-green rounded-full"></span>
                <span>Actividades básicas incluidas</span>
              </div>
            </div>
          </div>

          <div className="border-2 border-gray-200 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-lg font-bold text-gray-800">Pase VIP</h4>
              <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                ${PRECIOS.vip}
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span>Acceso prioritario</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span>Todas las actividades incluidas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span>Áreas exclusivas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de Descuentos por Edad - CORREGIDA */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Descuentos por Edad</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="font-semibold text-green-800">Menores de 3 años</div>
              <div className="text-lg font-bold text-green-600 mt-1">GRATIS</div>
              <div className="text-xs text-green-700 mt-1">(0, 1, 2 años)</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="font-semibold text-blue-800">Menores de 10 años</div>
              <div className="text-lg font-bold text-blue-600 mt-1">50% DESC</div>
              <div className="text-xs text-blue-700 mt-1">(3-9 años)</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="font-semibold text-purple-800">Adultos</div>
              <div className="text-lg font-bold text-purple-600 mt-1">PRECIO COMPLETO</div>
              <div className="text-xs text-purple-700 mt-1">(10-59 años)</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="font-semibold text-orange-800">Mayores de 60</div>
              <div className="text-lg font-bold text-orange-600 mt-1">50% DESC</div>
              <div className="text-xs text-orange-700 mt-1">(60+ años)</div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="block">
              <span className="font-medium text-gray-700">Fecha de Visita *</span>
              <input
                type="date"
                value={fecha}
                onChange={(e) => manejarCambioFecha(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
                className={`mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-color-medium-green focus:border-transparent ${
                  errores.fecha ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              {fecha && (
                <p className={`text-sm mt-1 ${
                  errores.fecha ? 'text-red-500' : 'text-color-medium-green'
                }`}>
                  {errores.fecha || `Seleccionado: ${obtenerNombreDia(fecha)}`}
                </p>
              )}
              {!fecha && camposModificados.fecha && errores.fecha && (
                <p className="text-red-500 text-sm mt-1">{errores.fecha}</p>
              )}
            </label>

            <label className="block">
              <span className="font-medium text-gray-700">Hora de Visita *</span>
              <select
                value={hora}
                onChange={(e) => manejarCambioHora(e.target.value)}
                required
                className={`mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-color-medium-green focus:border-transparent ${
                  errores.hora ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">Seleccione una hora</option>
                {generarOpcionesHora().map((horaOpt) => (
                  <option key={horaOpt} value={horaOpt}>
                    {horaOpt} hs
                  </option>
                ))}
              </select>
              {errores.hora && (
                <p className="text-red-500 text-sm mt-1">{errores.hora}</p>
              )}
              {hora && !errores.hora && (
                <p className="text-color-medium-green text-sm mt-1">
                  Horario válido: Parque abierto de 9:00 a 19:00 hs
                </p>
              )}
            </label>

            <label className="block">
              <span className="font-medium text-gray-700">Cantidad de Entradas *</span>
              <input
                type="number"
                min="1"
                max="10"
                value={cantidad}
                onChange={(e) => manejarCambio('cantidad', e.target.value)}
                className={`mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-color-medium-green focus:border-transparent ${
                  errores.cantidad ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errores.cantidad && (
                <p className="text-red-500 text-sm mt-1">{errores.cantidad}</p>
              )}
              <p className="text-sm text-gray-600 mt-1">Máximo 10 entradas por compra</p>
            </label>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="font-medium text-gray-700">Forma de Pago *</span>
              <select
                value={formaPago}
                onChange={(e) => manejarCambio('formaPago', e.target.value)}
                className={`mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-color-medium-green focus:border-transparent ${
                  errores.formaPago ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">Seleccione una opción</option>
                <option value="tarjeta">Tarjeta de Crédito/Débito</option>
                <option value="efectivo">Efectivo</option>
              </select>
              {errores.formaPago && (
                <p className="text-red-500 text-sm mt-1">{errores.formaPago}</p>
              )}
            </label>

            <label className="block">
              <span className="font-medium text-gray-700">Correo Electrónico *</span>
              <input
                type="email"
                value={mail}
                onChange={(e) => manejarCambio('mail', e.target.value)}
                required
                placeholder="ejemplo@dominio.com"
                className={`mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-color-medium-green focus:border-transparent ${
                  errores.mail ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errores.mail && (
                <p className="text-red-500 text-sm mt-1">{errores.mail}</p>
              )}
            </label>
          </div>
        </div>

        {/* Resto del código de visitantes... */}
        <div className="border border-gray-200 rounded-lg p-6 bg-gradient-to-br from-color-pale-green to-white">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-color-dark-green">
              Visitantes y Tipo de Entrada *
            </h3>
            <div className="flex items-center gap-2 text-sm text-color-medium-green bg-white px-3 py-1 rounded-full border border-color-lime-green">
              <span className="font-medium">{cantidad}</span>
              <span>visitante{cantidad !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {errores.edades && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-medium flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {errores.edades}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {edades.map((edad, index) => {
              const categoria = obtenerCategoriaEdad(edad, tiposEntrada[index]);
              const precioIndividual = calcularPrecioIndividual(edad, tiposEntrada[index]);
              
              return (
                <div 
                  key={index} 
                  className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                    (errores.edades || edad === "" || edad < 0 || edad > 120) 
                      ? 'border-red-300 bg-red-50' 
                      : categoria.color
                  } hover:shadow-md`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${categoria.puntoColor}`}></div>
                      <span className="font-semibold text-sm">Visitante {index + 1}</span>
                    </div>
                    <div className={`text-xs font-medium px-2 py-1 rounded-full border ${categoria.badgeColor}`}>
                      {categoria.tipo}
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <label className="block text-xs font-medium text-gray-600">
                      Edad
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="120"
                        value={edad}
                        onChange={(e) => manejarCambioEdad(index, e.target.value)}
                        className={`w-full border rounded-lg px-3 py-2 text-center font-semibold focus:ring-2 focus:ring-color-medium-green focus:border-transparent ${
                          (errores.edades || edad === "" || edad < 0 || edad > 120) 
                            ? 'border-red-300 bg-white' 
                            : 'border-gray-300'
                        }`}
                        placeholder="0"
                      />
                      <span className="text-sm text-gray-500 font-medium">años</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <label className="block text-xs font-medium text-gray-600">
                      Tipo de Entrada
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => manejarCambioTipoEntrada(index, "regular")}
                        className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg border transition-colors ${
                          tiposEntrada[index] === "regular" 
                            ? "bg-blue-100 border-blue-500 text-blue-700" 
                            : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        Regular
                      </button>
                      <button
                        type="button"
                        onClick={() => manejarCambioTipoEntrada(index, "vip")}
                        className={`flex-1 py-2 px-3 text-xs font-medium rounded-lg border transition-colors ${
                          tiposEntrada[index] === "vip" 
                            ? "bg-purple-100 border-purple-500 text-purple-700" 
                            : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        VIP
                      </button>
                    </div>
                  </div>

                  {edad !== "" && !isNaN(edad) && edad >= 0 && edad <= 120 && (
                    <div className="mt-3 p-2 bg-white rounded-lg border">
                      <div className="text-xs text-gray-600 text-center">
                        <div className="font-semibold text-color-dark-green">{categoria.descuento}</div>
                        <div className="text-color-medium-green font-bold">${precioIndividual}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {tiposEntrada[index] === "regular" ? "Regular" : "VIP"} • {categoria.descripcion}
                        </div>
                      </div>
                    </div>
                  )}

                  {edad !== "" && !isNaN(edad) && edad >= 0 && edad <= 120 && (
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-gray-500">Edad válida</span>
                      <div className="flex items-center gap-1 text-green-500">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>OK</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gradient-to-r from-color-pale-green to-color-lime-green rounded-lg p-6 border border-color-lime-green">
          <h4 className="font-semibold text-color-dark-green mb-4 text-lg">Resumen de Compra</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">{cantidad} entrada(s)</span>
              <span className="font-semibold">${calcularTotal()}</span>
            </div>
            <div className="flex justify-between items-center text-lg font-bold text-color-dark-green border-t border-color-medium-green pt-3">
              <span>Total a pagar:</span>
              <span className="text-xl">${calcularTotal()}</span>
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={!formularioValido}
            className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all duration-300 transform ${
              formularioValido 
                ? 'bg-gradient-to-r from-color-medium-green to-color-light-green hover:from-color-dark-green hover:to-color-medium-green text-white hover:scale-[1.02] hover:shadow-xl' 
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            }`}
          >
            {formularioValido ? (
              <div className="flex items-center justify-center gap-2">
                <span>Continuar al Resumen</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            ) : (
              'Complete el formulario correctamente'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioCompra;