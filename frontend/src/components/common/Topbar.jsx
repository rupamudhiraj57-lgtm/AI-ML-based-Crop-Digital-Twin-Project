
import { Menu, Sprout } from 'lucide-react'

export default function Topbar({ onMenuClick }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={22} />
        </button>

        <div className="flex items-center gap-2 lg:hidden">
          <Sprout size={22} className="text-green-700" />
          <span className="font-semibold text-gray-900">
            Crop Digital Twin
          </span>
        </div>

        <p className="hidden text-sm text-gray-500 sm:block">
          AI-powered crop monitoring
        </p>
      </div>

      <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-800">
        Local development
      </span>
    </header>
  )
}
