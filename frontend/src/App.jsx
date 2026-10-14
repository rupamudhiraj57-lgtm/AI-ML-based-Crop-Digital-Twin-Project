
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/common/AppLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Fields from './pages/Fields'
import FieldDetails from './pages/FieldDetails'

function Placeholder({ title }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
      <p className="text-sm font-medium text-green-700">
        Crop Digital Twin
      </p>
      <h2 className="mt-2 text-2xl font-bold text-gray-900">{title}</h2>
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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/fields" replace />} />
          <Route path="/fields" element={<Fields />} />
          <Route path="/fields/:fieldId" element={<FieldDetails />} />
          <Route path="/dashboard" element={<Placeholder title="Dashboard" />} />
          <Route path="/predictions" element={<Placeholder title="Predictions" />} />
          <Route path="/simulator" element={<Placeholder title="What-if Simulator" />} />
          <Route path="/history" element={<Placeholder title="History" />} />
        </Route>

        <Route path="*" element={<Navigate to="/fields" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
