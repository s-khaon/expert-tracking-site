import { useState } from 'react'
import { Table, Button, Input, Space, Tag, Card, Avatar } from 'antd'
import { PlusOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons'

const { Search } = Input

// 本地专家数据接口
interface ExpertData {
  id: number
  name: string
  email: string
  field: string
  institution: string
  position: string
  hIndex: number
  publications: number
  researchInterests: string[]
  status: string
}

const ExpertList = () => {
  const [loading] = useState(false)
  const [searchText, setSearchText] = useState('')

  // 模拟达人数据
  const expertsData = [
    {
      id: 1,
      name: '张教授',
      email: 'zhang@example.com',
      field: '人工智能',
      institution: '清华大学',
      position: '教授',
      hIndex: 45,
      publications: 120,
      researchInterests: ['机器学习', '深度学习', '计算机视觉'],
      status: 'active',
    },
    {
      id: 2,
      name: '李博士',
      email: 'li@example.com',
      field: '机器学习',
      institution: '北京大学',
      position: '副教授',
      hIndex: 38,
      publications: 95,
      researchInterests: ['自然语言处理', '强化学习'],
      status: 'active',
    },
    {
      id: 3,
      name: '王研究员',
      email: 'wang@example.com',
      field: '计算机视觉',
      institution: '中科院',
      position: '研究员',
      hIndex: 52,
      publications: 156,
      researchInterests: ['图像识别', '目标检测', '语义分割'],
      status: 'pending',
    },
  ]

  const handleSearch = (value: string) => {
    setSearchText(value)
  }

  // 过滤数据
  const filteredData = expertsData.filter(expert => {
    if (!searchText) return true
    const searchLower = searchText.toLowerCase()
    return (
      expert.name.toLowerCase().includes(searchLower) ||
      expert.institution.toLowerCase().includes(searchLower) ||
      expert.field.toLowerCase().includes(searchLower) ||
      expert.researchInterests.some(interest => 
        interest.toLowerCase().includes(searchLower)
      )
    )
  })

  const columns = [
    {
      title: '达人信息',
      key: 'expert',
      render: (record: ExpertData) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar size={48} icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>{record.name}</div>
            <div style={{ color: '#666', fontSize: 14 }}>{record.email}</div>
            <div style={{ color: '#666', fontSize: 12 }}>
              {record.position} · {record.institution}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '研究领域',
      dataIndex: 'field',
      key: 'field',
      render: (field: string) => <Tag color="blue">{field}</Tag>,
    },
    {
      title: '研究兴趣',
      dataIndex: 'researchInterests',
      key: 'researchInterests',
      render: (interests: string[]) => (
        <div>
          {interests.map((interest, index) => (
            <Tag key={index} style={{ marginBottom: 4 }}>
              {interest}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: 'H指数',
      dataIndex: 'hIndex',
      key: 'hIndex',
      sorter: true,
      render: (hIndex: number) => (
        <span style={{ fontWeight: 600, color: '#1890ff' }}>{hIndex}</span>
      ),
    },
    {
      title: '发表论文',
      dataIndex: 'publications',
      key: 'publications',
      sorter: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'orange'}>
          {status === 'active' ? '活跃' : '待审核'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_record: ExpertData) => (
        <Space size="middle">
          <Button type="link">查看详情</Button>
          <Button type="link">编辑</Button>
        </Space>
      ),
    },
  ]

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">达人管理</h1>
        <p className="page-description">管理和跟进达人信息</p>
      </div>

      <div className="page-actions">
        <Space>
          <Search
            placeholder="搜索达人姓名、机构或研究领域"
            allowClear
            enterButton={<SearchOutlined />}
            onSearch={handleSearch}
            style={{ width: 400 }}
          />
        </Space>
        <Button type="primary" icon={<PlusOutlined />}>
          添加达人
        </Button>
      </div>

      {/* 统计卡片 */}
      <div style={{ marginBottom: 24 }}>
        <Space size={16}>
          <Card size="small" style={{ minWidth: 120 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 600, color: '#1890ff' }}>
                {expertsData.length}
              </div>
              <div style={{ color: '#666' }}>总达人数</div>
            </div>
          </Card>
          <Card size="small" style={{ minWidth: 120 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 600, color: '#52c41a' }}>
                {expertsData.filter(e => e.status === 'active').length}
              </div>
              <div style={{ color: '#666' }}>活跃达人</div>
            </div>
          </Card>
          <Card size="small" style={{ minWidth: 120 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 600, color: '#faad14' }}>
                {Math.round(expertsData.reduce((sum, e) => sum + e.hIndex, 0) / expertsData.length)}
              </div>
              <div style={{ color: '#666' }}>平均H指数</div>
            </div>
          </Card>
          <Card size="small" style={{ minWidth: 120 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 600, color: '#f5222d' }}>
                {expertsData.reduce((sum, e) => sum + e.publications, 0)}
              </div>
              <div style={{ color: '#666' }}>总发表数</div>
            </div>
          </Card>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
        }}
        rowKey="id"
      />
    </div>
  )
}

export default ExpertList