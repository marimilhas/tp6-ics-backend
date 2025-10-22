# servicio_compra.py

from django.contrib.auth.models import User
from .excepciones import LimiteEntradasExcedidoError, ParqueCerradoError, PagoRechazadoError
from datetime import datetime, timedelta

# Importamos la excepción EdadInvalidaError (asumo que está junto a las otras)
# y la clase EmailError si la necesitas, aunque para el mock puedes usar Exception.
# Si EdadInvalidaError no está en excepciones.py, deberás añadirla a ese archivo.
from .excepciones import LimiteEntradasExcedidoError, ParqueCerradoError, PagoRechazadoError, EdadInvalidaError


class ServicioCompraEntradas:
    """Clase de la Capa de Lógica de Negocio (Service)."""

    def __init__(self, pasarela_pagos, servicio_correo, servicio_calendario):
        self.pasarela_pagos = pasarela_pagos
        self.servicio_correo = servicio_correo
        self.servicio_calendario = servicio_calendario

    # 1. Método Principal (Manteniendo la estructura que permite fallar el test RED por AttributeError si no se implementa)
    def comprar_entradas(self, usuario: User, cantidad: int, fecha_visita: str, tipo_pago: str, visitantes: list):
        """
        Método a construir. Actualmente, no tiene la lógica de validación de cantidad.
        Esta ausencia es lo que causa el fallo RED esperado en el test.
        """
        # En esta etapa, el método debe fallar o devolver un mock. 
        # Pero si tu test final es Failed: DID NOT RAISE <class 'AttributeError'>, significa
        # que el método comprar_entradas está incompleto, pero los métodos internos 
        # que se llaman desde ahí aún no están implementados o no se llaman correctamente.

        # Retorna el mensaje original para mantener el fallo en los tests finales si no está implementado:
        # return {"mensaje": "Compra iniciada (Validación de cantidad omitida para el test RED)."}

        # O lanza un AttributeError esperado en el test final si es necesario:
        raise NotImplementedError("Método comprar_entradas aún no implementado por completo (Fase RED).")

    # 2. Métodos de Cálculo (Implementados en el código que pasaste)
    def _calcular_precio_entrada(self, edad: int, tipo_pase: str) -> float:
        """Calculará el precio de una entrada según edad y tipo de pase."""
        costo = 0
        if tipo_pase == 'Regular':
            costo = 5000
        elif tipo_pase == 'VIP':
            costo = 10000

        if edad < 3:
            costo = 0
        elif edad < 10 or edad > 60:
            costo *= 0.5

        return costo

    def _calcular_monto_total(self, visitantes: list) -> float:
        """Calculará el monto total sumando todos los precios individuales."""
        suma = 0
        for visitante in visitantes:
            suma += self._calcular_precio_entrada(visitante["edad"], visitante["tipo_pase"])
        return suma

    # 3. Métodos de Validación (Implementados en el código que pasaste)
    def _validar_cantidad(self, cantidad, visitantes):
        """Valida que no se compren más de 10 entradas, que sea una cantidad positiva y que la cantidad coincida con los visitantes"""
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
        # Se necesita la hora actual para comparar con datetime.now()
        ahora = datetime.now()

        # Simplificación de fechas especiales para el stub, corrigiendo la lógica de comparación
        # (se debe comparar solo el día, no día y hora a la vez)
        navidad_sin_hora = datetime(fecha.year, 12, 25).date()
        anio_nuevo_sin_hora = datetime(fecha.year, 1, 1).date()

        if fecha.date() == navidad_sin_hora or fecha.date() == anio_nuevo_sin_hora or dia_fecha == 0:
            raise ParqueCerradoError("El parque está cerrado en esa fecha.")

        hora_fecha = fecha.hour

        if hora_fecha < 9 or hora_fecha >= 19:
            raise ParqueCerradoError("Horario de visita fuera del rango permitido (9:00 - 19:00).")

        if fecha < ahora:
            raise ValueError("La fecha de visita no puede ser en el pasado.")

        return True

    # 4. MÉTODOS FALTANTES (CAUSAN AttributeError)

    def _validar_formato_fecha(self, fecha_str: str) -> datetime:
        """
        Valida que la fecha sea un string no vacío y que tenga formato ISO 8601 (YYYY-MM-DDThh:mm:ss).
        """
        # STUB: Lanza AttributeError para pasar a la fase GREEN
        raise NotImplementedError("Método pendiente de implementación en fase GREEN")

    def _validar_formato_cantidad(self, cantidad):
        """
        Valida que la cantidad sea un entero, no un string, float o None.
        """
        # STUB: Lanza AttributeError para pasar a la fase GREEN
        raise NotImplementedError("Método pendiente de implementación en fase GREEN")

    def _validar_formato_edades(self, visitantes: list):
        """
        Valida que la clave 'edad' exista, sea un entero, no sea None, y no sea negativa/muy alta.
        """
        # STUB: Lanza AttributeError para pasar a la fase GREEN
        raise NotImplementedError("Método pendiente de implementación en fase GREEN")

    def _validar_formato_pases(self, visitantes: list):
        """
        Valida que la clave 'tipo_pase' exista, sea un string y no esté vacío/None/tipo incorrecto.
        """
        # STUB: Lanza AttributeError para pasar a la fase GREEN
        raise NotImplementedError("Método pendiente de implementación en fase GREEN")

    def _validar_usuario(self, usuario: User):
        """
        Valida que el usuario esté registrado.
        """
        # STUB: Lanza AttributeError para pasar a la fase GREEN
        raise NotImplementedError("Método pendiente de implementación en fase GREEN")

    def _gestionar_pago(self, monto_total: float, tipo_pago: str) -> bool:
        """
        Procesa el pago (llama a pasarela si es Tarjeta) o lo registra (si es Efectivo).
        """
        # STUB: Lanza AttributeError para pasar a la fase GREEN
        raise NotImplementedError("Método pendiente de implementación en fase GREEN")

    def _enviar_confirmacion(self, usuario: User, compra):
        """
        Envía el correo de confirmación de la compra.
        """
        # STUB: Lanza AttributeError para pasar a la fase GREEN
        raise NotImplementedError("Método pendiente de implementación en fase GREEN")

    def _enviar_notificacion(self, usuario: User, compra):
        """
        Envía notificaciones, similar a _enviar_confirmacion
        """
        # STUB: Lanza AttributeError para pasar a la fase GREEN
        raise NotImplementedError("Método pendiente de implementación en fase GREEN")
