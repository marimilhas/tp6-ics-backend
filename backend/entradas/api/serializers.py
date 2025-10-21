from rest_framework import serializers
from entradas.models import Pase, Compra, Entrada

class PaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pase
        fields = '__all__'

class EntradaSerializer(serializers.ModelSerializer):
    pase = PaseSerializer(read_only=True)

    class Meta:
        model = Entrada
        fields = '__all__'

class CompraSerializer(serializers.ModelSerializer):
    usuario = serializers.StringRelatedField(read_only=True)
    entradas = EntradaSerializer(many=True, read_only=True)

    class Meta:
        model = Compra
        fields = '__all__'
