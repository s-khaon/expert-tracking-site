import React, { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Switch,
  message,
  Popconfirm,
  Card,
  Row,
  Col,
  Tag,
  Transfer,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { TransferDirection } from 'antd/es/transfer'
import { roleService } from '../../services/roleService'
import { menuService } from '../../services/menuService'
import type { Role, RoleCreate, RoleUpdate, Menu } from '../../types'

// const { TabPane } = Tabs // Removed unused variable

interface TransferItem {
  key: string
  title: string
  description?: string
}

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([])
  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [menuModalVisible, setMenuModalVisible] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [form] = Form.useForm()
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })

  // 菜单穿梭框相关状态
  const [targetKeys, setTargetKeys] = useState<React.Key[]>([])
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([])

  // 获取角色列表
  const fetchRoles = async (page = 1, pageSize = 10) => {
    setLoading(true)
    try {
      const response = await roleService.getRoles({
        skip: (page - 1) * pageSize,
        limit: pageSize,
      })
      setRoles(response.items)
      setPagination({
        current: page,
        pageSize,
        total: response.total,
      })
    } catch (error) {
      message.error('获取角色列表失败')
    } finally {
      setLoading(false)
    }
  }

  // 获取菜单列表
  const fetchMenus = async () => {
    try {
      const response = await menuService.getMenus({
        skip: 0,
        limit: 1000, // 获取所有菜单
      })
      setMenus(response.items)
    } catch (error) {
      message.error('获取菜单列表失败')
    }
  }

  useEffect(() => {
    fetchRoles()
    fetchMenus()
  }, [])

  // 处理表格分页
  const handleTableChange = (pagination: any) => {
    fetchRoles(pagination.current, pagination.pageSize)
  }

  // 打开创建/编辑模态框
  const openModal = (role?: Role) => {
    setEditingRole(role || null)
    setModalVisible(true)
    if (role) {
      form.setFieldsValue(role)
    } else {
      form.resetFields()
    }
  }

  // 关闭模态框
  const closeModal = () => {
    setModalVisible(false)
    setEditingRole(null)
    form.resetFields()
  }

  // 提交表单
  const handleSubmit = async (values: RoleCreate | RoleUpdate) => {
    try {
      if (editingRole) {
        await roleService.updateRole(editingRole.id, values)
        message.success('角色更新成功')
      } else {
        await roleService.createRole(values as RoleCreate)
        message.success('角色创建成功')
      }
      closeModal()
      fetchRoles(pagination.current, pagination.pageSize)
    } catch (error) {
      message.error(editingRole ? '角色更新失败' : '角色创建失败')
    }
  }

  // 删除角色
  const handleDelete = async (id: number) => {
    try {
      await roleService.deleteRole(id)
      message.success('角色删除成功')
      fetchRoles(pagination.current, pagination.pageSize)
    } catch (error) {
      message.error('角色删除失败')
    }
  }

  // 打开菜单分配模态框
  const openMenuModal = async (role: Role) => {
    setSelectedRole(role)
    setMenuModalVisible(true)
    try {
      const roleMenus = await roleService.getRoleMenus(role.id)
      setTargetKeys(roleMenus.map(m => m.id.toString()))
    } catch (error) {
      message.error('获取角色菜单失败')
    }
  }

  // 关闭菜单分配模态框
  const closeMenuModal = () => {
    setMenuModalVisible(false)
    setSelectedRole(null)
    setTargetKeys([])
    setSelectedKeys([])
  }

  // 处理权限穿梭框变化
  const handleTransferChange = (newTargetKeys: React.Key[], _direction: TransferDirection, _moveKeys: React.Key[]) => {
    setTargetKeys(newTargetKeys)
  }

  // 处理权限穿梭框选择变化
  const handleTransferSelectChange = (sourceSelectedKeys: React.Key[], targetSelectedKeys: React.Key[]) => {
    setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys])
  }

  // 保存菜单分配
  const handleSaveMenus = async () => {
    if (!selectedRole) return
    
    try {
      const menuIds = targetKeys.map(key => parseInt(key.toString()))
      await roleService.assignMenus(selectedRole.id, menuIds)
      message.success('菜单分配成功')
      closeMenuModal()
    } catch (error) {
      message.error('菜单分配失败')
    }
  }

  // 准备穿梭框数据
  const transferData: TransferItem[] = menus.map(menu => ({
    key: menu.id.toString(),
    title: menu.name,
    description: menu.description || menu.path,
  }))

  // 表格列定义
  const columns: ColumnsType<Role> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '角色代码',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '角色描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<SettingOutlined />}
            onClick={() => openMenuModal(record)}
          >
            菜单分配
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个角色吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Card title="角色管理">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
            style={{ marginBottom: 16 }}
          >
            新增角色
          </Button>
        </Col>
        <Col span={24}>
          <Table
            columns={columns}
            dataSource={roles}
            rowKey="id"
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
            }}
            onChange={handleTableChange}
          />
        </Col>
      </Row>

      {/* 角色创建/编辑模态框 */}
      <Modal
        title={editingRole ? '编辑角色' : '新增角色'}
        open={modalVisible}
        onCancel={closeModal}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            is_active: true,
          }}
        >
          <Form.Item
            name="name"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="请输入角色名称" />
          </Form.Item>

          <Form.Item
            name="code"
            label="角色代码"
            rules={[{ required: true, message: '请输入角色代码' }]}
          >
            <Input placeholder="请输入角色代码，如：admin" />
          </Form.Item>

          <Form.Item name="description" label="角色描述">
            <Input.TextArea placeholder="请输入角色描述" rows={3} />
          </Form.Item>

          <Form.Item name="is_active" label="状态" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingRole ? '更新' : '创建'}
              </Button>
              <Button onClick={closeModal}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 菜单分配模态框 */}
      <Modal
        title={`为角色 "${selectedRole?.name}" 分配菜单`}
        open={menuModalVisible}
        onCancel={closeMenuModal}
        onOk={handleSaveMenus}
        width={800}
        okText="保存"
        cancelText="取消"
      >
        <Transfer
          dataSource={transferData}
          titles={['可用菜单', '已分配菜单']}
          targetKeys={targetKeys}
          selectedKeys={selectedKeys}
          onChange={handleTransferChange}
          onSelectChange={handleTransferSelectChange}
          render={item => item.title}
          listStyle={{
            width: 350,
            height: 400,
          }}
          showSearch
          filterOption={(inputValue, item) =>
            item.title.indexOf(inputValue) !== -1 ||
            !!(item.description && item.description.indexOf(inputValue) !== -1)
          }
        />
      </Modal>
    </Card>
  )
}

export default RoleManagement