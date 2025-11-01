import React from 'react'
import {
  Descriptions,
  Card,
  Tag,
  Space,
  Avatar,
  Button,
  Divider,
  Row,
  Col,
  Statistic
} from 'antd'
import {
  UserOutlined,
  MailOutlined,
  WechatOutlined,
  TikTokOutlined,
  InstagramOutlined
} from '@ant-design/icons'
import type { Influencer } from '@/types'

interface InfluencerDetailProps {
  influencer: Influencer
  onEdit: () => void
  onClose: () => void
}

const InfluencerDetail: React.FC<InfluencerDetailProps> = ({
  influencer,
  onEdit,
  onClose
}) => {


  const formatNumber = (value: string | number | undefined): React.ReactNode => {
    const num = typeof value === 'string' ? parseInt(value) : value
    if (!num) return '0'
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}万`
    }
    return num.toLocaleString()
  }



  const parseCooperationTypes = (types: string | null) => {
    if (!types) return []
    try {
      return JSON.parse(types)
    } catch {
      return []
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Space>
          <Button onClick={onClose}>关闭</Button>
          <Button type="primary" onClick={onEdit}>编辑</Button>
        </Space>
      </div>

      {/* 基本信息卡片 */}
      <Card title="基本信息" style={{ marginBottom: 16 }}>
        <Row gutter={24}>
          <Col span={4}>
            <div style={{ textAlign: 'center' }}>
              <Avatar size={80} icon={<UserOutlined />} />
            </div>
          </Col>
          <Col span={20}>
            <Descriptions column={3} size="small">
              <Descriptions.Item label="姓名">{influencer.name}</Descriptions.Item>
              <Descriptions.Item label="昵称">{influencer.nickname || '-'}</Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {influencer.created_at ? new Date(influencer.created_at).toLocaleString() : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="更新时间">
                {influencer.updated_at ? new Date(influencer.updated_at).toLocaleString() : '-'}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>

      {/* 联系方式卡片 */}
      <Card title="联系方式" style={{ marginBottom: 16 }}>
        <Descriptions column={2} size="small">
          <Descriptions.Item 
            label={<><MailOutlined /> 邮箱地址</>}
          >
            {influencer.email || '-'}
          </Descriptions.Item>
          <Descriptions.Item 
            label={<><WechatOutlined /> 微信号</>}
          >
            {influencer.wechat || '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 平台数据统计卡片 */}
      <Card title="平台数据统计" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title="抖音粉丝"
              value={influencer.douyin_followers || 0}
              formatter={formatNumber}
              prefix={<UserOutlined />}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="小红书粉丝"
              value={influencer.xiaohongshu_followers || 0}
              formatter={formatNumber}
              prefix={<UserOutlined />}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="视频号粉丝"
              value={influencer.wechat_channels_followers || 0}
              formatter={formatNumber}
              prefix={<UserOutlined />}
            />
          </Col>
        </Row>
      </Card>

      {/* 平台链接卡片 */}
      <Card title="平台链接" style={{ marginBottom: 16 }}>
        <Descriptions column={1} size="small">
          <Descriptions.Item 
            label={<><TikTokOutlined /> 抖音链接</>}
          >
            {influencer.douyin_url ? (
              <a href={influencer.douyin_url} target="_blank" rel="noopener noreferrer">
                {influencer.douyin_url}
              </a>
            ) : '-'}
          </Descriptions.Item>
          <Descriptions.Item 
            label={<><InstagramOutlined /> 小红书链接</>}
          >
            {influencer.xiaohongshu_url ? (
              <a href={influencer.xiaohongshu_url} target="_blank" rel="noopener noreferrer">
                {influencer.xiaohongshu_url}
              </a>
            ) : '-'}
          </Descriptions.Item>
          <Descriptions.Item 
            label={<><WechatOutlined /> 视频号链接</>}
          >
            {influencer.wechat_channels_url ? (
              <a href={influencer.wechat_channels_url} target="_blank" rel="noopener noreferrer">
                {influencer.wechat_channels_url}
              </a>
            ) : '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 商务信息 */}
      <Card title="商务信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2} size="small">
          <Descriptions.Item label="合作报价">
            {influencer.cooperation_price ? `¥${influencer.cooperation_price.toLocaleString()}` : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="合作类型">
            <Space wrap>
              {parseCooperationTypes(influencer.cooperation_types || '').map((type: string, index: number) => (
                <Tag key={index} color="blue">{type}</Tag>
              ))}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="退款政策">
            <Tag color={influencer.is_refund ? 'green' : 'red'}>
              {influencer.is_refund ? '支持退款' : '不支持退款'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="视频号小店">
            <Tag color={influencer.wechat_channels_has_shop ? 'blue' : 'default'}>
              {influencer.wechat_channels_has_shop ? '有小店' : '无小店'}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 描述信息 */}
      <Card title="描述信息" style={{ marginBottom: 16 }}>
        <Descriptions column={1} size="small">
          <Descriptions.Item label="达人描述">
            <div style={{ whiteSpace: 'pre-wrap' }}>
              {influencer.description || '-'}
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="内部备注">
            <div style={{ whiteSpace: 'pre-wrap' }}>
              {influencer.internal_notes || '-'}
            </div>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  )
}

export default InfluencerDetail