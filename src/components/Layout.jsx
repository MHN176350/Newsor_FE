import { Box, Typography, Button, Sheet, IconButton, Avatar, Dropdown, Menu, MenuButton, MenuItem, Chip } from '@mui/joy';
import { useColorScheme } from '@mui/joy/styles';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@apollo/client';
import { GET_CATEGORIES } from '../graphql/queries';

export default function Layout({ children }) {
  const { mode, setMode } = useColorScheme();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  // Fetch categories for dropdown
  const { data: categoriesData } = useQuery(GET_CATEGORIES);
  const categories = categoriesData?.categories || [];

  const toggleColorScheme = () => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getUserDisplayName = () => {
    if (!user) return '';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName} ${lastName}`.trim() || user.username;
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    return user.username?.charAt(0)?.toUpperCase() || 'U';
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.body' }}>
      {/* Header */}
      <Sheet
        component="header"
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'neutral.200',
          bgcolor: 'background.surface',
        }}
      >
        <Typography
          level="h3"
          component={Link}
          to="/"
          sx={{
            textDecoration: 'none',
            color: 'text.primary',
            fontWeight: 'bold',
            '&:hover': { color: 'primary.600' }
          }}
        >
          📰 Newsor
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {/* Navigation Links */}
          <Button
            variant="plain"
            component={Link}
            to="/"
            sx={{ 
              color: 'text.secondary',
              '&:hover': { color: 'text.primary', bgcolor: 'neutral.100' }
            }}
          >
            Home
          </Button>
          
          {/* News Dropdown with Categories */}
          <Dropdown>
            <MenuButton
              slots={{ root: Button }}
              slotProps={{
                root: {
                  variant: 'plain',
                  sx: { 
                    color: 'text.secondary',
                    '&:hover': { color: 'text.primary', bgcolor: 'neutral.100' }
                  }
                }
              }}
            >
              News
            </MenuButton>
            <Menu placement="bottom-start" sx={{ zIndex: 1300 }}>
              <MenuItem onClick={() => navigate('/news')}>
                📰 All News
              </MenuItem>
              {categories.length > 0 && (
                <>
                  <MenuItem disabled sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}>
                    BY CATEGORY
                  </MenuItem>
                  {categories.map((category) => (
                    <MenuItem 
                      key={category.id}
                      onClick={() => navigate(`/news?category=${category.slug}`)}
                    >
                      {category.name}
                    </MenuItem>
                  ))}
                </>
              )}
            </Menu>
          </Dropdown>

          {/* Authenticated user additional navigation */}
          {isAuthenticated && (
            <>
              <Button
                variant="plain"
                component={Link}
                to="/profile"
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': { color: 'text.primary', bgcolor: 'neutral.100' }
                }}
              >
                Profile
              </Button>
              {user?.profile?.role && ['writer', 'manager', 'admin'].includes(user.profile.role.toLowerCase()) && (
                <Button
                  variant="plain"
                  component={Link}
                  to="/dashboard"
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': { color: 'text.primary', bgcolor: 'neutral.100' }
                  }}
                >
                  Dashboard
                </Button>
              )}
              {user?.profile?.role?.toLowerCase() === 'admin' && (
                <Button
                  variant="plain"
                  component={Link}
                  to="/admin"
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': { color: 'text.primary', bgcolor: 'neutral.100' }
                  }}
                >
                  Admin Dashboard
                </Button>
              )}
            </>
          )}

          {/* Theme Toggle */}
          <IconButton
            onClick={toggleColorScheme}
            sx={{ 
              borderRadius: '50%',
              bgcolor: 'neutral.100',
              '&:hover': { bgcolor: 'neutral.200' }
            }}
          >
            {mode === 'dark' ? '🌞' : '🌙'}
          </IconButton>

          {/* Auth Section */}
          {isAuthenticated ? (
            /* User Profile Dropdown */
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* User Role Badge */}
              {user?.profile?.role && (
                <Chip
                  size="sm"
                  variant="soft"
                  color={
                    user.profile.role.toLowerCase() === 'admin' ? 'danger' :
                    user.profile.role.toLowerCase() === 'manager' ? 'warning' :
                    user.profile.role.toLowerCase() === 'writer' ? 'success' : 'neutral'
                  }
                >
                  {user.profile.role.charAt(0).toUpperCase() + user.profile.role.slice(1).toLowerCase()}
                </Chip>
              )}
              
              <Dropdown>
                <MenuButton
                  slots={{ root: Box }}
                  slotProps={{
                    root: {
                      sx: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        cursor: 'pointer',
                        p: 1,
                        borderRadius: 'sm',
                        '&:hover': { bgcolor: 'neutral.100' }
                      }
                    }
                  }}
                >
                  <Avatar
                    size="sm"
                    src={user?.profile?.avatarUrl}
                    sx={{ 
                      bgcolor: 'primary.500',
                      color: 'white',
                      fontSize: '0.75rem'
                    }}
                  >
                    {getUserInitials()}
                  </Avatar>
                  <Typography level="body-sm" sx={{ fontWeight: 'md', color: 'text.primary' }}>
                    {getUserDisplayName()}
                  </Typography>
                </MenuButton>
                <Menu placement="bottom-end" sx={{ zIndex: 1300 }}>
                  <MenuItem onClick={() => navigate('/profile')}>
                    👤 Profile
                  </MenuItem>
                  {user?.profile?.role && ['writer', 'manager', 'admin'].includes(user.profile.role.toLowerCase()) && (
                    <MenuItem onClick={() => navigate('/dashboard')}>
                      📊 Dashboard
                    </MenuItem>
                  )}
                  {user?.profile?.role?.toLowerCase() === 'admin' && (
                    <MenuItem onClick={() => navigate('/admin')}>
                      ⚙️ Admin Dashboard
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleLogout} sx={{ color: 'danger.500' }}>
                    🚪 Logout
                  </MenuItem>
                </Menu>
              </Dropdown>
            </Box>
          ) : (
            /* Login/Register Buttons */
            <>
              <Button
                variant="outlined"
                size="sm"
                onClick={() => navigate('/login')}
                sx={{
                  borderColor: 'neutral.300',
                  color: 'text.primary',
                  '&:hover': { borderColor: 'primary.400', bgcolor: 'neutral.50' }
                }}
              >
                Login
              </Button>
              <Button
                variant="solid"
                size="sm"
                onClick={() => navigate('/register')}
                sx={{
                  bgcolor: 'primary.600',
                  '&:hover': { bgcolor: 'primary.700' }
                }}
              >
                Register
              </Button>
            </>
          )}
        </Box>
      </Sheet>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          py: 3,
          px: 2,
          maxWidth: '1200px',
          mx: 'auto',
          width: '100%',
        }}
      >
        {children}
      </Box>

      {/* Footer */}
      <Sheet
        component="footer"
        sx={{
          p: 3,
          textAlign: 'center',
          borderTop: '1px solid',
          borderColor: 'neutral.200',
          bgcolor: 'background.surface',
          mt: 'auto',
        }}
      >
        <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
          © 2025 Newsor. Built with React, Vite, Joy UI & GraphQL.
        </Typography>
      </Sheet>
    </Box>
  );
}
