import { useState } from 'react'
import { Layout as AntLayout, Menu, Dropdown, Avatar, Button, message } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import type { MenuItem } from '../../types'

const { Header, Sider, Content } = AntLayout

interface LayoutProps {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()

  // 菜单项配置
  const menuItems: MenuItem[] = [
    {
      key: '/dashboard',
      label: '仪表板',
      icon: <DashboardOutlined />,
      path: '/dashboard',
    },
    {
      key: '/experts',
      label: '达人管理',
      icon: <TeamOutlined />,
      path: '/experts',
    },
    {
      key: '/users',
      label: '用户管理',
      icon: <UserOutlined />,
      path: '/users',
      permission: 'user:read',
    },
  ]

  // 过滤有权限的菜单项
  const filteredMenuItems = menuItems.filter((item) => {
    if (!item.permission) return true
    // 这里可以根据用户权限进行过滤
    return user?.is_superuser || user?.roles?.some(role => 
      role.permissions?.some(permission => permission.name === item.permission)
    )
  })

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
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={filteredMenuItems.map(item => ({
            key: item.key,
            icon: item.icon,
            label: item.label,
          }))}
          onClick={handleMenuClick}
        />
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