import React, { useEffect } from 'react'
import {
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  Space,
  Row,
  Col,
  Card,
  message,

} from 'antd'
import type { Influencer, InfluencerCreate, InfluencerUpdate } from '@/types'
import { influencerService } from '@/services/influencerService'

const { Option } = Select
const { TextArea } = Input

interface InfluencerFormProps {
  influencer?: Influencer | null
  onSuccess: () => void
  onCancel: () => void
}

const InfluencerForm: React.FC<InfluencerFormProps> = ({
  influencer,
  onSuccess,
  onCancel
}) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = React.useState(false)

  useEffect(() => {
    if (influencer) {
      form.setFieldsValue({
        ...influencer,
        // 处理可能的JSON字段
        cooperation_types: influencer.cooperation_types ? JSON.parse(influencer.cooperation_types) : undefined,
      })
    } else {
      form.resetFields()
    }
  }, [influencer, form])

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true)
      
      // 处理JSON字段
      const formData = {
        ...values,
        cooperation_types: values.cooperation_types ? JSON.stringify(values.cooperation_types) : undefined,
      }

      if (influencer) {
        await influencerService.updateInfluencer(influencer.id, formData as InfluencerUpdate)
        message.success('更新达人信息成功')
      } else {
        await influencerService.createInfluencer(formData as InfluencerCreate)
        message.success('创建达人成功')
      }
      
      onSuccess()
    } catch (error) {
      message.error(influencer ? '更新达人信息失败' : '创建达人失败')
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
        is_refund: false,
        wechat_channels_has_shop: false
      }}
    >
      <Card title="基本信息" size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="达人姓名"
              rules={[{ message: '请输入达人姓名' }]}
            >
              <Input placeholder="请输入达人姓名" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="nickname" label="昵称/网名" rules={[{ message: '请输入昵称或网名', required: true }]}>
              <Input placeholder="请输入昵称或网名" />
            </Form.Item>
          </Col>
        </Row>


      </Card>

      <Card title="联系方式" size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="email" label="邮箱地址">
              <Input placeholder="请输入邮箱地址" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="wechat" label="微信号">
              <Input placeholder="请输入微信号" />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card title="平台信息" size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="douyin_url" label="抖音链接">
              <Input placeholder="请输入抖音链接" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="douyin_followers" label="抖音粉丝数">
              <InputNumber
                placeholder="请输入抖音粉丝数"
                min={0}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="xiaohongshu_url" label="小红书链接">
              <Input placeholder="请输入小红书链接" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="xiaohongshu_followers" label="小红书粉丝数">
              <InputNumber
                placeholder="请输入小红书粉丝数"
                min={0}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="wechat_channels_url" label="视频号链接">
              <Input placeholder="请输入视频号链接" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="wechat_channels_followers" label="视频号粉丝数">
              <InputNumber
                placeholder="请输入视频号粉丝数"
                min={0}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card title="商务信息" size="small" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="cooperation_price" label="合作报价">
              <InputNumber
                placeholder="请输入合作报价"
                min={0}
                style={{ width: '100%' }}
                formatter={(value) => value ? `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="cooperation_types" label="合作类型">
              <Select
                mode="tags"
                placeholder="请选择或输入合作类型"
                style={{ width: '100%' }}
              >
                <Option value="广告植入">广告植入</Option>
                <Option value="产品试用">产品试用</Option>
                <Option value="直播带货">直播带货</Option>
                <Option value="品牌代言">品牌代言</Option>
                <Option value="活动参与">活动参与</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="is_refund" label="是否返款">
              <Select placeholder="请选择是否返款">
                <Option value={true}>可返款</Option>
                <Option value={false}>不返款</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="wechat_channels_has_shop" label="视频号是否有橱窗">
              <Select placeholder="请选择是否有橱窗">
                <Option value={true}>有橱窗</Option>
                <Option value={false}>无橱窗</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card title="备注信息" size="small" style={{ marginBottom: 16 }}>
        <Form.Item name="description" label="达人描述">
          <TextArea
            placeholder="请输入达人描述"
            rows={3}
          />
        </Form.Item>

        <Form.Item name="internal_notes" label="内部备注">
          <TextArea
            placeholder="请输入内部备注"
            rows={3}
          />
        </Form.Item>
      </Card>

      <div style={{ textAlign: 'right' }}>
        <Space>
          <Button onClick={onCancel}>
            取消
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {influencer ? '更新' : '创建'}
          </Button>
        </Space>
      </div>
    </Form>
  )
}

export default InfluencerForm