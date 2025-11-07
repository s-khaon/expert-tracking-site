import CooperationRecordDetailComponent from '@/features/cooperation-record/components/CooperationRecordDetail'
import CooperationRecordForm from '@/features/cooperation-record/components/CooperationRecordForm'
import type {
  CooperationRecordDetail,
  CooperationRecordSearchParams,
  InfluencerSimple,
} from '@/types'
import { cooperationRecordService } from '@services/cooperationRecordService'
import { influencerService } from '@services/influencerService'
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Spin,
  message,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import React, { useEffect, useRef, useState } from 'react'

const { RangePicker } = DatePicker


const statusColors: string[] = ['orange','blue','purple','green','red']
const statusLabels: string[] = ['待确认','已确认','进行中','已完成','已取消']
const CooperationRecordManagement: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState<CooperationRecordDetail[]>([])
  const [total, setTotal] = useState(0)
  const [params, setParams] = useState<CooperationRecordSearchParams>({ page: 1, page_size: 10 })

  const [influencerOptions, setInfluencerOptions] = useState<InfluencerSimple[]>([])
  const [influencerLoading, setInfluencerLoading] = useState(false)
  const [influencerPage, setInfluencerPage] = useState(1)
  const [influencerPageSize] = useState(20)
  const [influencerHasMore, setInfluencerHasMore] = useState(false)
  const [influencerQuery, setInfluencerQuery] = useState('')
  const influencerSearchTimer = useRef<any>(null)

  const [formVisible, setFormVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState<CooperationRecordDetail | null>(null)
  const [viewingRecord, setViewingRecord] = useState<CooperationRecordDetail | null>(null)

  const fetchRecords = async () => {
    try {
      setLoading(true)
      const res = await cooperationRecordService.getCooperationRecords(params)
      setRecords(res.items || [])
      setTotal(res.total || 0)
    } catch (err) {
      console.error(err)
      message.error('获取合作记录失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchInfluencers = async (
    query: string,
    page: number,
    append: boolean = false
  ) => {
    try {
      setInfluencerLoading(true)
      const res = await influencerService.getInfluencers({
        page,
        page_size: influencerPageSize,
        search: query || undefined,
      })
      const simplified = (res.items || []).map(i => ({ id: i.id, name: i.name, nickname: i.nickname }))
      setInfluencerOptions(prev => (append ? [...prev, ...simplified] : simplified))
      setInfluencerHasMore(page < (res.pages || 1))
      setInfluencerPage(page)
    } catch (err) {
      console.error(err)
    } finally {
      setInfluencerLoading(false)
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [
    params.page,
    params.page_size,
    params.search,
    params.cooperation_status,
    params.influencer_id,
    params.start_date,
    params.end_date,
  ])

  const handleInfluencerDropdownVisibleChange = (open: boolean) => {
    if (open && influencerOptions.length === 0) {
      setInfluencerQuery('')
      fetchInfluencers('', 1, false)
    }
  }

  const handleInfluencerSearch = (value: string) => {
    setInfluencerQuery(value)
    if (influencerSearchTimer.current) {
      clearTimeout(influencerSearchTimer.current)
    }
    influencerSearchTimer.current = setTimeout(() => {
      fetchInfluencers(value, 1, false)
    }, 300)
  }

  const loadMoreInfluencers = () => {
    if (influencerLoading || !influencerHasMore) return
    fetchInfluencers(influencerQuery, influencerPage + 1, true)
  }

  const handleSearch = (values: any) => {
    const next: CooperationRecordSearchParams = { ...params, page: 1 }
    if (values.search) next.search = values.search
    if (values.cooperation_status) next.cooperation_status = values.cooperation_status
    if (values.influencer_id) next.influencer_id = values.influencer_id
    if (values.dateRange && values.dateRange.length === 2) {
      next.start_date = values.dateRange[0].format('YYYY-MM-DD')
      next.end_date = values.dateRange[1].format('YYYY-MM-DD')
    } else {
      next.start_date = undefined
      next.end_date = undefined
    }
    setParams(next)
  }

  const handleReset = () => {
    setParams({ page: 1, page_size: params.page_size })
  }

  const handleCreate = () => {
    // 创建合作记录需先选择达人
    if (!params.influencer_id) {
      message.warning('请先在筛选区域选择达人，再创建合作记录')
      return
    }
    setEditingRecord(null)
    setFormVisible(true)
  }

  const handleEdit = (record: CooperationRecordDetail) => {
    setEditingRecord(record)
    setFormVisible(true)
  }

  const handleView = async (record: CooperationRecordDetail) => {
    try {
      const detail = await cooperationRecordService.getCooperationRecord(record.id)
      setViewingRecord(detail)
      setDetailVisible(true)
    } catch (err) {
      console.error(err)
      message.error('获取详情失败')
    }
  }

  const handleDelete = async (record: CooperationRecordDetail) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后不可恢复，是否继续？',
      okText: '删除',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await cooperationRecordService.deleteCooperationRecord(record.id)
          message.success('已删除')
          fetchRecords()
        } catch (err) {
          console.error(err)
          message.error('删除失败')
        }
      },
    })
  }

  const columns: ColumnsType<CooperationRecordDetail> = [
    {
      title: '达人',
      dataIndex: 'influencer_name',
      key: 'influencer_name',
      render: (text, record) => text || record.influencer_id,
    },
    {
      title: '合作状态',
      dataIndex: 'cooperation_status',
      key: 'cooperation_status',
      render: (status: number) => <Tag color={statusColors[status] || 'default'}>{statusLabels[status] || String(status)}</Tag>,
    },
        {
      title: '商品数',
      key: 'product_count',
      render: (_, record) => record.products?.length || 0,
    },
    {
      title: '备注',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: string) => (text ? dayjs(text).format('YYYY-MM-DD HH:mm') : '-'),
    },
    {
      title: '操作',
      key: 'actions',
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => handleView(record)}>
            查看
          </Button>
          <Button size="small" type="primary" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button size="small" danger onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      <Card>
        <Form
          layout="inline"
          onFinish={handleSearch}
          initialValues={{ page_size: params.page_size }}
        >
          <Form.Item name="search">
            <Input
              allowClear
              placeholder="搜索关键词（达人、备注、商品等）"
              style={{ width: 260 }}
            />
          </Form.Item>
          <Form.Item name="influencer_id">
            <Select
              allowClear
              showSearch
              filterOption={false}
              placeholder="选择达人"
              style={{ width: 220 }}
              options={influencerOptions.map(i => ({
                label: i.nickname ? `${i.name}（${i.nickname}）` : i.name,
                value: i.id,
              }))}
              onSearch={handleInfluencerSearch}
              onDropdownVisibleChange={handleInfluencerDropdownVisibleChange}
              notFoundContent={influencerLoading ? <Spin size="small" /> : null}
              dropdownRender={menu => (
                <div>
                  {menu}
                  <div style={{ display: 'flex', justifyContent: 'center', padding: 8 }}>
                    <Button
                      size="small"
                      onClick={loadMoreInfluencers}
                      disabled={!influencerHasMore || influencerLoading}
                    >
                      {influencerLoading ? '加载中...' : influencerHasMore ? '加载更多' : '没有更多了'}
                    </Button>
                  </div>
                </div>
              )}
            />
          </Form.Item>
          <Form.Item name="cooperation_status">
            <Select
              allowClear
              placeholder="合作状态"
              style={{ width: 160 }}
              options={[
                { label: '待确认', value: 0 },
                { label: '已确认', value: 1 },
                { label: '进行中', value: 2 },
                { label: '已完成', value: 3 },
                { label: '已取消', value: 4 },
              ]}
            />
          </Form.Item>
          <Form.Item name="dateRange">
            <RangePicker />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                搜索
              </Button>
              <Button onClick={handleReset}>重置</Button>
              <Button type="dashed" onClick={handleCreate}>
                新增合作记录
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card>
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={records}
          pagination={{
            current: params.page,
            pageSize: params.page_size,
            total,
            showSizeChanger: true,
            onChange: (page, pageSize) => setParams({ ...params, page, page_size: pageSize }),
          }}
        />
      </Card>

      <Modal
        title={editingRecord ? '编辑合作记录' : '新增合作记录'}
        open={formVisible}
        onCancel={() => {
          setFormVisible(false)
          setEditingRecord(null)
        }}
        footer={null}
        destroyOnClose
        width={720}
      >
        <CooperationRecordForm
          influencerId={editingRecord ? undefined : params.influencer_id}
          record={editingRecord}
          onCancel={() => {
            setFormVisible(false)
            setEditingRecord(null)
          }}
          onSuccess={() => {
            setFormVisible(false)
            setEditingRecord(null)
            fetchRecords()
          }}
        />
      </Modal>

      <Modal
        title="合作记录详情"
        open={detailVisible}
        onCancel={() => {
          setDetailVisible(false)
          setViewingRecord(null)
        }}
        footer={null}
        destroyOnClose
        width={720}
      >
        {viewingRecord && (
          <CooperationRecordDetailComponent
            recordId={viewingRecord.id}
            onClose={() => {
              setDetailVisible(false)
              setViewingRecord(null)
            }}
          />
        )}
      </Modal>
    </Space>
  )
}

export default CooperationRecordManagement
