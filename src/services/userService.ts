import type { PaginatedResponse, TableParams, User, UserCreate, UserUpdate } from '../types'
import { apiRequest } from './api'

export const userService = {
  // 获取用户列表
  getUsers: async (params?: TableParams): Promise<PaginatedResponse<User>> => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.size) queryParams.append('size', params.size.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by)
    if (params?.sort_order) queryParams.append('sort_order', params.sort_order)

    const url = queryParams.toString() ? `/users/?${queryParams.toString()}` : '/users/'
    return apiRequest.get(url)
  },

  // 获取单个用户
  getUser: async (id: number): Promise<User> => {
    return apiRequest.get(`/users/${id}`)
  },

  // 创建用户
  createUser: async (userData: UserCreate): Promise<User> => {
    return apiRequest.post('/users/', userData)
  },

  // 更新用户
  updateUser: async (id: number, userData: UserUpdate): Promise<User> => {
    return apiRequest.put(`/users/${id}`, userData)
  },

  // 删除用户
  deleteUser: async (id: number): Promise<void> => {
    return apiRequest.delete(`/users/${id}`)
  },

  // 切换用户状态
  toggleUserStatus: async (id: number): Promise<User> => {
    return apiRequest.patch(`/users/${id}/toggle-status`)
  },

  // 重置用户密码
  resetPassword: async (id: number, newPassword: string): Promise<void> => {
    return apiRequest.post(`/users/${id}/reset-password`, {
      new_password: newPassword,
    })
  },
}
