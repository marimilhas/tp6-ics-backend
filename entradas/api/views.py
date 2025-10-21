from rest_framework import viewsets
from entradas.models import Pase, Compra, Entrada
from .serializers import PaseSerializer, CompraSerializer, EntradaSerializer

class PaseViewSet(viewsets.ModelViewSet):
    queryset = Pase.objects.all()
    serializer_class = PaseSerializer

class CompraViewSet(viewsets.ModelViewSet):
    queryset = Compra.objects.all()
    serializer_class = CompraSerializer

class EntradaViewSet(viewsets.ModelViewSet):
    queryset = Entrada.objects.all()
    serializer_class = EntradaSerializer
