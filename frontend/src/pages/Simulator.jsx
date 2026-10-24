
import { useState } from 'react'
import { api } from '../services/api'
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
  ['Soil_Moisture', 'Soil Moisture (%)', 15, 95],
  ['Soil_pH', 'Soil pH', 5, 8],
  ['Nitrogen', 'Nitrogen', 10, 110],
  ['Phosphorus', 'Phosphorus', 5, 80],
  ['Potassium', 'Potassium', 10, 98.5],
  ['Temperature', 'Temperature (°C)', 18, 39.7],
  ['Humidity', 'Humidity (%)', 30.7, 95],
  ['Rainfall', 'Rainfall (mm)', 0, 250],
  ['Irrigation_Hours', 'Irrigation Hours', 0, 10],
  ['Pest_Index', 'Pest Index', 0, 74.3],
  ['Previous_Yield', 'Previous Yield', 1.93, 8.15],
]

const cropTypes = ['Maize', 'Cotton', 'Rice', 'Groundnut', 'Tomato']

function ConditionForm({ title, values, onChange }) {
  return (
    <section className="rounded-xl border bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>

      <label className="mb-4 block text-sm font-medium">
        Crop Type
        <select
          value={values.Crop_Type}
          onChange={(e) => onChange('Crop_Type', e.target.value)}
          className="mt-1 w-full rounded-lg border p-2"
        >
          {cropTypes.map((crop) => (
            <option key={crop} value={crop}>{crop}</option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map(([key, label, min, max]) => (
          <label key={key} className="text-sm font-medium">
            {label}
            <span className="ml-1 text-xs font-normal text-gray-500">
              ({min}–{max})
            </span>
            <input
              type="number"
              min={min}
              max={max}
              step="any"
              required
              value={values[key]}
              onChange={(e) => onChange(key, e.target.value)}
              className="mt-1 w-full rounded-lg border p-2"
            />
          </label>
        ))}
      </div>
    </section>
  )
}

export default function Simulator() {
  const [baseline, setBaseline] = useState({ ...initialValues })
  const [scenario, setScenario] = useState({ ...initialValues })
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function updateBaseline(key, value) {
    setBaseline((current) => ({ ...current, [key]: value }))
  }

  function updateScenario(key, value) {
    setScenario((current) => ({ ...current, [key]: value }))
  }

  async function runSimulation(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const toPayload = (values) => ({
        Crop_Type: values.Crop_Type,
        ...Object.fromEntries(
          fields.map(([key]) => [key, Number(values[key])])
        ),
      })

      const data = await api.post('simulate/', {
        baseline: toPayload(baseline),
        scenario: toPayload(scenario),
      })

      setResult(data)
    } catch (err) {
      setError(
        err?.message || 'Simulation failed. Check the inputs and try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold">What-if Simulator</h1>
        <p className="mt-1 text-gray-600">
          Change crop conditions and compare the model's predictions.
        </p>
      </div>

      <form onSubmit={runSimulation} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ConditionForm
            title="Baseline Conditions"
            values={baseline}
            onChange={updateBaseline}
          />
          <ConditionForm
            title="Scenario Conditions"
            values={scenario}
            onChange={updateScenario}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-60"
        >
          {loading ? 'Running Simulation...' : 'Run Simulation'}
        </button>
      </form>

      {error && (
        <div role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {result && (
        <section className="rounded-xl border p-5">
          <h2 className="mb-4 text-xl font-semibold">Simulation Results</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-600">Baseline Prediction</p>
              <p className="mt-2 text-xl font-bold">
                {result.baseline_prediction}
              </p>
            </div>

            <div className="rounded-lg bg-green-50 p-4">
              <p className="text-sm text-gray-600">Scenario Prediction</p>
              <p className="mt-2 text-xl font-bold">
                {result.scenario_prediction}
              </p>
            </div>
          </div>

          <p className="mt-4">
            {result.changed
              ? 'The model prediction changed under the scenario conditions.'
              : 'The model prediction remained the same under the scenario conditions.'}
          </p>

          <p className="mt-2 text-sm text-gray-600">
            This result reflects the model prediction, not a guarantee of actual
            crop performance.
          </p>
        </section>
      )}
    </div>
  )
}
