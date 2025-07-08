import { Box, Typography, Card, CardContent, Button, Input, FormControl, FormLabel, Alert, Stack } from '@mui/joy';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../core/presentation/hooks/useAuth';
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const { login, loading } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.username.trim()) {
      errors.username = t('auth.login.usernameRequired');
    }
    
    if (!formData.password.trim()) {
      errors.password = t('auth.login.passwordRequired');
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setError('');

      const result = await login({
        username: formData.username,
        password: formData.password
      });

      if (result.success) {
        // The useAuth hook will handle updating the auth state
        // Redirect based on user role (if available in the result)
        navigate('/');
      } else {
        setError(result.error || t('auth.login.error'));
      }
    } catch (err) {
      setError(err.message || t('auth.login.failed'));
    }
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
          <Typography level="h2" textAlign="center" sx={{ mb: 1, color: 'var(--joy-palette-text-primary)' }}>
            {t('auth.login.title')}
          </Typography>
          <Typography level="body1" textAlign="center" sx={{ mb: 3, color: 'var(--joy-palette-text-secondary)' }}>
            {t('auth.login.subtitle')}
          </Typography>

          {error && (
            <Alert color="danger" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <FormControl>
                <FormLabel>{t('auth.login.username')}</FormLabel>
                <Input
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder={t('auth.login.username')}
                  required
                />
                {formErrors.username && (
                  <Typography level="body-sm" color="danger" sx={{ mt: 0.5 }}>
                    {formErrors.username}
                  </Typography>
                )}
              </FormControl>

              <FormControl>
                <FormLabel>{t('auth.login.password')}</FormLabel>
                <Input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t('auth.login.password')}
                  required
                />
                {formErrors.password && (
                  <Typography level="body-sm" color="danger" sx={{ mt: 0.5 }}>
                    {formErrors.password}
                  </Typography>
                )}
              </FormControl>

              <Button
                type="submit"
                loading={loading}
                sx={{ mt: 2 }}
                fullWidth
              >
                {t('auth.login.signIn')}
              </Button>
            </Stack>
          </form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography level="body2" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
              {t('auth.login.noAccount')}{' '}
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
                {t('auth.login.signUp')}
              </Typography>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
