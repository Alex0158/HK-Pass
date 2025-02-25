# game/admin.py
from django.contrib import admin
from .models import Team, Player, MiniGame, CommonSetting

@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ('name', 'score', 'attacked_count')

@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = ('name', 'number', 'personal_score', 'chips', 'completed_minigame_count', 'team')

@admin.register(MiniGame)
class MiniGameAdmin(admin.ModelAdmin):
    list_display = ('category', 'room', 'name', 'available_chips')


@admin.register(CommonSetting)
class CommonSettingAdmin(admin.ModelAdmin):
    list_display = ('attacker_team_bonus', 'attacker_player_bonus', 'attacked_increment')