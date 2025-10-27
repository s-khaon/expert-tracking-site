import React from 'react'
import { useAuthStore } from '../../store/authStore'
import { permissionService } from '../../services/permissionService'
import { useQuery } from 'react-query'
import type { Permission } from '../../types'

interface PermissionGuardProps {
  children: React.ReactNode
  permission?: string // 权限代码
  permissions?: string[] // 多个权限代码（满足其中一个即可）
  requireAll?: boolean // 是否需要满足所有权限（仅在permissions时有效）
  fallback?: React.ReactNode // 无权限时显示的内容
  loading?: React.ReactNode // 加载时显示的内容
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  loading = null,
}) => {
  const { user, isAuthenticated } = useAuthStore()

  // 获取用户权限
  const { data: userPermissions, isLoading } = useQuery(
    ['userPermissions', user?.id],
    () => permissionService.getUserPermissions(user!.id),
    {
      enabled: !!user?.id && isAuthenticated,
      staleTime: 5 * 60 * 1000, // 5分钟缓存
    }
  )

  // 如果未登录，不显示内容
  if (!isAuthenticated || !user) {
    return <>{fallback}</>
  }

  // 加载中
  if (isLoading) {
    return <>{loading}</>
  }

  // 检查权限
  const hasPermission = (permCode: string): boolean => {
    if (!userPermissions) return false
    return userPermissions.some((p: Permission) => p.code === permCode)
  }

  // 单个权限检查
  if (permission) {
    if (!hasPermission(permission)) {
      return <>{fallback}</>
    }
    return <>{children}</>
  }

  // 多个权限检查
  if (permissions && permissions.length > 0) {
    const hasAnyPermission = permissions.some(p => hasPermission(p))
    const hasAllPermissions = permissions.every(p => hasPermission(p))

    const shouldShow = requireAll ? hasAllPermissions : hasAnyPermission

    if (!shouldShow) {
      return <>{fallback}</>
    }
    return <>{children}</>
  }

  // 如果没有指定权限要求，默认显示
  return <>{children}</>
}

export default PermissionGuard