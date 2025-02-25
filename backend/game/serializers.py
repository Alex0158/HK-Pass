# game/serializers.py
from rest_framework import serializers
from .models import Team, Player, MiniGame, CommonSetting

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = '__all__'

class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = '__all__'

class MiniGameSerializer(serializers.ModelSerializer):
    class Meta:
        model = MiniGame
        fields = '__all__'


class CommonSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommonSetting
        fields = '__all__'