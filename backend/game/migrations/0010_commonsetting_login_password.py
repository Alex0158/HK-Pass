# Generated by Django 5.1.6 on 2025-03-06 23:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("game", "0009_commonsetting_attack_count_ranking_top_n_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="commonsetting",
            name="login_password",
            field=models.CharField(default="", help_text="登入密碼", max_length=128),
        ),
    ]
