import { Box, Typography, Card, CardContent, Button, Input, FormControl, FormLabel, Alert, Stack } from '@mui/joy';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { LOGIN_USER } from '../graphql/mutations';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loginUser, { loading }] = useMutation(LOGIN_USER, {
    onCompleted: (data) => {
      if (data.tokenAuth.token) {
        login(data.tokenAuth.user, data.tokenAuth.token, data.tokenAuth.refreshToken);
        
        // Redirect based on user role
        const userRole = data.tokenAuth.user?.profile?.role;
        if (userRole === 'reader') {
          navigate('/news');
        } else {
          navigate('/dashboard');
        }
      }
    },
    onError: (error) => {
      setError('Invalid username or password');
    },
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    loginUser({
      variables: {
        username: formData.username,
        password: formData.password,
      },
    });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
        padding: 2,
      }}
    >
      <Card
        variant="outlined"
        sx={{
          width: '100%',
          maxWidth: 400,
          p: 3,
          boxShadow: 'var(--joy-shadow-lg)',
        }}
      >
        <CardContent>
          <Typography level="h2" textAlign="center" sx={{ mb: 3, color: 'var(--joy-palette-text-primary)' }}>
            Sign In
          </Typography>

          {error && (
            <Alert color="danger" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <FormControl>
                <FormLabel>Username</FormLabel>
                <Input
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  required
                />
              </FormControl>

              <FormControl>
                <FormLabel>Password</FormLabel>
                <Input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />
              </FormControl>

              <Button
                type="submit"
                loading={loading}
                sx={{ mt: 2 }}
                fullWidth
              >
                Sign In
              </Button>
            </Stack>
          </form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography level="body2" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
              Don't have an account?{' '}
              <Typography
                component={Link}
                to="/register"
                level="body2"
                sx={{
                  color: 'var(--joy-palette-primary-500)',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Sign up
              </Typography>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
