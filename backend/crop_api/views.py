
import json
from pathlib import Path

import joblib
import pandas as pd
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

# Locate the trained model
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "ml" / "best_crop_health_model.pkl"

# Load the model once
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


@csrf_exempt
def predict_crop_health(request):
    if request.method != "POST":
        return JsonResponse(
            {"error": "Please use POST to submit crop data."},
            status=405,
        )

    try:
        data = json.loads(request.body)

        missing = [field for field in FEATURES if field not in data]
        if missing:
            return JsonResponse(
                {"error": "Missing required fields", "fields": missing},
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

    except (ValueError, TypeError, json.JSONDecodeError) as error:
        return JsonResponse({"error": str(error)}, status=400)

    except Exception as error:
        return JsonResponse(
            {"error": f"Prediction failed: {error}"},
            status=500,
        )
