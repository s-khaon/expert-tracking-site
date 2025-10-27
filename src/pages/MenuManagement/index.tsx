import React, { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  message,
  Popconfirm,
  Card,
  Row,
  Col,
  Tag,
  TreeSelect,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { menuService } from '../../services/menuService'
import type { Menu, MenuCreate, MenuUpdate } from '../../types'

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
    } catch (error) {
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
      if (editingMenu) {
        await menuService.updateMenu(editingMenu.id, values)
        message.success('菜单更新成功')
      } else {
        await menuService.createMenu(values as MenuCreate)
        message.success('菜单创建成功')
      }
      closeModal()
      fetchMenus()
    } catch (error) {
      message.error(editingMenu ? '菜单更新失败' : '菜单创建失败')
    }
  }

  // 删除菜单
  const handleDelete = async (id: number) => {
    try {
      await menuService.deleteMenu(id)
      message.success('菜单删除成功')
      fetchMenus()
    } catch (error) {
      message.error('菜单删除失败')
    }
  }

  // 将菜单树转换为平铺列表用于表格显示
  const flattenMenus = (menus: Menu[], level = 0): (Menu & { level: number })[] => {
    const result: (Menu & { level: number })[] = []
    menus.forEach(menu => {
      result.push({ ...menu, level })
      if (menu.children && menu.children.length > 0) {
        result.push(...flattenMenus(menu.children, level + 1))
      }
    })
    return result
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

  const flatMenus = flattenMenus(menus)

  // 表格列定义
  const columns: ColumnsType<Menu & { level: number }> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '菜单名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record) => (
        <span style={{ paddingLeft: record.level * 20 }}>
          {record.level > 0 && '└─ '}
          {text}
        </span>
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
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          >
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
            dataSource={flatMenus}
            rowKey="id"
            loading={loading}
            pagination={false}
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

          <Form.Item name="description" label="菜单描述">
            <Input.TextArea placeholder="请输入菜单描述" rows={3} />
          </Form.Item>

          <Form.Item
            name="sort_order"
            label="排序"
            rules={[{ required: true, message: '请输入排序值' }]}
          >
            <InputNumber
              placeholder="请输入排序值"
              min={0}
              style={{ width: '100%' }}
            />
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