
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  Leaf,
  Sprout,
  AlertTriangle,
} from 'lucide-react'
import { api } from '../services/api'

function getHealthCategory(health) {
  const value = String(health || '').toLowerCase()

  if (value.includes('healthy') || value.includes('good')) {
    return 'healthy'
  }

  if (value.includes('moderate') || value.includes('medium') || value.includes('fair')) {
    return 'moderate'
  }

  return 'attention'
}

export default function Dashboard() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await api.get('history/')
        setRecords(response.history || [])
      } catch (err) {
        setError(
          err.response?.data?.error ||
            'Unable to load dashboard data. Please try again.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const stats = useMemo(() => {
    const healthy = records.filter(
      (record) => getHealthCategory(record.crop_health) === 'healthy'
    ).length

    const moderate = records.filter(
      (record) => getHealthCategory(record.crop_health) === 'moderate'
    ).length

    const attention = records.filter(
      (record) => getHealthCategory(record.crop_health) === 'attention'
    ).length

    return { total: records.length, healthy, moderate, attention }
  }, [records])

  if (loading) {
    return <p className="p-6 text-gray-500">Loading dashboard...</p>
  }

  return (
    <div className="space-y-7">
      <section>
        <p className="text-sm font-medium text-green-700">
          Smart agriculture
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
          Dashboard
        </h1>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          An overview of your crop-health predictions and recent activity.
        </p>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!error && (
        <>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Total predictions"
              value={stats.total}
              icon={<Activity size={21} />}
            />
            <SummaryCard
              label="Healthy predictions"
              value={stats.healthy}
              icon={<CheckCircle2 size={21} />}
            />
            <SummaryCard
              label="Moderate predictions"
              value={stats.moderate}
              icon={<Leaf size={21} />}
            />
            <SummaryCard
              label="Needs attention"
              value={stats.attention}
              icon={<AlertTriangle size={21} />}
            />
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent predictions
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Your latest crop-health assessments.
                </p>
              </div>

              <Link
                to="/history"
                className="inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-900"
              >
                View full history <ArrowRight size={17} />
              </Link>
            </div>

            {records.length === 0 ? (
              <div className="mt-6 rounded-xl bg-gray-50 p-6 text-center">
                <Sprout className="mx-auto text-green-700" size={30} />
                <p className="mt-3 font-medium text-gray-900">
                  No predictions yet
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Make your first crop-health prediction to populate your dashboard.
                </p>
                <Link
                  to="/predictions"
                  className="mt-4 inline-block rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
                >
                  Make a prediction
                </Link>
              </div>
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[550px] text-left">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="p-3 text-sm font-semibold">Crop</th>
                      <th className="p-3 text-sm font-semibold">Health</th>
                      <th className="p-3 text-sm font-semibold">Moisture</th>
                      <th className="p-3 text-sm font-semibold">Temperature</th>
                      <th className="p-3 text-sm font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.slice(0, 5).map((record) => (
                      <tr
                        key={record.id}
                        className="border-b border-gray-100 last:border-0"
                      >
                        <td className="p-3 font-medium text-gray-800">
                          {record.crop_type}
                        </td>
                        <td className="p-3">
                          <HealthBadge health={record.crop_health} />
                        </td>
                        <td className="p-3">{record.soil_moisture}%</td>
                        <td className="p-3">{record.temperature} °C</td>
                        <td className="p-3 text-sm text-gray-500">
                          {new Date(record.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <QuickLink
              to="/fields"
              title="Explore fields"
              description="Review your field information."
              icon={<Sprout size={22} />}
            />
            <QuickLink
              to="/predictions"
              title="Predict crop health"
              description="Evaluate crop conditions with your ML model."
              icon={<Activity size={22} />}
            />
          </section>
        </>
      )}
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

function HealthBadge({ health }) {
  const category = getHealthCategory(health)

  const styles = {
    healthy: 'bg-green-100 text-green-800',
    moderate: 'bg-amber-100 text-amber-800',
    attention: 'bg-red-100 text-red-800',
  }

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${styles[category]}`}>
      {health || 'Unknown'}
    </span>
  )
}

function QuickLink({ to, title, description, icon }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-green-300 hover:shadow-sm"
    >
      <div className="flex items-center gap-3">
        <span className="rounded-xl bg-green-50 p-3 text-green-700">
          {icon}
        </span>
        <div>
          <h2 className="font-semibold text-gray-900">{title}</h2>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <ArrowRight className="shrink-0 text-green-700" size={19} />
    </Link>
  )
}
