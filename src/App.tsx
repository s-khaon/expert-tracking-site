import React, { useState, useEffect, useRef } from 'react'
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
  
  // 使用 ref 来跟踪请求状态，防止重复请求
  const fetchingRef = useRef(false)
  const lastUserIdRef = useRef<number | null>(null)

  // 获取用户可访问的菜单数据
  useEffect(() => {
    const fetchMenus = async () => {
      // 如果用户未认证，重置状态
      if (!isAuthenticated || !user) {
        setUserMenus([])
        setMenusLoading(false)
        setDefaultRoute('/dashboard')
        fetchingRef.current = false
        lastUserIdRef.current = null
        return
      }

      // 防止重复请求：如果正在请求中，或者用户ID没有变化，则跳过
      if (fetchingRef.current || lastUserIdRef.current === user.id) {
        setMenusLoading(false)
        return
      }

      try {
        fetchingRef.current = true
        setMenusLoading(true)
        
        const menus = await menuService.getCurrentUserMenuTree()
        setUserMenus(menus)
        lastUserIdRef.current = user.id
        
        // 设置默认路由为第一个可访问的菜单
        const defaultPath = getDefaultRoute(menus)
        setDefaultRoute(defaultPath)
      } catch (error) {
        console.error('获取菜单失败:', error)
        setUserMenus([])
      } finally {
        setMenusLoading(false)
        fetchingRef.current = false
      }
    }

    fetchMenus()
  }, [isAuthenticated, user?.id]) // 只依赖认证状态和用户ID

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