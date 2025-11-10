import React, { useEffect, useState, useCallback } from 'react'
import { Table, Input, Space, Button, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { CooperationProduct, CooperationProductListResponse, CooperationProductSearchParams } from '@/types'
import { cooperationRecordService } from '@/services/cooperationRecordService'

const CooperationProductManagement: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState<string>('')
  const [data, setData] = useState<CooperationProduct[]>([])
  const [page, setPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [total, setTotal] = useState<number>(0)

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
    { title: '合作平台', dataIndex: 'cooperation_platform', key: 'cooperation_platform' },
    { title: '拍单号', dataIndex: 'order_number', key: 'order_number' },
    { title: '外部编号', dataIndex: 'external_number', key: 'external_number' },
    { title: '合作时间', dataIndex: 'cooperation_time', key: 'cooperation_time' },
    { title: '达人ID', dataIndex: 'influencer_id', key: 'influencer_id' },
    { title: '记录ID', dataIndex: 'cooperation_record_id', key: 'cooperation_record_id' },
    {
      title: '操作',
      key: 'action',
      render: (_value, record) => (
        <Space>
          <Button danger onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      )
    }
  ]

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="搜索商品名称/编号/平台/备注"
          onSearch={onSearch}
          allowClear
          enterButton
          style={{ width: 360 }}
        />
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
    </div>
  )
}

export default CooperationProductManagement