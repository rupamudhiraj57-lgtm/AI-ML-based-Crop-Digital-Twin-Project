
import { BrowserRouter, Navigate, Route, Routes, Outlet } from 'react-router-dom'
import Predictions from './pages/Predictions'
import AppLayout from './components/common/AppLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Fields from './pages/Fields'
import History from './pages/History'
import FieldDetails from './pages/FieldDetails'
import { useAuth } from './context/AuthContext'
import Dashboard from './pages/Dashboard'
import Simulator from './pages/Simulator'

function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-gray-500">
          Checking your session...
        </p>
      </div>
    )
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />
}

function Placeholder({ title }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
      <p className="text-sm font-medium text-green-700">
        Crop Digital Twin
      </p>
      <h2 className="mt-2 text-2xl font-bold text-gray-900">
        {title}
      </h2>
      <p className="mt-2 text-sm text-gray-500">
        This page will be implemented in the upcoming development phase.
      </p>
    </section>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/fields" replace />} />
            <Route path="/fields" element={<Fields />} />
            <Route path="/fields/:fieldId" element={<FieldDetails />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/predictions" element={<Predictions />} />
            <Route path="/simulator" element={<Simulator />} />
            <Route path="/history" element={<History />} />
          </Route>
        </Route>

        {/* Unknown routes */}
        <Route path="*" element={<Navigate to="/fields" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
