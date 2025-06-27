import { Box, Typography, Card, CardContent, Button, Grid, Stack, Chip, CircularProgress, Alert, Divider, Tabs, TabList, Tab, TabPanel } from '@mui/joy';
import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { USER_ROLES, getRoleColor, formatDate } from '../utils/constants';
import { GET_DASHBOARD_STATS, GET_RECENT_ACTIVITY } from '../graphql/queries';
import UserManagement from '../components/UserManagement';

export default function AdminDashboardPage() {
  const { user, isAuthenticated } = useAuth();
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
          Access Denied
        </Typography>
        <Typography level="body1" sx={{ mb: 3, color: 'var(--joy-palette-text-secondary)' }}>
          Please sign in to access the admin dashboard.
        </Typography>
        <Button component={Link} to="/login">
          Sign In
        </Button>
      </Box>
    );
  }

  // Restrict access to admin users only (case-insensitive comparison)
  if (!isAdmin) {
    return (
      <Box textAlign="center" py={6}>
        <Typography level="h3" sx={{ mb: 2, color: 'danger.500' }}>
          Access Denied
        </Typography>
        <Typography level="body1" sx={{ mb: 3, color: 'var(--joy-palette-text-secondary)' }}>
          You don't have permission to access the admin dashboard.
        </Typography>
        <Typography level="body2" sx={{ mb: 3, color: 'var(--joy-palette-text-secondary)' }}>
          Your role: {userRole} | Required: admin
        </Typography>
        <Button onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography level="h1" sx={{ mb: 2, color: 'var(--joy-palette-text-primary)' }}>
          ⚙️ Admin Dashboard
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography level="body1" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
            System Administration & Management
          </Typography>
          <Chip size="sm" color="danger">
            ADMIN
          </Chip>
        </Stack>
      </Box>

      {/* Navigation Tabs */}
      <Tabs defaultValue={0} sx={{ mb: 4 }}>
        <TabList>
          <Tab>System Overview</Tab>
          <Tab>User Management</Tab>
          <Tab>Content Management</Tab>
          <Tab>System Settings</Tab>
        </TabList>

        {/* System Overview Tab */}
        <TabPanel value={0} sx={{ px: 0 }}>
          {/* System Statistics */}
          <Box sx={{ mb: 4 }}>
            <Typography level="h3" sx={{ mb: 3, color: 'var(--joy-palette-text-primary)' }}>
              System Statistics
            </Typography>

            {statsLoading ? (
              <Card variant="outlined" sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size="lg" />
                <Typography level="body1" sx={{ mt: 2 }}>
                  Loading system statistics...
                </Typography>
              </Card>
            ) : statsError ? (
              <Alert color="danger" sx={{ mb: 3 }}>
                Error loading system statistics: {statsError.message}
              </Alert>
            ) : stats ? (
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* User Statistics */}
                <Grid xs={12} sm={6} md={3}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography level="title-sm" sx={{ color: 'primary.500', mb: 1 }}>
                        Total Users
                      </Typography>
                      <Typography level="h2" sx={{ mb: 1 }}>
                        {stats.totalUsers}
                      </Typography>
                      <Typography level="body-sm" sx={{ color: 'success.500' }}>
                        +{stats.newUsersThisMonth} this month
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid xs={12} sm={6} md={3}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography level="title-sm" sx={{ color: 'success.500', mb: 1 }}>
                        Published Articles
                      </Typography>
                      <Typography level="h2" sx={{ mb: 1 }}>
                        {stats.publishedNews}
                      </Typography>
                      <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                        of {stats.totalNews} total
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid xs={12} sm={6} md={3}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography level="title-sm" sx={{ color: 'warning.500', mb: 1 }}>
                        Pending Review
                      </Typography>
                      <Typography level="h2" sx={{ mb: 1 }}>
                        {stats.pendingNews}
                      </Typography>
                      <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                        {stats.draftNews} drafts
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid xs={12} sm={6} md={3}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography level="title-sm" sx={{ color: 'neutral.500', mb: 1 }}>
                        Total Views
                      </Typography>
                      <Typography level="h2" sx={{ mb: 1 }}>
                        {stats.totalViews.toLocaleString()}
                      </Typography>
                      <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                        {stats.totalLikes} likes
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* User Role Breakdown */}
                <Grid xs={12} md={6}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography level="title-md" sx={{ mb: 2 }}>
                        User Role Distribution
                      </Typography>
                      <Stack spacing={2}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography level="body-sm">👥 Readers</Typography>
                          <Chip size="sm" color="primary">
                            {stats.totalReaders}
                          </Chip>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography level="body-sm">✍️ Writers</Typography>
                          <Chip size="sm" color="success">
                            {stats.totalWriters}
                          </Chip>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography level="body-sm">📊 Managers</Typography>
                          <Chip size="sm" color="warning">
                            {stats.totalManagers}
                          </Chip>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography level="body-sm">⚙️ Admins</Typography>
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
                        Content Overview
                      </Typography>
                      <Stack spacing={2}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography level="body-sm">📁 Categories</Typography>
                          <Typography level="title-sm">{stats.totalCategories}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography level="body-sm">🏷️ Tags</Typography>
                          <Typography level="title-sm">{stats.totalTags}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography level="body-sm">📰 Articles This Month</Typography>
                          <Chip size="sm" color="primary">
                            {stats.newsThisMonth}
                          </Chip>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography level="body-sm">💬 Total Comments</Typography>
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
              Recent System Activity
            </Typography>
            
            {activityLoading ? (
              <Card variant="outlined" sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size="lg" />
                <Typography level="body1" sx={{ mt: 2 }}>
                  Loading recent activity...
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
                              by {activity.user?.firstName || activity.user?.username}
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
                    No recent activity to display
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
          <Typography level="h3" sx={{ mb: 3, color: 'var(--joy-palette-text-primary)' }}>
            Content Management
          </Typography>
          <Card variant="outlined">
            <CardContent>
              <Typography level="body1" sx={{ color: 'text.secondary' }}>
                Content management features will be implemented here.
              </Typography>
              <Typography level="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                This could include article approval, category management, tag management, etc.
              </Typography>
            </CardContent>
          </Card>
        </TabPanel>

        {/* System Settings Tab */}
        <TabPanel value={3} sx={{ px: 0 }}>
          <Typography level="h3" sx={{ mb: 3, color: 'var(--joy-palette-text-primary)' }}>
            System Settings
          </Typography>
          <Card variant="outlined">
            <CardContent>
              <Typography level="body1" sx={{ color: 'text.secondary' }}>
                System configuration and settings will be available here.
              </Typography>
              <Typography level="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                This could include site settings, email configuration, security settings, etc.
              </Typography>
            </CardContent>
          </Card>
        </TabPanel>
      </Tabs>
    </Box>
  );
}
