import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Form, Input, message, Modal, Popconfirm, Space, Switch, Table, Tag, Select, Tooltip } from 'antd'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { userService } from '../../services/userService'
import { roleService } from '../../services/roleService'
import type { TableParams, User, UserCreate, UserUpdate, Role } from '../../types'

const { Search } = Input

const UserManagement = () => {
  const [form] = Form.useForm()
  const queryClient = useQueryClient()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isRoleModalVisible, setIsRoleModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
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

  // 获取角色列表
  const { data: rolesData } = useQuery(
    ['roles'],
    () => roleService.getRoles({ limit: 100 }),
    {
      staleTime: 5 * 60 * 1000, // 5分钟缓存
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

  // 分配用户角色
  const assignRolesMutation = useMutation(
    ({ userId, roleIds }: { userId: number; roleIds: number[] }) =>
      userService.updateUser(userId, { role_ids: roleIds }),
    {
      onSuccess: () => {
        message.success('角色分配成功')
        setIsRoleModalVisible(false)
        setSelectedUser(null)
        queryClient.invalidateQueries(['users'])
      },
      onError: (error: any) => {
        message.error(error.response?.data?.message || '角色分配失败')
      },
    }
  )

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
      role_ids: user.roles?.map(role => role.id) || [],
    })
  }

  const handleManageRoles = (user: User) => {
    setSelectedUser(user)
    setIsRoleModalVisible(true)
  }

  const handleRoleAssign = (roleIds: number[]) => {
    if (selectedUser) {
      assignRolesMutation.mutate({
        userId: selectedUser.id,
        roleIds,
      })
    }
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
      title: '角色',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles: Role[]) => (
        <Space size={[0, 4]} wrap>
          {roles?.map((role) => (
            <Tag key={role.id} color="blue">
              {role.name}
            </Tag>
          )) || <Tag color="default">无角色</Tag>}
        </Space>
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
          <Tooltip title="管理角色">
            <Button 
              type="link" 
              icon={<UserOutlined />} 
              onClick={() => handleManageRoles(record)}
            >
              角色
            </Button>
          </Tooltip>
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
                { min: 8, message: '密码至少8个字符' },
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

          <Form.Item
            name="role_ids"
            label="角色"
          >
            <Select
              mode="multiple"
              placeholder="请选择角色"
              allowClear
              loading={!rolesData}
              options={rolesData?.items?.map((role: Role) => ({
                label: role.name,
                value: role.id,
              })) || []}
            />
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

        {/* 角色分配模态框 */}
        <Modal
          title={`为用户 "${selectedUser?.username}" 分配角色`}
          open={isRoleModalVisible}
          onCancel={() => {
            setIsRoleModalVisible(false)
            setSelectedUser(null)
          }}
          footer={null}
          width={600}
        >
          <div style={{ marginBottom: 16 }}>
            <p>当前角色：</p>
            <Space size={[0, 4]} wrap>
              {selectedUser?.roles?.map((role) => (
                <Tag key={role.id} color="blue">
                  {role.name}
                </Tag>
              )) || <Tag color="default">无角色</Tag>}
            </Space>
          </div>
          
          <div>
            <p>选择新角色：</p>
            <Select
              mode="multiple"
              placeholder="请选择角色"
              style={{ width: '100%' }}
              value={selectedUser?.roles?.map(role => role.id) || []}
              onChange={handleRoleAssign}
              loading={assignRolesMutation.isLoading || !rolesData}
              options={rolesData?.items?.map((role: Role) => ({
                label: role.name,
                value: role.id,
              })) || []}
            />
          </div>
        </Modal>
      </div>
    )
  }

  export default UserManagement
