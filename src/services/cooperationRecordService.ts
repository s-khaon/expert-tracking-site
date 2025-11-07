import type {
  CooperationRecord,
  CooperationRecordCreate,
  CooperationRecordUpdate,
  CooperationRecordDetail,
  CooperationRecordListResponse,
  CooperationRecordSearchParams,
  CooperationProduct,
  CooperationProductCreate,
  CooperationProductUpdate
} from '../types'
import api from './api'

export const cooperationRecordService = {
  // 获取合作记录列表
  getCooperationRecords: async (
    params?: CooperationRecordSearchParams
  ): Promise<CooperationRecordListResponse> => {
    const response = await api.get('/cooperation-records/', { params })
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
  createCooperationRecord: async (
    data: CooperationRecordCreate
  ): Promise<CooperationRecord> => {
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
    const response = await api.post(`/cooperation-records/${recordId}/products`, data)
    return response.data
  },

  // 更新合作商品
  updateCooperationProduct: async (
    productId: number,
    data: CooperationProductUpdate
  ): Promise<CooperationProduct> => {
    const response = await api.put(`/cooperation-records/products/${productId}`, data)
    return response.data
  },

  // 删除合作商品
  deleteCooperationProduct: async (productId: number): Promise<void> => {
    await api.delete(`/cooperation-records/products/${productId}`)
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
  }
}