// 用户相关类型
export interface User {
  id: number
  username: string
  email: string
  full_name: string
  is_active: boolean
  is_superuser: boolean
  created_at: string
  updated_at: string
  roles: Role[]
}

export interface UserCreate {
  username: string
  email: string
  password: string
  full_name: string
  is_active?: boolean
  is_superuser?: boolean
  role_ids?: number[]
}

export interface UserUpdate {
  email?: string
  full_name?: string
  is_active?: boolean
  is_superuser?: boolean
  role_ids?: number[]
}

export interface UserLogin {
  username: string
  password: string
}

export interface UserListResponse extends PaginatedResponse<User> {}

// 角色相关类型
export interface Role {
  id: number
  name: string
  code: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
  menus: Menu[]
}

export interface RoleCreate {
  name: string
  code: string
  description?: string
  is_active?: boolean
  menu_ids?: number[]
}

export interface RoleUpdate {
  name?: string
  code?: string
  description?: string
  is_active?: boolean
  menu_ids?: number[]
}

export interface RoleListResponse extends PaginatedResponse<Role> {}

// 权限相关类型
export interface Permission {
  id: number
  name: string
  code: string
  description?: string
  permission_type: 'menu' | 'api' | 'button'
  module?: string
  api_path?: string
  api_method?: string
  menu_id?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PermissionCreate {
  name: string
  code: string
  description?: string
  permission_type: 'menu' | 'api' | 'button'
  module?: string
  api_path?: string
  api_method?: string
  menu_id?: number
  is_active?: boolean
}

export interface PermissionUpdate {
  name?: string
  code?: string
  description?: string
  permission_type?: 'menu' | 'api' | 'button'
  module?: string
  api_path?: string
  api_method?: string
  menu_id?: number
  is_active?: boolean
}

export interface PermissionListResponse extends PaginatedResponse<Permission> {}

// 认证相关类型
export interface Token {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface AuthUser {
  user: User
  token: Token
}

// API响应类型
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

// 统一的分页响应类型（与后端保持一致）
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  pages: number
}

// 统一的分页请求参数类型（与后端保持一致）
export interface PaginationParams {
  page?: number
  page_size?: number
  search?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

// 表格参数类型（前端组件使用）
export interface TableParams {
  page?: number
  page_size?: number
  search?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

// 达人相关类型（扩展用户）
export interface Expert extends User {
  expertise_areas: string[]
  research_interests: string[]
  publications_count: number
  h_index?: number
  affiliation?: string
  position?: string
  bio?: string
}

export interface ExpertCreate extends UserCreate {
  expertise_areas: string[]
  research_interests: string[]
  affiliation?: string
  position?: string
  bio?: string
}

// 表单相关类型
export interface FormErrors {
  [key: string]: string | undefined
}

// 菜单相关类型
export interface Menu {
  id: number
  name: string
  title: string
  path?: string
  icon?: string
  component?: string
  parent_id?: number
  sort_order: number
  is_hidden: boolean
  is_active: boolean
  description?: string
  created_at: string
  updated_at: string
  children?: Menu[]
}

export interface MenuCreate {
  name: string
  title: string
  path?: string
  icon?: string
  component?: string
  parent_id?: number
  sort_order?: number
  is_active?: boolean
}

export interface MenuUpdate {
  name?: string
  title?: string
  path?: string
  icon?: string
  component?: string
  parent_id?: number
  sort_order?: number
  is_active?: boolean
}

export interface MenuListResponse extends PaginatedResponse<Menu> {}

// 菜单项类型（用于导航）
export interface MenuItem {
  key: string
  label: string
  icon?: any
  path?: string
  children?: MenuItem[]
  permission?: string
}

// 操作权限相关类型
export interface ActionItem {
  key: string
  path: string
  method: string
  summary: string
  group: string
  endpoint_name: string
  requires_auth: boolean
  checked: boolean
}

export interface ActionGroup {
  name: string
  actions: ActionItem[]
}

export interface ActionTreeResponse {
  list: ActionGroup[]
  checked_keys: string[]
}

export interface RoleActionListResponse {
  role_id: number
  actions: string[]
}

export interface UpdateRoleActionRequest {
  role_id: number
  checked_keys: string[]
}

// 达人管理相关类型
export interface Influencer {
  id: number
  name: string
  nickname?: string
  email?: string
  wechat?: string
  douyin_url?: string
  xiaohongshu_url?: string
  wechat_channels_url?: string
  douyin_followers?: number
  xiaohongshu_followers?: number
  wechat_channels_followers?: number
  cooperation_price?: number
  cooperation_types?: string
  is_refund?: boolean
  wechat_channels_has_shop?: boolean
  description?: string
  internal_notes?: string
  created_at: string
  updated_at: string
  created_by?: number
  updated_by?: number
}

export interface InfluencerCreate {
  name: string
  nickname?: string
  email?: string
  wechat?: string
  douyin_url?: string
  xiaohongshu_url?: string
  wechat_channels_url?: string
  douyin_followers?: number
  xiaohongshu_followers?: number
  wechat_channels_followers?: number
  cooperation_price?: number
  cooperation_types?: string
  is_refund?: boolean
  wechat_channels_has_shop?: boolean
  description?: string
  internal_notes?: string
}

export interface InfluencerUpdate {
  name?: string
  nickname?: string
  email?: string
  wechat?: string
  douyin_url?: string
  xiaohongshu_url?: string
  wechat_channels_url?: string
  douyin_followers?: number
  xiaohongshu_followers?: number
  wechat_channels_followers?: number
  cooperation_price?: number
  cooperation_types?: string
  is_refund?: boolean
  wechat_channels_has_shop?: boolean
  description?: string
  internal_notes?: string
}

export interface InfluencerSimple {
  id: number
  name: string
  nickname?: string
}

export interface InfluencerListResponse extends PaginatedResponse<Influencer> {}

// 建联记录相关类型
export interface ContactRecord {
  id: number
  influencer_id: number
  influencer_name?: string
  contact_type: string
  contact_method?: string
  contact_person?: string
  contact_content?: string
  contact_result?: string
  follow_up_required: string
  follow_up_date?: string
  follow_up_notes?: string
  contact_date?: string
  created_at: string
  updated_at: string
  created_by?: number
  updated_by?: number
  influencer?: Influencer
}

export interface ContactRecordCreate {
  influencer_id: number
  contact_type: string
  contact_method?: string
  contact_person?: string
  contact_content?: string
  contact_result?: string
  follow_up_required?: string
  follow_up_date?: string
  follow_up_notes?: string
  contact_date?: string
}

export interface ContactRecordUpdate {
  contact_type?: string
  contact_method?: string
  contact_person?: string
  contact_content?: string
  contact_result?: string
  follow_up_required?: string
  follow_up_date?: string
  follow_up_notes?: string
  contact_date?: string
}

export interface ContactRecordListResponse extends PaginatedResponse<ContactRecord> {}

// 达人搜索参数
export interface InfluencerSearchParams extends PaginationParams {
  name?: string
  platform?: string
}

// 建联记录搜索参数
export interface ContactRecordSearchParams extends PaginationParams {
  influencer_id?: number
  contact_type?: string
  contact_result?: string
  follow_up_required?: string
  start_date?: string
  end_date?: string
}

// 合作商品相关类型
export interface CooperationProduct {
  id: number
  cooperation_record_id?: number | null
  product_name: string
  product_code: string
  price: number
  commission_rate?: number
  notes?: string
  created_at: string
  updated_at: string
  created_by?: number
  updated_by?: number
}

export interface CooperationProductCreate {
  product_name: string
  product_code: string
  price: number
  commission_rate?: number
  notes?: string
}

export interface CooperationProductUpdate {
  product_name?: string
  product_code?: string
  price?: number
  commission_rate?: number
  notes?: string
}

// 合作记录相关类型
export interface CooperationRecord {
  id: number
  influencer_id: number
  contact_record_id?: number
  cooperation_status: number
  notes?: string
  created_at: string
  updated_at: string
  created_by?: number
  updated_by?: number
  products: CooperationProduct[]
}

export interface CooperationRecordDetail extends CooperationRecord {
  influencer_name?: string
  contact_record_type?: string
}

export interface CooperationRecordCreate {
  influencer_id: number
  contact_record_id?: number
  cooperation_status?: number
  notes?: string
  product_ids?: number[]
}

export interface CooperationRecordUpdate {
  cooperation_status?: number
  notes?: string
}

export interface CooperationRecordListResponse extends PaginatedResponse<CooperationRecordDetail> {}

export interface CooperationRecordSearchParams extends PaginationParams {
  cooperation_status?: number
  influencer_id?: number
  contact_record_id?: number
  start_date?: string
  end_date?: string
  order_by?: string
  order_direction?: 'asc' | 'desc'
}

// 合作商品分页响应与搜索参数
export interface CooperationProductListResponse extends PaginatedResponse<CooperationProduct> {}

export interface CooperationProductSearchParams extends PaginationParams {
  record_id?: number
  order_by?: string
  order_direction?: 'asc' | 'desc'
}
