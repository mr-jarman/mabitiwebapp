from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Property, Rental
from .serializers import PropertySerializer, RentalSerializer

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and (request.user.is_staff or getattr(request.user, 'is_admin', False))

class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    
    def get_queryset(self):
        user = self.request.user
        # Regular users (authenticated or not) only see visible properties
        if not (user.is_authenticated and (user.is_staff or getattr(user, 'is_admin', False))):
            return Property.objects.filter(is_visible=True)
        return Property.objects.all()

    def destroy(self, request, *args, **kwargs):
        # Only superusers can delete permanently
        if not request.user.is_superuser:
            return Response(
                {"detail": "Only superusers can delete permanently. Admins should use 'hide'."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def toggle_visibility(self, request, pk=None):
        user = request.user
        if not (user.is_staff or getattr(user, 'is_admin', False)):
            return Response({"detail": "Only admins can hide/show properties."}, status=status.HTTP_403_FORBIDDEN)
        
        property_obj = self.get_object()
        property_obj.is_visible = not property_obj.is_visible
        property_obj.save()
        
        status_str = "visible" if property_obj.is_visible else "hidden"
        return Response({"status": f"Property is now {status_str}", "is_visible": property_obj.is_visible})

class RentalViewSet(viewsets.ModelViewSet):
    serializer_class = RentalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Return only rentals belonging to the current user
        return Rental.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
