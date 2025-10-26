import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { message } from 'antd'
import { useAuthStore } from '../store/authStore'

// 创建axios实例
const api: AxiosInstance = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const { token } = useAuthStore.getState()
    if (token?.access_token) {
      config.headers.Authorization = `Bearer ${token.access_token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error) => {
    const { logout, token, updateToken } = useAuthStore.getState()
    
    if (error.response?.status === 401) {
      // Token过期，尝试刷新
      if (token?.refresh_token) {
        try {
          const refreshResponse = await axios.post('/api/v1/auth/refresh', {
            refresh_token: token.refresh_token,
          })
          
          const newToken = refreshResponse.data
          updateToken(newToken)
          
          // 重新发送原请求
          error.config.headers.Authorization = `Bearer ${newToken.access_token}`
          return api.request(error.config)
        } catch (refreshError) {
          // 刷新失败，退出登录
          logout()
          window.location.href = '/login'
        }
      } else {
        logout()
        window.location.href = '/login'
      }
    }
    
    // 显示错误消息
    const errorMessage = error.response?.data?.message || error.message || '请求失败'
    message.error(errorMessage)
    
    return Promise.reject(error)
  }
)

export default api

// 通用API方法
export const apiRequest = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    api.get(url, config).then((res) => res.data),
    
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    api.post(url, data, config).then((res) => res.data),
    
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    api.put(url, data, config).then((res) => res.data),
    
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    api.patch(url, data, config).then((res) => res.data),
    
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    api.delete(url, config).then((res) => res.data),
}