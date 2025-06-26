import { Box, Typography, Card, CardContent, Button, Grid, Stack, Chip } from '@mui/joy';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { USER_ROLES, getRoleColor } from '../utils/constants';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();

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

  const userRole = user?.profile?.role || USER_ROLES.READER;

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
    </Box>
  );
}
