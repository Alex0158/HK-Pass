# game/models.py
from django.db import models

class Team(models.Model):
    name = models.CharField(max_length=50, unique=True)  # 隊伍名稱
    score = models.IntegerField(default=0)
    attacked_count = models.IntegerField(default=0)
    hide_ranking = models.BooleanField(default=False)  # 是否隱藏排行榜數值
    hide_team_name = models.BooleanField(default=False)  # 是否隱藏隊伍名稱

    def __str__(self):
        return self.name

class Player(models.Model):
    name = models.CharField(max_length=100)  # 玩家名稱
    number = models.CharField(max_length=20, unique=True)  # 玩家號碼
    personal_score = models.IntegerField(default=0)
    chips = models.IntegerField(default=0)
    completed_minigame_count = models.IntegerField(default=0)
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='players', null=True, blank=True)
    hide_name = models.BooleanField(default=False)  # 是否隱藏玩家名稱
    hide_team = models.BooleanField(default=False)  # 是否隱藏所屬隊伍
    hide_personal_score = models.BooleanField(default=False)  # 是否隱藏個人得分
    hide_completed_minigame_count = models.BooleanField(default=False)  # 是否隱藏個人完成小遊戲數量

    def __str__(self):
        return self.name

class MiniGame(models.Model):
    category = models.CharField(max_length=50)        # 遊戲類別
    room = models.CharField(max_length=50)            # 房間
    name = models.CharField(max_length=100)           # 遊戲名稱
    available_chips = models.IntegerField(default=0)  # 可得籌碼
    is_displayed = models.BooleanField(default=True)  # 是否在遊戲大全中顯示
    is_limited = models.BooleanField(default=False)   # 是否啟用限時功能
    limited_time = models.IntegerField(default=0)       # 限時秒數
    play_count = models.IntegerField(default=0)         # 被玩次數

    def __str__(self):
        return self.name
    


class CommonSetting(models.Model):
    attacker_team_bonus = models.IntegerField(default=2, help_text="攻擊者隊伍加分")
    attacker_player_bonus = models.IntegerField(default=1, help_text="攻擊者玩家加分")
    # 如果需要也可以加入被攻擊次數增加的設定
    attacked_increment = models.IntegerField(default=1, help_text="被攻擊隊伍次數增加")

    def __str__(self):
        return "全域設定"