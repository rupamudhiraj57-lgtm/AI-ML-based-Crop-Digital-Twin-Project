
import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { useAuth } from '../../context/AuthContext'
import { logoutUser } from '../../services/authService'

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const { setUser } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    setLoggingOut(true)

    try {
      await logoutUser()
    } catch (error) {
      console.error('Logout request failed:', error)
    } finally {
      setUser(null)
      navigate('/login', { replace: true })
      setLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f9f5] lg:flex">
      <div className="hidden lg:block">
        <div className="sticky top-0 h-screen">
          <Sidebar />
        </div>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation"
          />
          <div className="relative h-full">
            <Sidebar />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="absolute right-3 top-5 rounded-lg p-2 text-gray-600 hover:bg-gray-100"
              aria-label="Close navigation"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 pr-4 sm:pr-6 lg:pr-8">
          <div className="min-w-0 flex-1">
            <Topbar onMenuClick={() => setMenuOpen(true)} />
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="shrink-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {loggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>

        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
