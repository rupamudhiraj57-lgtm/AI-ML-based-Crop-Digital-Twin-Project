from pathlib import Path
import json
import joblib

BASE_DIR = Path(__file__).resolve().parent

model = joblib.load(BASE_DIR / "best_crop_health_model.pkl")

with open(BASE_DIR / "model_features.json", "r") as file:
    features = json.load(file)

print("Model loaded successfully!")
print("Model type:", type(model).__name__)
print("Expected features:")

for feature in features:
    print(feature)