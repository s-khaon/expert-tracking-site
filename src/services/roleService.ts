import { apiRequest } from './api'
import type { Role, RoleCreate, RoleUpdate, RoleListResponse, Permission } from '../types'

export interface RoleQueryParams {
  skip?: number
  limit?: number
  is_active?: boolean
}

export const roleService = {
  // 获取角色列表
  getRoles: (params?: RoleQueryParams): Promise<RoleListResponse> =>
    apiRequest.get('/roles/', { params }),

  // 获取单个角色
  getRole: (id: number): Promise<Role> =>
    apiRequest.get(`/roles/${id}`),

  // 创建角色
  createRole: (data: RoleCreate): Promise<Role> =>
    apiRequest.post('/roles', data),

  // 更新角色
  updateRole: (id: number, data: RoleUpdate): Promise<Role> =>
    apiRequest.put(`/roles/${id}`, data),

  // 删除角色
  deleteRole: (id: number): Promise<void> =>
    apiRequest.delete(`/roles/${id}`),

  // 获取用户角色
  getUserRoles: (userId: number): Promise<Role[]> =>
    apiRequest.get(`/roles/user/${userId}`),

  // 分配角色给用户
  assignRolesToUser: (userId: number, roleIds: number[]): Promise<{ message: string }> =>
    apiRequest.post(`/roles/user/${userId}/assign`, roleIds),

  // 从用户移除角色
  removeRolesFromUser: async (userId: number, roleIds: number[]): Promise<void> => {
    await apiRequest.delete(`/users/${userId}/roles`, { data: { role_ids: roleIds } })
  },

  // 获取角色权限
  getRolePermissions: async (roleId: number): Promise<Permission[]> => {
    return await apiRequest.get<Permission[]>(`/roles/${roleId}/permissions`)
  },

  // 分配权限给角色
  assignPermissions: async (roleId: number, permissionIds: number[]): Promise<void> => {
    await apiRequest.post(`/roles/${roleId}/permissions`, { permission_ids: permissionIds })
  },
}