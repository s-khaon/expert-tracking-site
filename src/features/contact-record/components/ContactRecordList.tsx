import React, { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  message,
  Popconfirm,
  Card,
  Timeline,
  Typography,
  Divider,
  Row,
  Col
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons'
import type { ContactRecord, ContactRecordSearchParams } from '@/types'
import { contactRecordService } from '@/services/contactRecordService'
import ContactRecordForm from './ContactRecordForm'

const { Text } = Typography

interface ContactRecordListProps {
  influencerId: number
  visible: boolean
  onClose: () => void
  showAsModal?: boolean // 新增属性，控制是否显示为Modal
}

const ContactRecordList: React.FC<ContactRecordListProps> = ({
  influencerId,
  visible,
  onClose,
  showAsModal = true
}) => {
  const [records, setRecords] = useState<ContactRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [formVisible, setFormVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState<ContactRecord | null>(null)
  const [timelineVisible, setTimelineVisible] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })

  const fetchRecords = async (params?: Partial<ContactRecordSearchParams>) => {
    try {
      setLoading(true)
      const response = await contactRecordService.getContactRecordsByInfluencer(
        influencerId,
        {
          page: pagination.current,
          page_size: pagination.pageSize,
          ...params
        }
      )
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

  useEffect(() => {
    if (visible && influencerId) {
      fetchRecords()
    }
  }, [visible, influencerId, pagination.current, pagination.pageSize])

  const handleCreate = () => {
    setEditingRecord(null)
    setFormVisible(true)
  }

  const handleEdit = (record: ContactRecord) => {
    setEditingRecord(record)
    setFormVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await contactRecordService.deleteContactRecord(id)
      message.success('删除成功')
      fetchRecords()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleFormSuccess = () => {
    setFormVisible(false)
    setEditingRecord(null)
    fetchRecords()
  }

  const handleMarkFollowUpComplete = async (id: number) => {
    try {
      await contactRecordService.markFollowUpCompleted(id)
      message.success('标记跟进完成')
      fetchRecords()
    } catch (error) {
      message.error('操作失败')
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

  const columns = [
    {
      title: '联系时间',
      dataIndex: 'contact_date',
      key: 'contact_date',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: '联系类型',
      dataIndex: 'contact_type',
      key: 'contact_type',
      width: 100,
      render: (type: string) => (
        <Tag color={getContactTypeColor(type)}>
          {getContactTypeText(type)}
        </Tag>
      )
    },
    {
      title: '联系方式',
      dataIndex: 'contact_method',
      key: 'contact_method',
      width: 100
    },
    {
      title: '联系人',
      dataIndex: 'contact_person',
      key: 'contact_person',
      width: 100
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
      width: 100,
      render: (result: string) => (
        <Tag color={getContactResultColor(result)}>
          {getContactResultText(result)}
        </Tag>
      )
    },
    {
      title: '跟进状态',
      dataIndex: 'follow_up_required',
      key: 'follow_up_required',
      width: 100,
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
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: ContactRecord) => (
        <Space size="small">
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
                  <Text strong>{record.contact_date ? new Date(record.contact_date).toLocaleString() : '未设置'}</Text>
                </Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                  <Space>
                    <Tag color={getContactTypeColor(record.contact_type)}>
                      {getContactTypeText(record.contact_type)}
                    </Tag>
                    <Tag color={record.contact_result ? getContactResultColor(record.contact_result) : 'default'}>
                      {record.contact_result ? getContactResultText(record.contact_result) : '未设置'}
                    </Tag>
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
            </Card>
          </Timeline.Item>
        ))}
      </Timeline>
    )
  }

  const content = (
    <>
      <div style={{ marginBottom: 16 }}>
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
        </Space>
      </div>

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
          scroll={{ y: 400 }}
        />
      )}

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
          influencerId={influencerId}
          onSuccess={handleFormSuccess}
          onCancel={() => setFormVisible(false)}
        />
      </Modal>
    </>
  )

  if (showAsModal) {
    return (
      <Modal
        title="建联记录"
        open={visible}
        onCancel={onClose}
        width={1200}
        footer={null}
        destroyOnHidden
      >
        {content}
      </Modal>
    )
  }

  return content
}

export default ContactRecordList