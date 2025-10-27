import React, { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  message,
  Popconfirm,
  Card,
  Row,
  Col,
  Tag,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { permissionService } from '../../services/permissionService'
import { menuService } from '../../services/menuService'
import type { Permission, PermissionCreate, PermissionUpdate, Menu } from '../../types'

const { Option } = Select

const PermissionManagement: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [menus, setMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null)
  const [form] = Form.useForm()
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })

  // 获取权限列表
  const fetchPermissions = async (page = 1, pageSize = 10) => {
    setLoading(true)
    try {
      const response = await permissionService.getPermissions({
        skip: (page - 1) * pageSize,
        limit: pageSize,
      })
      setPermissions(response.items)
      setPagination({
        current: page,
        pageSize,
        total: response.total,
      })
    } catch (error) {
      message.error('获取权限列表失败')
    } finally {
      setLoading(false)
    }
  }

  // 获取菜单列表
  const fetchMenus = async () => {
    try {
      const response = await menuService.getMenuTree(true)
      setMenus(response)
    } catch (error) {
      message.error('获取菜单列表失败')
    }
  }

  useEffect(() => {
    fetchPermissions()
    fetchMenus()
  }, [])

  // 处理表格分页
  const handleTableChange = (pagination: any) => {
    fetchPermissions(pagination.current, pagination.pageSize)
  }

  // 打开创建/编辑模态框
  const openModal = (permission?: Permission) => {
    setEditingPermission(permission || null)
    setModalVisible(true)
    if (permission) {
      form.setFieldsValue(permission)
    } else {
      form.resetFields()
    }
  }

  // 关闭模态框
  const closeModal = () => {
    setModalVisible(false)
    setEditingPermission(null)
    form.resetFields()
  }

  // 提交表单
  const handleSubmit = async (values: PermissionCreate | PermissionUpdate) => {
    try {
      if (editingPermission) {
        await permissionService.updatePermission(editingPermission.id, values)
        message.success('权限更新成功')
      } else {
        await permissionService.createPermission(values as PermissionCreate)
        message.success('权限创建成功')
      }
      closeModal()
      fetchPermissions(pagination.current, pagination.pageSize)
    } catch (error) {
      message.error(editingPermission ? '权限更新失败' : '权限创建失败')
    }
  }

  // 删除权限
  const handleDelete = async (id: number) => {
    try {
      await permissionService.deletePermission(id)
      message.success('权限删除成功')
      fetchPermissions(pagination.current, pagination.pageSize)
    } catch (error) {
      message.error('权限删除失败')
    }
  }

  // 渲染菜单选项
  const renderMenuOptions = (menus: Menu[], level = 0): React.ReactNode[] => {
    return menus.map((menu) => [
      <Option key={menu.id} value={menu.id}>
        {'  '.repeat(level) + menu.name}
      </Option>,
      ...(menu.children ? renderMenuOptions(menu.children, level + 1) : []),
    ]).flat()
  }

  // 表格列定义
  const columns: ColumnsType<Permission> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '权限名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '权限代码',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '权限类型',
      dataIndex: 'permission_type',
      key: 'permission_type',
      render: (type: string) => {
        const colorMap = {
          menu: 'blue',
          api: 'green',
          button: 'orange',
        }
        return <Tag color={colorMap[type as keyof typeof colorMap]}>{type}</Tag>
      },
    },
    {
      title: '所属模块',
      dataIndex: 'module',
      key: 'module',
    },
    {
      title: 'API路径',
      dataIndex: 'api_path',
      key: 'api_path',
    },
    {
      title: 'API方法',
      dataIndex: 'api_method',
      key: 'api_method',
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
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个权限吗？"
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
    <Card title="权限管理">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
            style={{ marginBottom: 16 }}
          >
            新增权限
          </Button>
        </Col>
        <Col span={24}>
          <Table
            columns={columns}
            dataSource={permissions}
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

      <Modal
        title={editingPermission ? '编辑权限' : '新增权限'}
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
            permission_type: 'api',
          }}
        >
          <Form.Item
            name="name"
            label="权限名称"
            rules={[{ required: true, message: '请输入权限名称' }]}
          >
            <Input placeholder="请输入权限名称" />
          </Form.Item>

          <Form.Item
            name="code"
            label="权限代码"
            rules={[{ required: true, message: '请输入权限代码' }]}
          >
            <Input placeholder="请输入权限代码，如：user:read" />
          </Form.Item>

          <Form.Item
            name="permission_type"
            label="权限类型"
            rules={[{ required: true, message: '请选择权限类型' }]}
          >
            <Select placeholder="请选择权限类型">
              <Option value="menu">菜单权限</Option>
              <Option value="api">API权限</Option>
              <Option value="button">按钮权限</Option>
            </Select>
          </Form.Item>

          <Form.Item name="description" label="权限描述">
            <Input.TextArea placeholder="请输入权限描述" rows={3} />
          </Form.Item>

          <Form.Item name="module" label="所属模块">
            <Input placeholder="请输入所属模块" />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.permission_type !== currentValues.permission_type
            }
          >
            {({ getFieldValue }) => {
              const permissionType = getFieldValue('permission_type')
              return (
                <>
                  {permissionType === 'api' && (
                    <>
                      <Form.Item name="api_path" label="API路径">
                        <Input placeholder="请输入API路径，如：/api/v1/users" />
                      </Form.Item>
                      <Form.Item name="api_method" label="API方法">
                        <Select placeholder="请选择API方法">
                          <Option value="GET">GET</Option>
                          <Option value="POST">POST</Option>
                          <Option value="PUT">PUT</Option>
                          <Option value="DELETE">DELETE</Option>
                          <Option value="PATCH">PATCH</Option>
                        </Select>
                      </Form.Item>
                    </>
                  )}
                  {permissionType === 'menu' && (
                    <Form.Item name="menu_id" label="关联菜单">
                      <Select placeholder="请选择关联菜单" allowClear>
                        {renderMenuOptions(menus)}
                      </Select>
                    </Form.Item>
                  )}
                </>
              )
            }}
          </Form.Item>

          <Form.Item name="is_active" label="状态" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingPermission ? '更新' : '创建'}
              </Button>
              <Button onClick={closeModal}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}

export default PermissionManagement