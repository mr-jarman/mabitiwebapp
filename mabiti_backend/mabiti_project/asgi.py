import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import path

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mabiti_project.settings')

# Initialize Django ASGI application early to ensure AppRegistry is ready
django_asgi_app = get_asgi_application()

from ai_agent.consumers import LiveCallConsumer

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter([
            path("ws/agent/call/", LiveCallConsumer.as_asgi()),
        ])
    ),
})
