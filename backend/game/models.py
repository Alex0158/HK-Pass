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
    limited_time = models.IntegerField(default=0)     # 限時秒數
    play_count = models.IntegerField(default=0)       # 被玩次數

    def __str__(self):
        return self.name


class CommonSetting(models.Model):
    attacker_team_bonus = models.IntegerField(default=2, help_text="攻擊者隊伍加分")
    attacker_player_bonus = models.IntegerField(default=1, help_text="攻擊者玩家加分")
    attacked_increment = models.IntegerField(default=1, help_text="被攻擊隊伍次數增加")

    hide_team_ranking = models.BooleanField(default=False, help_text="隱藏隊伍排行榜")
    team_ranking_top_n = models.IntegerField(default=10, help_text="隊伍排行榜顯示前 N 名")

    hide_player_ranking = models.BooleanField(default=False, help_text="隱藏玩家得分排行榜")
    player_ranking_top_n = models.IntegerField(default=10, help_text="玩家得分排行榜顯示前 N 名")

    hide_attack_count_ranking = models.BooleanField(default=False, help_text="隱藏被攻擊次數排行榜")
    attack_count_ranking_top_n = models.IntegerField(default=10, help_text="被攻擊次數排行榜顯示前 N 名")

    hide_minigame_ranking = models.BooleanField(default=False, help_text="隱藏小遊戲完成數排行榜")
    minigame_ranking_top_n = models.IntegerField(default=10, help_text="完成小遊戲數排行榜顯示前 N 名")

    login_password = models.CharField(max_length=128, default="", help_text="登入密碼")

    def __str__(self):
        return "全域設定"