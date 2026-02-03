from rest_framework import serializers
from .models import Property, Rental

class PropertySerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = '__all__'

class RentalSerializer(serializers.ModelSerializer):
    property_details = PropertySerializer(source='property', read_only=True)
    
    class Meta:
        model = Rental
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'is_active')
