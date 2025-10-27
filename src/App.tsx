import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@store/authStore'
import Layout from '@components/Layout'
import RouteGuard from '@components/RouteGuard'
import Login from '@pages/Login'
import Dashboard from '@pages/Dashboard'
import UserManagement from '@pages/UserManagement'
import ExpertList from '@pages/ExpertList'
import PermissionManagement from '@pages/PermissionManagement'
import RoleManagement from '@pages/RoleManagement'
import MenuManagement from '@pages/MenuManagement'

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
                <Route 
                  path="/dashboard" 
                  element={
                    <RouteGuard requiredPath="/dashboard">
                      <Dashboard />
                    </RouteGuard>
                  } 
                />
                <Route 
                  path="/users" 
                  element={
                    <RouteGuard requiredPath="/users">
                      <UserManagement />
                    </RouteGuard>
                  } 
                />
                <Route 
                  path="/experts" 
                  element={
                    <RouteGuard requiredPath="/experts">
                      <ExpertList />
                    </RouteGuard>
                  } 
                />
                <Route 
                  path="/permissions" 
                  element={
                    <RouteGuard requiredPath="/permissions">
                      <PermissionManagement />
                    </RouteGuard>
                  } 
                />
                <Route 
                  path="/roles" 
                  element={
                    <RouteGuard requiredPath="/roles">
                      <RoleManagement />
                    </RouteGuard>
                  } 
                />
                <Route 
                  path="/menus" 
                  element={
                    <RouteGuard requiredPath="/menus">
                      <MenuManagement />
                    </RouteGuard>
                  } 
                />
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