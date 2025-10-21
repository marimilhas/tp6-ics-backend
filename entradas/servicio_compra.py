from django.contrib.auth.models import User
from entradas.excepciones import LimiteEntradasExcedidoError, ParqueCerradoError
from datetime import datetime, timedelta

class ServicioCompraEntradas:
    """Clase de la Capa de Lógica de Negocio (Service)."""

    # 1. Constructor: Debe recibir los mismos mocks que se pasan en la fixture 'servicio_compra'
    def __init__(self, pasarela_pagos, servicio_correo, servicio_calendario):
        self.pasarela_pagos = pasarela_pagos
        self.servicio_correo = servicio_correo
        self.servicio_calendario = servicio_calendario

    # 2. Método Principal: Debe recibir la firma de argumentos correcta
    def comprar_entradas(self, usuario: User, cantidad: int, fecha_visita: str, tipo_pago: str, visitantes: list):
        """
        Método a construir. Actualmente, no tiene la lógica de validación de cantidad.
        Esta ausencia es lo que causa el fallo RED esperado en el test.
        """

        # El código simplemente ignora la cantidad excesiva (11) y no lanza la excepción.
        # Esto provoca que el 'pytest.raises(LimiteEntradasExcedidoError)' falle.
        return {"mensaje": "Compra iniciada (Validación de cantidad omitida para el test RED)."}

    def _calcular_precio_entrada(self, edad: int, tipo_pase: str) -> float:
        """
        Calculará el precio de una entrada según edad y tipo de pase.
        
        """
        costo = 0
        #Asigna según tipo de entrada
        if tipo_pase == 'Regular':
            costo = 5000
        elif tipo_pase == 'VIP':
            costo = 10000

        #Modifica segun edad
        if edad < 3:
            costo = 0
        elif edad < 10 or edad > 60:
            costo *= 0.5
        
        return costo

    def _calcular_monto_total(self, visitantes: list) -> float:
        """
        Calculará el monto total sumando todos los precios individuales.
        
        """

        
    
    def _validar_cantidad(self, cantidad, visitantes):
        """
        Valida que no se compren más de 10 entradas, que sea una cantidad positiva y que la cantidad coincida con los visitantes
        """

        if cantidad <= 0:
            raise ValueError("La cantidad de entradas debe ser al menos 1.")
        
        if cantidad > 10:
            raise LimiteEntradasExcedidoError("La cantidad de entradas no puede ser mayor a 10.")
        
        if cantidad != len(visitantes):
            raise ValueError("La cantidad de entradas debe ser igual al nro de visitantes.")
        
        return True
        
    def _validar_fecha_hora_visita(self, fecha):
        """
        Valida que la fecha sea en un dia donde el parque esté abierto (ni lunes, ni feriados como navidad o año nuevo),
        que se compre durante horario habilitado
        """
        dia_fecha = fecha.weekday()
        navidad = datetime(fecha.year, month=12, day=25) + timedelta(hours=fecha.hour, minutes=fecha.minute, seconds=fecha.second)
        anio_nuevo = datetime(fecha.year, month=1, day=1) + timedelta(hours=fecha.hour, minutes=fecha.minute, seconds=fecha.second)
        hora_fecha = fecha.hour

        if fecha == navidad or fecha == anio_nuevo or dia_fecha == 0 or hora_fecha < 9 or hora_fecha >= 19:
            raise ParqueCerradoError

        if fecha < datetime.now():
            raise ValueError