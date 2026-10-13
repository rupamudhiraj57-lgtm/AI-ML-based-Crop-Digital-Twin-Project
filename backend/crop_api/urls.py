from django.urls import path
from . import views

urlpatterns = [
    path('predict/', views.predict_crop_health, name='predict_crop_health'),
]