from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PropertyViewSet, RentalViewSet

router = DefaultRouter()
router.register(r'rentals', RentalViewSet, basename='rental')
router.register(r'', PropertyViewSet, basename='property')

urlpatterns = [
    path('', include(router.urls)),
]
