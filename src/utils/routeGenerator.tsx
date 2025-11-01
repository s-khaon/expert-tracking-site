import React, { lazy } from 'react'
import { RouteObject } from 'react-router-dom'
import RouteGuard from '@components/RouteGuard'
import type { Menu } from '@/types'

// 懒加载页面组件
const Dashboard = lazy(() => import('@pages/Dashboard'))
const UserManagement = lazy(() => import('@pages/UserManagement'))
const ExpertManagement = lazy(() => import('@pages/InfluencerManagement'))
const RoleManagement = lazy(() => import('@pages/RoleManagement'))
const MenuManagement = lazy(() => import('@pages/MenuManagement'))
const InfluencerManagement = lazy(() => import('@pages/InfluencerManagement'))
const ContactRecordManagement = lazy(() => import('@pages/ContactRecordManagement'))

// 组件映射表 - 将菜单的component字段映射到实际的React组件
const componentMap: Record<string, React.ComponentType> = {
  'Dashboard': Dashboard,
  'UserManagement': UserManagement,
  'ExpertManagement': ExpertManagement,
  'RoleManagement': RoleManagement,
  'MenuManagement': MenuManagement,
  'InfluencerManagement': InfluencerManagement,
  'ContactRecordManagement': ContactRecordManagement,
}

/**
 * 根据菜单数据生成路由配置
 * @param menus 菜单数据数组
 * @returns React Router路由配置数组
 */
export const generateRoutesFromMenus = (menus: Menu[]): RouteObject[] => {
  const routes: RouteObject[] = []

  const processMenu = (menu: Menu): RouteObject | null => {
    // 只处理有路径的菜单项（叶子节点）
    if (!menu.path) {
      // 如果没有路径但有子菜单，递归处理子菜单
      if (menu.children && menu.children.length > 0) {
        const childRoutes = menu.children
          .map(processMenu)
          .filter((route): route is RouteObject => route !== null)
        return childRoutes.length > 0 ? null : null // 父级菜单不生成路由，只处理子菜单
      }
      return null
    }

    // 获取对应的组件
    const Component = menu.component ? componentMap[menu.component] : null
    
    if (!Component) {
      console.warn(`未找到组件映射: ${menu.component} for menu: ${menu.name}`)
      return null
    }

    // 创建路由配置
    const route: RouteObject = {
      path: menu.path,
      element: (
        <RouteGuard>
          <React.Suspense fallback={<div>Loading...</div>}>
            <Component />
          </React.Suspense>
        </RouteGuard>
      ),
    }

    return route
  }

  // 递归处理所有菜单项
  const processMenus = (menuList: Menu[]) => {
    menuList.forEach(menu => {
      // 处理当前菜单
      const route = processMenu(menu)
      if (route) {
        routes.push(route)
      }

      // 递归处理子菜单
      if (menu.children && menu.children.length > 0) {
        processMenus(menu.children)
      }
    })
  }

  processMenus(menus)
  return routes
}

/**
 * 获取默认路由路径
 * @param menus 菜单数据数组
 * @returns 第一个有效的菜单路径，用作默认路由
 */
export const getDefaultRoute = (menus: Menu[]): string => {
  const findFirstValidPath = (menuList: Menu[]): string | null => {
    for (const menu of menuList) {
      // 如果当前菜单有路径且有对应组件，返回该路径
      if (menu.path && menu.component && componentMap[menu.component]) {
        return menu.path
      }
      
      // 递归查找子菜单
      if (menu.children && menu.children.length > 0) {
        const childPath = findFirstValidPath(menu.children)
        if (childPath) {
          return childPath
        }
      }
    }
    return null
  }

  return findFirstValidPath(menus) || '/dashboard' // 默认回退到仪表盘
}

/**
 * 验证路径是否在用户可访问的菜单中
 * @param path 要验证的路径
 * @param menus 用户可访问的菜单数据
 * @returns 是否有权限访问该路径
 */
export const validateRouteAccess = (path: string, menus: Menu[]): boolean => {
  const checkMenuAccess = (menuList: Menu[]): boolean => {
    for (const menu of menuList) {
      if (menu.path === path) {
        return true
      }
      
      if (menu.children && menu.children.length > 0) {
        if (checkMenuAccess(menu.children)) {
          return true
        }
      }
    }
    return false
  }

  return checkMenuAccess(menus)
}