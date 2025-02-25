# game/views.py
from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from .models import Team, Player, MiniGame,CommonSetting
from .serializers import TeamSerializer, PlayerSerializer, MiniGameSerializer,CommonSettingSerializer

class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['name']

class PlayerViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['team', 'team__name']

class MiniGameViewSet(viewsets.ModelViewSet):
    queryset = MiniGame.objects.all()
    serializer_class = MiniGameSerializer


class CommonSettingViewSet(viewsets.ModelViewSet):
    queryset = CommonSetting.objects.all()
    serializer_class = CommonSettingSerializer