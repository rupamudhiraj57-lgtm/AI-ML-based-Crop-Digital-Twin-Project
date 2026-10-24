
import { useState } from 'react'
import { api, ApiError } from '../services/api'

const initialValues = {
  Crop_Type: 'Rice',
  Soil_Moisture: '45',
  Soil_pH: '6.5',
  Nitrogen: '60',
  Phosphorus: '30',
  Potassium: '40',
  Temperature: '28',
  Humidity: '70',
  Rainfall: '100',
  Irrigation_Hours: '4',
  Pest_Index: '10',
  Previous_Yield: '5',
}

const fields = [
  { name: 'Soil_Moisture', label: 'Soil Moisture (%)', min: 15, max: 95, step: 0.1 },
  { name: 'Soil_pH', label: 'Soil pH', min: 5, max: 8, step: 0.1 },
  { name: 'Nitrogen', label: 'Nitrogen', min: 10, max: 110, step: 0.1 },
  { name: 'Phosphorus', label: 'Phosphorus', min: 5, max: 80, step: 0.1 },
  { name: 'Potassium', label: 'Potassium', min: 10, max: 98.5, step: 0.1 },
  { name: 'Temperature', label: 'Temperature (°C)', min: 18, max: 39.7, step: 0.1 },
  { name: 'Humidity', label: 'Humidity (%)', min: 30.7, max: 95, step: 0.1 },
  { name: 'Rainfall', label: 'Rainfall (mm)', min: 0, max: 250, step: 0.1 },
  { name: 'Irrigation_Hours', label: 'Irrigation Hours', min: 0, max: 10, step: 0.1 },
  { name: 'Pest_Index', label: 'Pest Index', min: 0, max: 74.3, step: 0.1 },
  { name: 'Previous_Yield', label: 'Previous Yield', min: 1.93, max: 8.15, step: 0.01 },
]

export default function Predictions() {
  const [values, setValues] = useState(initialValues)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setValues((previous) => ({ ...previous, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setResult(null)
    setError('')
    setLoading(true)

    const payload = {
      Crop_Type: values.Crop_Type,
      ...Object.fromEntries(
        fields.map(({ name }) => [name, Number(values[name])]),
      ),
    }

    try {
      const data = await api.post('predict/', payload)
      setResult(data)
    } catch (err) {
      if (err instanceof ApiError && err.details?.fields) {
        const details = Object.entries(err.details.fields)
          .map(([field, message]) => `${field}: ${message}`)
          .join(' ')
        setError(details)
      } else {
        setError(err.message || 'Unable to get a prediction.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-green-700">Crop Digital Twin</p>
        <h1 className="mt-1 text-3xl font-bold text-gray-900">
          Crop Health Prediction
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Enter crop, soil and environmental values to request an ML prediction.
          The initial values are examples, not real farm measurements.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-gray-200 bg-white p-6"
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block text-sm font-medium text-gray-700">
            Crop Type
            <select
              name="Crop_Type"
              value={values.Crop_Type}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-3"
            >
              {['Maize', 'Cotton', 'Rice', 'Groundnut', 'Tomato'].map((crop) => (
                <option key={crop} value={crop}>{crop}</option>
              ))}
            </select>
          </label>

          {fields.map(({ name, label, min, max, step }) => (
            <label key={name} className="block text-sm font-medium text-gray-700">
              {label}
              <input
                type="number"
                name={name}
                value={values[name]}
                onChange={handleChange}
                min={min}
                max={max}
                step={step}
                required
                className="mt-2 w-full rounded-lg border border-gray-300 p-3"
              />
            </label>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 rounded-xl bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Predicting…' : 'Predict Crop Health'}
        </button>
      </form>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
          <strong>Prediction failed:</strong> {error}
        </div>
      )}

      {result && (
        <section aria-live="polite" className="rounded-2xl border border-green-200 bg-green-50 p-6">
          <p className="text-sm font-medium text-green-800">Prediction Result</p>
          <h2 className="mt-2 text-2xl font-bold text-green-950">
            {result.crop_health}
          </h2>
          <p className="mt-2 text-sm text-green-800">{result.message}</p>
          <p className="mt-3 text-xs text-green-800">
            This is a model prediction, not a guaranteed diagnosis of crop health.
          </p>
        </section>
      )}
    </section>
  )
}
