# game/urls.py
from django.urls import path, include
from rest_framework import routers
from .views import TeamViewSet, PlayerViewSet, MiniGameViewSet,CommonSettingViewSet

router = routers.DefaultRouter()
router.register(r'teams', TeamViewSet)
router.register(r'players', PlayerViewSet)
router.register(r'minigames', MiniGameViewSet)
router.register(r'settings', CommonSettingViewSet)
urlpatterns = [
    path('api/', include(router.urls)),
]
