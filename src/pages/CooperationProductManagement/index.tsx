import React, { useEffect, useState, useCallback } from 'react'
import { Table, Input, Space, Button, message, Modal, Form, InputNumber } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { CooperationProduct, CooperationProductListResponse, CooperationProductSearchParams, CooperationProductCreate, CooperationProductUpdate } from '@/types'
import { cooperationRecordService } from '@/services/cooperationRecordService'

const CooperationProductManagement: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState<string>('')
  const [data, setData] = useState<CooperationProduct[]>([])
  const [page, setPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [total, setTotal] = useState<number>(0)
  const [createVisible, setCreateVisible] = useState<boolean>(false)
  const [editVisible, setEditVisible] = useState<boolean>(false)
  const [editing, setEditing] = useState<CooperationProduct | null>(null)
  const [createForm] = Form.useForm<CooperationProductCreate>()
  const [editForm] = Form.useForm<CooperationProductUpdate>()

  const fetchData = useCallback(async (p?: number, ps?: number, s?: string) => {
    setLoading(true)
    try {
      const params: CooperationProductSearchParams = {
        page: p ?? page,
        page_size: ps ?? pageSize,
        search: s ?? search,
        order_by: 'created_at',
        order_direction: 'desc',
      }
      const res: CooperationProductListResponse = await cooperationRecordService.getAllCooperationProducts(params)
      setData(res.items)
      setTotal(res.total)
      setPage(res.page)
      setPageSize(res.page_size)
    } catch (err) {
      message.error('加载合作商品失败')
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search])

  useEffect(() => {
    fetchData(1, pageSize, search)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSearch = (value: string) => {
    setSearch(value)
    fetchData(1, pageSize, value)
  }

  const handleDelete = async (productId: number) => {
    try {
      await cooperationRecordService.deleteCooperationProduct(productId)
      message.success('删除成功')
      fetchData()
    } catch (err) {
      message.error('删除失败')
    }
  }

  const columns: ColumnsType<CooperationProduct> = [
    { title: '商品名称', dataIndex: 'product_name', key: 'product_name' },
    { title: '商品编号', dataIndex: 'product_code', key: 'product_code' },
    { title: '价格', dataIndex: 'price', key: 'price' },
    { title: '佣金比例(%)', dataIndex: 'commission_rate', key: 'commission_rate' },
    { title: '备注', dataIndex: 'notes', key: 'notes' },
    { title: '记录ID', dataIndex: 'cooperation_record_id', key: 'cooperation_record_id' },
    { title: '创建时间', dataIndex: 'created_at', key: 'created_at' },
    {
      title: '操作',
      key: 'action',
      render: (_value, record) => (
        <Space>
          <Button onClick={() => onEdit(record)}>编辑</Button>
          <Button danger onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      )
    }
  ]

  const onEdit = (record: CooperationProduct) => {
    setEditing(record)
    editForm.setFieldsValue({
      product_name: record.product_name,
      product_code: record.product_code,
      price: record.price,
      commission_rate: record.commission_rate,
      notes: record.notes,
    })
    setEditVisible(true)
  }

  const submitCreate = async () => {
    try {
      const values = await createForm.validateFields()
      await cooperationRecordService.createProduct(values)
      message.success('创建成功')
      setCreateVisible(false)
      createForm.resetFields()
      fetchData()
    } catch (err) {
      // 校验或请求错误提示由拦截器/表单自身处理
    }
  }

  const submitEdit = async () => {
    if (!editing) return
    try {
      const values = await editForm.validateFields()
      await cooperationRecordService.updateCooperationProduct(editing.id, values)
      message.success('更新成功')
      setEditVisible(false)
      setEditing(null)
      editForm.resetFields()
      fetchData()
    } catch (err) {
      // 错误提示由拦截器/表单自身处理
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="搜索商品名称/编号/备注"
          onSearch={onSearch}
          allowClear
          enterButton
          style={{ width: 360 }}
        />
        <Button type="primary" onClick={() => setCreateVisible(true)}>新增商品</Button>
        <Button onClick={() => fetchData()}>刷新</Button>
      </Space>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={data}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          onChange: (p, ps) => fetchData(p, ps, search)
        }}
      />

      <Modal
        title="新增商品"
        open={createVisible}
        onOk={submitCreate}
        onCancel={() => setCreateVisible(false)}
        destroyOnClose
      >
        <Form form={createForm} layout="vertical">
          <Form.Item name="product_name" label="商品名称" rules={[{ required: true, message: '请输入商品名称' }]}>
            <Input placeholder="请输入商品名称" />
          </Form.Item>
          <Form.Item name="product_code" label="商品编号" rules={[{ required: true, message: '请输入商品编号' }]}>
            <Input placeholder="请输入商品编号" />
          </Form.Item>
          <Form.Item name="price" label="价格" rules={[{ required: true, message: '请输入价格' }]}>
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="请输入价格" />
          </Form.Item>
          <Form.Item name="commission_rate" label="佣金比例(%)">
            <InputNumber min={0} max={100} step={0.01} style={{ width: '100%' }} placeholder="请输入佣金比例(%)" />
          </Form.Item>
          <Form.Item name="notes" label="备注">
            <Input.TextArea rows={3} placeholder="备注" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="编辑商品"
        open={editVisible}
        onOk={submitEdit}
        onCancel={() => setEditVisible(false)}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="product_name" label="商品名称" rules={[{ required: true, message: '请输入商品名称' }]}>
            <Input placeholder="请输入商品名称" />
          </Form.Item>
          <Form.Item name="product_code" label="商品编号" rules={[{ required: true, message: '请输入商品编号' }]}>
            <Input placeholder="请输入商品编号" />
          </Form.Item>
          <Form.Item name="price" label="价格" rules={[{ required: true, message: '请输入价格' }]}>
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="请输入价格" />
          </Form.Item>
          <Form.Item name="commission_rate" label="佣金比例(%)">
            <InputNumber min={0} max={100} step={0.01} style={{ width: '100%' }} placeholder="请输入佣金比例(%)" />
          </Form.Item>
          <Form.Item name="notes" label="备注">
            <Input.TextArea rows={3} placeholder="备注" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default CooperationProductManagement