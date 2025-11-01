import React from 'react'
import {
  Descriptions,
  Card,
  Tag,
  Space,
  Button,
  Divider,
  Typography
} from 'antd'
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  EditOutlined
} from '@ant-design/icons'
import type { ContactRecord } from '@/types'

const { Text, Paragraph } = Typography

interface ContactRecordDetailProps {
  contactRecord: ContactRecord
  onEdit: () => void
  onClose: () => void
}

const ContactRecordDetail: React.FC<ContactRecordDetailProps> = ({
  contactRecord,
  onEdit,
  onClose
}) => {
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

  const getContactMethodIcon = (method: string) => {
    const icons = {
      '微信': <UserOutlined />,
      '电话': <PhoneOutlined />,
      '邮件': <MailOutlined />,
      'QQ': <UserOutlined />,
      '短信': <PhoneOutlined />,
      '面谈': <UserOutlined />,
      '视频通话': <PhoneOutlined />
    }
    return icons[method as keyof typeof icons] || <UserOutlined />
  }

  return (
    <div>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Space>
          <Button onClick={onClose}>关闭</Button>
          <Button type="primary" icon={<EditOutlined />} onClick={onEdit}>
            编辑
          </Button>
        </Space>
      </div>

      {/* 基本信息卡片 */}
      <Card title="基本信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2} size="small">
          <Descriptions.Item 
            label={<><UserOutlined /> 达人</>}
            span={2}
          >
            <Text strong>
              {contactRecord.influencer_name || `达人ID: ${contactRecord.influencer_id}`}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="联系时间">
            {contactRecord.contact_date ? new Date(contactRecord.contact_date).toLocaleString() : '未设置'}
          </Descriptions.Item>
          <Descriptions.Item label="联系类型">
            <Tag color={getContactTypeColor(contactRecord.contact_type)}>
              {getContactTypeText(contactRecord.contact_type)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item 
            label={<>联系方式</>}
          >
            <Space>
              {contactRecord.contact_method ? getContactMethodIcon(contactRecord.contact_method) : <UserOutlined />}
              <Text>{contactRecord.contact_method || '-'}</Text>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="联系人">
            {contactRecord.contact_person || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="联系结果">
            <Tag color={contactRecord.contact_result ? getContactResultColor(contactRecord.contact_result) : 'default'}>
              {contactRecord.contact_result ? getContactResultText(contactRecord.contact_result) : '未设置'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="记录创建时间">
            {contactRecord.created_at ? new Date(contactRecord.created_at).toLocaleString() : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="最后更新时间">
            {contactRecord.updated_at ? new Date(contactRecord.updated_at).toLocaleString() : '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 联系内容卡片 */}
      <Card title="联系内容" style={{ marginBottom: 16 }}>
        <Paragraph>
          <Text>{contactRecord.contact_content}</Text>
        </Paragraph>
      </Card>

      {/* 跟进信息卡片 */}
      <Card title="跟进信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2} size="small">
          <Descriptions.Item label="跟进状态">
            {contactRecord.follow_up_required === 'yes' ? (
              <Tag color="orange" icon={<ClockCircleOutlined />}>
                待跟进
              </Tag>
            ) : contactRecord.follow_up_required === 'completed' ? (
              <Tag color="green" icon={<CheckCircleOutlined />}>
                已完成
              </Tag>
            ) : (
              <Tag color="default">
                无需跟进
              </Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="跟进日期">
            {contactRecord.follow_up_date ? 
              new Date(contactRecord.follow_up_date).toLocaleString() : 
              '-'
            }
          </Descriptions.Item>
        </Descriptions>
        
        {contactRecord.follow_up_notes && (
          <>
            <Divider />
            <div>
              <Text strong>跟进备注：</Text>
              <Paragraph style={{ marginTop: 8 }}>
                <Text>{contactRecord.follow_up_notes}</Text>
              </Paragraph>
            </div>
          </>
        )}
      </Card>

      {/* 时间轴信息 */}
      <Card title="时间信息" size="small">
        <Descriptions column={1} size="small">
          <Descriptions.Item label="联系时间">
            <Text code>{contactRecord.contact_date ? new Date(contactRecord.contact_date).toLocaleString() : '未设置'}</Text>
          </Descriptions.Item>
          {contactRecord.follow_up_date && (
            <Descriptions.Item label="计划跟进时间">
              <Text code>{new Date(contactRecord.follow_up_date).toLocaleString()}</Text>
            </Descriptions.Item>
          )}
          <Descriptions.Item label="记录创建时间">
            <Text code>
              {contactRecord.created_at ? new Date(contactRecord.created_at).toLocaleString() : '-'}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="最后更新时间">
            <Text code>
              {contactRecord.updated_at ? new Date(contactRecord.updated_at).toLocaleString() : '-'}
            </Text>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  )
}

export default ContactRecordDetail