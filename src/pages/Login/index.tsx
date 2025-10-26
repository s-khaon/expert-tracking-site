import { Form, Input, Button, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useMutation } from 'react-query'
import { useAuthStore } from '@store/authStore'
import { authService } from '@services/authService'
import type { UserLogin } from '../../types'

const Login = () => {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const loginMutation = useMutation(authService.login, {
    onSuccess: (data) => {
      login(data.user, data.token)
      message.success('登录成功')
      navigate('/dashboard')
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || '登录失败')
    },
  })

  const handleSubmit = (values: UserLogin) => {
    loginMutation.mutate(values)
  }

  return (
    <div className="login-container">
      <div className="login-form">
        <h1 className="login-title">达人跟进系统</h1>
        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少3个字符' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-button"
              loading={loginMutation.isLoading}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

export default Login