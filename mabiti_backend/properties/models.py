from django.db import models
from django.conf import settings

class Property(models.Model):
    original_id = models.CharField(max_length=50, unique=True, null=True, blank=True)
    title = models.CharField(max_length=255)
    address = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    beds = models.IntegerField()
    baths = models.FloatField()
    sqft = models.IntegerField()
    built = models.IntegerField()
    description = models.TextField()
    images = models.JSONField()
    panorama_images = models.JSONField(null=True, blank=True)
    agent = models.JSONField()
    neighborhood = models.CharField(max_length=255)
    features = models.JSONField()
    is_visible = models.BooleanField(default=True)
    listing_type = models.CharField(max_length=20, choices=[('buy', 'For Sale'), ('rent', 'For Rent')], default='buy')
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    has_online_lock = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class Rental(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='rentals')
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='rentals')
    start_date = models.DateField()
    end_date = models.DateField()
    days = models.IntegerField(default=1)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.property.title} ({self.days} days)"
