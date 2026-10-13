
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  MapPin,
  Sprout,
  ArrowUpRight,
  Activity,
  Leaf,
} from 'lucide-react'

const sampleFields = [
  {
    id: 'F001',
    name: 'North Field',
    crop: 'Rice',
    location: 'Field Zone A',
    area: '2.5 acres',
    health: 'Healthy',
    moisture: '68%',
  },
  {
    id: 'F002',
    name: 'East Field',
    crop: 'Cotton',
    location: 'Field Zone B',
    area: '3.2 acres',
    health: 'Needs attention',
    moisture: '34%',
  },
  {
    id: 'F003',
    name: 'South Field',
    crop: 'Maize',
    location: 'Field Zone C',
    area: '1.8 acres',
    health: 'Moderate',
    moisture: '51%',
  },
]

const healthStyles = {
  Healthy: 'bg-green-100 text-green-800',
  Moderate: 'bg-amber-100 text-amber-800',
  'Needs attention': 'bg-red-100 text-red-800',
}

export default function Fields() {
  const [search, setSearch] = useState('')
  const [healthFilter, setHealthFilter] = useState('All')

  const filteredFields = useMemo(() => {
    return sampleFields.filter((field) => {
      const matchesSearch = [
        field.name,
        field.id,
        field.crop,
        field.location,
      ]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase())

      const matchesHealth =
        healthFilter === 'All' || field.health === healthFilter

      return matchesSearch && matchesHealth
    })
  }, [search, healthFilter])

  return (
    <div className="space-y-7">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-green-700">
            Smart agriculture
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
            Field Explorer
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            Explore your fields and review their current crop-health status.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 sm:self-auto">
          <Sprout size={18} />
          <span>{filteredFields.length} fields shown</span>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Total sample fields"
          value={sampleFields.length}
          icon={<MapPin size={20} />}
        />
        <SummaryCard
          label="Healthy fields"
          value={sampleFields.filter((f) => f.health === 'Healthy').length}
          icon={<Leaf size={20} />}
        />
        <SummaryCard
          label="Need attention"
          value={
            sampleFields.filter((f) => f.health === 'Needs attention').length
          }
          icon={<Activity size={20} />}
        />
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center gap-3 rounded-xl border border-gray-200 px-3">
            <Search size={19} className="shrink-0 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by field, crop, or ID..."
              aria-label="Search fields"
              className="w-full py-3 text-sm outline-none"
            />
          </div>

          <select
            value={healthFilter}
            onChange={(event) => setHealthFilter(event.target.value)}
            aria-label="Filter by crop health"
            className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-700 outline-none focus:border-green-600"
          >
            <option value="All">All health statuses</option>
            <option value="Healthy">Healthy</option>
            <option value="Moderate">Moderate</option>
            <option value="Needs attention">Needs attention</option>
          </select>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {filteredFields.map((field) => (
          <article
            key={field.id}
            className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-green-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-green-50 p-3 text-green-700">
                  <Sprout size={23} />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {field.name}
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">{field.id}</p>
                </div>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  healthStyles[field.health]
                }`}
              >
                {field.health}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Info label="Crop" value={field.crop} />
              <Info label="Area" value={field.area} />
              <Info label="Location" value={field.location} />
              <Info label="Soil moisture" value={field.moisture} />
            </div>

            <Link
              to={`/fields/${field.id}`}
              className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4 text-sm font-semibold text-green-700 hover:text-green-900"
            >
              View field details
              <ArrowUpRight size={18} />
            </Link>
          </article>
        ))}
      </section>

      {filteredFields.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <Search className="mx-auto text-gray-400" size={28} />
          <h2 className="mt-3 font-semibold text-gray-900">
            No fields found
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Try another search term or health filter.
          </p>
        </div>
      )}

      <p className="text-xs text-gray-400">
        Demo data only — these records and measurements are illustrative, not
        real agricultural observations.
      </p>
    </div>
  )
}

function SummaryCard({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{label}</p>
        <span className="rounded-lg bg-green-50 p-2 text-green-700">
          {icon}
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl bg-gray-50 p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-gray-800">{value}</p>
    </div>
  )
}
