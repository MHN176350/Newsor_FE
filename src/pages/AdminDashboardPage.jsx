import { Box, Typography, Card, CardContent, Button, Grid, Stack, Chip, CircularProgress, Alert, Divider, Tabs, TabList, Tab, TabPanel } from '@mui/joy';
import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useAuth } from '../core/presentation/hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { USER_ROLES, getRoleColor, formatDate } from '../utils/constants';
import { GET_DASHBOARD_STATS, GET_RECENT_ACTIVITY } from '../graphql/queries';
import UserManagement from '../components/UserManagement';
import ContentManagement from '../components/ContentManagement';
import { useTranslation } from 'react-i18next';

export default function AdminDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // All hooks must be called before early returns
  const userRole = user?.profile?.role || USER_ROLES.READER;
  const isAdmin = isAuthenticated && userRole?.toLowerCase() === USER_ROLES.ADMIN.toLowerCase();

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
      <Box textAlign="center" py={6}>
        <Typography level="h3" sx={{ mb: 2 }}>
          {t('admin.accessDenied')}
        </Typography>
        <Typography level="body1" sx={{ mb: 3, color: 'var(--joy-palette-text-secondary)' }}>
          {t('admin.signInRequired')}
        </Typography>
        <Button component={Link} to="/login">
          {t('auth.login.signIn')}
        </Button>
      </Box>
    );
  }

  // Restrict access to admin users only (case-insensitive comparison)
  if (!isAdmin) {
    return (
      <Box textAlign="center" py={6}>
        <Typography level="h3" sx={{ mb: 2, color: 'danger.500' }}>
          {t('admin.accessDenied')}
        </Typography>
        <Typography level="body1" sx={{ mb: 3, color: 'var(--joy-palette-text-secondary)' }}>
          {t('admin.noPermission')}
        </Typography>
        <Typography level="body2" sx={{ mb: 3, color: 'var(--joy-palette-text-secondary)' }}>
          {t('admin.currentRole')}: {userRole} | {t('admin.requiredRole')}: {t('common.admin')}
        </Typography>
        <Button onClick={() => navigate(-1)}>
          {t('common.back')}
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography level="h1" sx={{ mb: 2, color: 'var(--joy-palette-text-primary)' }}>
          ⚙️ {t('admin.title')}
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography level="body1" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
            {t('admin.subtitle')}
          </Typography>
          <Chip size="sm" color="danger">
            {t('admin.adminChip')}
          </Chip>
        </Stack>
      </Box>

      {/* Navigation Tabs */}
      <Tabs defaultValue={0} sx={{ mb: 4 }}>
        <TabList>
          <Tab>{t('admin.tabs.systemOverview')}</Tab>
          <Tab>{t('admin.tabs.userManagement')}</Tab>
          <Tab>{t('admin.tabs.contentManagement')}</Tab>
          <Tab>{t('admin.tabs.systemSettings')}</Tab>
        </TabList>

        {/* System Overview Tab */}
        <TabPanel value={0} sx={{ px: 0 }}>
          {/* System Statistics */}
          <Box sx={{ mb: 4 }}>
            <Typography level="h3" sx={{ mb: 3, color: 'var(--joy-palette-text-primary)' }}>
              {t('admin.systemStats')}
            </Typography>

            {statsLoading ? (
              <Card variant="outlined" sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size="lg" />
                <Typography level="body1" sx={{ mt: 2 }}>
                  {t('admin.loadingStats')}
                </Typography>
              </Card>
            ) : statsError ? (
              <Alert color="danger" sx={{ mb: 3 }}>
                {t('admin.statsError')}: {statsError.message}
              </Alert>
            ) : stats ? (
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* User Statistics */}
                <Grid xs={12} sm={6} md={3}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography level="title-sm" sx={{ color: 'primary.500', mb: 1 }}>
                        {t('admin.stats.totalUsers')}
                      </Typography>
                      <Typography level="h2" sx={{ mb: 1 }}>
                        {stats.totalUsers}
                      </Typography>
                      <Typography level="body-sm" sx={{ color: 'success.500' }}>
                        +{stats.newUsersThisMonth} {t('admin.stats.thisMonth')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid xs={12} sm={6} md={3}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography level="title-sm" sx={{ color: 'success.500', mb: 1 }}>
                        {t('admin.stats.publishedArticles')}
                      </Typography>
                      <Typography level="h2" sx={{ mb: 1 }}>
                        {stats.publishedNews}
                      </Typography>
                      <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                        {t('news.of')} {stats.totalNews} {t('admin.stats.total')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid xs={12} sm={6} md={3}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography level="title-sm" sx={{ color: 'warning.500', mb: 1 }}>
                        {t('admin.stats.pendingReview')}
                      </Typography>
                      <Typography level="h2" sx={{ mb: 1 }}>
                        {stats.pendingNews}
                      </Typography>
                      <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                        {stats.draftNews} {t('admin.stats.drafts')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid xs={12} sm={6} md={3}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography level="title-sm" sx={{ color: 'neutral.500', mb: 1 }}>
                        {t('admin.stats.totalViews')}
                      </Typography>
                      <Typography level="h2" sx={{ mb: 1 }}>
                        {stats.totalViews.toLocaleString()}
                      </Typography>
                      <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                        {stats.totalLikes} {t('admin.stats.likes')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* User Role Breakdown */}
                <Grid xs={12} md={6}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography level="title-md" sx={{ mb: 2 }}>
                        {t('admin.userRoleDistribution')}
                      </Typography>
                      <Stack spacing={2}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography level="body-sm">👥 {t('admin.roles.readers')}</Typography>
                          <Chip size="sm" color="primary">
                            {stats.totalReaders}
                          </Chip>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography level="body-sm">✍️ {t('admin.roles.writers')}</Typography>
                          <Chip size="sm" color="success">
                            {stats.totalWriters}
                          </Chip>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography level="body-sm">📊 {t('admin.roles.managers')}</Typography>
                          <Chip size="sm" color="warning">
                            {stats.totalManagers}
                          </Chip>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography level="body-sm">⚙️ {t('admin.roles.admins')}</Typography>
                          <Chip size="sm" color="danger">
                            {stats.totalAdmins}
                          </Chip>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Content Statistics */}
                <Grid xs={12} md={6}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography level="title-md" sx={{ mb: 2 }}>
                        {t('admin.contentOverview')}
                      </Typography>
                      <Stack spacing={2}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography level="body-sm">📁 {t('common.categories')}</Typography>
                          <Typography level="title-sm">{stats.totalCategories}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography level="body-sm">🏷️ {t('common.tags')}</Typography>
                          <Typography level="title-sm">{stats.totalTags}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography level="body-sm">📰 {t('admin.stats.articlesThisMonth')}</Typography>
                          <Chip size="sm" color="primary">
                            {stats.newsThisMonth}
                          </Chip>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography level="body-sm">💬 {t('admin.stats.totalComments')}</Typography>
                          <Typography level="title-sm">{stats.totalComments}</Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            ) : null}
          </Box>

          {/* Recent System Activity */}
          <Box sx={{ mb: 4 }}>
            <Typography level="h3" sx={{ mb: 3, color: 'var(--joy-palette-text-primary)' }}>
              {t('admin.recentActivity')}
            </Typography>
            
            {activityLoading ? (
              <Card variant="outlined" sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size="lg" />
                <Typography level="body1" sx={{ mt: 2 }}>
                  {t('admin.loadingActivity')}
                </Typography>
              </Card>
            ) : recentActivity.length > 0 ? (
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={2}>
                    {recentActivity.map((activity, index) => (
                      <Box key={activity.id}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography level="body-sm" sx={{ fontWeight: 500 }}>
                              {activity.description}
                            </Typography>
                            <Typography level="body-xs" sx={{ color: 'text.secondary', mt: 0.5 }}>
                              {t('admin.activityBy')} {activity.user?.firstName || activity.user?.username}
                            </Typography>
                          </Box>
                          <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
                            {formatDate(activity.timestamp)}
                          </Typography>
                        </Box>
                        {index < recentActivity.length - 1 && <Divider sx={{ my: 1 }} />}
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            ) : (
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Typography level="body2" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
                    {t('admin.noActivity')}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Box>
        </TabPanel>

        {/* User Management Tab */}
        <TabPanel value={1} sx={{ px: 0 } }>
          <UserManagement />
        </TabPanel>

        {/* Content Management Tab */}
        <TabPanel value={2} sx={{ px: 0 }}>
          <ContentManagement />
        </TabPanel>

        {/* System Settings Tab */}
        <TabPanel value={3} sx={{ px: 0 }}>
          <Typography level="h3" sx={{ mb: 3, color: 'var(--joy-palette-text-primary)' }}>
            {t('admin.tabs.systemSettings')}
          </Typography>
          <Card variant="outlined">
            <CardContent>
              <Typography level="body1" sx={{ color: 'text.secondary' }}>
                {t('admin.settingsPlaceholder')}
              </Typography>
              <Typography level="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                {t('admin.settingsDescription')}
              </Typography>
            </CardContent>
          </Card>
        </TabPanel>
      </Tabs>
    </Box>
  );
}
