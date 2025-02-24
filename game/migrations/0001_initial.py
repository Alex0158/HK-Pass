# Generated by Django 5.1.6 on 2025-02-18 21:12

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="MiniGame",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("room", models.CharField(max_length=50)),
                ("score", models.IntegerField(default=0)),
            ],
        ),
        migrations.CreateModel(
            name="Team",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("number", models.PositiveSmallIntegerField(unique=True)),
                ("score", models.IntegerField(default=0)),
                ("attacked_count", models.IntegerField(default=0)),
            ],
        ),
        migrations.CreateModel(
            name="Player",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=100)),
                ("number", models.CharField(max_length=20, unique=True)),
                ("personal_score", models.IntegerField(default=0)),
                ("chips", models.IntegerField(default=0)),
                ("completed_minigame_count", models.IntegerField(default=0)),
                (
                    "team",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="players",
                        to="game.team",
                    ),
                ),
            ],
        ),
    ]
