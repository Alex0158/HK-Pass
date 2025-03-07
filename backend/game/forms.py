from django import forms
from .models import Team, Player, MiniGame, CommonSetting

class TeamForm(forms.ModelForm):
    class Meta:
        model = Team
        fields = ['name', 'score', 'attacked_count', 'hide_ranking', 'hide_team_name']

class PlayerForm(forms.ModelForm):
    class Meta:
        model = Player
        fields = [
            'name', 'number', 'personal_score', 'chips',
            'completed_minigame_count', 'team',
            'hide_name', 'hide_team',
            'hide_personal_score', 'hide_completed_minigame_count'
        ]

class MiniGameForm(forms.ModelForm):
    class Meta:
        model = MiniGame
        fields = [
            'category', 'room', 'name', 'available_chips',
            'is_displayed', 'is_limited', 'limited_time', 'play_count'
        ]

class CommonSettingForm(forms.ModelForm):
    class Meta:
        model = CommonSetting
        fields = '__all__'