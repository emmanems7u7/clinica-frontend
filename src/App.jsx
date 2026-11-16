import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'
import Layout from './components/Layout'
import Loader from './components/Loader'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ResourcePage from './pages/ResourcePage'

function Private({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Loader text="Cargando su sesión…" />
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Private><Layout /></Private>}>
        <Route index element={<Dashboard />} />
        <Route path=":resource" element={<ResourcePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
