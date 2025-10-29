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
  path?: string
  icon?: string
  component?: string
  parent_id?: number
  sort_order?: number
  is_active?: boolean
}

export interface MenuUpdate {
  name?: string
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
