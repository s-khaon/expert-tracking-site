import React, { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  DatePicker,
  Card,
  Tag,
  Modal,
  message,
  Popconfirm,
  Row,
  Col,
  Statistic,
  Timeline,
  Typography,
  Divider,
  AutoComplete
} from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ExportOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  UserOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { ContactRecord, ContactRecordSearchParams } from '@/types'
import { contactRecordService } from '@/services/contactRecordService'
import { influencerService } from '@/services/influencerService'
import ContactRecordForm from './components/ContactRecordForm'
import ContactRecordDetail from './components/ContactRecordDetail'

const { RangePicker } = DatePicker
const { Option } = Select
const { Text } = Typography

const ContactRecordManagement: React.FC = () => {
  const [records, setRecords] = useState<ContactRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [formVisible, setFormVisible] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [timelineVisible, setTimelineVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState<ContactRecord | null>(null)
  const [viewingRecord, setViewingRecord] = useState<ContactRecord | null>(null)
  const [selectedInfluencerId, setSelectedInfluencerId] = useState<number | null>(null)
  const [influencerOptions, setInfluencerOptions] = useState<{ value: number; label: string }[]>([])
  const [influencerSearchLoading, setInfluencerSearchLoading] = useState(false)
  const [searchParams, setSearchParams] = useState<ContactRecordSearchParams>({
    page: 1,
    page_size: 10
  })
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })
  const [statistics, setStatistics] = useState({
    total: 0,
    by_type: {} as Record<string, number>,
    by_result: {} as Record<string, number>,
    pending_follow_up: 0
  })

  // 获取建联记录列表
  const fetchRecords = async (params?: Partial<ContactRecordSearchParams>) => {
    try {
      setLoading(true)
      const response = await contactRecordService.getContactRecords({
        ...searchParams,
        ...params
      })
      setRecords(response.items)
      setPagination(prev => ({
        ...prev,
        total: response.total
      }))
    } catch (error) {
      message.error('获取建联记录失败')
    } finally {
      setLoading(false)
    }
  }



  // 搜索达人（用于筛选）
  const searchInfluencers = async (search: string) => {
    if (!search.trim()) {
      setInfluencerOptions([])
      return
    }
    
    try {
      setInfluencerSearchLoading(true)
      const response = await influencerService.getInfluencers({
        page: 1,
        page_size: 20, // 限制搜索结果数量
        search: search.trim()
      })
      
      const options = response.items.map(influencer => ({
        value: influencer.id,
        label: `${influencer.name} (${influencer.nickname || 'ID: ' + influencer.id})`
      }))
      
      setInfluencerOptions(options)
    } catch (error) {
      console.error('搜索达人失败')
      setInfluencerOptions([])
    } finally {
      setInfluencerSearchLoading(false)
    }
  }

  // 获取统计数据
  const fetchStatistics = async () => {
    try {
      const stats = await contactRecordService.getContactRecordStats()
      setStatistics(stats)
    } catch (error) {
      console.error('获取统计数据失败')
    }
  }

  useEffect(() => {
    fetchRecords()
    fetchStatistics()
  }, [])

  useEffect(() => {
    fetchRecords()
  }, [pagination.current, pagination.pageSize])

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }))
    fetchRecords({ page: 1 })
  }

  const handleReset = () => {
    setSearchParams({ page: 1, page_size: 10 })
    setPagination({ current: 1, pageSize: 10, total: 0 })
    fetchRecords({ page: 1, page_size: 10 })
  }

  const handleCreate = () => {
    setEditingRecord(null)
    setSelectedInfluencerId(null)
    setFormVisible(true)
  }

  const handleEdit = (record: ContactRecord) => {
    setEditingRecord(record)
    setSelectedInfluencerId(record.influencer_id)
    setFormVisible(true)
  }

  const handleView = (record: ContactRecord) => {
    setViewingRecord(record)
    setDetailVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await contactRecordService.deleteContactRecord(id)
      message.success('删除成功')
      fetchRecords()
      fetchStatistics()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleFormSuccess = () => {
    setFormVisible(false)
    setEditingRecord(null)
    setSelectedInfluencerId(null)
    fetchRecords()
    fetchStatistics()
  }

  const handleMarkFollowUpComplete = async (id: number) => {
    try {
      await contactRecordService.markFollowUpCompleted(id)
      message.success('标记跟进完成')
      fetchRecords()
      fetchStatistics()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleExport = async () => {
    try {
      await contactRecordService.exportContactRecords(searchParams)
      message.success('导出成功')
    } catch (error) {
      message.error('导出失败')
    }
  }

  const getContactTypeColor = (type: string) => {
    const colors = {
      initial: 'blue',
      follow_up: 'orange',
      negotiation: 'purple',
      contract: 'green',
      cooperation: 'cyan',
      maintenance: 'gold'
    }
    return colors[type as keyof typeof colors] || 'default'
  }

  const getContactTypeText = (type: string) => {
    const texts = {
      initial: '初次联系',
      follow_up: '跟进',
      negotiation: '商务洽谈',
      contract: '合同签署',
      cooperation: '合作执行',
      maintenance: '关系维护'
    }
    return texts[type as keyof typeof texts] || type
  }

  const getContactResultColor = (result: string) => {
    const colors = {
      successful: 'green',
      failed: 'red',
      pending: 'orange',
      no_response: 'gray'
    }
    return colors[result as keyof typeof colors] || 'default'
  }

  const getContactResultText = (result: string) => {
    const texts = {
      successful: '成功',
      failed: '失败',
      pending: '待回复',
      no_response: '无回应'
    }
    return texts[result as keyof typeof texts] || result
  }

  const columns: ColumnsType<ContactRecord> = [
    {
      title: '达人',
      dataIndex: 'influencer_name',
      key: 'influencer_name',
      width: 120,
      render: (name: string, record: ContactRecord) => (
        <Space>
          <UserOutlined />
          <Text>{name || `ID: ${record.influencer_id}`}</Text>
        </Space>
      )
    },
    {
      title: '联系时间',
      dataIndex: 'contact_date',
      key: 'contact_date',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: true
    },
    {
      title: '联系类型',
      dataIndex: 'contact_type',
      key: 'contact_type',
      width: 120,
      render: (type: string) => (
        <Tag color={getContactTypeColor(type)}>
          {getContactTypeText(type)}
        </Tag>
      ),
      filters: [
        { text: '初次联系', value: 'initial' },
        { text: '跟进', value: 'follow_up' },
        { text: '商务洽谈', value: 'negotiation' },
        { text: '合同签署', value: 'contract' },
        { text: '合作执行', value: 'cooperation' },
        { text: '关系维护', value: 'maintenance' }
      ]
    },
    {
      title: '联系方式',
      dataIndex: 'contact_method',
      key: 'contact_method',
      width: 120
    },
    {
      title: '联系人',
      dataIndex: 'contact_person',
      key: 'contact_person',
      width: 120
    },
    {
      title: '联系内容',
      dataIndex: 'contact_content',
      key: 'contact_content',
      ellipsis: true,
      render: (content: string) => (
        <Text ellipsis={{ tooltip: content }} style={{ maxWidth: 200 }}>
          {content}
        </Text>
      )
    },
    {
      title: '联系结果',
      dataIndex: 'contact_result',
      key: 'contact_result',
      width: 120,
      render: (result: string) => (
        <Tag color={getContactResultColor(result)}>
          {getContactResultText(result)}
        </Tag>
      ),
      filters: [
        { text: '成功', value: 'successful' },
        { text: '失败', value: 'failed' },
        { text: '待回复', value: 'pending' },
        { text: '无回应', value: 'no_response' }
      ]
    },
    {
      title: '跟进状态',
      dataIndex: 'follow_up_required',
      key: 'follow_up_required',
      width: 120,
      render: (required: string) => {
        if (required === 'yes') {
          return (
            <Tag color="orange" icon={<ClockCircleOutlined />}>
              待跟进
            </Tag>
          )
        } else if (required === 'completed') {
          return (
            <Tag color="green" icon={<CheckCircleOutlined />}>
              已完成
            </Tag>
          )
        }
        return (
          <Tag color="default">
            无需跟进
          </Tag>
        )
      },
      filters: [
        { text: '待跟进', value: 'yes' },
        { text: '已完成', value: 'completed' },
        { text: '无需跟进', value: 'no' }
      ]
    },
    {
      title: '跟进日期',
      dataIndex: 'follow_up_date',
      key: 'follow_up_date',
      width: 120,
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record: ContactRecord) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          {record.follow_up_required === 'yes' && (
            <Button
              type="link"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleMarkFollowUpComplete(record.id)}
            >
              完成跟进
            </Button>
          )}
          <Popconfirm
            title="确定要删除这条记录吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  const renderTimeline = () => {
    const sortedRecords = [...records].sort((a, b) => 
      (b.contact_date ? new Date(b.contact_date).getTime() : 0) - (a.contact_date ? new Date(a.contact_date).getTime() : 0)
    )

    return (
      <Timeline>
        {sortedRecords.map((record) => (
          <Timeline.Item
            key={record.id}
            color={record.contact_result ? getContactResultColor(record.contact_result) : 'default'}
          >
            <Card size="small" style={{ marginBottom: 8 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Space>
                    <UserOutlined />
                    <Text strong>{record.influencer_name || `达人ID: ${record.influencer_id}`}</Text>
                  </Space>
                </Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                  <Text type="secondary">{record.contact_date ? new Date(record.contact_date).toLocaleString() : '未设置'}</Text>
                </Col>
              </Row>
              <Row gutter={16} style={{ marginTop: 8 }}>
                <Col span={24}>
                  <Space>
                    <Tag color={getContactTypeColor(record.contact_type)}>
                      {getContactTypeText(record.contact_type)}
                    </Tag>
                    <Tag color={record.contact_result ? getContactResultColor(record.contact_result) : 'default'}>
                      {record.contact_result ? getContactResultText(record.contact_result) : '未设置'}
                    </Tag>
                    {record.follow_up_required === 'yes' && (
                      <Tag color="orange" icon={<ClockCircleOutlined />}>
                        待跟进
                      </Tag>
                    )}
                  </Space>
                </Col>
              </Row>
              <Divider style={{ margin: '8px 0' }} />
              <div>
                <Text type="secondary">联系方式：</Text>
                <Text>{record.contact_method}</Text>
                {record.contact_person && (
                  <>
                    <Divider type="vertical" />
                    <Text type="secondary">联系人：</Text>
                    <Text>{record.contact_person}</Text>
                  </>
                )}
              </div>
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">联系内容：</Text>
                <div style={{ marginTop: 4 }}>
                  <Text>{record.contact_content}</Text>
                </div>
              </div>
              {record.follow_up_notes && (
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">跟进备注：</Text>
                  <div style={{ marginTop: 4 }}>
                    <Text>{record.follow_up_notes}</Text>
                  </div>
                </div>
              )}
              <div style={{ marginTop: 8, textAlign: 'right' }}>
                <Space size="small">
                  <Button
                    type="link"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => handleView(record)}
                  >
                    查看
                  </Button>
                  <Button
                    type="link"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(record)}
                  >
                    编辑
                  </Button>
                </Space>
              </div>
            </Card>
          </Timeline.Item>
        ))}
      </Timeline>
    )
  }

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总记录数"
              value={statistics.total}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待跟进"
              value={statistics.pending_follow_up}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日完成"
              value={0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="本周记录"
              value={0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 搜索筛选区域 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Input
              placeholder="搜索联系内容"
              prefix={<SearchOutlined />}
              value={searchParams.search}
              onChange={(e) => setSearchParams(prev => ({ ...prev, search: e.target.value }))}
              onPressEnter={handleSearch}
            />
          </Col>
          <Col span={4}>
            <AutoComplete
              placeholder="搜索达人"
              allowClear
              value={searchParams.influencer_id}
              onChange={(value) => setSearchParams(prev => ({ ...prev, influencer_id: value }))}
              onSearch={searchInfluencers}
              options={influencerOptions}
              style={{ width: '100%' }}
              filterOption={false}
              notFoundContent={influencerSearchLoading ? '搜索中...' : '暂无数据'}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="联系类型"
              allowClear
              value={searchParams.contact_type}
              onChange={(value) => setSearchParams(prev => ({ ...prev, contact_type: value }))}
              style={{ width: '100%' }}
            >
              <Option value="initial">初次联系</Option>
              <Option value="follow_up">跟进</Option>
              <Option value="negotiation">商务洽谈</Option>
              <Option value="contract">合同签署</Option>
              <Option value="cooperation">合作执行</Option>
              <Option value="maintenance">关系维护</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="联系结果"
              allowClear
              value={searchParams.contact_result}
              onChange={(value) => setSearchParams(prev => ({ ...prev, contact_result: value }))}
              style={{ width: '100%' }}
            >
              <Option value="successful">成功</Option>
              <Option value="failed">失败</Option>
              <Option value="pending">待回复</Option>
              <Option value="no_response">无回应</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                搜索
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                重置
              </Button>
            </Space>
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={8}>
            <RangePicker
              placeholder={['开始日期', '结束日期']}
              onChange={(dates) => {
                if (dates) {
                  setSearchParams(prev => ({
                    ...prev,
                    start_date: dates[0]?.format('YYYY-MM-DD'),
                    end_date: dates[1]?.format('YYYY-MM-DD')
                  }))
                } else {
                  setSearchParams(prev => ({
                    ...prev,
                    start_date: undefined,
                    end_date: undefined
                  }))
                }
              }}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="跟进状态"
              allowClear
              value={searchParams.follow_up_required}
              onChange={(value) => setSearchParams(prev => ({ ...prev, follow_up_required: value }))}
              style={{ width: '100%' }}
            >
              <Option value="yes">待跟进</Option>
              <Option value="completed">已完成</Option>
              <Option value="no">无需跟进</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* 操作按钮区域 */}
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            新增记录
          </Button>
          <Button
            icon={<EyeOutlined />}
            onClick={() => setTimelineVisible(!timelineVisible)}
          >
            {timelineVisible ? '表格视图' : '时间线视图'}
          </Button>
          <Button
            icon={<ExportOutlined />}
            onClick={handleExport}
          >
            导出数据
          </Button>
        </Space>
      </Card>

      {/* 数据展示区域 */}
      <Card>
        {timelineVisible ? (
          <div style={{ maxHeight: 600, overflow: 'auto' }}>
            {renderTimeline()}
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={records}
            rowKey="id"
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
              onChange: (page, pageSize) => {
                setPagination(prev => ({
                  ...prev,
                  current: page,
                  pageSize: pageSize || 10
                }))
              }
            }}
            scroll={{ x: 1500 }}
          />
        )}
      </Card>

      {/* 表单弹窗 */}
      <Modal
        title={editingRecord ? '编辑建联记录' : '新增建联记录'}
        open={formVisible}
        onCancel={() => setFormVisible(false)}
        footer={null}
        width={800}
        destroyOnHidden
      >
        <ContactRecordForm
          contactRecord={editingRecord}
          influencerId={selectedInfluencerId}
          onSuccess={handleFormSuccess}
          onCancel={() => setFormVisible(false)}
        />
      </Modal>

      {/* 详情弹窗 */}
      <Modal
        title="建联记录详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={800}
        destroyOnHidden
      >
        {viewingRecord && (
          <ContactRecordDetail
            contactRecord={viewingRecord}
            onEdit={() => {
              setDetailVisible(false)
              handleEdit(viewingRecord)
            }}
            onClose={() => setDetailVisible(false)}
          />
        )}
      </Modal>
    </div>
  )
}

export default ContactRecordManagement