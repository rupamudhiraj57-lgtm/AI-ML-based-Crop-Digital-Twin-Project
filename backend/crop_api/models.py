
from django.conf import settings
from django.db import models


class PredictionHistory(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="crop_predictions",
        null=True,
        blank=True,
    )

    crop_type = models.CharField(max_length=50)

    soil_moisture = models.FloatField()
    soil_ph = models.FloatField()
    nitrogen = models.FloatField()
    phosphorus = models.FloatField()
    potassium = models.FloatField()

    temperature = models.FloatField()
    humidity = models.FloatField()
    rainfall = models.FloatField()
    irrigation_hours = models.FloatField()
    pest_index = models.FloatField()
    previous_yield = models.FloatField()

    crop_health = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.crop_type} - {self.crop_health}"
