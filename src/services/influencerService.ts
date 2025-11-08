import type {
  Influencer,
  InfluencerCreate,
  InfluencerListResponse,
  InfluencerSearchParams,
  InfluencerUpdate,
} from '../types'
import api from './api'

export const influencerService = {
  // 获取达人列表
  getInfluencers: async (params?: InfluencerSearchParams): Promise<InfluencerListResponse> => {
    const response = await api.get('/influencers/', { params })
    return response.data
  },

  // 获取达人详情
  getInfluencer: async (id: number): Promise<Influencer> => {
    const response = await api.get(`/influencers/${id}`)
    return response.data
  },

  // 创建达人
  createInfluencer: async (data: InfluencerCreate): Promise<Influencer> => {
    const response = await api.post('/influencers/', data)
    return response.data
  },

  // 更新达人信息
  updateInfluencer: async (id: number, data: InfluencerUpdate): Promise<Influencer> => {
    const response = await api.put(`/influencers/${id}`, data)
    return response.data
  },

  // 删除达人
  deleteInfluencer: async (id: number): Promise<void> => {
    await api.delete(`/influencers/${id}`)
  },

  // 根据姓名获取达人
  getInfluencerByName: async (name: string): Promise<Influencer> => {
    const response = await api.get(`/influencers/name/${name}`)
    return response.data
  },

  // 根据状态获取达人列表
  getInfluencersByStatus: async (
    status: string,
    params?: InfluencerSearchParams
  ): Promise<InfluencerListResponse> => {
    const response = await api.get(`/influencers/status/${status}`, { params })
    return response.data
  },

  // 根据优先级获取达人列表
  getInfluencersByPriority: async (
    priority: string,
    params?: InfluencerSearchParams
  ): Promise<InfluencerListResponse> => {
    const response = await api.get(`/influencers/priority/${priority}`, { params })
    return response.data
  },

  // 根据平台搜索达人
  searchInfluencersByPlatform: async (
    platform: string,
    params?: InfluencerSearchParams
  ): Promise<InfluencerListResponse> => {
    const response = await api.get(`/influencers/platform/${platform}`, { params })
    return response.data
  },

  // 批量删除达人
  batchDeleteInfluencers: async (ids: number[]): Promise<void> => {
    await api.post('/influencers/batch-delete', { ids })
  },

  // 批量更新达人状态
  batchUpdateInfluencerStatus: async (ids: number[], status: string): Promise<void> => {
    await api.post('/influencers/batch-update-status', { ids, status })
  },

  // 导出达人信息
  exportInfluencers: async (params?: InfluencerSearchParams): Promise<void> => {
    const response = await api.get('/influencers/export', {
      params,
      responseType: 'blob',
    })

    // 创建下载链接
    const blob = new Blob([response.data], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `influencers_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  },
  // 从飞书同步达人信息（手动触发）
  syncFromFeishu: async (): Promise<{ message: string; added: number; updated: number; skipped: number }> => {
    const response = await api.post('/influencers/sync/feishu')
    return response.data
  }
}

