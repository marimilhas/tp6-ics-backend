import pytest
from datetime import date, datetime, timedelta
from unittest.mock import MagicMock, Mock

# Importar las clases y excepciones (asumiendo que existen en el modelo)
from entradas.excepciones import LimiteEntradasExcedidoError, FechaInvalidaError, ParqueCerradoError
from entradas.servicio_compra import ServicioCompraEntradas


# --- FIXTURES ---

#@pytest.fixture
#def sistema():
#    return Sistema()


pytest.fixture
def usuario_valido_mock():
    """Retorna un mock que simula un objeto Usuario ya cargado y válido."""
    return Mock(nombre="Juan Pérez", email="juan@example.com", esta_registrado=True)

@pytest.fixture
def datos_compra_validos():
    """Fixture que retorna una base de datos de compra que cumple todas las reglas."""
    fecha_base = datetime(2026, 3, 15, 12, 0, 0)  # Cambiado a datetime con hora
    visitantes_validos = ([ {"edad": 30, "tipo_pase": "Regular"}, {"edad": 10, "tipo_pase": "VIP"}, ] * 2
                          + [{"edad": 5, "tipo_pase": "Regular"}])  # Total 5 visitantes

    return {
        "cantidad": len(visitantes_validos),  # Cantidad válida: 5
        "fecha_visita": fecha_base.isoformat(),
        "tipo_pago": "Tarjeta",
        "visitantes": visitantes_validos
    }

@pytest.fixture
def mocks_infraestructura():
    """Fixture que retorna mocks de los servicios externos configurados como 'válidos'."""
    mocks = {
        'pasarela_pagos': MagicMock(),
        'servicio_correo': MagicMock(),
        'servicio_calendario': MagicMock()
    }
    mocks['servicio_calendario'].es_dia_abierto.return_value = True
    return mocks

@pytest.fixture
def servicio_compra(mocks_infraestructura):
    """Fixture que inicializa y retorna una nueva instancia de ServicioCompraEntradas."""
    return ServicioCompraEntradas(**mocks_infraestructura)

# --- Pruebas unitarias: Validación de cantidad de entradas ---

def test_validar_cantidad_mayor_a_10_falla(servicio_compra):
    """Prueba: la validación falla con más de 10 entradas."""
    cantidad_invalida = 11
    visitantes_mock = [{}] * cantidad_invalida
    with pytest.raises(LimiteEntradasExcedidoError, match="La cantidad de entradas no puede ser mayor a 10."):
        servicio_compra._validar_cantidad(cantidad=cantidad_invalida, visitantes=visitantes_mock)

def test_validar_cantidad_cero_falla(servicio_compra):
    """Prueba: la validación falla con 0 entradas."""
    cantidad_invalida = 0
    visitantes_mock = []
    with pytest.raises(ValueError, match="La cantidad de entradas debe ser al menos 1."):
        servicio_compra._validar_cantidad(cantidad=cantidad_invalida, visitantes=visitantes_mock)

def test_validar_cantidad_negativa_negativa(servicio_compra):
    """Prueba: la validación falla con cantidad negativa de entradas."""
    cantidad_invalida = -1
    visitantes_mock = []
    with pytest.raises(ValueError, match="La cantidad de entradas debe ser al menos 1."):
        servicio_compra._validar_cantidad(cantidad=cantidad_invalida, visitantes=visitantes_mock)

def test_validar_cantidad_no_coincide_con_visitantes_falla(servicio_compra):
    """Prueba: la validación falla si la cantidad no coincide con el nro de visitantes."""
    cantidad_valida = 5
    visitantes_incorrectos = [{}] * 3 
    with pytest.raises(ValueError, match="La cantidad de entradas debe ser igual al nro de visitantes."):
        servicio_compra._validar_cantidad(cantidad=cantidad_valida, visitantes=visitantes_incorrectos)

def test_validar_cantidad_datos_validos_pasa(servicio_compra):
    """Prueba: la validación pasa si la cantidad está entre 1-10 y coincide con visitantes."""
    cantidad_valida = 7
    visitantes_validos = [{}] * cantidad_valida
    try:
        servicio_compra._validar_cantidad(cantidad=cantidad_valida, visitantes=visitantes_validos)
    except (LimiteEntradasExcedidoError, ValueError):
        pytest.fail("La validación no debería haber fallado con datos válidos.")

def test_validar_cantidad_limite_exacto_10_pasa(servicio_compra):
    """Prueba: la validación pasa si la cantidad es exactamente 10 y coincide con visitantes."""
    cantidad_limite = 10
    visitantes_validos = [{}] * cantidad_limite
    try:
        servicio_compra._validar_cantidad(cantidad=cantidad_limite, visitantes=visitantes_validos)
    except (LimiteEntradasExcedidoError, ValueError):
        pytest.fail("La validación no debería haber fallado con la cantidad límite de 10.")
        
# --- Pruebas unitarias: Validación de fecha y hora ---

def test_validar_fecha_dia_habil_pasa(servicio_compra):
    fecha_habil = datetime(2025, 10, 22, 12, 0, 0)  # Miércoles
    try:
        servicio_compra._validar_fecha_hora_visita(fecha_habil)
    except ParqueCerradoError:
        pytest.fail("La validación no debería haber fallado en un día hábil.")
        
def test_validar_fecha_falla_en_lunes(servicio_compra):
     fecha_lunes = datetime(2025, 10, 20, 12, 0, 0)  
     with pytest.raises(ParqueCerradoError):
         servicio_compra._validar_fecha_hora_visita(fecha_lunes)
         
def test_validar_fecha_25_diciembre_falla(servicio_compra):
    fecha_navidad = datetime(2025, 12, 25, 12, 0, 0)
    with pytest.raises(ParqueCerradoError):
        servicio_compra._validar_fecha_hora_visita(fecha_navidad)

def test_validar_fecha_1_enero_falla(servicio_compra):
    fecha_ano_nuevo = datetime(2026, 1, 1, 12, 0, 0)
    with pytest.raises(ParqueCerradoError):
        servicio_compra._validar_fecha_hora_visita(fecha_ano_nuevo)

def test_validar_fecha_lunes_feriado_falla(servicio_compra):
    fecha_especial = datetime(2024, 1, 1, 12, 0, 0) # 1 de Enero de 2024 fue lunes
    with pytest.raises(ParqueCerradoError):
        servicio_compra._validar_fecha_hora_visita(fecha_especial)

def test_validar_horario_antes_de_abrir_falla(servicio_compra):
    fecha_valida = datetime(2025, 10, 22, 8, 59, 59)
    with pytest.raises(ParqueCerradoError):
        servicio_compra._validar_fecha_hora_visita(fecha_valida)

def test_validar_horario_al_abrir_pasa(servicio_compra):
    fecha_valida = datetime(2025, 10, 22, 9, 0, 0)
    try:
        servicio_compra._validar_fecha_hora_visita(fecha_valida)
    except ParqueCerradoError:
        pytest.fail("La validación no debería haber fallado a la hora de apertura.")

def test_validar_horario_durante_el_dia_pasa(servicio_compra):
    fecha_valida = datetime(2025, 10, 22, 14, 30, 0)
    try:
        servicio_compra._validar_fecha_hora_visita(fecha_valida)
    except ParqueCerradoError:
        pytest.fail("La validación no debería haber fallado durante el horario hábil.")

def test_validar_horario_antes_de_cerrar_pasa(servicio_compra):
    fecha_valida = datetime(2025, 10, 22, 18, 59, 59)
    try:
        servicio_compra._validar_fecha_hora_visita(fecha_valida)
    except ParqueCerradoError:
        pytest.fail("La validación no debería haber fallado justo antes de la hora de cierre.")

def test_validar_horario_al_cerrar_falla(servicio_compra):
    fecha_valida = datetime(2025, 10, 22, 19, 0, 0)
    with pytest.raises(ParqueCerradoError):
        servicio_compra._validar_fecha_hora_visita(fecha_valida)

def test_validar_fecha_pasada_falla(servicio_compra):
    fecha_pasada = datetime(2024, 10, 22, 12, 0, 0) 

    with pytest.raises(ValueError) as excinfo:
        servicio_compra._validar_fecha_hora_visita(fecha_pasada)

def test_validar_fecha_futura_pasa(servicio_compra):
    fecha_futura = datetime(2026, 10, 22, 12, 0, 0)

    servicio_compra._validar_fecha_hora_visita(fecha_futura)

# --- PRUEBAS RED: Cálculo de Precios y Montos ---

def test_calcular_precio_menor_3_anos_regular(servicio_compra):
    """Prueba RED: menores de 3 con pase Regular entran gratis."""
    with pytest.raises(AttributeError):
        precio = servicio_compra._calcular_precio_entrada(1, "Regular")
        assert precio == 0
        
def test_calcular_precio_menor_3_anos_vip(servicio_compra):
    """Prueba RED: menores de 3 con pase VIP entran gratis ($0)."""
    with pytest.raises(AttributeError):
        precio = servicio_compra._calcular_precio_entrada(1, "VIP")
        assert precio == 0        
        
def test_calcular_precio_menor_10_anos_regular(servicio_compra):
    """Prueba RED: menores de 10 con pase Regular pagan mitad"""
    with pytest.raises(AttributeError):
        precio = servicio_compra._calcular_precio_entrada(8, "Regular")
        assert precio == 2500  # 5000 / 2

def test_calcular_precio_menor_10_anos_vip(servicio_compra):
    """Prueba RED: menores de 10 con pase VIP pagan mitad"""
    with pytest.raises(AttributeError):
        precio = servicio_compra._calcular_precio_entrada(8, "VIP")
        assert precio == 5000  # 10000 / 2

def test_calcular_precio_mayor_60_anos_regular(servicio_compra):
    """Prueba RED: mayores de 60 con pase Regular pagan mitad"""
    with pytest.raises(AttributeError):
        precio = servicio_compra._calcular_precio_entrada(65, "Regular")
        assert precio == 2500 # 5000 / 2

def test_calcular_precio_mayor_60_anos_vip(servicio_compra):
    """Prueba RED: mayores de 60 con pase VIP pagan mitad"""
    with pytest.raises(AttributeError):
        precio = servicio_compra._calcular_precio_entrada(65, "VIP")
        assert precio == 5000  # 10000 / 2

def test_calcular_precio_adulto_regular(servicio_compra):
    """Prueba RED: adultos (10-60) con pase Regular pagan precio completo"""
    with pytest.raises(AttributeError):
        precio = servicio_compra._calcular_precio_entrada(30, "Regular")
        assert precio == 5000

def test_calcular_precio_adulto_vip(servicio_compra):
    """Prueba RED: adultos (10-60) con pase VIP pagan precio completo"""
    with pytest.raises(AttributeError):
        precio = servicio_compra._calcular_precio_entrada(30, "VIP")
        assert precio == 10000

def test_calcular_precio_edad_limite_inferior_menores_3(servicio_compra):
    """Prueba RED: 0 años (límite inferior) con pase Regular entra gratis ($0)."""
    with pytest.raises(AttributeError):
        precio = servicio_compra._calcular_precio_entrada(0, "Regular")
        assert precio == 0

def test_calcular_precio_edad_limite_superior_menores_3(servicio_compra):
    """Prueba RED: 2 años (límite superior) con pase Regular entra gratis ($0)."""
    with pytest.raises(AttributeError):
        precio = servicio_compra._calcular_precio_entrada(2, "Regular")
        assert precio == 0

def test_calcular_precio_edad_limite_inferior_menores_10(servicio_compra):
    """Prueba RED: 3 años (límite inferior) paga la mitad."""
    with pytest.raises(AttributeError):
        precio = servicio_compra._calcular_precio_entrada(3, "Regular")
        assert precio == 2500  # Mitad por ser menor de 10

def test_calcular_precio_edad_limite_superior_menores_10(servicio_compra):
    """Prueba RED: 9 años (límite superior) paga la mitad."""
    with pytest.raises(AttributeError):
        precio = servicio_compra._calcular_precio_entrada(9, "Regular")
        assert precio == 2500

def test_calcular_precio_edad_limite_inferior_adulto(servicio_compra):
    """Prueba RED: 10 años (límite inferior) paga el total."""
    with pytest.raises(AttributeError):
        precio = servicio_compra._calcular_precio_entrada(10, "Regular")
        assert precio == 5000

def test_calcular_precio_edad_limite_superior_adulto(servicio_compra):
    """Prueba RED: 60 años (límite superior) paga el total."""
    with pytest.raises(AttributeError):
        precio = servicio_compra._calcular_precio_entrada(60, "VIP")
        assert precio == 10000

def test_calcular_precio_edad_limite_inferior_tercera_edad(servicio_compra):
    """Prueba RED: 61 años (límite inferior) paga la mitad."""
    with pytest.raises(AttributeError):
        precio = servicio_compra._calcular_precio_entrada(61, "VIP")
        assert precio == 5000

def test_calcular_monto_total_un_solo_visitante(servicio_compra):
    """Prueba RED: el monto total para un solo adulto regular es $5000."""
    visitantes = [
        {"edad": 30, "tipo_pase": "Regular"}
    ]
    with pytest.raises(AttributeError):
        monto_total = servicio_compra._calcular_monto_total(visitantes)
        assert monto_total == 5000 

def test_calcular_monto_total_todos_adultos(servicio_compra):
    """Prueba RED: todos adultos - monto completo"""
    with pytest.raises(AttributeError):
        visitantes = [
            {"edad": 25, "tipo_pase": "Regular"},  # 5000
            {"edad": 30, "tipo_pase": "VIP"}       # 10000
        ]
        monto_total = servicio_compra._calcular_monto_total(visitantes)
        assert monto_total == 15000

def test_calcular_monto_total_mixto(servicio_compra):
    """Prueba RED: cálculo de monto con diferentes edades"""
    with pytest.raises(AttributeError):
        visitantes = [
            {"edad": 2, "tipo_pase": "Regular"},   # 0
            {"edad": 8, "tipo_pase": "Regular"},   # 2500
            {"edad": 35, "tipo_pase": "VIP"},      # 10000
            {"edad": 65, "tipo_pase": "VIP"}       # 5000
        ]
        monto_total = servicio_compra._calcular_monto_total(visitantes)
        assert monto_total == 17500

def test_calcular_monto_total_todos_menores_3_mixto(servicio_compra):
    """Prueba RED: todos menores de 3 años con distintos tipos de pase - Monto $0."""
    with pytest.raises(AttributeError):
        visitantes = [
            {"edad": 1, "tipo_pase": "Regular"},
            {"edad": 2, "tipo_pase": "VIP"}
        ]
        monto_total = servicio_compra._calcular_monto_total(visitantes)
        assert monto_total == 0 # 0 + 0

def test_calcular_monto_total_todos_menores_3_vip(servicio_compra):
    """Prueba RED: todos menores de 3 años con pases VIP - Monto $0."""
    visitantes = [
        {"edad": 1, "tipo_pase": "VIP"},  
        {"edad": 2, "tipo_pase": "VIP"}   
    ]
    with pytest.raises(AttributeError):
        monto_total = servicio_compra._calcular_monto_total(visitantes)
        assert monto_total == 0 # 0 + 0

def test_calcular_monto_total_varios_menores(servicio_compra):
    """Prueba RED: múltiples menores (<3 y <10) con diferentes pases"""
    with pytest.raises(AttributeError):
        visitantes = [
            {"edad": 2, "tipo_pase": "Regular"},   # 0
            {"edad": 5, "tipo_pase": "Regular"},   # 2500
            {"edad": 7, "tipo_pase": "VIP"},       # 5000
            {"edad": 70, "tipo_pase": "Regular"}   # 2500
        ]
        monto_total = servicio_compra._calcular_monto_total(visitantes)
        assert monto_total == 10000

def test_calcular_monto_total_todos_mayores_60_regular(servicio_compra):
    """Prueba RED: todos mayores de 60 con pases Regular - Monto mitad precio completo."""
    visitantes = [
        {"edad": 65, "tipo_pase": "Regular"},  
        {"edad": 80, "tipo_pase": "Regular"}   
    ]
    with pytest.raises(AttributeError):
        monto_total = servicio_compra._calcular_monto_total(visitantes)
        assert monto_total == 5000 # 2500 + 2500

def test_calcular_monto_total_solo_regular(servicio_compra):
    """Prueba RED: grupo donde todos eligen Regular"""
    with pytest.raises(AttributeError):
        visitantes = [
            {"edad": 5, "tipo_pase": "Regular"},   # 2500
            {"edad": 30, "tipo_pase": "Regular"},  # 5000
            {"edad": 65, "tipo_pase": "Regular"}   # 2500
        ]
        monto_total = servicio_compra._calcular_monto_total(visitantes)
        assert monto_total == 10000  # 2500 + 5000 + 2500

def test_calcular_monto_total_limites_edad(servicio_compra):
    """ Prueba RED: cada límite superior e inferior de las categorías de edad."""
    visitantes = [
        {"edad": 0, "tipo_pase": "Regular"},   # Límite inferior Infante        -> $0
        {"edad": 2, "tipo_pase": "VIP"},       # Límite superior Infante        -> $0
        {"edad": 3, "tipo_pase": "Regular"},   # Límite inferior Menor          -> $2500 (50% de 5k)
        {"edad": 9, "tipo_pase": "VIP"},       # Límite superior Menor          -> $5000 (50% de 10k)
        {"edad": 10, "tipo_pase": "Regular"},  # Límite inferior Adulto         -> $5000 (100% de 5k)
        {"edad": 60, "tipo_pase": "VIP"},      # Límite superior Adulto         -> $10000 (100% de 10k)
        {"edad": 61, "tipo_pase": "Regular"},  # Límite inferior Tercera Edad   -> $2500 (50% de 5k)
    ]
    monto_total = servicio_compra._calcular_monto_total(visitantes)
    assert monto_total == 30000  # 0 + 0 + 2500 + 5000 + 5000 + 10000 + 2500 + 5000

def test_calcular_monto_total_mezcla_extrema(servicio_compra):
    """Prueba RED: mezcla extrema de edades y tipos de pase"""
    with pytest.raises(AttributeError):
        visitantes = [
            {"edad": 1, "tipo_pase": "VIP"},       # 0
            {"edad": 2, "tipo_pase": "Regular"},   # 0
            {"edad": 99, "tipo_pase": "VIP"},      # 5000
            {"edad": 100, "tipo_pase": "Regular"}, # 2500
            {"edad": 35, "tipo_pase": "VIP"},      # 10000
            {"edad": 25, "tipo_pase": "Regular"}   # 5000
        ]
        monto_total = servicio_compra._calcular_monto_total(visitantes)
        assert monto_total == 22500  # 0 + 0 + 5000 + 2500 + 10000 + 5000

def test_calcular_monto_total_familia_mixta(servicio_compra):
    """Prueba RED: familia con diferentes edades y tipos de pase"""
    with pytest.raises(AttributeError):
        visitantes = [
            {"edad": 2, "tipo_pase": "VIP"},       # 0 (menor 3)
            {"edad": 5, "tipo_pase": "VIP"},       # 5000 (menor 10)
            {"edad": 8, "tipo_pase": "Regular"},   # 2500 (menor 10)
            {"edad": 35, "tipo_pase": "VIP"},      # 10000 (adulto)
            {"edad": 40, "tipo_pase": "Regular"},  # 5000 (adulto)
            {"edad": 65, "tipo_pase": "VIP"},      # 5000 (mayor 60)
            {"edad": 70, "tipo_pase": "Regular"}   # 2500 (mayor 60)
        ]
        monto_total = servicio_compra._calcular_monto_total(visitantes)
        assert monto_total == 30000  # 0 + 5000 + 2500 + 10000 + 5000 + 5000 + 2500

def test_calcular_monto_total_grupo_jovenes_mixto(servicio_compra):
    """Prueba RED: grupo de jóvenes con mezcla VIP/Regular"""
    with pytest.raises(AttributeError):
        visitantes = [
            {"edad": 20, "tipo_pase": "VIP"},      # 10000
            {"edad": 22, "tipo_pase": "Regular"},  # 5000
            {"edad": 25, "tipo_pase": "VIP"},      # 10000
            {"edad": 18, "tipo_pase": "Regular"}   # 5000
        ]
        monto_total = servicio_compra._calcular_monto_total(visitantes)
        assert monto_total == 30000  # 10000 + 5000 + 10000 + 5000

def test_calcular_monto_total_tercera_edad_mixta(servicio_compra):
    """Prueba RED: grupo tercera edad con mezcla VIP/Regular"""
    with pytest.raises(AttributeError):
        visitantes = [
            {"edad": 65, "tipo_pase": "VIP"},      # 5000
            {"edad": 68, "tipo_pase": "Regular"},  # 2500
            {"edad": 72, "tipo_pase": "VIP"},      # 5000
            {"edad": 75, "tipo_pase": "Regular"}   # 2500
        ]
        monto_total = servicio_compra._calcular_monto_total(visitantes)
        assert monto_total == 15000  # 5000 + 2500 + 5000 + 2500

def test_calcular_monto_total_familia_numerosa_mixta(servicio_compra):
    """Prueba RED: familia numerosa con múltiples combinaciones"""
    with pytest.raises(AttributeError):
        visitantes = [
            {"edad": 1, "tipo_pase": "Regular"},   # 0
            {"edad": 4, "tipo_pase": "VIP"},       # 5000
            {"edad": 6, "tipo_pase": "Regular"},   # 2500
            {"edad": 9, "tipo_pase": "VIP"},       # 5000
            {"edad": 12, "tipo_pase": "Regular"},  # 5000
            {"edad": 15, "tipo_pase": "VIP"},      # 10000
            {"edad": 45, "tipo_pase": "VIP"},      # 10000
            {"edad": 50, "tipo_pase": "Regular"},  # 5000
            {"edad": 67, "tipo_pase": "VIP"},      # 5000
            {"edad": 70, "tipo_pase": "Regular"}   # 2500
        ]
        monto_total = servicio_compra._calcular_monto_total(visitantes)
        assert monto_total == 50000  # Suma de todos

def test_calcular_monto_total_solo_vip(servicio_compra):
    """Prueba RED: grupo donde todos eligen VIP"""
    with pytest.raises(AttributeError):
        visitantes = [
            {"edad": 5, "tipo_pase": "VIP"},       # 5000
            {"edad": 30, "tipo_pase": "VIP"},      # 10000
            {"edad": 65, "tipo_pase": "VIP"}       # 5000
        ]
        monto_total = servicio_compra._calcular_monto_total(visitantes)
        assert monto_total == 20000  # 5000 + 10000 + 5000

# --- PRUEBAS RED: Proceso de Compra Completo ---

def test_comprar_entradas_proceso_completo_exitoso(servicio_compra, datos_compra_validos, usuario_valido_mock):
    """Prueba RED: proceso completo de compra exitoso"""
    with pytest.raises(AttributeError):
        # Mockear todas las dependencias externas
        servicio_compra.pasarela_pagos.procesar_pago = MagicMock(return_value=True)
        servicio_compra.servicio_correo.enviar_confirmacion = MagicMock(return_value=True)
        servicio_compra.servicio_calendario.es_dia_abierto.return_value = True
        
        compra = servicio_compra.comprar_entradas(usuario=usuario_valido_mock, **datos_compra_validos)

# --- PRUEBAS RED: Validación de Forma de Pago ---

def test_comprar_entradas_sin_forma_pago_falla(servicio_compra, datos_compra_validos, usuario_valido_mock):
    """Prueba RED: comprar sin seleccionar forma de pago debe fallar"""
    datos_de_falla = datos_compra_validos.copy()
    datos_de_falla["tipo_pago"] = None
    
    with pytest.raises(ValueError):
        servicio_compra.comprar_entradas(usuario=usuario_valido_mock, **datos_de_falla)

def test_comprar_entradas_forma_pago_efectivo_valida(servicio_compra, datos_compra_validos, usuario_valido_mock):
    """Prueba RED: comprar con forma de pago efectivo debe ser válido"""
    with pytest.raises(AttributeError):
        datos_efectivo = datos_compra_validos.copy()
        datos_efectivo["tipo_pago"] = "Efectivo"
        
        # Mockear dependencias externas
        servicio_compra.pasarela_pagos.procesar_pago = MagicMock()
        servicio_compra.servicio_correo.enviar_confirmacion = MagicMock(return_value=True)
        
        compra = servicio_compra.comprar_entradas(usuario=usuario_valido_mock, **datos_efectivo)
        
        # Verificar que NO se llamó a la pasarela de pagos
        servicio_compra.pasarela_pagos.procesar_pago.assert_not_called()
        # Verificar que SÍ se envió el email
        servicio_compra.servicio_correo.enviar_confirmacion.assert_called_once()

def test_comprar_entradas_forma_pago_tarjeta_valida(servicio_compra, datos_compra_validos, usuario_valido_mock):
    """Prueba RED: comprar con forma de pago tarjeta debe procesar pago"""
    with pytest.raises(AttributeError):
        datos_tarjeta = datos_compra_validos.copy()
        datos_tarjeta["tipo_pago"] = "Tarjeta"
        
        # Mockear dependencias externas
        servicio_compra.pasarela_pagos.procesar_pago = MagicMock(return_value=True)
        servicio_compra.servicio_correo.enviar_confirmacion = MagicMock(return_value=True)
        
        compra = servicio_compra.comprar_entradas(usuario=usuario_valido_mock, **datos_tarjeta)
        
        # Verificar que SÍ se llamó a la pasarela de pagos
        servicio_compra.pasarela_pagos.procesar_pago.assert_called_once()
        servicio_compra.servicio_correo.enviar_confirmacion.assert_called_once()

def test_comprar_entradas_pago_tarjeta_rechazado_falla(servicio_compra, datos_compra_validos, usuario_valido_mock):
    """Prueba RED: pago con tarjeta rechazado debe fallar"""
    with pytest.raises(AttributeError):
        datos_tarjeta = datos_compra_validos.copy()
        datos_tarjeta["tipo_pago"] = "Tarjeta"
        
        servicio_compra.pasarela_pagos.procesar_pago = MagicMock(return_value=False)  # Pago rechazado
        servicio_compra.servicio_correo.enviar_confirmacion = MagicMock()
        
        with pytest.raises(Exception, match="Pago rechazado"):
            servicio_compra.comprar_entradas(usuario=usuario_valido_mock, **datos_tarjeta)
        
        # Verificar que NO se envió email de confirmación
        servicio_compra.servicio_correo.enviar_confirmacion.assert_not_called()

# --- PRUEBAS RED: Casos de Error en Proceso de Pago ---

def test_comprar_entradas_error_envio_email_falla(servicio_compra, datos_compra_validos, usuario_valido_mock):
    """Prueba RED: error al enviar email debe fallar"""
    with pytest.raises(AttributeError):
        servicio_compra.pasarela_pagos.procesar_pago = MagicMock(return_value=True)
        servicio_compra.servicio_correo.enviar_confirmacion = MagicMock(return_value=False)  # Email falló
        
        with pytest.raises(Exception, match="Error enviando confirmación"):
            servicio_compra.comprar_entradas(usuario=usuario_valido_mock, **datos_compra_validos)

# --- PRUEBAS RED: Días Festivos ---

def test_comprar_entradas_navidad_falla(servicio_compra, datos_compra_validos, usuario_valido_mock):
    """Prueba RED: comprar para 25 de diciembre debe fallar"""
    navidad = date(date.today().year, 12, 25)
    # Si la navidad ya pasó este año, usar la del próximo
    if navidad < date.today():
        navidad = date(date.today().year + 1, 12, 25)
    
    datos_de_falla = datos_compra_validos.copy()
    datos_de_falla["fecha_visita"] = navidad.isoformat()
    
    with pytest.raises(ParqueCerradoError):
        servicio_compra.comprar_entradas(usuario=usuario_valido_mock, **datos_de_falla)

def test_comprar_entradas_año_nuevo_falla(servicio_compra, datos_compra_validos, usuario_valido_mock):
    """Prueba RED: comprar para 1ero de enero debe fallar"""
    año_nuevo = date(date.today().year, 1, 1)
    # Si ya pasó el 1ero de enero, usar el del próximo año
    if año_nuevo < date.today():
        año_nuevo = date(date.today().year + 1, 1, 1)
    
    datos_de_falla = datos_compra_validos.copy()
    datos_de_falla["fecha_visita"] = año_nuevo.isoformat()
    
    with pytest.raises(ParqueCerradoError):
        servicio_compra.comprar_entradas(usuario=usuario_valido_mock, **datos_de_falla)

# --- PRUEBAS RED: Validación de Horarios en Proceso de Compra ---

def test_comprar_entradas_horario_antes_de_abrir_falla(servicio_compra, datos_compra_validos, usuario_valido_mock):
    """Prueba RED: comprar con horario antes de las 9:00 debe fallar"""
    datos_de_falla = datos_compra_validos.copy()
    fecha_antes_apertura = datetime(2026, 3, 15, 8, 30, 0)  # 8:30 AM
    datos_de_falla["fecha_visita"] = fecha_antes_apertura.isoformat()
    
    with pytest.raises(ParqueCerradoError):
        servicio_compra.comprar_entradas(usuario=usuario_valido_mock, **datos_de_falla)

def test_comprar_entradas_horario_despues_de_cerrar_falla(servicio_compra, datos_compra_validos, usuario_valido_mock):
    """Prueba RED: comprar con horario después de las 19:00 debe fallar"""
    datos_de_falla = datos_compra_validos.copy()
    fecha_despues_cierre = datetime(2026, 3, 15, 19, 30, 0)  # 7:30 PM
    datos_de_falla["fecha_visita"] = fecha_despues_cierre.isoformat()
    
    with pytest.raises(ParqueCerradoError):
        servicio_compra.comprar_entradas(usuario=usuario_valido_mock, **datos_de_falla)

def test_comprar_entradas_horario_exacto_apertura_pasa(servicio_compra, datos_compra_validos, usuario_valido_mock):
    """Prueba RED: comprar con horario exacto de apertura (9:00) debe pasar"""
    with pytest.raises(AttributeError):  # Porque el método comprar_entradas no está implementado
        datos_horario_valido = datos_compra_validos.copy()
        fecha_apertura = datetime(2026, 3, 15, 9, 0, 0)  # 9:00 AM exacto
        datos_horario_valido["fecha_visita"] = fecha_apertura.isoformat()
        
        # Mockear dependencias externas
        servicio_compra.pasarela_pagos.procesar_pago = MagicMock(return_value=True)
        servicio_compra.servicio_correo.enviar_confirmacion = MagicMock(return_value=True)
        servicio_compra.servicio_calendario.es_dia_abierto.return_value = True
        
        compra = servicio_compra.comprar_entradas(usuario=usuario_valido_mock, **datos_horario_valido)

def test_comprar_entradas_horario_tarde_pasa(servicio_compra, datos_compra_validos, usuario_valido_mock):
    """Prueba RED: comprar con horario de tarde (15:30) debe pasar"""
    with pytest.raises(AttributeError):  # Porque el método comprar_entradas no está implementado
        datos_horario_valido = datos_compra_validos.copy()
        fecha_tarde = datetime(2026, 3, 15, 15, 30, 0)  # 3:30 PM
        datos_horario_valido["fecha_visita"] = fecha_tarde.isoformat()
        
        # Mockear dependencias externas
        servicio_compra.pasarela_pagos.procesar_pago = MagicMock(return_value=True)
        servicio_compra.servicio_correo.enviar_confirmacion = MagicMock(return_value=True)
        servicio_compra.servicio_calendario.es_dia_abierto.return_value = True
        
        compra = servicio_compra.comprar_entradas(usuario=usuario_valido_mock, **datos_horario_valido)

def test_comprar_entradas_horario_noche_falla(servicio_compra, datos_compra_validos, usuario_valido_mock):
    """Prueba RED: comprar con horario nocturno (20:00) debe fallar"""
    datos_de_falla = datos_compra_validos.copy()
    fecha_noche = datetime(2026, 3, 15, 20, 0, 0)  # 8:00 PM
    datos_de_falla["fecha_visita"] = fecha_noche.isoformat()
    
    with pytest.raises(ParqueCerradoError):
        servicio_compra.comprar_entradas(usuario=usuario_valido_mock, **datos_de_falla)

def test_comprar_entradas_horario_madrugada_falla(servicio_compra, datos_compra_validos, usuario_valido_mock):
    """Prueba RED: comprar con horario de madrugada (2:00) debe fallar"""
    datos_de_falla = datos_compra_validos.copy()
    fecha_madrugada = datetime(2026, 3, 15, 2, 0, 0)  # 2:00 AM
    datos_de_falla["fecha_visita"] = fecha_madrugada.isoformat()
    
    with pytest.raises(ParqueCerradoError):
        servicio_compra.comprar_entradas(usuario=usuario_valido_mock, **datos_de_falla)

def test_comprar_entradas_horario_exacto_antes_cierre_pasa(servicio_compra, datos_compra_validos, usuario_valido_mock):
    """Prueba RED: comprar con horario exacto antes de cierre (18:59:59) debe pasar"""
    with pytest.raises(AttributeError):  # Porque el método comprar_entradas no está implementado
        datos_horario_valido = datos_compra_validos.copy()
        fecha_antes_cierre = datetime(2026, 3, 15, 18, 59, 59)  # Justo antes del cierre
        datos_horario_valido["fecha_visita"] = fecha_antes_cierre.isoformat()
        
        # Mockear dependencias externas
        servicio_compra.pasarela_pagos.procesar_pago = MagicMock(return_value=True)
        servicio_compra.servicio_correo.enviar_confirmacion = MagicMock(return_value=True)
        servicio_compra.servicio_calendario.es_dia_abierto.return_value = True
        
        compra = servicio_compra.comprar_entradas(usuario=usuario_valido_mock, **datos_horario_valido)

def test_comprar_entradas_horario_exacto_cierre_falla(servicio_compra, datos_compra_validos, usuario_valido_mock):
    """Prueba RED: comprar con horario exacto de cierre (19:00) debe fallar"""
    datos_de_falla = datos_compra_validos.copy()
    fecha_cierre = datetime(2026, 3, 15, 19, 0, 0)  # 7:00 PM exacto
    datos_de_falla["fecha_visita"] = fecha_cierre.isoformat()
    
    with pytest.raises(ParqueCerradoError):
        servicio_compra.comprar_entradas(usuario=usuario_valido_mock, **datos_de_falla)

def test_comprar_entradas_horario_medio_dia_pasa(servicio_compra, datos_compra_validos, usuario_valido_mock):
    """Prueba RED: comprar con horario de medio día (12:00) debe pasar"""
    with pytest.raises(AttributeError):  # Porque el método comprar_entradas no está implementado
        datos_horario_valido = datos_compra_validos.copy()
        fecha_medio_dia = datetime(2026, 3, 15, 12, 0, 0)  # 12:00 PM
        datos_horario_valido["fecha_visita"] = fecha_medio_dia.isoformat()
        
        # Mockear dependencias externas
        servicio_compra.pasarela_pagos.procesar_pago = MagicMock(return_value=True)
        servicio_compra.servicio_correo.enviar_confirmacion = MagicMock(return_value=True)
        servicio_compra.servicio_calendario.es_dia_abierto.return_value = True
        
        compra = servicio_compra.comprar_entradas(usuario=usuario_valido_mock, **datos_horario_valido)

# --- PRUEBAS RED: Usuario No Registrado ---

def test_comprar_entradas_usuario_no_registrado_falla(servicio_compra, datos_compra_validos):
    """Prueba RED: usuario no registrado no puede comprar entradas"""
    usuario_no_registrado = Mock(nombre="Jose Gonzales", email="jose@example.com", esta_registrado=False)
    
    with pytest.raises(PermissionError):
        servicio_compra.comprar_entradas(usuario=usuario_no_registrado, **datos_compra_validos)

# -- PRUEBAS RED: Validaciones de estructura y datos ---

def test_comprar_entradas_cantidad_inconsistente_falla(servicio_compra, datos_compra_validos, usuario_valido_mock):
    """Prueba RED: cantidad no coincide con visitantes debe fallar"""
    datos_de_falla = datos_compra_validos.copy()
    datos_de_falla["cantidad"] = 3
    datos_de_falla["visitantes"] = datos_compra_validos["visitantes"][:2]  # Solo 2 visitantes
    
    with pytest.raises(ValueError):
        servicio_compra.comprar_entradas(usuario=usuario_valido_mock, **datos_de_falla)

def test_comprar_entradas_edad_negativa_falla(servicio_compra, usuario_valido_mock):
    """Prueba RED: edad negativa debe fallar"""
    datos_invalidos = {
        "cantidad": 1,
        "fecha_visita": date.today().isoformat(),
        "tipo_pago": "Tarjeta",
        "visitantes": [{"edad": -5, "tipo_pase": "Regular"}]
    }
    
    with pytest.raises(ValueError):
        servicio_compra.comprar_entradas(usuario=usuario_valido_mock, **datos_invalidos)

def test_comprar_entradas_edad_muy_alta_falla(servicio_compra, usuario_valido_mock):
    """Prueba RED: edad muy alta (mayor a 150) debe fallar"""
    datos_invalidos = {
        "cantidad": 1,
        "fecha_visita": date.today().isoformat(),
        "tipo_pago": "Tarjeta",
        "visitantes": [{"edad": 200, "tipo_pase": "Regular"}]
    }
    
    with pytest.raises(ValueError):
        servicio_compra.comprar_entradas(usuario=usuario_valido_mock, **datos_invalidos)

def test_comprar_entradas_tipo_pase_invalido_falla(servicio_compra, usuario_valido_mock):
    """Prueba RED: tipo de pase inválido debe fallar"""
    datos_invalidos = {
        "cantidad": 1,
        "fecha_visita": date.today().isoformat(),
        "tipo_pago": "Tarjeta",
        "visitantes": [{"edad": 25, "tipo_pase": "Premium"}]  # Tipo inválido
    }
    
    with pytest.raises(ValueError):
        servicio_compra.comprar_entradas(usuario=usuario_valido_mock, **datos_invalidos)

def test_comprar_entradas_datos_visitante_incompletos_falla(servicio_compra, usuario_valido_mock):
    """Prueba RED: datos de visitante incompletos debe fallar"""
    datos_incompletos = {
        "cantidad": 1,
        "fecha_visita": date.today().isoformat(),
        "tipo_pago": "Tarjeta",
        "visitantes": [{"edad": 25}]  # Falta tipo_pase
    }
    
    with pytest.raises(ValueError):
        servicio_compra.comprar_entradas(usuario=usuario_valido_mock, **datos_incompletos)

def test_comprar_entradas_edad_string_falla(servicio_compra, usuario_valido_mock):
    """Prueba RED: edad como string debe fallar"""
    datos_invalidos = {
        "cantidad": 1,
        "fecha_visita": date.today().isoformat(),
        "tipo_pago": "Tarjeta",
        "visitantes": [{"edad": "veinticinco", "tipo_pase": "Regular"}]  # Edad como string
    }
    
    with pytest.raises(ValueError):
        servicio_compra.comprar_entradas(usuario=usuario_valido_mock, **datos_invalidos)

def test_comprar_entradas_tipo_pase_null_falla(servicio_compra, usuario_valido_mock):
    """Prueba RED: tipo pase null debe fallar"""
    datos_invalidos = {
        "cantidad": 1,
        "fecha_visita": date.today().isoformat(),
        "tipo_pago": "Tarjeta",
        "visitantes": [{"edad": 25, "tipo_pase": None}]
    }
        
    with pytest.raises(ValueError):
        servicio_compra.comprar_entradas(usuario=usuario_valido_mock, **datos_invalidos)


# --- PRUEBAS RED: Edge Cases de Negocio ---

def test_calcular_precio_edad_cero_gratis(servicio_compra):
    """Prueba RED: edad 0 años debe ser gratis"""
    with pytest.raises(AttributeError):
        precio = servicio_compra._calcular_precio_entrada(0, "VIP")
        assert precio == 0

def test_calcular_precio_edad_un_ano_gratis(servicio_compra):
    """Prueba RED: edad 1 año debe ser gratis"""
    with pytest.raises(AttributeError):
        precio = servicio_compra._calcular_precio_entrada(1, "Regular")
        assert precio == 0

# --- PRUEBAS RED: Validación de Formato Email ---

def test_comprar_entradas_email_usuario_invalido_falla(servicio_compra, datos_compra_validos):
    """Prueba RED: email de usuario inválido debe fallar"""
    usuario_email_invalido = Mock(esta_registrado=True, email="email_invalido")
    
    with pytest.raises(ValueError):
        servicio_compra.comprar_entradas(usuario=usuario_email_invalido, **datos_compra_validos)

def test_comprar_entradas_email_usuario_vacio_falla(servicio_compra, datos_compra_validos):
    """Prueba RED: email de usuario vacío debe fallar"""
    usuario_email_vacio = Mock(esta_registrado=True, email="")
    
    with pytest.raises(ValueError):
        servicio_compra.comprar_entradas(usuario=usuario_email_vacio, **datos_compra_validos)


# Los siguientes tests creo q están mal porque están probando comprar_entradas, no _validar_fecha_hora_visita, _validad_cantidad, etc. Los implementé correctamente. De todas formas, los dejo comentados por si me equivoco. 
#                                                                       Mari.
"""
def test_comprar_mas_de_diez_entradas_falla(servicio_compra, datos_compra_validos, usuario_valido_mock):
    #Prueba RED: comprar más de 10 entradas debe fallar.
    datos_de_falla = datos_compra_validos.copy()
    cantidad_a_fallar = 11
    datos_de_falla["cantidad"] = cantidad_a_fallar
    visitante_base = datos_de_falla["visitantes"][0]
    datos_de_falla["visitantes"] = [visitante_base] * cantidad_a_fallar

    with pytest.raises(LimiteEntradasExcedidoError):
        servicio_compra.comprar_entradas(usuario=usuario_valido_mock, **datos_de_falla)

def test_comprar_entradas_fecha_pasada_falla(servicio_compra, datos_compra_validos, usuario_valido_mock):
    #Prueba RED: comprar con fecha pasada debe fallar.
    fecha_pasada = date.today() - timedelta(days=1)
    datos_de_falla = datos_compra_validos.copy()
    datos_de_falla["fecha_visita"] = fecha_pasada.isoformat()

    with pytest.raises(FechaInvalidaError):
        servicio_compra.comprar_entradas(usuario=usuario_valido_mock, **datos_de_falla)

def test_comprar_entradas_fecha_lunes_falla(servicio_compra, datos_compra_validos, usuario_valido_mock):
    #Prueba RED: comprar para un lunes debe fallar (parque cerrado).
    hoy = date.today()
    dias_hasta_lunes = (0 - hoy.weekday() + 7) % 7
    if dias_hasta_lunes == 0: 
        dias_hasta_lunes = 7
    fecha_lunes = hoy + timedelta(days=dias_hasta_lunes)

    datos_de_falla = datos_compra_validos.copy()
    datos_de_falla["fecha_visita"] = fecha_lunes.isoformat()

    with pytest.raises(ParqueCerradoError):
        servicio_compra.comprar_entradas(usuario=usuario_valido_mock, **datos_de_falla)
"""

# --- PRUEBAS (estas parecen estar en fase GREEN, las mantengo pero comento) ---
"""
def test_validar_parametros_cantidad_valida_no_lanza_error(sistema):
    # Prueba que la validación pasa con una cantidad correcta.
    sistema.validar_parametros_compra(cantidad=5)

def test_procesar_pago_compra_exitoso(sistema, mocker):
    # Prueba que el cálculo del monto y la llamada de pago son correctos.
    mocker.patch.object(sistema.mp_service, 'procesar_pago', return_value=True)
    pago_exitoso, monto = sistema.procesar_pago_compra(cantidad=3, tipo_pase={"nombre": "VIP", "precio": 10000})
    
    assert pago_exitoso is True
    assert monto == 30000

def test_crear_objeto_compra(sistema):
    # Prueba que el objeto Compra se instancia con los datos correctos.
    datos = {
        "fecha_visita": date.today(), "cantidad_entradas": 2, "edades_visitantes": [30, 35],
        "tipo_pase": {"nombre": "VIP", "precio": 10000}, "forma_pago": "tarjeta", "usuario": {"mail": "test@test.com"}
    }
    
    compra_creada = sistema.crear_objeto_compra(datos, monto_total=20000)
    
    assert isinstance(compra_creada, Compra)
    assert compra_creada.cantidad_entradas == 2
    assert compra_creada.monto_total == 20000
    assert compra_creada.usuario["mail"] == "test@test.com"

def test_comprar_entradas_con_datos_validos_y_pago_tarjeta(sistema, mocker):
    # Prueba el flujo completo del método 'comprar_entradas'
    mock_procesar_pago = mocker.patch.object(sistema.mp_service, 'procesar_pago', return_value=True)
    mock_enviar_email = mocker.patch.object(sistema.email_service, 'enviar_confirmacion', return_value=True)
    
    usuario_valido = {"nombre": "Ana", "apellido": "López", "mail": "analopez@gmail.com"}
    fecha_valida = date.today() + timedelta(days=1)
    tipo_pase_valido = {"nombre": "VIP", "precio": 10000}
    forma_pago_valida = "tarjeta"

    compra, confirmacion = sistema.comprar_entradas(
        fecha_visita=fecha_valida,
        cantidad_entradas=2,
        edades_visitantes=[24, 22],
        tipo_pase=tipo_pase_valido,
        forma_pago=forma_pago_valida,
        usuario=usuario_valido
    )

    assert isinstance(compra, Compra)
    assert compra.fecha_visita == fecha_valida
    assert len(compra.entradas) == 2
    assert compra.forma_pago == "tarjeta"
    assert compra.usuario["mail"] == 'analopez@gmail.com'
    assert confirmacion is True
    mock_procesar_pago.assert_called_once_with(monto=20000)
    mock_enviar_email.assert_called_once_with(
        mail='analopez@gmail.com',
        compra_details=compra.__dict__
    )
"""