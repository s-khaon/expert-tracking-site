import type {
  CooperationProduct,
  CooperationProductCreate,
  CooperationProductListResponse,
  CooperationProductSearchParams,
  CooperationProductUpdate,
  CooperationRecord,
  CooperationRecordCreate,
  CooperationRecordDetail,
  CooperationRecordListResponse,
  CooperationRecordSearchParams,
  CooperationRecordUpdate,
} from '../types'
import api from './api'

export const cooperationRecordService = {
  // 获取合作记录列表
  getCooperationRecords: async (
    params?: CooperationRecordSearchParams
  ): Promise<CooperationRecordListResponse> => {
    const response = await api.get('/cooperation-records', { params })
    const data = response.data
    // 兼容后端可能的 size 字段
    if (data && typeof data.page_size === 'undefined' && typeof data.size !== 'undefined') {
      data.page_size = data.size
      delete data.size
    }
    return data
  },

  // 获取合作记录详情
  getCooperationRecord: async (id: number): Promise<CooperationRecordDetail> => {
    const response = await api.get(`/cooperation-records/${id}`)
    return response.data
  },

  // 创建合作记录
  createCooperationRecord: async (data: CooperationRecordCreate): Promise<CooperationRecord> => {
    const response = await api.post('/cooperation-records/', data)
    return response.data
  },

  // 更新合作记录
  updateCooperationRecord: async (
    id: number,
    data: CooperationRecordUpdate
  ): Promise<CooperationRecord> => {
    const response = await api.put(`/cooperation-records/${id}`, data)
    return response.data
  },

  // 删除合作记录
  deleteCooperationRecord: async (id: number): Promise<void> => {
    await api.delete(`/cooperation-records/${id}`)
  },

  // 获取合作记录的商品列表
  getCooperationProducts: async (recordId: number): Promise<CooperationProduct[]> => {
    const response = await api.get(`/cooperation-records/${recordId}/products`)
    return response.data
  },

  // 创建合作商品
  createCooperationProduct: async (
    recordId: number,
    data: CooperationProductCreate
  ): Promise<CooperationProduct> => {
    const response = await api.post(`/${recordId}/products`, data)
    return response.data
  },

  // 更新合作商品
  updateCooperationProduct: async (
    productId: number,
    data: CooperationProductUpdate
  ): Promise<CooperationProduct> => {
    const response = await api.put(`/products/${productId}`, data)
    return response.data
  },

  // 删除合作商品
  deleteCooperationProduct: async (productId: number): Promise<void> => {
    await api.delete(`/products/${productId}`)
  },

  // 全局分页搜索合作商品（用于远程下拉与管理页面）
  getAllCooperationProducts: async (
    params?: CooperationProductSearchParams
  ): Promise<CooperationProductListResponse> => {
    const response = await api.get('/products', { params })
    const data = response.data
    if (data && typeof data.page_size === 'undefined' && typeof data.size !== 'undefined') {
      data.page_size = data.size
      delete data.size
    }
    return data
  },

  // 根据ID获取合作商品详情
  getCooperationProductById: async (productId: number): Promise<CooperationProduct> => {
    const response = await api.get(`/products/${productId}`)
    return response.data
  },

  // 独立创建合作商品（不绑定记录）
  createProduct: async (data: CooperationProductCreate): Promise<CooperationProduct> => {
    const response = await api.post('/products', data)
    return response.data
  },

  // 统计信息
  getCooperationStats: async (
    start_date?: string,
    end_date?: string
  ): Promise<{ total_records: number; status_distribution: Record<string, number> }> => {
    const params: Record<string, string> = {}
    if (start_date) params.start_date = start_date
    if (end_date) params.end_date = end_date
    const response = await api.get('/cooperation-records/stats/overview', { params })
    return response.data
  },
  // 导入合作结果文件并匹配达人
  importCooperationResults: async (
    file: File,
    similarityThreshold: number = 0.8
  ): Promise<{
    exact_success: Array<{
      import_nickname: string
      influencer_id: number
      influencer_name: string
      influencer_nickname: string
    }>
    similar_possible_success: Array<{
      import_nickname: string
      influencer_id: number
      influencer_name: string
      influencer_nickname: string
      similarity: number
    }>
    unmatched: Array<{ import_nickname: string }>
    download_url?: string
    expires_at?: string
  }> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('similarity_threshold', String(similarityThreshold))
    const response = await api.post('/cooperation-records/import-results', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
  // 从飞书同步合作记录
  syncFeishu: async (): Promise<{ added: number; updated: number; skipped: number }> => {
    const response = await api.post('/cooperation-records/sync/feishu')
    return response.data
  },
}
