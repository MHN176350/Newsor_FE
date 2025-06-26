import { Box, Typography, Button, Sheet, IconButton } from '@mui/joy';
import { useColorScheme } from '@mui/joy/styles';
import { Link, useNavigate } from 'react-router-dom';

export default function Layout({ children }) {
  const { mode, setMode } = useColorScheme();
  const navigate = useNavigate();

  const toggleColorScheme = () => {
    setMode(mode === 'dark' ? 'light' : 'dark');
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
          <Button
            variant="plain"
            component={Link}
            to="/news"
            sx={{ 
              color: 'text.secondary',
              '&:hover': { color: 'text.primary', bgcolor: 'neutral.100' }
            }}
          >
            News
          </Button>

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

          {/* Auth Buttons */}
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
