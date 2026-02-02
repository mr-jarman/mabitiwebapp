import json
import os
from django.core.management.base import BaseCommand
from properties.models import Property
from django.conf import settings

class Command(BaseCommand):
    help = 'Import properties from JSON file'

    def handle(self, *args, **kwargs):
        json_path = os.path.join(settings.BASE_DIR, '..', 'mabiti_frontend', 'data', 'properties.json')
        
        with open(json_path, 'r') as f:
            data = json.load(f)
            properties = data.get('properties', [])

        count = 0
        for item in properties:
            obj, created = Property.objects.update_or_create(
                original_id=item['id'],
                defaults={
                    'title': item['title'],
                    'address': item['address'],
                    'price': item['price'],
                    'beds': item['beds'],
                    'baths': item['baths'],
                    'sqft': item['sqft'],
                    'built': item['built'],
                    'description': item['description'],
                    'images': item['images'],
                    'agent': item['agent'],
                    'neighborhood': item['neighborhood'],
                    'features': item['features'],
                    'panorama_images': item.get('panorama_images', []),
                }
            )
            if created:
                count += 1
        
        self.stdout.write(self.style.SUCCESS(f'Successfully imported {count} new properties'))
