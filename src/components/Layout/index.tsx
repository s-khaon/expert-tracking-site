import { useState, useEffect } from 'react'
import { Layout as AntLayout, Menu, Dropdown, Avatar, Button, message, Spin } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  LogoutOutlined,
  SettingOutlined,
  SafetyOutlined,
  ControlOutlined,
  AppstoreOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from 'react-query'
import { useAuthStore } from '../../store/authStore'
import { menuService } from '../../services/menuService'
import type { MenuItem, Menu as MenuType } from '../../types'

const { Header, Sider, Content } = AntLayout

interface LayoutProps {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()

  // 获取用户可访问的菜单树
  const { data: userMenus = [], isLoading: menusLoading } = useQuery(
    ['userMenuTree'],
    () => menuService.getCurrentUserMenuTree(),
    {
      enabled: !!user,
      staleTime: 5 * 60 * 1000, // 5分钟缓存
    }
  )

  // 图标映射
  const iconMap: Record<string, React.ReactNode> = {
    'DashboardOutlined': <DashboardOutlined />,
    'UserOutlined': <UserOutlined />,
    'TeamOutlined': <TeamOutlined />,
    'SafetyOutlined': <SafetyOutlined />,
    'ControlOutlined': <ControlOutlined />,
    'AppstoreOutlined': <AppstoreOutlined />,
    'SettingOutlined': <SettingOutlined />,
  }

  // 转换菜单数据为Ant Design Menu组件需要的格式
  const convertMenusToAntdFormat = (menus: MenuType[]): MenuItem[] => {
    return menus
      .filter(menu => menu.menu_type === 'menu' && !menu.is_hidden && menu.path)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(menu => ({
        key: menu.path!,
        label: menu.title,
        icon: iconMap[menu.icon || ''] || <AppstoreOutlined />,
        path: menu.path!,
        children: menu.children && menu.children.length > 0 
          ? convertMenusToAntdFormat(menu.children)
          : undefined,
      }))
  }

  const menuItems = convertMenusToAntdFormat(userMenus)

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  const handleLogout = () => {
    logout()
    message.success('退出登录成功')
    navigate('/login')
  }

  const userMenuItems = [
    {
      key: 'profile',
      label: '个人资料',
      icon: <UserOutlined />,
    },
    {
      key: 'settings',
      label: '设置',
      icon: <SettingOutlined />,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ]

  return (
    <AntLayout className="layout-container">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="layout-sider"
        width={240}
      >
        <div className="flex-center" style={{ height: 64, padding: '0 16px' }}>
          <div className="logo" style={{ color: '#1890ff', fontSize: collapsed ? 16 : 18 }}>
            {collapsed ? 'ETS' : '达人跟进系统'}
          </div>
        </div>
        {menusLoading ? (
          <div style={{ padding: 20, textAlign: 'center' }}>
            <Spin />
          </div>
        ) : (
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems.map(item => ({
              key: item.key,
              icon: item.icon,
              label: item.label,
              children: item.children?.map(child => ({
                key: child.key,
                icon: child.icon,
                label: child.label,
              })),
            }))}
            onClick={handleMenuClick}
          />
        )}
      </Sider>
      
      <AntLayout>
        <Header className="layout-header">
          <div className="header-left">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 16, width: 64, height: 64 }}
            />
          </div>
          
          <div className="header-right">
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar icon={<UserOutlined />} />
                <span>{user?.full_name || user?.username}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        
        <Content className="layout-content">
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  )
}

export default Layout