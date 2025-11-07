import React, { useEffect, useState } from 'react'
import { Card, Descriptions, Tag, Space, Button, Table, Modal, message } from 'antd'
import type { CooperationRecordDetail, CooperationProduct, CooperationProductUpdate } from '@/types'
import { cooperationRecordService } from '@/services/cooperationRecordService'

interface CooperationRecordDetailProps {
  recordId: number
  onClose: () => void
}

const CooperationRecordDetail: React.FC<CooperationRecordDetailProps> = ({ recordId, onClose }) => {
  const [record, setRecord] = useState<CooperationRecordDetail | null>(null)
  const [products, setProducts] = useState<CooperationProduct[]>([])
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const r = await cooperationRecordService.getCooperationRecord(recordId)
      setRecord(r)
      const p = await cooperationRecordService.getCooperationProducts(recordId)
      setProducts(p)
    } catch (error) {
      // axios 拦截器处理错误
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [recordId])

  const getStatusTag = (status?: number) => {
      const colors: string[] = ['orange', 'blue', 'purple', 'green', 'red']
      const labels: string[] = ['待确认', '已确认', '进行中', '已完成', '已取消']
      if (status === undefined || status === null) return <Tag>未设置</Tag>
      const idx = Number(status)
      return <Tag color={colors[idx] || 'default'}>{labels[idx] || String(status)}</Tag>
    }

  const columns = [
    { title: '商品名称', dataIndex: 'product_name', key: 'product_name' },
    { title: '商品编号', dataIndex: 'product_code', key: 'product_code' },
    { title: '价格', dataIndex: 'price', key: 'price' },
    { title: '平台', dataIndex: 'cooperation_platform', key: 'cooperation_platform' },
    { title: '拍单号', dataIndex: 'order_number', key: 'order_number' },
    { title: '外部编号', dataIndex: 'external_number', key: 'external_number' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, item: CooperationProduct) => (
        <Space>
          <Button type="link" onClick={() => handleEditProduct(item)}>编辑</Button>
          <Button danger type="link" onClick={() => handleDeleteProduct(item.id)}>删除</Button>
        </Space>
      )
    }
  ]

  const handleEditProduct = (product: CooperationProduct) => {
    Modal.confirm({
      title: '编辑合作商品（简版）',
      content: '确认更新此商品为示例更新（将价格+1）？',
      onOk: async () => {
        const payload: CooperationProductUpdate = { price: Number(product.price) + 1 }
        const updated = await cooperationRecordService.updateCooperationProduct(product.id, payload)
        setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)))
        message.success('更新成功')
      }
    })
  }

  const handleDeleteProduct = async (productId: number) => {
    await cooperationRecordService.deleteCooperationProduct(productId)
    setProducts(prev => prev.filter(p => p.id !== productId))
    message.success('删除成功')
  }

  if (!record) return null

  return (
    <div>
      <div style={{ textAlign: 'right', marginBottom: 8 }}>
        <Button onClick={onClose}>关闭</Button>
      </div>
      <Card title="合作记录详情" loading={loading}>
        <Descriptions column={2} size="small">
          <Descriptions.Item label="达人">{record.influencer_name || `ID: ${record.influencer_id}`}</Descriptions.Item>
          <Descriptions.Item label="建联类型">{record.contact_record_type || '-'}</Descriptions.Item>
          <Descriptions.Item label="合作状态">{getStatusTag(record.cooperation_status)}</Descriptions.Item>
          <Descriptions.Item label="备注" span={2}>{record.notes || '-'}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{new Date(record.created_at).toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label="更新时间">{new Date(record.updated_at).toLocaleString()}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="合作商品" style={{ marginTop: 16 }}>
        <Table rowKey="id" columns={columns as any} dataSource={products} pagination={false} />
      </Card>
    </div>
  )
}

export default CooperationRecordDetail