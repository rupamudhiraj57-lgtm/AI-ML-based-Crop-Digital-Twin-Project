
import { NavLink } from 'react-router-dom'
import {
  Sprout,
  LayoutDashboard,
  Map,
  Activity,
  FlaskConical,
  History,
  Leaf,
} from 'lucide-react'

const navigation = [
  { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Fields', path: '/fields', icon: Map },
  { label: 'Predictions', path: '/predictions', icon: Activity },
  { label: 'What-if Simulator', path: '/simulator', icon: FlaskConical },
  { label: 'History', path: '/history', icon: History },
]

export default function Sidebar() {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-6">
        <div className="rounded-xl bg-green-100 p-2 text-green-800">
          <Sprout size={25} />
        </div>
        <div>
          <h1 className="text-base font-bold text-gray-900">
            Crop Digital Twin
          </h1>
          <p className="text-xs text-gray-500">Smart Agriculture</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        <p className="px-3 pb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Workspace
        </p>

        {navigation.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
                isActive
                  ? 'bg-green-50 text-green-800'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <Icon size={19} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="m-4 rounded-xl bg-green-50 p-4">
        <Leaf size={20} className="mb-2 text-green-800" />
        <p className="text-sm font-semibold text-green-900">
          Smarter farming
        </p>
        <p className="mt-1 text-xs leading-5 text-green-800">
          Explore field conditions and data-driven crop insights.
        </p>
      </div>
    </aside>
  )
}
