import { Card, Row, Col, Statistic, Table, Tag } from 'antd'
import { UserOutlined, TeamOutlined, FileTextOutlined, TrophyOutlined } from '@ant-design/icons'

const Dashboard = () => {
  // 模拟数据
  const stats = [
    {
      title: '总用户数',
      value: 1234,
      icon: <UserOutlined style={{ color: '#1890ff' }} />,
      color: '#1890ff',
    },
    {
      title: '达人数量',
      value: 567,
      icon: <TeamOutlined style={{ color: '#52c41a' }} />,
      color: '#52c41a',
    },
    {
      title: '发表论文',
      value: 8901,
      icon: <FileTextOutlined style={{ color: '#faad14' }} />,
      color: '#faad14',
    },
    {
      title: 'H指数平均',
      value: 23.5,
      precision: 1,
      icon: <TrophyOutlined style={{ color: '#f5222d' }} />,
      color: '#f5222d',
    },
  ]

  const recentExperts = [
    {
      key: '1',
      name: '张教授',
      field: '人工智能',
      institution: '清华大学',
      hIndex: 45,
      status: 'active',
    },
    {
      key: '2',
      name: '李博士',
      field: '机器学习',
      institution: '北京大学',
      hIndex: 38,
      status: 'active',
    },
    {
      key: '3',
      name: '王研究员',
      field: '计算机视觉',
      institution: '中科院',
      hIndex: 52,
      status: 'pending',
    },
  ]

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '研究领域',
      dataIndex: 'field',
      key: 'field',
    },
    {
      title: '所属机构',
      dataIndex: 'institution',
      key: 'institution',
    },
    {
      title: 'H指数',
      dataIndex: 'hIndex',
      key: 'hIndex',
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
  ]

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">仪表板</h1>
        <p className="page-description">达人跟进系统概览</p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                precision={stat.precision}
                prefix={stat.icon}
                valueStyle={{ color: stat.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="最近添加的达人" extra={<a href="/experts">查看全部</a>}>
            <Table
              columns={columns}
              dataSource={recentExperts}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card title="系统状态">
            <div style={{ padding: '16px 0' }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>数据同步</span>
                  <Tag color="green">正常</Tag>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>API服务</span>
                  <Tag color="green">运行中</Tag>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>数据库</span>
                  <Tag color="green">连接正常</Tag>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>缓存服务</span>
                  <Tag color="orange">维护中</Tag>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard