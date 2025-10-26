import { apiRequest } from './api'
import type { UserLogin, Token, User, UserCreate } from '../types'

export const authService = {
  // 用户登录
  login: async (credentials: UserLogin): Promise<{ user: User; token: Token }> => {
    return apiRequest.post('/auth/login', credentials)
  },

  // 用户注册
  register: async (userData: UserCreate): Promise<{ user: User; token: Token }> => {
    return apiRequest.post('/auth/register', userData)
  },

  // 刷新Token
  refreshToken: async (refreshToken: string): Promise<Token> => {
    return apiRequest.post('/auth/refresh', { refresh_token: refreshToken })
  },

  // 退出登录
  logout: async (): Promise<void> => {
    return apiRequest.post('/auth/logout')
  },

  // 获取当前用户信息
  getCurrentUser: async (): Promise<User> => {
    return apiRequest.get('/auth/me')
  },

  // 修改密码
  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    return apiRequest.post('/auth/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    })
  },
}