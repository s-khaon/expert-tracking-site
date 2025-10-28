import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { Button, Form, Input, message, Modal, Popconfirm, Space, Switch, Table, Tag } from 'antd'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { userService } from '../../services/userService'
import type { TableParams, User, UserCreate, UserUpdate } from '../../types'

const { Search } = Input

const UserManagement = () => {
  const [form] = Form.useForm()
  const queryClient = useQueryClient()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [tableParams, setTableParams] = useState<TableParams>({
    page: 1,
    page_size: 10,
  })

  // 获取用户列表
  const { data: usersData, isLoading } = useQuery(
    ['users', tableParams],
    () => userService.getUsers(tableParams),
    {
      keepPreviousData: true,
    }
  )

  // 创建用户
  const createUserMutation = useMutation(userService.createUser, {
    onSuccess: () => {
      message.success('用户创建成功')
      setIsModalVisible(false)
      form.resetFields()
      queryClient.invalidateQueries(['users'])
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || '创建失败')
    },
  })

  // 更新用户
  const updateUserMutation = useMutation(
    ({ id, data }: { id: number; data: UserUpdate }) => userService.updateUser(id, data),
    {
      onSuccess: () => {
        message.success('用户更新成功')
        setIsModalVisible(false)
        setEditingUser(null)
        form.resetFields()
        queryClient.invalidateQueries(['users'])
      },
      onError: (error: any) => {
        message.error(error.response?.data?.message || '更新失败')
      },
    }
  )

  // 删除用户
  const deleteUserMutation = useMutation(userService.deleteUser, {
    onSuccess: () => {
      message.success('用户删除成功')
      queryClient.invalidateQueries(['users'])
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || '删除失败')
    },
  })

  // 切换用户状态
  const toggleStatusMutation = useMutation(userService.toggleUserStatus, {
    onSuccess: () => {
      message.success('状态更新成功')
      queryClient.invalidateQueries(['users'])
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || '状态更新失败')
    },
  })

  const handleCreate = () => {
    setEditingUser(null)
    setIsModalVisible(true)
    form.resetFields()
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setIsModalVisible(true)
    form.setFieldsValue({
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      is_active: user.is_active,
      is_superuser: user.is_superuser,
    })
  }

  const handleDelete = (id: number) => {
    deleteUserMutation.mutate(id)
  }

  const handleToggleStatus = (id: number) => {
    toggleStatusMutation.mutate(id)
  }

  const handleSubmit = (values: any) => {
    if (editingUser) {
      updateUserMutation.mutate({
        id: editingUser.id,
        data: values,
      })
    } else {
      createUserMutation.mutate(values as UserCreate)
    }
  }

  const handleSearch = (value: string) => {
    setTableParams({
      ...tableParams,
      search: value,
      page: 1,
    })
  }

  const handleTableChange = (pagination: any) => {
    setTableParams({
      ...tableParams,
      page: pagination.current,
      page_size: pagination.pageSize,
    })
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '姓名',
      dataIndex: 'full_name',
      key: 'full_name',
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean, record: User) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleStatus(record.id)}
          loading={toggleStatusMutation.isLoading}
        />
      ),
    },
    {
      title: '超级用户',
      dataIndex: 'is_superuser',
      key: 'is_superuser',
      render: (isSuperuser: boolean) => (
        <Tag color={isSuperuser ? 'red' : 'default'}>{isSuperuser ? '是' : '否'}</Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: User) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个用户吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              loading={deleteUserMutation.isLoading}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">用户管理</h1>
        <p className="page-description">管理系统用户账户</p>
      </div>

      <div className="page-actions">
        <Space>
          <Search
            placeholder="搜索用户名或邮箱"
            allowClear
            enterButton={<SearchOutlined />}
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新建用户
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={usersData?.items || []}
        loading={isLoading}
        pagination={{
          current: tableParams.page,
          pageSize: tableParams.page_size,
          total: usersData?.total || 0,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
        }}
        onChange={handleTableChange}
        rowKey="id"
      />

      <Modal
        title={editingUser ? '编辑用户' : '新建用户'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false)
          setEditingUser(null)
          form.resetFields()
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off">
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3个字符' },
            ]}
          >
            <Input placeholder="请输入用户名" disabled={!!editingUser} />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item
            name="full_name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              name="password"
              label="密码"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6个字符' },
              ]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}

          <Form.Item name="is_active" label="启用状态" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item name="is_superuser" label="超级用户" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={createUserMutation.isLoading || updateUserMutation.isLoading}
              >
                {editingUser ? '更新' : '创建'}
              </Button>
              <Button
                onClick={() => {
                  setIsModalVisible(false)
                  setEditingUser(null)
                  form.resetFields()
                }}
              >
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default UserManagement
