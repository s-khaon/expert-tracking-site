import api from './api'

export interface Permission {
  id: number
  name: string
  code: string
  description?: string
  resource_type: string
  resource_id?: string
  action: string
  created_at: string
  updated_at: string
}

export interface PermissionSearchParams {
  page?: number
  page_size?: number
  name?: string
  code?: string
  resource_type?: string
  action?: string
}

export interface PermissionListResponse {
  items: Permission[]
  total: number
  page: number
  page_size: number
  pages: number
}

export const permissionService = {
  // 获取权限列表
  getPermissions: async (params?: PermissionSearchParams): Promise<PermissionListResponse> => {
    const response = await api.get('/permissions', { params })
    return response.data
  },

  // 获取权限详情
  getPermission: async (id: number): Promise<Permission> => {
    const response = await api.get(`/permissions/${id}`)
    return response.data
  },

  // 创建权限
  createPermission: async (data: Omit<Permission, 'id' | 'created_at' | 'updated_at'>): Promise<Permission> => {
    const response = await api.post('/permissions', data)
    return response.data
  },

  // 更新权限
  updatePermission: async (id: number, data: Partial<Omit<Permission, 'id' | 'created_at' | 'updated_at'>>): Promise<Permission> => {
    const response = await api.put(`/permissions/${id}`, data)
    return response.data
  },

  // 删除权限
  deletePermission: async (id: number): Promise<void> => {
    await api.delete(`/permissions/${id}`)
  },

  // 检查用户权限
  checkPermission: async (resource: string, action: string): Promise<boolean> => {
    try {
      const response = await api.get('/permissions/check', {
        params: { resource, action }
      })
      return response.data.has_permission
    } catch (error) {
      return false
    }
  },

  // 获取用户所有权限
  getUserPermissions: async (): Promise<Permission[]> => {
    const response = await api.get('/permissions/user')
    return response.data
  }
}

export default permissionService