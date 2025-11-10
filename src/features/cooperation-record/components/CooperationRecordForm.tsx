import { cooperationRecordService } from '@/services/cooperationRecordService'
import type {
  CooperationProductCreate,
  CooperationProductUpdate,
  CooperationRecord,
  CooperationRecordCreate,
  CooperationRecordUpdate,
} from '@/types'
import {
  Button,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  Row,
  Select,
  Space,
} from 'antd'
import dayjs from 'dayjs'
import React, { useCallback, useEffect } from 'react'

const { Option } = Select

interface CooperationRecordFormProps {
  influencerId?: number
  contactRecordId?: number
  record?: CooperationRecord | null
  // eslint-disable-next-line no-unused-vars
  onSuccess?: (createdOrUpdated: CooperationRecord) => void
  onCancel: () => void
}

const CooperationRecordForm: React.FC<CooperationRecordFormProps> = props => {
  const { influencerId, contactRecordId, onSuccess, onCancel } = props
  const [form] = Form.useForm()
  const initialRecord = props.record ?? null
  const currentRecord = initialRecord ?? null

  // 将后端商品数据映射为表单项（包含 id 以便编辑识别）
  const mapProductToFormItem = useCallback(
    (p: any) => ({
      id: p.id,
      influencer_id: p.influencer_id,
      contact_record_id: p.contact_record_id,
      product_name: p.product_name,
      product_code: p.product_code,
      price: Number(p.price),
      commission_rate: p.commission_rate ? Number(p.commission_rate) : undefined,
      cooperation_platform: p.cooperation_platform,
      order_number: p.order_number,
      external_number: p.external_number,
      notes: p.notes,
      cooperation_time: p.cooperation_time ? dayjs(p.cooperation_time) : undefined,
    }),
    []
  )

  // 将表单项映射为创建/更新所需的 payload
  const mapFormItemToCreatePayload = useCallback(
    (p: any): CooperationProductCreate => ({
      influencer_id: influencerId!,
      contact_record_id: contactRecordId,
      product_name: p.product_name,
      product_code: p.product_code,
      price: p.price,
      commission_rate: p.commission_rate,
      cooperation_platform: p.cooperation_platform,
      order_number: p.order_number,
      external_number: p.external_number,
      notes: p.notes,
      cooperation_time: p.cooperation_time ? dayjs(p.cooperation_time).toISOString() : undefined,
    }),
    [influencerId, contactRecordId]
  )

  const mapFormItemToUpdatePayload = useCallback(
    (p: any): CooperationProductUpdate => ({
      product_name: p.product_name,
      product_code: p.product_code,
      price: p.price,
      commission_rate: p.commission_rate,
      cooperation_platform: p.cooperation_platform,
      order_number: p.order_number,
      external_number: p.external_number,
      notes: p.notes,
      cooperation_time: p.cooperation_time ? dayjs(p.cooperation_time).toISOString() : undefined,
    }),
    []
  )

  useEffect(() => {
    if (currentRecord) {
      form.setFieldsValue({
        cooperation_status: currentRecord.cooperation_status,
        notes: currentRecord.notes,
        products: (currentRecord.products || []).map(mapProductToFormItem),
      })
    } else {
      form.setFieldsValue({
        cooperation_status: 0,
        products: [],
      })
    }
  }, [currentRecord, form, mapProductToFormItem])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      // 创建模式：一次性创建记录与商品列表
      if (!currentRecord) {
        const payload: CooperationRecordCreate = {
          influencer_id: influencerId!,
          contact_record_id: contactRecordId,
          cooperation_status: values.cooperation_status,
          notes: values.notes,
          products: (values.products || []).map(mapFormItemToCreatePayload),
        }
        const created = await cooperationRecordService.createCooperationRecord(payload)
        message.success('创建合作记录成功')
        onSuccess?.(created)
        return
      }

      // 编辑模式：先同步商品增删改，再更新合作记录字段
      const initialProducts = currentRecord.products || []
      const currentProducts = values.products || []

      const currentIds = new Set<number>(
        currentProducts.map((p: any) => p.id).filter((id: any) => typeof id === 'number')
      )

      // 删除：初始有但当前没有的 id
      for (const ip of initialProducts) {
        if (!currentIds.has(ip.id)) {
          await cooperationRecordService.deleteCooperationProduct(ip.id)
        }
      }

      // 新增与更新
      for (const p of currentProducts) {
        if (typeof p.id === 'number') {
          const updatePayload: CooperationProductUpdate = mapFormItemToUpdatePayload(p)
          await cooperationRecordService.updateCooperationProduct(p.id, updatePayload)
        } else {
          const createPayload = mapFormItemToCreatePayload(p)
          await cooperationRecordService.createCooperationProduct(currentRecord.id, createPayload)
        }
      }

      const updateRecordPayload: CooperationRecordUpdate = {
        cooperation_status: values.cooperation_status,
        notes: values.notes,
      }
      await cooperationRecordService.updateCooperationRecord(currentRecord.id, updateRecordPayload)

      const latest = await cooperationRecordService.getCooperationRecord(currentRecord.id)
      message.success('更新合作记录成功')
      onSuccess?.(latest)
    } catch (error) {
      // 错误提示由 axios 拦截器统一处理
    }
  }

  return (
    <Form form={form} layout="vertical">
      <Form.Item
        label="合作状态"
        name="cooperation_status"
        rules={[{ required: true, message: '请选择合作状态' }]}
      >
        <Select placeholder="请选择">
          <Option value={0}>待确认</Option>
          <Option value={1}>已确认</Option>
          <Option value={2}>进行中</Option>
          <Option value={3}>已完成</Option>
          <Option value={4}>已取消</Option>
        </Select>
      </Form.Item>

      {/* 去除合作评分字段：后端接口未定义该字段 */}

      <Form.Item label="备注" name="notes">
        <Input.TextArea rows={4} placeholder="填写备注信息" />
      </Form.Item>

      <Divider>合作商品</Divider>
      <Form.List name="products">
        {(fields, { add, remove }) => (
          <>
            {fields.map(field => (
              <div key={field.key} style={{ marginBottom: 12 }}>
                <Row gutter={12} wrap>
                  {/* 隐藏 id 字段用于识别已有商品 */}
                  <Form.Item name={[field.name, 'id']} hidden>
                    <InputNumber />
                  </Form.Item>
                  <Col span={6}>
                    <Form.Item
                      {...field}
                      label="商品名称"
                      name={[field.name, 'product_name']}
                      fieldKey={[field.fieldKey!, 'product_name']}
                      rules={[{ required: true, message: '请输入商品名称' }]}
                    >
                      <Input placeholder="商品名称" />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      {...field}
                      label="商品编号"
                      name={[field.name, 'product_code']}
                      fieldKey={[field.fieldKey!, 'product_code']}
                      rules={[{ required: true, message: '请输入商品编号' }]}
                    >
                      <Input placeholder="商品编号" />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      {...field}
                      label="价格"
                      name={[field.name, 'price']}
                      fieldKey={[field.fieldKey!, 'price']}
                      rules={[{ required: true, message: '请输入价格' }]}
                    >
                      <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item {...field} label="佣金比例" name={[field.name, 'commission_rate']}>
                      <InputNumber min={0} max={100} style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      {...field}
                      label="合作平台"
                      name={[field.name, 'cooperation_platform']}
                    >
                      <Input placeholder="平台" />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item {...field} label="拍单号" name={[field.name, 'order_number']}>
                      <Input placeholder="拍单号" />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item {...field} label="外部编号" name={[field.name, 'external_number']}>
                      <Input placeholder="外部编号" />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item {...field} label="合作时间" name={[field.name, 'cooperation_time']}>
                      <DatePicker showTime style={{ width: '100%' }} />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Button danger onClick={() => remove(field.name)}>
                      删除该商品
                    </Button>
                  </Col>
                </Row>
              </div>
            ))}
            <Button type="dashed" onClick={() => add()} block>
              添加商品
            </Button>
          </>
        )}
      </Form.List>

      <Divider />
      <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onCancel}>取消</Button>
        <Button type="primary" onClick={handleSubmit}>
          {currentRecord ? '保存' : '创建'}
        </Button>
      </Space>
    </Form>
  )
}

export default CooperationRecordForm
