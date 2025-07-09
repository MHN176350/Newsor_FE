import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Alert, Typography, Space, Checkbox, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useTranslation } from 'react-i18next';
import '../styles/admin-theme.css';

const { Title, Text } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(null);

    try {
      await login(values.username, values.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background-overlay"></div>
      
      {/* Animated background elements */}
      <div className="login-background-elements">
        <div className="bg-element bg-element-1"></div>
        <div className="bg-element bg-element-2"></div>
        <div className="bg-element bg-element-3"></div>
      </div>

      <div className="login-content">
        <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
          <Col xs={22} sm={20} md={18} lg={14} xl={12} xxl={10}>
            <Card className="login-card">
              <div className="login-header">
                <div className="login-logo">
                  <div className="logo-icon">
                    <UserOutlined />
                  </div>
                  <Title level={1} className="login-title">
                    {t('auth.login.title')} - Newsor Admin
                  </Title>
                </div>
                <Text className="login-subtitle">
                  {t('auth.login.subtitle')}
                </Text>
              </div>

              {error && (
                <Alert
                  message={error}
                  type="error"
                  showIcon
                  closable
                  style={{ marginBottom: '24px' }}
                  onClose={() => setError(null)}
                />
              )}

              <Form
                form={form}
                name="login"
                layout="vertical"
                onFinish={handleSubmit}
                size="large"
                autoComplete="off"
              >
                <Form.Item
                  name="username"
                  rules={[
                    { required: true, message: t('auth.login.username') + ' is required!' },
                    { min: 3, message: t('auth.login.username') + ' must be at least 3 characters!' }
                  ]}
                >
                  <Input
                    prefix={<UserOutlined className="input-icon" />}
                    placeholder={t('auth.login.username')}
                    className="login-input"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: t('auth.login.password') + ' is required!' },
                    { min: 6, message: t('auth.login.password') + ' must be at least 6 characters!' }
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="input-icon" />}
                    placeholder={t('auth.login.password')}
                    className="login-input"
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  />
                </Form.Item>

                <Form.Item>
                  <div className="login-options">
                    <Checkbox 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="remember-checkbox"
                    >
                      {t('auth.login.rememberMe')}
                    </Checkbox>
                    <Button type="link" className="forgot-password">
                      {t('auth.login.forgotPassword')}
                    </Button>
                  </div>
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    className="login-button"
                    block
                  >
                    {loading ? t('auth.login.signingIn') : t('auth.login.signIn')}
                  </Button>
                </Form.Item>
              </Form>

              <div className="login-footer">
                <Text type="secondary">
                  {t('auth.login.noAccount')} <Button type="link" className="signup-link">{t('auth.login.contactAdmin')}</Button>
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Login;
