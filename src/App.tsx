import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@store/authStore'
import Layout from '@components/Layout'
import Login from '@pages/Login'
import Dashboard from '@pages/Dashboard'
import UserManagement from '@pages/UserManagement'
import ExpertList from '@pages/ExpertList'

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          isAuthenticated ? (
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/experts" element={<ExpertList />} />
              </Routes>
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  )
}

export default App