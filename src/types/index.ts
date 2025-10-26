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

// 角色相关类型
export interface Role {
  id: number
  name: string
  description?: string
  created_at: string
  updated_at: string
  permissions: Permission[]
}

export interface RoleCreate {
  name: string
  description?: string
  permission_ids?: number[]
}

// 权限相关类型
export interface Permission {
  id: number
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export interface PermissionCreate {
  name: string
  description?: string
}

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

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
}

// 表格相关类型
export interface TableParams {
  page?: number
  size?: number
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

// 菜单项类型
export interface MenuItem {
  key: string
  label: string
  icon?: any
  path?: string
  children?: MenuItem[]
  permission?: string
}