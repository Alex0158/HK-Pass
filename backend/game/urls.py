# game/urls.py
from django.urls import path, include
from rest_framework import routers
from .views import TeamViewSet, PlayerViewSet, MiniGameViewSet, CommonSettingViewSet

router = routers.DefaultRouter()
router.register(r'teams', TeamViewSet)
router.register(r'players', PlayerViewSet)
router.register(r'minigames', MiniGameViewSet)
router.register(r'settings', CommonSettingViewSet)

urlpatterns = [
    # 這裡不要再加 'api/'，否則會造成 /api/api/teams
    path('', include(router.urls)),
]