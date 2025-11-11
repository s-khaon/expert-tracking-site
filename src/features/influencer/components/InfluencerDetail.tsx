import type { Influencer } from '@/types'
import {
  InstagramOutlined,
  MailOutlined,
  TikTokOutlined,
  UserOutlined,
  WechatOutlined,
} from '@ant-design/icons'
import { Avatar, Button, Card, Col, Descriptions, Row, Space, Statistic, Tag } from 'antd'
import React from 'react'

interface InfluencerDetailProps {
  influencer: Influencer
  onEdit: () => void
  onClose: () => void
}

const InfluencerDetail: React.FC<InfluencerDetailProps> = ({ influencer, onEdit, onClose }) => {
  const formatNumber = (value: string | number | undefined): React.ReactNode => {
    const num = typeof value === 'string' ? parseInt(value) : value
    if (!num) return '0'
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}万`
    }
    return num.toLocaleString()
  }

  const parseCooperationTypes = (types: unknown): string[] => {
    if (!types) return []
    if (Array.isArray(types)) {
      return types.map(t => String(t)).filter(Boolean)
    }
    if (typeof types === 'string') {
      const s = types.trim()
      if (!s) return []
      try {
        const parsed = JSON.parse(s)
        return Array.isArray(parsed) ? parsed.map(t => String(t)).filter(Boolean) : []
      } catch {
        // 回退：处理非JSON的逗号分隔字符串或带括号的字符串
        return s
          .replace(/^\[|\]$/g, '')
          .split(',')
          .map(x =>
            x
              .trim()
              .replace(/^"(.*)"$/, '$1')
              .replace(/^'(.*)'$/, '$1')
          )
          .filter(Boolean)
      }
    }
    return []
  }

  return (
    <div>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Space>
          <Button onClick={onClose}>关闭</Button>
          <Button type="primary" onClick={onEdit}>
            编辑
          </Button>
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
            label={
              <>
                <MailOutlined /> 邮箱地址
              </>
            }
          >
            {influencer.email || '-'}
          </Descriptions.Item>
          <Descriptions.Item
            label={
              <>
                <WechatOutlined /> 微信号
              </>
            }
          >
            {influencer.wechat || '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 平台数据统计卡片 */}
      <Card title="平台数据统计" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          {(influencer.platforms || []).map((p, idx) => {
            const label = p.platform_code === 'douyin'
              ? '抖音粉丝'
              : p.platform_code === 'xiaohongshu'
                ? '小红书粉丝'
                : p.platform_code === 'wechat_channels'
                  ? '视频号粉丝'
                  : `${p.platform_code} 粉丝`
            return (
              <Col span={8} key={`${influencer.id}-${p.platform_code}-${idx}`}>
                <Statistic title={label} value={p.followers || 0} formatter={formatNumber} prefix={<UserOutlined />} />
              </Col>
            )
          })}
        </Row>
      </Card>

      {/* 平台链接卡片 */}
      <Card title="平台链接" style={{ marginBottom: 16 }}>
        <Descriptions column={1} size="small">
          {(influencer.platforms || []).map((p, idx) => {
            const labelIcon = p.platform_code === 'douyin'
              ? <TikTokOutlined />
              : p.platform_code === 'xiaohongshu'
                ? <InstagramOutlined />
                : <WechatOutlined />
            const labelText = p.platform_code === 'douyin'
              ? '抖音链接'
              : p.platform_code === 'xiaohongshu'
                ? '小红书链接'
                : p.platform_code === 'wechat_channels'
                  ? '视频号链接'
                  : `${p.platform_code} 链接`
            return (
              <Descriptions.Item key={`${influencer.id}-${p.platform_code}-${idx}`} label={<><span style={{ marginRight: 4 }}>{labelIcon}</span> {labelText}</>}>
                {p.account_url ? (
                  <a href={p.account_url} target="_blank" rel="noopener noreferrer">{p.account_url}</a>
                ) : (
                  '-'
                )}
              </Descriptions.Item>
            )
          })}
        </Descriptions>
      </Card>

      {/* 商务信息 */}
      <Card title="商务信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2} size="small">
          <Descriptions.Item label="合作报价">
            {influencer.cooperation_price
              ? `¥${influencer.cooperation_price.toLocaleString()}`
              : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="合作类型">
            <Space wrap>
              {parseCooperationTypes(influencer.cooperation_types).map(
                (type: string, index: number) => (
                  <Tag key={index} color="blue">
                    {type}
                  </Tag>
                )
              )}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="退款政策">
            <Tag color={influencer.is_refund ? 'green' : 'red'}>
              {influencer.is_refund ? '支持返款' : '不支持返款'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="视频号小店">
            {(() => {
              const wc = (influencer.platforms || []).find(p => p.platform_code === 'wechat_channels')
              const val = wc?.has_shop
              if (val === undefined) return '-'
              return <Tag color={val ? 'blue' : 'default'}>{val ? '有小店' : '无小店'}</Tag>
            })()}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 描述信息 */}
      <Card title="描述信息" style={{ marginBottom: 16 }}>
        <Descriptions column={1} size="small">
          <Descriptions.Item label="达人描述">
            <div style={{ whiteSpace: 'pre-wrap' }}>{influencer.description || '-'}</div>
          </Descriptions.Item>
          <Descriptions.Item label="内部备注">
            <div style={{ whiteSpace: 'pre-wrap' }}>{influencer.internal_notes || '-'}</div>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  )
}

export default InfluencerDetail
