import type { 
  ContactRecord, 
  ContactRecordCreate, 
  ContactRecordUpdate, 
  ContactRecordListResponse,
  ContactRecordSearchParams 
} from '../types'
import api from './api'

export const contactRecordService = {
  // 获取建联记录列表
  getContactRecords: async (params?: ContactRecordSearchParams): Promise<ContactRecordListResponse> => {
    const response = await api.get('/contact-records/', { params })
    return response.data
  },

  // 获取建联记录详情
  getContactRecord: async (id: number): Promise<ContactRecord> => {
    const response = await api.get(`/contact-records/${id}`)
    return response.data
  },

  // 创建建联记录
  createContactRecord: async (data: ContactRecordCreate): Promise<ContactRecord> => {
    const response = await api.post('/contact-records/', data)
    return response.data
  },

  // 更新建联记录
  updateContactRecord: async (id: number, data: ContactRecordUpdate): Promise<ContactRecord> => {
    const response = await api.put(`/contact-records/${id}`, data)
    return response.data
  },

  // 删除建联记录
  deleteContactRecord: async (id: number): Promise<void> => {
    await api.delete(`/contact-records/${id}`)
  },

  // 根据达人ID获取建联记录
  getContactRecordsByInfluencer: async (influencerId: number, params?: ContactRecordSearchParams): Promise<ContactRecordListResponse> => {
    const response = await api.get(`/contact-records/influencer/${influencerId}`, { params })
    return response.data
  },

  // 获取待跟进的建联记录
  getPendingFollowUpRecords: async (params?: ContactRecordSearchParams): Promise<ContactRecordListResponse> => {
    const response = await api.get('/contact-records/pending-follow-up', { params })
    return response.data
  },

  // 标记跟进完成
  markFollowUpCompleted: async (id: number, notes?: string): Promise<ContactRecord> => {
    const response = await api.patch(`/contact-records/${id}/follow-up`, { notes })
    return response.data
  },

  // 批量删除建联记录
  batchDeleteContactRecords: async (ids: number[]): Promise<void> => {
    await api.post('/contact-records/batch-delete', { ids })
  },

  // 批量更新跟进状态
  batchUpdateFollowUpStatus: async (ids: number[], followUpRequired: string): Promise<void> => {
    await api.post('/contact-records/batch-update-follow-up', { ids, follow_up_required: followUpRequired })
  },

  // 获取建联记录统计信息
  getContactRecordStats: async (influencerId?: number): Promise<{
    total: number
    by_type: Record<string, number>
    by_result: Record<string, number>
    pending_follow_up: number
  }> => {
    const params = influencerId ? { influencer_id: influencerId } : {}
    const response = await api.get('/contact-records/stats', { params })
    return response.data
  },

  // 导出建联记录
  exportContactRecords: async (params?: ContactRecordSearchParams): Promise<void> => {
    const response = await api.get('/contact-records/export', { 
      params,
      responseType: 'blob'
    })
    
    // 创建下载链接
    const blob = new Blob([response.data], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `contact_records_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }
}