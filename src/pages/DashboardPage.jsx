import { Box, Typography, Card, CardContent, Button, Grid, Stack, Chip, CircularProgress, Alert, Divider } from '@mui/joy';
import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useAuth } from '../core/presentation/hooks/useAuth';
import { Link } from 'react-router-dom';
import { USER_ROLES, getRoleColor, formatDate } from '../utils/constants';
import { GET_DASHBOARD_STATS, GET_RECENT_ACTIVITY } from '../graphql/queries';
import UserManagement from '../components/UserManagement';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Always call hooks in the same order
  const userRole = user?.profile?.role || USER_ROLES.READER;
  const isAdminOrManager = userRole === USER_ROLES.ADMIN || userRole === USER_ROLES.MANAGER;
  const isAdmin = userRole === USER_ROLES.ADMIN;

  // Fetch dashboard data for admin/manager users - always call hooks, but skip when not needed
  const { data: statsData, loading: statsLoading, error: statsError } = useQuery(GET_DASHBOARD_STATS, {
    skip: !isAuthenticated || !isAdminOrManager,
  });

  const { data: activityData, loading: activityLoading } = useQuery(GET_RECENT_ACTIVITY, {
    variables: { limit: 5 },
    skip: !isAuthenticated || !isAdminOrManager,
  });

  // Early return after all hooks are called
  if (!isAuthenticated) {
    return (
      <Box textAlign="center" py={6}>
        <Typography level="h3" sx={{ mb: 2 }}>
          Access Denied
        </Typography>
        <Typography level="body1" sx={{ mb: 3, color: 'var(--joy-palette-text-secondary)' }}>
          Please sign in to access your dashboard.
        </Typography>
        <Button component={Link} to="/login">
          Sign In
        </Button>
      </Box>
    );
  }

  const stats = statsData?.dashboardStats;
  const recentActivity = activityData?.recentActivity || [];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography level="h1" sx={{ mb: 2, color: 'var(--joy-palette-text-primary)' }}>
          Dashboard
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography level="body1" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
            Welcome back, {user?.firstName || user?.username}!
          </Typography>
          <Chip size="sm" color={getRoleColor(userRole)}>
            {userRole?.toUpperCase()}
          </Chip>
        </Stack>
      </Box>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {(userRole === USER_ROLES.WRITER || userRole === USER_ROLES.MANAGER || userRole === USER_ROLES.ADMIN) && (
          <Grid xs={12} sm={6} md={3}>
            <Card
              component={Link}
              to="/articles/create"
              variant="outlined"
              sx={{
                p: 3,
                textAlign: 'center',
                textDecoration: 'none',
                color: 'inherit',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: 'var(--joy-shadow-md)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Typography level="h4" sx={{ mb: 1, color: 'var(--joy-palette-primary-700)' }}>
                ✍️
              </Typography>
              <Typography level="title-md" sx={{ mb: 1 }}>
                Write Article
              </Typography>
              <Typography level="body2" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
                Create a new story
              </Typography>
            </Card>
          </Grid>
        )}

        <Grid xs={12} sm={6} md={3}>
          <Card
            component={Link}
            to="/news"
            variant="outlined"
            sx={{
              p: 3,
              textAlign: 'center',
              textDecoration: 'none',
              color: 'inherit',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                boxShadow: 'var(--joy-shadow-md)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Typography level="h4" sx={{ mb: 1, color: 'var(--joy-palette-primary-700)' }}>
              📰
            </Typography>
            <Typography level="title-md" sx={{ mb: 1 }}>
              Browse News
            </Typography>
            <Typography level="body2" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
              Read latest articles
            </Typography>
          </Card>
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <Card
            component={Link}
            to="/profile"
            variant="outlined"
            sx={{
              p: 3,
              textAlign: 'center',
              textDecoration: 'none',
              color: 'inherit',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                boxShadow: 'var(--joy-shadow-md)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Typography level="h4" sx={{ mb: 1, color: 'var(--joy-palette-primary-700)' }}>
              👤
            </Typography>
            <Typography level="title-md" sx={{ mb: 1 }}>
              Profile
            </Typography>
            <Typography level="body2" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
              Manage your profile
            </Typography>
          </Card>
        </Grid>

        {(userRole === USER_ROLES.MANAGER || userRole === USER_ROLES.ADMIN) && (
          <Grid xs={12} sm={6} md={3}>
            <Card
              variant="outlined"
              sx={{
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: 'var(--joy-shadow-md)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Typography level="h4" sx={{ mb: 1, color: 'var(--joy-palette-primary-700)' }}>
                📊
              </Typography>
              <Typography level="title-md" sx={{ mb: 1 }}>
                Analytics
              </Typography>
              <Typography level="body2" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
                View site statistics
              </Typography>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Tab Navigation for Admin/Manager */}
      {isAdminOrManager && (
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" spacing={2}>
            <Button
              variant={activeTab === 'overview' ? 'solid' : 'outlined'}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </Button>
            {isAdmin && (
              <Button
                variant={activeTab === 'users' ? 'solid' : 'outlined'}
                onClick={() => setActiveTab('users')}
              >
                User Management
              </Button>
            )}
            <Button
              variant={activeTab === 'content' ? 'solid' : 'outlined'}
              onClick={() => setActiveTab('content')}
            >
              Content Management
            </Button>
          </Stack>
        </Box>
      )}

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Recent Activity */}
          <Card variant="outlined" sx={{ mb: 4 }}>
            <CardContent>
              <Typography level="h3" sx={{ mb: 3, color: 'var(--joy-palette-text-primary)' }}>
                Recent Activity
              </Typography>
              <Box textAlign="center" py={4}>
                <Typography level="body2" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
                  No recent activity to display
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Stats Overview */}
          <Grid container spacing={3}>
            <Grid xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography level="h2" sx={{ color: 'var(--joy-palette-primary-700)' }}>
                    0
                  </Typography>
                  <Typography level="body2" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
                    Articles Read
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography level="h2" sx={{ color: 'var(--joy-palette-primary-700)' }}>
                    0
                  </Typography>
                  <Typography level="body2" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
                    Comments Made
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {(userRole === USER_ROLES.WRITER || userRole === USER_ROLES.MANAGER || userRole === USER_ROLES.ADMIN) && (
              <>
                <Grid xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography level="h2" sx={{ color: 'var(--joy-palette-primary-700)' }}>
                        0
                      </Typography>
                      <Typography level="body2" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
                        Articles Written
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography level="h2" sx={{ color: 'var(--joy-palette-primary-700)' }}>
                        0
                      </Typography>
                      <Typography level="body2" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
                        Total Views
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </>
            )}
          </Grid>

          {/* Statistics Section for Admin/Manager */}
          {isAdminOrManager && (
            <Box sx={{ mb: 4 }}>
              <Typography level="h3" sx={{ mb: 3, color: 'var(--joy-palette-text-primary)' }}>
                System Statistics
              </Typography>

              {statsLoading ? (
                <Card variant="outlined" sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress size="lg" />
                  <Typography level="body1" sx={{ mt: 2 }}>
                    Loading statistics...
                  </Typography>
                </Card>
              ) : statsError ? (
                <Alert color="warning" sx={{ mb: 3 }}>
                  Unable to load statistics. Please check your permissions.
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
                          Published News
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
                          User Roles
                        </Typography>
                        <Stack spacing={2}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography level="body-sm">Readers</Typography>
                            <Chip size="sm" color="primary">
                              {stats.totalReaders}
                            </Chip>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography level="body-sm">Writers</Typography>
                            <Chip size="sm" color="success">
                              {stats.totalWriters}
                            </Chip>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography level="body-sm">Managers</Typography>
                            <Chip size="sm" color="warning">
                              {stats.totalManagers}
                            </Chip>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography level="body-sm">Admins</Typography>
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
                            <Typography level="body-sm">Categories</Typography>
                            <Typography level="title-sm">{stats.totalCategories}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography level="body-sm">Tags</Typography>
                            <Typography level="title-sm">{stats.totalTags}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography level="body-sm">News This Month</Typography>
                            <Chip size="sm" color="primary">
                              {stats.newsThisMonth}
                            </Chip>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography level="body-sm">Total Comments</Typography>
                            <Typography level="title-sm">{stats.totalComments}</Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              ) : null}
            </Box>
          )}

          {/* Recent Activity for Admin/Manager */}
          {isAdminOrManager && recentActivity.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography level="h3" sx={{ mb: 3, color: 'var(--joy-palette-text-primary)' }}>
                Recent Activity
              </Typography>
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
            </Box>
          )}
        </>
      )}

      {activeTab === 'users' && isAdmin && (
        <UserManagement />
      )}

      {activeTab === 'content' && (
        <Box>
          <Typography level="h3" sx={{ mb: 3, color: 'var(--joy-palette-text-primary)' }}>
            Content Management
          </Typography>
          {/* Content management components go here */}
        </Box>
      )}
    </Box>
  );
}
