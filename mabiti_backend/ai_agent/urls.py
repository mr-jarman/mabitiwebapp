from django.urls import path
from .views import AgentChatView

urlpatterns = [
    path('chat/', AgentChatView.as_view(), name='agent-chat'),
]
