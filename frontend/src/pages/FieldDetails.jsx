
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Sprout, MapPin, Droplets, Activity, Leaf } from 'lucide-react'

const sampleFields = {
  F001: {
    name: 'North Field',
    crop: 'Rice',
    location: 'Field Zone A',
    area: '2.5 acres',
    health: 'Healthy',
    moisture: '68%',
    description: 'Illustrative field record for the rice crop.',
  },
  F002: {
    name: 'East Field',
    crop: 'Cotton',
    location: 'Field Zone B',
    area: '3.2 acres',
    health: 'Needs attention',
    moisture: '34%',
    description: 'Illustrative field record for the cotton crop.',
  },
  F003: {
    name: 'South Field',
    crop: 'Maize',
    location: 'Field Zone C',
    area: '1.8 acres',
    health: 'Moderate',
    moisture: '51%',
    description: 'Illustrative field record for the maize crop.',
  },
}

export default function FieldDetails() {
  const { fieldId } = useParams()
  const field = sampleFields[fieldId]

  if (!field) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-8">
        <h1 className="text-xl font-bold text-gray-900">Field not found</h1>
        <p className="mt-2 text-sm text-gray-500">
          This field ID does not exist in the current demo data.
        </p>
        <Link to="/fields" className="mt-5 inline-flex text-sm font-semibold text-green-700 hover:underline">
          Back to Field Explorer
        </Link>
      </section>
    )
  }

  const healthStyle =
    field.health === 'Healthy'
      ? 'bg-green-100 text-green-800'
      : field.health === 'Moderate'
        ? 'bg-amber-100 text-amber-800'
        : 'bg-red-100 text-red-800'

  return (
    <div className="space-y-6">
      <Link
        to="/fields"
        className="inline-flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-900"
      >
        <ArrowLeft size={18} />
        Back to Field Explorer
      </Link>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-green-50 p-4 text-green-700">
              <Sprout size={30} />
            </div>
            <div>
              <p className="text-sm font-medium text-green-700">{fieldId}</p>
              <h1 className="mt-1 text-3xl font-bold text-gray-900">{field.name}</h1>
              <p className="mt-2 text-sm text-gray-500">{field.description}</p>
            </div>
          </div>
          <span className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${healthStyle}`}>
            {field.health}
          </span>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric icon={<Leaf size={20} />} label="Crop" value={field.crop} />
        <Metric icon={<MapPin size={20} />} label="Location" value={field.location} />
        <Metric icon={<Sprout size={20} />} label="Field area" value={field.area} />
        <Metric icon={<Droplets size={20} />} label="Soil moisture" value={field.moisture} />
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <Activity className="text-green-700" size={22} />
          <h2 className="text-lg font-bold text-gray-900">Crop health overview</h2>
        </div>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          This screen currently uses illustrative data. Actual crop-health
          indicators, environmental measurements, and prediction results will
          appear after the backend integration is completed.
        </p>
      </section>

      <p className="text-xs text-gray-400">
        Demo data only — values are not real agricultural measurements or model predictions.
      </p>
    </div>
  )
}

function Metric({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-center gap-3 text-green-700">
        {icon}
        <p className="text-sm text-gray-500">{label}</p>
      </div>
      <p className="mt-4 text-xl font-bold text-gray-900">{value}</p>
    </div>
  )
}
