from django.db import models

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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
