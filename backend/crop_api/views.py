from django.contrib.auth import authenticate, login, logout, get_user_model
from django.middleware.csrf import get_token
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.csrf import csrf_exempt
import json
import logging
from pathlib import Path
from .models import PredictionHistory
import joblib
import pandas as pd
from django.http import JsonResponse

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "ml" / "best_crop_health_model.pkl"

model = joblib.load(MODEL_PATH)

FEATURES = [
    "Crop_Type",
    "Soil_Moisture",
    "Soil_pH",
    "Nitrogen",
    "Phosphorus",
    "Potassium",
    "Temperature",
    "Humidity",
    "Rainfall",
    "Irrigation_Hours",
    "Pest_Index",
    "Previous_Yield",
]

CROP_TYPES = {"Maize", "Cotton", "Rice", "Groundnut", "Tomato"}

# Observed dataset ranges; these are an initial validation policy.
NUMERIC_RANGES = {
    "Soil_Moisture": (15, 95),
    "Soil_pH": (5, 8),
    "Nitrogen": (10, 110),
    "Phosphorus": (5, 80),
    "Potassium": (10, 98.5),
    "Temperature": (18, 39.7),
    "Humidity": (30.7, 95),
    "Rainfall": (0, 250),
    "Irrigation_Hours": (0, 10),
    "Pest_Index": (0, 74.3),
    "Previous_Yield": (1.93, 8.15),
}


#@csrf_exempt
def predict_crop_health(request):
    if not request.user.is_authenticated:
        return JsonResponse(
        {"error": "Please log in to make predictions."},
        status=401,
    )
    if request.method != "POST":
        return JsonResponse(
            {"error": "Please use POST to submit crop data."},
            status=405,
        )

    try:
        data = json.loads(request.body)

        if not isinstance(data, dict):
            return JsonResponse(
                {"error": "Request body must be a JSON object."},
                status=400,
            )

        missing = [field for field in FEATURES if field not in data]
        if missing:
            return JsonResponse(
                {"error": "Missing required fields", "fields": missing},
                status=400,
            )

        if not isinstance(data["Crop_Type"], str):
            return JsonResponse(
                {"error": "Crop_Type must be a string."},
                status=400,
            )

        if data["Crop_Type"] not in CROP_TYPES:
            return JsonResponse(
                {
                    "error": "Unsupported Crop_Type.",
                    "allowed_values": sorted(CROP_TYPES),
                },
                status=400,
            )

        errors = {}

        for field, (minimum, maximum) in NUMERIC_RANGES.items():
            value = data[field]

            # Booleans are not accepted as numeric measurements.
            if isinstance(value, bool) or not isinstance(value, (int, float)):
                errors[field] = "Must be a finite number."
                continue

            # Reject NaN and positive/negative infinity.
            if not pd.notna(value) or value in (float("inf"), float("-inf")):
                errors[field] = "Must be a finite number."
                continue

            if not minimum <= value <= maximum:
                errors[field] = (
                    f"Must be between {minimum} and {maximum}."
                )

        if errors:
            return JsonResponse(
                {"error": "Invalid input values", "fields": errors},
                status=400,
            )

        input_data = pd.DataFrame(
            [{field: data[field] for field in FEATURES}],
            columns=FEATURES,
        )

        prediction = str(model.predict(input_data)[0])

        PredictionHistory.objects.create(
             user=request.user,
              crop_type=data["Crop_Type"],
              soil_moisture=data["Soil_Moisture"],
              soil_ph=data["Soil_pH"],
              nitrogen=data["Nitrogen"],
              phosphorus=data["Phosphorus"],
              potassium=data["Potassium"],
              temperature=data["Temperature"],
              humidity=data["Humidity"],
              rainfall=data["Rainfall"],
             irrigation_hours=data["Irrigation_Hours"],
             pest_index=data["Pest_Index"],
             previous_yield=data["Previous_Yield"],
             crop_health=prediction,
         )

        return JsonResponse({
          "crop_health": prediction,
          "message": "Crop health prediction completed successfully.",
        })

    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse(
            {"error": "Request body must contain valid JSON."},
            status=400,
        )

    except Exception:
        logger.exception("Crop health prediction failed")
        return JsonResponse(
            {"error": "Prediction failed due to a server error."},
            status=500,
        )


def simulate_crop_health(request):
    if request.method != "POST":
        return JsonResponse(
            {"error": "Please use POST to submit simulation data."},
            status=405,
        )

    if not request.user.is_authenticated:
        return JsonResponse(
            {"error": "Please log in to run simulations."},
            status=401,
        )

    try:
        data = json.loads(request.body)

        if not isinstance(data, dict):
            return JsonResponse(
                {"error": "Request body must be a JSON object."},
                status=400,
            )

        baseline = data.get("baseline")
        scenario = data.get("scenario")

        if not isinstance(baseline, dict) or not isinstance(scenario, dict):
            return JsonResponse(
                {"error": "Provide baseline and scenario objects."},
                status=400,
            )

        def validate_inputs(values, label):
            missing = [field for field in FEATURES if field not in values]
            errors = {}

            if missing:
                errors["missing_fields"] = missing

            if "Crop_Type" in values:
                if (
                    not isinstance(values["Crop_Type"], str)
                    or values["Crop_Type"] not in CROP_TYPES
                ):
                    errors["Crop_Type"] = (
                        f"Choose one of: {', '.join(sorted(CROP_TYPES))}."
                    )

            for field, (minimum, maximum) in NUMERIC_RANGES.items():
                if field not in values:
                    continue

                value = values[field]

                if (
                    isinstance(value, bool)
                    or not isinstance(value, (int, float))
                    or not pd.notna(value)
                    or value in (float("inf"), float("-inf"))
                ):
                    errors[field] = "Must be a finite number."
                elif not minimum <= value <= maximum:
                    errors[field] = (
                        f"Must be between {minimum} and {maximum}."
                    )

            return {label: errors} if errors else None

        errors = (
            validate_inputs(baseline, "baseline")
            or validate_inputs(scenario, "scenario")
        )

        if errors:
            return JsonResponse(
                {"error": "Invalid simulation inputs.", "fields": errors},
                status=400,
            )

        baseline_data = pd.DataFrame(
            [{field: baseline[field] for field in FEATURES}],
            columns=FEATURES,
        )
        scenario_data = pd.DataFrame(
            [{field: scenario[field] for field in FEATURES}],
            columns=FEATURES,
        )

        baseline_prediction = str(model.predict(baseline_data)[0])
        scenario_prediction = str(model.predict(scenario_data)[0])

        return JsonResponse({
            "baseline_prediction": baseline_prediction,
            "scenario_prediction": scenario_prediction,
            "changed": baseline_prediction != scenario_prediction,
            "message": (
                "Simulation completed. Compare the model predictions "
                "for both sets of conditions."
            ),
        })

    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse(
            {"error": "Request body must contain valid JSON."},
            status=400,
        )

    except Exception:
        logger.exception("Crop health simulation failed")
        return JsonResponse(
            {"error": "Simulation failed due to a server error."},
            status=500,
        )


def prediction_history(request):
    if request.method != "GET":
        return JsonResponse(
            {"error": "Please use GET to retrieve prediction history."},
            status=405,
        )

    if not request.user.is_authenticated:
       return JsonResponse(
        {"error": "Please log in to view prediction history."},
        status=401,
    )

    history = PredictionHistory.objects.filter(
    user=request.user
).order_by("-created_at")

    records = [
        {
            "id": item.id,
            "crop_type": item.crop_type,
            "crop_health": item.crop_health,
            "soil_moisture": item.soil_moisture,
            "soil_ph": item.soil_ph,
            "nitrogen": item.nitrogen,
            "phosphorus": item.phosphorus,
            "potassium": item.potassium,
            "temperature": item.temperature,
            "humidity": item.humidity,
            "rainfall": item.rainfall,
            "irrigation_hours": item.irrigation_hours,
            "pest_index": item.pest_index,
            "previous_yield": item.previous_yield,
            "created_at": item.created_at.isoformat(),
        }
        for item in history
    ]

    return JsonResponse({"history": records})
User = get_user_model()


@require_POST
def register_user(request):
    try:
        data = json.loads(request.body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({"error": "Invalid JSON."}, status=400)

    username = data.get("username", "").strip()
    password = data.get("password", "")

    if not username or not password:
        return JsonResponse(
            {"error": "Username and password are required."},
            status=400,
        )

    if len(username) > 150:
        return JsonResponse(
            {"error": "Username must be 150 characters or fewer."},
            status=400,
        )

    if User.objects.filter(username__iexact=username).exists():
        return JsonResponse(
            {"error": "This username is already taken."},
            status=409,
        )

    user = User.objects.create_user(
        username=username,
        password=password,
    )

    login(request, user)

    return JsonResponse(
        {
            "message": "Registration successful.",
            "user": {"username": user.username},
        },
        status=201,
    )
@require_POST
def login_user(request):
    try:
        data = json.loads(request.body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({"error": "Invalid JSON."}, status=400)

    username = data.get("username", "").strip()
    password = data.get("password", "")

    user = authenticate(
        request,
        username=username,
        password=password,
    )

    if user is None:
        return JsonResponse(
            {"error": "Invalid username or password."},
            status=401,
        )

    login(request, user)

    return JsonResponse({
        "message": "Login successful.",
        "user": {"username": user.username},
    })


@require_POST
def logout_user(request):
    if not request.user.is_authenticated:
        return JsonResponse(
            {"error": "You are not logged in."},
            status=401,
        )

    logout(request)
    return JsonResponse({"message": "Logout successful."})


@ensure_csrf_cookie
def auth_status(request):
    if request.method != "GET":
        return JsonResponse(
            {"error": "Please use GET."},
            status=405,
        )

    response = JsonResponse({
        "authenticated": request.user.is_authenticated,
        "user": (
            {"username": request.user.username}
            if request.user.is_authenticated
            else None
        ),
    })

    get_token(request)
    return response
