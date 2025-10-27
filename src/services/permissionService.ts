import { apiRequest } from './api'
import type {
  Permission,
  PermissionCreate,
  PermissionUpdate,
  PermissionListResponse,
} from '../types'

export interface PermissionQueryParams {
  skip?: number
  limit?: number
  is_active?: boolean
  permission_type?: string
  module?: string
}

export const permissionService = {
  // 获取权限列表
  getPermissions: (params?: PermissionQueryParams): Promise<PermissionListResponse> =>
    apiRequest.get('/permissions/', { params }),

  // 获取单个权限
  getPermission: (id: number): Promise<Permission> =>
    apiRequest.get(`/permissions/${id}`),

  // 创建权限
  createPermission: (data: PermissionCreate): Promise<Permission> =>
    apiRequest.post('/permissions/', data),

  // 更新权限
  updatePermission: (id: number, data: PermissionUpdate): Promise<Permission> =>
    apiRequest.put(`/permissions/${id}`, data),

  // 删除权限
  deletePermission: (id: number): Promise<void> =>
    apiRequest.delete(`/permissions/${id}`),

  // 获取用户所有权限
  getUserPermissions: (userId: number): Promise<Permission[]> =>
    apiRequest.get(`/permissions/user/${userId}`),

  // 获取用户API权限
  getUserApiPermissions: (userId: number): Promise<any[]> =>
    apiRequest.get(`/permissions/user/${userId}/api-permissions`),

  // 获取用户菜单权限
  getUserMenuPermissions: (userId: number): Promise<number[]> =>
    apiRequest.get(`/permissions/user/${userId}/menu-permissions`),

  // 检查API权限
  checkApiPermission: (apiPath: string, method: string): Promise<{ has_permission: boolean }> =>
    apiRequest.post('/permissions/check-api', { api_path: apiPath, method }),

  // 检查菜单权限
  checkMenuPermission: (menuId: number): Promise<{ has_permission: boolean }> =>
    apiRequest.post('/permissions/check-menu', { menu_id: menuId }),

  // 获取角色权限
  getRolePermissions: (roleId: number): Promise<Permission[]> =>
    apiRequest.get(`/permissions/role/${roleId}`),

  // 分配权限给角色
  assignPermissionsToRole: (roleId: number, permissionIds: number[]): Promise<{ message: string }> =>
    apiRequest.post(`/permissions/role/${roleId}/assign`, permissionIds),

  // 从角色移除权限
  removePermissionsFromRole: (roleId: number, permissionIds: number[]): Promise<{ message: string }> =>
    apiRequest.post(`/permissions/role/${roleId}/remove`, permissionIds),
}