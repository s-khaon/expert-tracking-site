import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { menuService } from '../../services/menuService'
import { useQuery } from 'react-query'
import { Spin } from 'antd'
import type { Menu } from '../../types'

interface RouteGuardProps {
  children: React.ReactNode
  requiredPath?: string // 需要的路径权限
  fallbackPath?: string // 无权限时跳转的路径
}

const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  requiredPath,
  fallbackPath = '/dashboard',
}) => {
  const { user, isAuthenticated } = useAuthStore()
  const location = useLocation()

  // 获取用户可访问的菜单
  const { data: userMenus, isLoading } = useQuery(
    ['userMenuTree'],
    () => menuService.getCurrentUserMenuTree(),
    {
      enabled: !!user && isAuthenticated,
      staleTime: 5 * 60 * 1000, // 5分钟缓存
    }
  )

  // 如果未登录，跳转到登录页
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 加载中
  if (isLoading) {
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

  // 检查路径权限
  const hasPathPermission = (path: string): boolean => {
    if (!userMenus) return false
    
    // 递归检查菜单树
    const checkMenus = (menus: Menu[]): boolean => {
      for (const menu of menus) {
        if (menu.path === path) {
          return true
        }
        if (menu.children && menu.children.length > 0) {
          if (checkMenus(menu.children)) {
            return true
          }
        }
      }
      return false
    }

    return checkMenus(userMenus)
  }

  // 如果指定了需要的路径权限，检查权限
  if (requiredPath) {
    if (!hasPathPermission(requiredPath)) {
      return <Navigate to={fallbackPath} replace />
    }
  } else {
    // 如果没有指定路径，检查当前路径
    const currentPath = location.pathname
    if (!hasPathPermission(currentPath)) {
      return <Navigate to={fallbackPath} replace />
    }
  }

  return <>{children}</>
}

export default RouteGuard