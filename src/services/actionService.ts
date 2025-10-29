import { apiRequest } from './api'
import type { ActionTreeResponse, RoleActionListResponse, UpdateRoleActionRequest } from '../types'

export interface ActionQueryParams {
  role_id?: number
}

export const actionService = {
  // 获取操作权限树
  getActionTree: (params?: ActionQueryParams): Promise<ActionTreeResponse> =>
    apiRequest.get('/actions', { params }),

  // 获取角色的操作权限列表
  getRoleActions: (roleId: number): Promise<RoleActionListResponse> =>
    apiRequest.get(`/actions/role/${roleId}`),

  // 更新角色的操作权限
  updateRoleActions: (data: UpdateRoleActionRequest): Promise<void> =>
    apiRequest.put('/actions', data),
}