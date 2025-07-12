import React, { useState, useEffect } from 'react';
import { Layout as AntLayout, Menu, Avatar, Dropdown, theme, Button, Spin, Space } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  FileTextOutlined,
  TagsOutlined,
  TagOutlined,
  EditOutlined,
  UserOutlined,
  PictureOutlined,
  SettingOutlined,
  MessageOutlined,
  LogoutOutlined,
  BellOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { useAuth } from '../store/AuthContext';
import { useTranslation } from 'react-i18next';
import NotificationBell from './NotificationBell';

const { Header, Sider, Content } = AntLayout;

/**
 * Main Layout component with sidebar navigation
 */
const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, loading, isAuthenticated } = useAuth();
  const { t, i18n } = useTranslation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: t('navigation.dashboard'),
    },
    {
      key: '/articles',
      icon: <FileTextOutlined />,
      label: t('navigation.articles'),
    },
    {
      key: '/categories',
      icon: <TagsOutlined />,
      label: t('navigation.categories'),
    },
    {
      key: '/tags',
      icon: <TagOutlined />,
      label: t('navigation.tags'),
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: t('navigation.users'),
    },
    {
      key: '/media',
      icon: <PictureOutlined />,
      label: t('navigation.media'),
    },
    {
      key: '/contacts',
      icon: <MessageOutlined />,
      label: t('navigation.contacts'),
    },
    {
      key: '/email-content',
      icon: <EditOutlined />,
      label: t('navigation.emailContent'),
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: t('navigation.settings'),
    },
  ];

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [loading, isAuthenticated, navigate]);

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleUserMenuClick = ({ key }) => {
    if (key === 'logout') {
      logout();
      navigate('/login');
    } else if (key === 'profile') {
      navigate('/profile');
    }
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: t('navigation.profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: t('navigation.settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('navigation.logout'),
      danger: true,
    },
  ];

  const languageMenuItems = [
    {
      key: 'en',
      label: 'English',
      onClick: () => changeLanguage('en'),
    },
    {
      key: 'vi',
      label: 'Tiếng Việt',
      onClick: () => changeLanguage('vi'),
    },
  ];

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AntLayout className="admin-layout">
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        className="admin-sider"
        width={256}
        theme="light"
      >
        <div className={`admin-logo ${collapsed ? 'admin-logo-collapsed' : ''}`}>
          {collapsed ? '📰' : '📰 Newsor Admin'}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          className="admin-menu"
        />
      </Sider>
      <AntLayout>
        <Header className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="trigger"
            />
          </div>
          <div className="header-right">
            <Space size={16}>
              <Dropdown
                menu={{ items: languageMenuItems }}
                placement="bottomRight"
                trigger={['click']}
              >
                <Button 
                  type="text" 
                  icon={<GlobalOutlined />}
                  style={{ color: 'var(--text-primary)' }}
                >
                  {i18n.language?.toUpperCase() || 'EN'}
                </Button>
              </Dropdown>
              
              {user?.profile?.role && ['admin'].includes(user.profile.role.toLowerCase()) && (
                <NotificationBell />
              )}
              
              <Dropdown
                menu={{ 
                  items: userMenuItems,
                  onClick: handleUserMenuClick
                }}
                placement="bottomRight"
                trigger={['click']}
              >
                <div className="user-info" style={{ cursor: 'pointer' }}>
                  <Avatar 
                    className="user-avatar"
                    size="small"
                    src={user?.profile?.avatarUrl || '/default-avatar.svg'}
                  >
                    {(user?.firstName || user?.username || 'U')[0].toUpperCase()}
                  </Avatar>
                  <span className="username" style={{ marginLeft: '8px' }}>
                    {user?.firstName || user?.username}
                  </span>
                </div>
              </Dropdown>
            </Space>
          </div>
        </Header>
        <Content
          className="admin-content"
          style={{
            margin: 0,
            padding: 0,
            minHeight: 'calc(100vh - 64px)',
            background: 'var(--background-color)',
            overflow: 'initial',
          }}
        >
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
