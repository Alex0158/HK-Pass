# game/forms.py
from django import forms
from .models import Team, Player, MiniGame

class TeamForm(forms.ModelForm):
    class Meta:
        model = Team
        fields = ['number', 'score', 'attacked_count']

class PlayerForm(forms.ModelForm):
    class Meta:
        model = Player
        fields = ['name', 'number', 'personal_score', 'chips', 'completed_minigame_count', 'team']

class MiniGameForm(forms.ModelForm):
    class Meta:
        model = MiniGame
        fields = ['room', 'score']
