import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useRoutes } from 'react-router-dom'
import { Spin } from 'antd'
import { useAuthStore } from '@store/authStore'
import Layout from '@components/Layout'
import Login from '@pages/Login'
import { menuService } from '@services/menuService'
import { generateRoutesFromMenus, getDefaultRoute } from '@utils/routeGenerator'
import type { Menu } from '@/types'

function App() {
  const { isAuthenticated, user } = useAuthStore()
  const [userMenus, setUserMenus] = useState<Menu[]>([])
  const [menusLoading, setMenusLoading] = useState(true)
  const [defaultRoute, setDefaultRoute] = useState('/dashboard')

  // 获取用户可访问的菜单数据
  useEffect(() => {
    const fetchMenus = async () => {
      if (isAuthenticated && user) {
        try {
          setMenusLoading(true)
          const menus = await menuService.getCurrentUserMenuTree()
          setUserMenus(menus)
          
          // 设置默认路由为第一个可访问的菜单
          const defaultPath = getDefaultRoute(menus)
          setDefaultRoute(defaultPath)
        } catch (error) {
          console.error('获取菜单失败:', error)
          setUserMenus([])
        } finally {
          setMenusLoading(false)
        }
      } else {
        setMenusLoading(false)
      }
    }

    fetchMenus()
  }, [isAuthenticated, user])

  // 生成动态路由
  const dynamicRoutes = React.useMemo(() => {
    if (!userMenus.length) return []
    return generateRoutesFromMenus(userMenus)
  }, [userMenus])

  // 内部路由组件
  const InnerRoutes = () => {
    if (menusLoading) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          <Spin size="large" />
        </div>
      )
    }

    const routes = [
      {
        path: '/',
        element: <Navigate to={defaultRoute} replace />
      },
      ...dynamicRoutes
    ]

    return useRoutes(routes)
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          isAuthenticated ? (
            <Layout userMenus={userMenus} menusLoading={menusLoading}>
              <InnerRoutes />
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