import React, { useState } from 'react';
import { Row, Col, Card, Statistic, Tag, Alert, Spin, Typography, Space, Button, Divider, Tabs, Empty } from 'antd';
import { 
  UserOutlined, 
  FileTextOutlined, 
  EyeOutlined, 
  LikeOutlined,
  FolderOutlined,
  TagOutlined,
  CommentOutlined,
  CalendarOutlined,
  TrophyOutlined,
  RiseOutlined,
  TeamOutlined,
  BarChartOutlined,
  SettingOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import { useQuery } from '@apollo/client';
import { GET_DASHBOARD_STATS, GET_RECENT_ACTIVITY } from '../graphql/queries';
import { formatDate, formatNumber } from '../utils/helpers';
import { useAuth } from '../store/AuthContext';
import { useTranslation } from 'react-i18next';
import '../styles/admin-theme.css';

const { Title, Text } = Typography;

const Dashboard = () => {
  const { user, isAuthenticated, userRole } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('1');
  
  // All hooks must be called before early returns
  const isAdmin = isAuthenticated && (userRole?.toLowerCase() === 'admin' || userRole?.toLowerCase() === 'manager');

  // Fetch dashboard data (hooks must always be called)
  const { data: statsData, loading: statsLoading, error: statsError } = useQuery(GET_DASHBOARD_STATS, {
    skip: !isAdmin, // Skip the query if not admin
  });
  const { data: activityData, loading: activityLoading } = useQuery(GET_RECENT_ACTIVITY, {
    variables: { limit: 10 },
    skip: !isAdmin, // Skip the query if not admin
  });

  const stats = statsData?.dashboardStats;
  const recentActivity = activityData?.recentActivity || [];

  // Check if user is authenticated and is admin (after all hooks)
  if (!isAuthenticated) {
    return (
      <div className="dashboard-container">
        <Card className="analytics-card" style={{ textAlign: 'center', margin: '40px' }}>
          <Title level={3} style={{ marginBottom: '16px' }}>
            {t('admin.accessDenied')}
          </Title>
          <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
            {t('admin.signInRequired')}
          </Text>
          <Button type="primary" href="/login">
            {t('auth.login.signIn')}
          </Button>
        </Card>
      </div>
    );
  }

  // Restrict access to admin users only
  if (!isAdmin) {
    return (
      <div className="dashboard-container">
        <Card className="analytics-card" style={{ textAlign: 'center', margin: '40px' }}>
          <Title level={3} style={{ marginBottom: '16px', color: '#ef4444' }}>
            {t('admin.accessDenied')}
          </Title>
          <Text type="secondary" style={{ marginBottom: '16px', display: 'block' }}>
            {t('admin.noPermission')}
          </Text>
          <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
            {t('admin.currentRole')}: {userRole} | {t('admin.requiredRole')}: {t('common.admin')}
          </Text>
          <Button type="default" onClick={() => window.history.back()}>
            {t('common.back')}
          </Button>
        </Card>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="dashboard-container">
        <Alert
          message={t('admin.statsError')}
          description={statsError.message}
          type="error"
          showIcon
          style={{ margin: '20px' }}
        />
      </div>
    );
  }

  const tabItems = [
    {
      key: '1',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChartOutlined />
          {t('admin.tabs.systemOverview')}
        </span>
      ),
      children: (
        <div>
          {/* System Statistics */}
          <Title level={4} style={{ marginBottom: '24px', color: 'var(--text-primary)' }}>
            {t('admin.systemStats')}
          </Title>

          {statsLoading ? (
            <Card className="analytics-card" style={{ textAlign: 'center', padding: '40px' }}>
              <Spin size="large" />
              <Text style={{ marginTop: '16px', display: 'block' }}>
                {t('admin.loadingStats')}
              </Text>
            </Card>
          ) : stats ? (
            <>
              {/* Main Statistics */}
              <Row gutter={[24, 24]} className="stats-row">
                <Col xs={24} sm={12} md={6}>
                  <Card className="stat-card stat-card-primary">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div className="stat-icon">
                        <UserOutlined />
                      </div>
                      <div className="stat-content">
                        <Statistic
                          title={t('admin.stats.totalUsers')}
                          value={stats.totalUsers || 0}
                          valueStyle={{ color: 'var(--primary-color)', fontWeight: 'bold' }}
                        />
                        <div className="stat-trend">
                          <RiseOutlined style={{ color: 'var(--success-color)' }} />
                          <Text type="success">+{stats.newUsersThisMonth || 0} {t('admin.stats.thisMonth')}</Text>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <Card className="stat-card stat-card-success">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div className="stat-icon">
                        <FileTextOutlined />
                      </div>
                      <div className="stat-content">
                        <Statistic
                          title={t('admin.stats.publishedArticles')}
                          value={stats.publishedNews || 0}
                          valueStyle={{ color: 'var(--success-color)', fontWeight: 'bold' }}
                        />
                        <div className="stat-trend">
                          <Text type="secondary">{stats.pendingNews || 0} {t('admin.stats.pendingReview')}</Text>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <Card className="stat-card stat-card-warning">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div className="stat-icon">
                        <EyeOutlined />
                      </div>
                      <div className="stat-content">
                        <Statistic
                          title={t('admin.stats.totalViews')}
                          value={formatNumber(stats.totalViews || 0)}
                          valueStyle={{ color: 'var(--warning-color)', fontWeight: 'bold' }}
                        />
                        <div className="stat-trend">
                          <Text type="secondary">{formatNumber(stats.totalLikes || 0)} {t('admin.stats.likes')}</Text>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <Card className="stat-card stat-card-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div className="stat-icon">
                        <CommentOutlined />
                      </div>
                      <div className="stat-content">
                        <Statistic
                          title={t('admin.stats.totalComments')}
                          value={formatNumber(stats.totalComments || 0)}
                          valueStyle={{ color: 'var(--info-color)', fontWeight: 'bold' }}
                        />
                        <div className="stat-trend">
                          <Text type="secondary">{t('common.total')} {t('admin.stats.totalComments')}</Text>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>

              {/* Detailed Statistics */}
              <Row gutter={[24, 24]} style={{ marginTop: '32px' }}>
                <Col xs={24} md={12}>
                  <Card 
                    className="analytics-card"
                    title={
                      <div className="card-header">
                        <TeamOutlined className="card-icon" />
                        <span>{t('admin.userRoleDistribution')}</span>
                      </div>
                    }
                  >
                    <div className="role-distribution">
                      <div className="role-item">
                        <div className="role-label">
                          <span className="role-emoji">👥</span>
                          <span>{t('admin.roles.readers')}</span>
                        </div>
                        <div className="role-stats">
                          <Tag color="blue">{stats.totalReaders || 0}</Tag>
                        </div>
                      </div>
                      <div className="role-item">
                        <div className="role-label">
                          <span className="role-emoji">✍️</span>
                          <span>{t('admin.roles.writers')}</span>
                        </div>
                        <div className="role-stats">
                          <Tag color="green">{stats.totalWriters || 0}</Tag>
                        </div>
                      </div>
                      <div className="role-item">
                        <div className="role-label">
                          <span className="role-emoji">📊</span>
                          <span>{t('admin.roles.managers')}</span>
                        </div>
                        <div className="role-stats">
                          <Tag color="orange">{stats.totalManagers || 0}</Tag>
                        </div>
                      </div>
                      <div className="role-item">
                        <div className="role-label">
                          <span className="role-emoji">⚙️</span>
                          <span>{t('admin.roles.admins')}</span>
                        </div>
                        <div className="role-stats">
                          <Tag color="red">{stats.totalAdmins || 0}</Tag>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>

                <Col xs={24} md={12}>
                  <Card 
                    className="analytics-card"
                    title={
                      <div className="card-header">
                        <FileTextOutlined className="card-icon" />
                        <span>{t('admin.contentOverview')}</span>
                      </div>
                    }
                  >
                    <div className="content-stats">
                      <Space direction="vertical" size={16} style={{ width: '100%' }}>
                        <div className="content-stat-item">
                          <div className="content-stat-icon">
                            <FolderOutlined />
                          </div>
                          <div className="content-stat-info">
                            <Text strong>📁 {t('common.categories')}</Text>
                            <Text type="secondary">{stats.totalCategories || 0}</Text>
                          </div>
                        </div>
                        <div className="content-stat-item">
                          <div className="content-stat-icon">
                            <TagOutlined />
                          </div>
                          <div className="content-stat-info">
                            <Text strong>🏷️ {t('common.tags')}</Text>
                            <Text type="secondary">{stats.totalTags || 0}</Text>
                          </div>
                        </div>
                        <div className="content-stat-item">
                          <div className="content-stat-icon">
                            <CalendarOutlined />
                          </div>
                          <div className="content-stat-info">
                            <Text strong>📰 {t('admin.stats.articlesThisMonth')}</Text>
                            <Tag color="blue">{stats.newsThisMonth || 0}</Tag>
                          </div>
                        </div>
                      </Space>
                    </div>
                  </Card>
                </Col>
              </Row>
            </>
          ) : null}

          {/* Recent System Activity */}
          <Title level={4} style={{ marginTop: '32px', marginBottom: '24px', color: 'var(--text-primary)' }}>
            {t('admin.recentActivity')}
          </Title>
          
          {activityLoading ? (
            <Card className="activity-card" style={{ textAlign: 'center', padding: '40px' }}>
              <Spin size="large" />
              <Text style={{ marginTop: '16px', display: 'block' }}>
                {t('admin.loadingActivity')}
              </Text>
            </Card>
          ) : recentActivity.length > 0 ? (
            <Card className="activity-card">
              <div className="activity-list">
                {recentActivity.map((activity, index) => (
                  <div key={activity.id || index} className="activity-item">
                    <div className="activity-avatar">
                      <div className="avatar-circle">
                        {(activity.user?.firstName || activity.user?.username || 'U')[0].toUpperCase()}
                      </div>
                    </div>
                    <div className="activity-content">
                      <div className="activity-description">
                        <Text strong>{activity.description}</Text>
                      </div>
                      <div className="activity-meta">
                        <Text type="secondary">
                          {t('admin.activityBy')} {activity.user?.firstName || activity.user?.username || 'Unknown'}
                        </Text>
                        <Text type="secondary" style={{ marginLeft: '16px' }}>
                          {formatDate(activity.timestamp)}
                        </Text>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card className="activity-card">
              <Empty 
                description={t('admin.noActivity')}
                style={{ padding: '40px' }}
              />
            </Card>
          )}
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TeamOutlined />
          {t('admin.tabs.userManagement')}
        </span>
      ),
      children: (
        <div className="tab-content">
          <Title level={4}>{t('admin.tabs.userManagement')}</Title>
          <Text type="secondary">{t('users.subtitle')}</Text>
          <div style={{ marginTop: '32px' }}>
            <Button type="primary" href="/users">
              {t('navigation.users')}
            </Button>
          </div>
        </div>
      ),
    },
    {
      key: '3',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileTextOutlined />
          {t('admin.tabs.contentManagement')}
        </span>
      ),
      children: (
        <div className="tab-content">
          <Title level={4}>{t('admin.tabs.contentManagement')}</Title>
          <Text type="secondary">{t('articles.subtitle')}</Text>
          <div style={{ marginTop: '32px' }}>
            <Space>
              <Button type="primary" href="/articles">
                {t('navigation.articles')}
              </Button>
              <Button href="/categories">
                {t('navigation.categories')}
              </Button>
              <Button href="/tags">
                {t('navigation.tags')}
              </Button>
            </Space>
          </div>
        </div>
      ),
    },
    {
      key: '4',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SettingOutlined />
          {t('admin.tabs.systemSettings')}
        </span>
      ),
      children: (
        <div className="tab-content">
          <Title level={4}>{t('admin.tabs.systemSettings')}</Title>
          <Text type="secondary">{t('admin.settingsDescription')}</Text>
          <div style={{ marginTop: '32px' }}>
            <Button type="primary" href="/settings">
              {t('navigation.settings')}
            </Button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="dashboard-container">
      {/* Welcome Header */}
      <div className="dashboard-welcome">
        <div className="welcome-content">
          <Title level={1} className="welcome-title">
            ⚙️ {t('admin.welcomeTitle')}
          </Title>
          <Text className="welcome-subtitle">
            {t('admin.welcomeSubtitle')}
          </Text>
          <Space className="welcome-actions">
            <Button type="primary" size="large" href="/articles">
              {t('navigation.articles')}
            </Button>
            <Button size="large" href="/users">
              {t('navigation.users')}
            </Button>
          </Space>
        </div>
        <div className="welcome-illustration">
          <div className="illustration-circle">
            <DashboardOutlined style={{ fontSize: '48px', color: 'white' }} />
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="dashboard-content">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="dashboard-tabs"
        />
      </div>
    </div>
  );
};

export default Dashboard;
