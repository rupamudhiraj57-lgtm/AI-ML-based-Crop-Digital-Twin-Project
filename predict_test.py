
from pathlib import Path
import json
import joblib
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent

# Load the trained model
model = joblib.load(BASE_DIR / "best_crop_health_model.pkl")

# Load the exact feature names
with open(BASE_DIR / "model_features.json", "r") as file:
    features = json.load(file)

# Example field conditions for testing only.
# These are illustrative values, not verified optimal conditions.
sample_values = {
    "Crop_Type": "Wheat",
    "Soil_Moisture": 35,
    "Soil_pH": 6.5,
    "Nitrogen": 50,
    "Phosphorus": 30,
    "Potassium": 40,
    "Temperature": 28,
    "Humidity": 65,
    "Rainfall": 100,
    "Irrigation_Hours": 2,
    "Pest_Index": 2,
    "Previous_Yield": 3.5
}

# Match the model's expected feature order
input_data = pd.DataFrame(
    [[sample_values[feature] for feature in features]],
    columns=features
)

# Predict crop health
prediction = model.predict(input_data)

print("Input field details:")
print(input_data.to_string(index=False))

print("\nPredicted Crop Health:", prediction[0])

# Show probabilities if supported by the classifier
if hasattr(model, "predict_proba"):
    probabilities = model.predict_proba(input_data)[0]
    print("\nPrediction probabilities:")

    for label, probability in zip(model.classes_, probabilities):
        print(f"{label}: {probability:.2%}")
