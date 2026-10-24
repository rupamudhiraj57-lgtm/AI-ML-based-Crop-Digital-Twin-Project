from django.urls import path
from . import views

urlpatterns = [
    path(
        "predict/",
        views.predict_crop_health,
        name="predict_crop_health",
    ),
    path(
        "history/",
        views.prediction_history,
        name="prediction_history",
    ),
    path(
    "simulate/",
    views.simulate_crop_health,
    name="simulate_crop_health",
    ),
    path(
    "auth/register/",
     views.register_user,
     name="register"
     ),
path(
    "auth/login/",
    views.login_user,
      name="login"
      ),
path(
    "auth/logout/",
      views.logout_user,
        name="logout"
        ),
path(
    "auth/status/",
    views.auth_status,
    name="auth_status"
    ),
]