
import json
import logging
from pathlib import Path

import joblib
import pandas as pd
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

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


@csrf_exempt
def predict_crop_health(request):
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

        prediction = model.predict(input_data)[0]

        return JsonResponse({
            "crop_health": str(prediction),
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
