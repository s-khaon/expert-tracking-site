import type { Menu, MenuCreate, MenuListResponse, MenuUpdate } from '../types'
import { apiRequest } from './api'

export interface MenuQueryParams {
  skip?: number
  limit?: number
  is_active?: boolean
  parent_id?: number
}

export const menuService = {
  // 获取菜单列表
  getMenus: (params?: MenuQueryParams): Promise<MenuListResponse> =>
    apiRequest.get('/menus', { params }),

  // 获取菜单树
  getMenuTree: (isActive?: boolean): Promise<Menu[]> =>
    apiRequest.get('/menus/tree', { params: { is_active: isActive } }),

  // 获取单个菜单
  getMenu: (id: number): Promise<Menu> => apiRequest.get(`/menus/${id}`),

  // 创建菜单
  createMenu: (data: MenuCreate): Promise<Menu> => apiRequest.post('/menus', data),

  // 更新菜单
  updateMenu: (id: number, data: MenuUpdate): Promise<Menu> => apiRequest.put(`/menus/${id}`, data),

  // 删除菜单
  deleteMenu: (id: number): Promise<void> => apiRequest.delete(`/menus/${id}`),

  // 获取用户可访问的菜单
  getUserAccessibleMenus: (userId: number): Promise<Menu[]> =>
    apiRequest.get(`/menus/user/${userId}/accessible`),

  // 获取当前用户可访问的菜单树
  getCurrentUserMenuTree: (): Promise<Menu[]> => apiRequest.get('/menus/user-tree'),
}
