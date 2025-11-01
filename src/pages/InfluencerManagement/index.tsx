import React, { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  Card,
  Modal,
  message,
  Popconfirm,
  Tag,
  Tooltip,
  Row,
  Col,
  Drawer,
  Typography,

} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,

  ReloadOutlined,
  ExportOutlined,
  UserOutlined
} from '@ant-design/icons'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import type { Influencer, InfluencerSearchParams } from '@/types'
import { influencerService } from '@/services/influencerService'

import InfluencerForm from './components/InfluencerForm'
import InfluencerDetail from './components/InfluencerDetail'
import ContactRecordList from './components/ContactRecordList'

const { Search } = Input
const { Title } = Typography

const InfluencerManagement: React.FC = () => {
  const [influencers, setInfluencers] = useState<Influencer[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [searchParams, setSearchParams] = useState<InfluencerSearchParams>({
    page: 1,
    page_size: 10
  })

  // 表单相关状态
  const [formVisible, setFormVisible] = useState(false)
  const [editingInfluencer, setEditingInfluencer] = useState<Influencer | null>(null)
  
  // 详情相关状态
  const [detailVisible, setDetailVisible] = useState(false)
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null)
  
  // 建联记录相关状态
  const [contactRecordsVisible, setContactRecordsVisible] = useState(false)
  const [contactInfluencer, setContactInfluencer] = useState<Influencer | null>(null)

  // 获取达人列表
  const fetchInfluencers = async () => {
    try {
      setLoading(true)
      const response = await influencerService.getInfluencers(searchParams)
      setInfluencers(response.items)
      setTotal(response.total)
    } catch (error) {
      message.error('获取达人列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInfluencers()
  }, [searchParams])

  // 处理搜索
  const handleSearch = (value: string) => {
    setSearchParams(prev => ({
      ...prev,
      page: 1,
      search: value || undefined
    }))
  }



  // 处理分页
  const handleTableChange = (pagination: TablePaginationConfig) => {
    setSearchParams(prev => ({
      ...prev,
      page: pagination.current || 1,
      page_size: pagination.pageSize || 10
    }))
  }

  // 处理新增
  const handleAdd = () => {
    setEditingInfluencer(null)
    setFormVisible(true)
  }

  // 处理编辑
  const handleEdit = (record: Influencer) => {
    setEditingInfluencer(record)
    setFormVisible(true)
  }

  // 处理删除
  const handleDelete = async (id: number) => {
    try {
      await influencerService.deleteInfluencer(id)
      message.success('删除成功')
      fetchInfluencers()
    } catch (error) {
      message.error('删除失败')
    }
  }

  // 处理查看详情
  const handleViewDetail = (record: Influencer) => {
    setSelectedInfluencer(record)
    setDetailVisible(true)
  }

  // 处理查看建联记录
  const handleViewContactRecords = (record: Influencer) => {
    setContactInfluencer(record)
    setContactRecordsVisible(true)
  }

  // 处理表单提交成功
  const handleFormSuccess = () => {
    setFormVisible(false)
    setEditingInfluencer(null)
    fetchInfluencers()
  }



  // 表格列定义
  const columns: ColumnsType<Influencer> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: true
    },
    {
      title: '达人信息',
      key: 'info',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.name}</div>
          {record.nickname && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.nickname}
            </div>
          )}
        </div>
      )
    },
    {
      title: '联系方式',
      key: 'contact',
      width: 150,
      render: (_, record) => (
        <div style={{ fontSize: '12px' }}>
          {record.wechat && <div>💬 {record.wechat}</div>}
          {record.email && <div>📧 {record.email}</div>}
        </div>
      )
    },
    {
      title: '粉丝数据',
      key: 'followers',
      width: 150,
      render: (_, record) => (
        <div style={{ fontSize: '12px' }}>
          {record.douyin_followers && (
            <div>抖音: {(record.douyin_followers / 10000).toFixed(1)}万</div>
          )}
          {record.xiaohongshu_followers && (
            <div>小红书: {(record.xiaohongshu_followers / 10000).toFixed(1)}万</div>
          )}
          {record.wechat_channels_followers && (
            <div>视频号: {(record.wechat_channels_followers / 10000).toFixed(1)}万</div>
          )}
        </div>
      )
    },
    {
      title: '商务信息',
      key: 'business',
      width: 150,
      render: (_, record) => (
        <div style={{ fontSize: '12px' }}>
          {record.cooperation_price && (
            <div>报价: ¥{record.cooperation_price.toLocaleString()}</div>
          )}
          {record.is_refund !== undefined && (
            <div>
              <Tag color={record.is_refund ? 'green' : 'red'}>
                {record.is_refund ? '可返款' : '不返款'}
              </Tag>
            </div>
          )}
          {record.wechat_channels_has_shop !== undefined && (
            <div>
              <Tag color={record.wechat_channels_has_shop ? 'blue' : 'gray'}>
                {record.wechat_channels_has_shop ? '有橱窗' : '无橱窗'}
              </Tag>
            </div>
          )}
        </div>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="建联记录">
            <Button
              type="text"
              icon={<UserOutlined />}
              onClick={() => handleViewContactRecords(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个达人吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '16px' }}>
          <Row gutter={[16, 16]} align="middle">
            <Col flex="auto">
              <Title level={4} style={{ margin: 0 }}>
                达人管理
              </Title>
            </Col>
            <Col>
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAdd}
                >
                  新增达人
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchInfluencers}
                >
                  刷新
                </Button>
                <Button
                  icon={<ExportOutlined />}
                  onClick={() => message.info('导出功能开发中')}
                >
                  导出
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Search
                placeholder="搜索达人姓名、昵称"
                allowClear
                onSearch={handleSearch}
                style={{ width: '100%' }}
              />
            </Col>
          </Row>
        </div>

        <Table
          columns={columns}
          dataSource={influencers}
          rowKey="id"
          loading={loading}
          pagination={{
            current: searchParams.page,
            pageSize: searchParams.page_size,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 达人表单弹窗 */}
      <Modal
        title={editingInfluencer ? '编辑达人' : '新增达人'}
        open={formVisible}
        onCancel={() => setFormVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <InfluencerForm
          influencer={editingInfluencer}
          onSuccess={handleFormSuccess}
          onCancel={() => setFormVisible(false)}
        />
      </Modal>

      {/* 达人详情抽屉 */}
      <Drawer
        title="达人详情"
        placement="right"
        width={600}
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
        destroyOnClose
      >
        {selectedInfluencer && (
          <InfluencerDetail 
            influencer={selectedInfluencer} 
            onEdit={() => {
              setEditingInfluencer(selectedInfluencer)
              setFormVisible(true)
              setDetailVisible(false)
            }}
            onClose={() => setDetailVisible(false)}
          />
        )}
      </Drawer>

      {/* 建联记录抽屉 */}
      <Drawer
        title={`${contactInfluencer?.name} - 建联记录`}
        placement="right"
        width={800}
        open={contactRecordsVisible}
        onClose={() => setContactRecordsVisible(false)}
        destroyOnClose
      >
        {contactInfluencer && (
          <ContactRecordList 
            influencerId={contactInfluencer.id} 
            visible={contactRecordsVisible}
            onClose={() => setContactRecordsVisible(false)}
          />
        )}
      </Drawer>
    </div>
  )
}

export default InfluencerManagement