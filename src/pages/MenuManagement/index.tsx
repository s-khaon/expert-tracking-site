import {
  DeleteOutlined,
  EditOutlined,
  FileOutlined,
  FolderOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Row,
  Space,
  Switch,
  Table,
  Tag,
  Select,
  TreeSelect,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import React, { useEffect, useState } from 'react'
import { menuService } from '../../services/menuService'
import type { Menu, MenuCreate, MenuUpdate } from '../../types'
import { availableComponents } from '../../utils/routeGenerator'

const MenuManagement: React.FC = () => {
  const [menus, setMenus] = useState<Menu[]>([])
  const [allMenus, setAllMenus] = useState<Menu[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null)
  const [form] = Form.useForm()

  // 获取菜单列表
  const fetchMenus = async () => {
    setLoading(true)
    try {
      const response = await menuService.getMenuTree(true)
      setMenus(response)
      setAllMenus(response)
    } catch {
      message.error('获取菜单列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMenus()
  }, [])

  // 打开创建/编辑模态框
  const openModal = (menu?: Menu) => {
    setEditingMenu(menu || null)
    setModalVisible(true)
    if (menu) {
      form.setFieldsValue({
        ...menu,
        parent_id: menu.parent_id || undefined,
      })
    } else {
      form.resetFields()
    }
  }

  // 关闭模态框
  const closeModal = () => {
    setModalVisible(false)
    setEditingMenu(null)
    form.resetFields()
  }

  // 提交表单
  const handleSubmit = async (values: MenuCreate | MenuUpdate) => {
    try {
      // 后端要求 title 为必填；如未提供则用 name 代填
      const title = (values as any).title ?? (values as any).name

      if (editingMenu) {
        await menuService.updateMenu(editingMenu.id, { ...values, title })
        message.success('菜单更新成功')
      } else {
        await menuService.createMenu({ ...(values as MenuCreate), title })
        message.success('菜单创建成功')
      }
      closeModal()
      fetchMenus()
    } catch {
      message.error(editingMenu ? '菜单更新失败' : '菜单创建失败')
    }
  }

  // 删除菜单
  const handleDelete = async (id: number) => {
    try {
      await menuService.deleteMenu(id)
      message.success('菜单删除成功')
      fetchMenus()
    } catch {
      message.error('菜单删除失败')
    }
  }

  // 将菜单树转换为TreeSelect数据
  const convertToTreeData = (menus: Menu[]): any[] => {
    return menus.map(menu => ({
      title: menu.name,
      value: menu.id,
      key: menu.id,
      children: menu.children ? convertToTreeData(menu.children) : undefined,
    }))
  }

  // 将菜单数据转换为表格树形数据
  const convertToTableTreeData = (menus: Menu[]): any[] => {
    return menus.map(menu => ({
      ...menu,
      key: menu.id,
      children:
        menu.children && menu.children.length > 0
          ? convertToTableTreeData(menu.children)
          : undefined,
    }))
  }

  const tableTreeData = convertToTableTreeData(menus)

  // 表格列定义
  const columns: ColumnsType<Menu> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '菜单名称',
      dataIndex: 'title',
      key: 'name',
      render: (text: string, record: any) => (
        <Space>
          {record.children && record.children.length > 0 ? (
            <FolderOutlined style={{ color: '#1890ff' }} />
          ) : (
            <FileOutlined style={{ color: '#52c41a' }} />
          )}
          <span
            style={{
              fontWeight: record.children && record.children.length > 0 ? 'bold' : 'normal',
            }}
          >
            {text}
          </span>
        </Space>
      ),
    },
    {
      title: '菜单路径',
      dataIndex: 'path',
      key: 'path',
    },
    {
      title: '图标',
      dataIndex: 'icon',
      key: 'icon',
    },
    {
      title: '排序',
      dataIndex: 'sort_order',
      key: 'sort_order',
      width: 80,
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>{isActive ? '启用' : '禁用'}</Tag>
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
          <Button type="link" icon={<EditOutlined />} onClick={() => openModal(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个菜单吗？"
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
    <Card title="菜单管理">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
            style={{ marginBottom: 16 }}
          >
            新增菜单
          </Button>
        </Col>
        <Col span={24}>
          <Table
            columns={columns}
            dataSource={tableTreeData}
            rowKey="id"
            loading={loading}
            pagination={false}
            expandable={{
              defaultExpandAllRows: false,
              indentSize: 20,
            }}
          />
        </Col>
      </Row>

      <Modal
        title={editingMenu ? '编辑菜单' : '新增菜单'}
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
            sort_order: 0,
          }}
        >
          <Form.Item
            name="name"
            label="菜单名称"
            rules={[{ required: true, message: '请输入菜单名称' }]}
          >
            <Input placeholder="请输入菜单名称" />
          </Form.Item>

          <Form.Item name="parent_id" label="父级菜单">
            <TreeSelect
              placeholder="请选择父级菜单"
              allowClear
              treeData={convertToTreeData(allMenus)}
              treeDefaultExpandAll
            />
          </Form.Item>

          <Form.Item name="path" label="菜单路径">
            <Input placeholder="请输入菜单路径，如：/users" />
          </Form.Item>

          <Form.Item name="icon" label="菜单图标">
            <Input placeholder="请输入图标名称，如：UserOutlined" />
          </Form.Item>

          <Form.Item name="component" label="组件路径">
            <Select
              placeholder="请选择组件"
              allowClear
              showSearch
              options={availableComponents.map(c => ({ label: c, value: c }))}
              optionFilterProp="label"
            />
          </Form.Item>

          <Form.Item name="description" label="菜单描述">
            <Input.TextArea placeholder="请输入菜单描述" rows={3} />
          </Form.Item>

          <Form.Item
            name="sort_order"
            label="排序"
            rules={[{ required: true, message: '请输入排序值' }]}
          >
            <InputNumber placeholder="请输入排序值" min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="is_active" label="状态" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingMenu ? '更新' : '创建'}
              </Button>
              <Button onClick={closeModal}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}

export default MenuManagement
