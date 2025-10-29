import React, { useState } from 'react'
import {
  Layout as AntLayout,
  Menu,
  Button,
  Dropdown,
  Avatar,
  Spin,
  message,
} from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  TeamOutlined,
  SafetyOutlined,
  ControlOutlined,
  AppstoreOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import type { Menu as MenuType, MenuItem } from '../../types'

const { Header, Sider, Content } = AntLayout

interface LayoutProps {
  children: React.ReactNode
  userMenus: MenuType[]
  menusLoading: boolean
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  userMenus, 
  menusLoading 
}) => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()

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
      .filter(menu => {
        // 显示条件：菜单类型为'menu'且未隐藏，并且满足以下条件之一：
        // 1. 有path（叶子菜单）
        // 2. 有子菜单（父级菜单，即使没有path也要显示）
        return menu.menu_type === 'menu' && !menu.is_hidden && 
               (menu.path || (menu.children && menu.children.length > 0));
      })
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