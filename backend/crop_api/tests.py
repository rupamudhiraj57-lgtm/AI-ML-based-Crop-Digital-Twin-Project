
# Create your tests here.

import json

from django.test import TestCase
from unittest.mock import patch


class CropPredictionAPITests(TestCase):
    def setUp(self):
        self.url = "/api/predict/"

        self.valid_data = {
            "Crop_Type": "Rice",
            "Soil_Moisture": 45,
            "Soil_pH": 6.5,
            "Nitrogen": 60,
            "Phosphorus": 30,
            "Potassium": 40,
            "Temperature": 28,
            "Humidity": 70,
            "Rainfall": 100,
            "Irrigation_Hours": 4,
            "Pest_Index": 10,
            "Previous_Yield": 5,
        }

    def test_valid_prediction(self):
        response = self.client.post(
            self.url,
            data=json.dumps(self.valid_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("crop_health", response.json())
        self.assertEqual(
            response.json()["message"],
            "Crop health prediction completed successfully.",
        )

    def test_unsupported_crop_type(self):
        data = self.valid_data.copy()
        data["Crop_Type"] = "Wheat"

        response = self.client.post(
            self.url,
            data=json.dumps(data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("Unsupported Crop_Type", response.json()["error"])

    def test_out_of_range_soil_ph(self):
        data = self.valid_data.copy()
        data["Soil_pH"] = 15

        response = self.client.post(
            self.url,
            data=json.dumps(data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("Soil_pH", response.json()["fields"])

    def test_missing_required_field(self):
        data = self.valid_data.copy()
        del data["Nitrogen"]

        response = self.client.post(
            self.url,
            data=json.dumps(data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("Nitrogen", response.json()["fields"])

    def test_invalid_json(self):
        response = self.client.post(
            self.url,
            data="{invalid json",
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("valid JSON", response.json()["error"])

    def test_get_method_not_allowed(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 405)

    def test_model_failure_returns_generic_error(self):
        with patch(
            "crop_api.views.model.predict",
            side_effect=RuntimeError("Internal test error"),
        ):
            response = self.client.post(
                self.url,
                data=json.dumps(self.valid_data),
                content_type="application/json",
            )

        self.assertEqual(response.status_code, 500)
        self.assertEqual(
            response.json()["error"],
            "Prediction failed due to a server error.",
        )
