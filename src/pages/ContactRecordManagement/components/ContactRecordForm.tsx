import React, { useEffect, useState } from 'react'
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  Row,
  Col,
  Card,
  message,
  AutoComplete
} from 'antd'
import type { ContactRecord, ContactRecordCreate, ContactRecordUpdate } from '@/types'
import { contactRecordService } from '@/services/contactRecordService'
import { influencerService } from '@/services/influencerService'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input

interface ContactRecordFormProps {
  contactRecord?: ContactRecord | null
  influencerId?: number | null
  onSuccess: () => void
  onCancel: () => void
}

const ContactRecordForm: React.FC<ContactRecordFormProps> = ({
  contactRecord,
  influencerId,
  onSuccess,
  onCancel
}) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [influencerOptions, setInfluencerOptions] = useState<{ value: number; label: string }[]>([])
  const [influencerSearchLoading, setInfluencerSearchLoading] = useState(false)

  // 搜索达人
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

  // 当有预设的达人ID时，获取该达人信息
  const loadSelectedInfluencer = async (influencerId: number) => {
    try {
      const response = await influencerService.getInfluencers({
        page: 1,
        page_size: 1,
        search: influencerId.toString()
      })
      
      if (response.items.length > 0) {
        const influencer = response.items[0]
        setInfluencerOptions([{
          value: influencer.id,
          label: `${influencer.name} (${influencer.nickname || 'ID: ' + influencer.id})`
        }])
      }
    } catch (error) {
      console.error('获取达人信息失败')
    }
  }

  useEffect(() => {
    if (contactRecord) {
      form.setFieldsValue({
        ...contactRecord,
        contact_date: contactRecord.contact_date ? dayjs(contactRecord.contact_date) : undefined,
        follow_up_date: contactRecord.follow_up_date ? dayjs(contactRecord.follow_up_date) : undefined
      })
      // 如果联系记录有达人ID，加载达人信息
      if (contactRecord.influencer_id) {
        loadSelectedInfluencer(contactRecord.influencer_id)
      }
    } else {
      form.resetFields()
      if (influencerId) {
        form.setFieldsValue({ influencer_id: influencerId })
        loadSelectedInfluencer(influencerId)
      }
    }
  }, [contactRecord, influencerId, form])

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true)
      
      const formData = {
        ...values,
        contact_date: values.contact_date ? values.contact_date.format('YYYY-MM-DD HH:mm:ss') : undefined,
        follow_up_date: values.follow_up_date ? values.follow_up_date.format('YYYY-MM-DD HH:mm:ss') : undefined
      }

      if (contactRecord) {
        await contactRecordService.updateContactRecord(contactRecord.id, formData as ContactRecordUpdate)
        message.success('更新建联记录成功')
      } else {
        await contactRecordService.createContactRecord(formData as ContactRecordCreate)
        message.success('创建建联记录成功')
      }
      
      onSuccess()
    } catch (error) {
      message.error(contactRecord ? '更新建联记录失败' : '创建建联记录失败')
    } finally {
      setLoading(false)
    }
  }



  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        contact_type: 'initial',
        contact_result: 'pending',
        follow_up_required: 'no',
        contact_date: dayjs()
      }}
    >
      <Card title="基本信息" size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="influencer_id"
              label="选择达人"
              rules={[{ required: true, message: '请选择达人' }]}
            >
              <AutoComplete
                placeholder="搜索并选择达人"
                options={influencerOptions}
                onSearch={searchInfluencers}
                filterOption={false}
                showSearch
                notFoundContent={influencerSearchLoading ? '搜索中...' : '暂无数据'}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="contact_date"
              label="联系时间"
              rules={[{ required: true, message: '请选择联系时间' }]}
            >
              <DatePicker
                showTime
                placeholder="请选择联系时间"
                style={{ width: '100%' }}
                format="YYYY-MM-DD HH:mm:ss"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="contact_type"
              label="联系类型"
              rules={[{ required: true, message: '请选择联系类型' }]}
            >
              <Select placeholder="请选择联系类型">
                <Option value="initial">初次联系</Option>
                <Option value="follow_up">跟进</Option>
                <Option value="negotiation">商务洽谈</Option>
                <Option value="contract">合同签署</Option>
                <Option value="cooperation">合作执行</Option>
                <Option value="maintenance">关系维护</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="contact_method"
              label="联系方式"
              rules={[{ required: true, message: '请输入联系方式' }]}
            >
              <Select
                placeholder="请选择或输入联系方式"
                showSearch
                allowClear
              >
                <Option value="微信">微信</Option>
                <Option value="电话">电话</Option>
                <Option value="邮件">邮件</Option>
                <Option value="QQ">QQ</Option>
                <Option value="短信">短信</Option>
                <Option value="面谈">面谈</Option>
                <Option value="视频通话">视频通话</Option>
                <Option value="其他">其他</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="contact_person"
              label="联系人"
            >
              <Input placeholder="请输入联系人姓名" />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card title="联系内容" size="small" style={{ marginBottom: 16 }}>
        <Form.Item
          name="contact_content"
          label="联系内容"
          rules={[{ required: true, message: '请输入联系内容' }]}
        >
          <TextArea
            placeholder="请详细描述联系内容"
            rows={4}
            showCount
            maxLength={100}
          />
        </Form.Item>

        <Form.Item
          name="contact_result"
          label="联系结果"
          rules={[{ required: true, message: '请选择联系结果' }]}
        >
          <Select placeholder="请选择联系结果">
            <Option value="successful">成功</Option>
            <Option value="failed">失败</Option>
            <Option value="pending">待回复</Option>
            <Option value="no_response">无回应</Option>
          </Select>
        </Form.Item>
      </Card>

      <Card title="跟进信息" size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="follow_up_required"
              label="是否需要跟进"
              rules={[{ required: true, message: '请选择是否需要跟进' }]}
            >
              <Select placeholder="请选择是否需要跟进">
                <Option value="yes">需要跟进</Option>
                <Option value="no">无需跟进</Option>
                <Option value="completed">已完成</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="follow_up_date"
              label="跟进日期"
              dependencies={['follow_up_required']}
              rules={[
                ({ getFieldValue }) => ({
                  required: getFieldValue('follow_up_required') === 'yes',
                  message: '需要跟进时必须设置跟进日期'
                })
              ]}
            >
              <DatePicker
                showTime
                placeholder="请选择跟进日期"
                style={{ width: '100%' }}
                format="YYYY-MM-DD HH:mm:ss"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="follow_up_notes"
          label="跟进备注"
        >
          <TextArea
            placeholder="请输入跟进备注"
            rows={3}
            showCount
            maxLength={500}
          />
        </Form.Item>
      </Card>

      <div style={{ textAlign: 'right' }}>
        <Space>
          <Button onClick={onCancel}>
            取消
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {contactRecord ? '更新' : '创建'}
          </Button>
        </Space>
      </div>
    </Form>
  )
}

export default ContactRecordForm