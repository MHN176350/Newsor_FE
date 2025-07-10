import { Box, Typography, Card, CardContent, Button, Input, FormControl, FormLabel, Alert, Stack, Grid } from '@mui/joy';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { CREATE_USER } from '../graphql/mutations';
import { useTranslation } from 'react-i18next';
import ImageUpload from '../components/ImageUpload';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../core/presentation/hooks/useAuth';

export default function RegisterPage() {
  const { user, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();



  const [createUser, { loading }] = useMutation(CREATE_USER, {
    onCompleted: (data) => {
      if (data.createUser?.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.createUser?.errors?.join(', ') || t('auth.register.failed'));
      }
    },
    onError: (error) => {
      setError(t('auth.register.failed'));
    },
  });

  // Redirect if user is already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  };
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageUploaded = (imageUrl) => {
    setAvatarUrl(imageUrl);
    setError(''); // Clear any previous errors
  };

  const handleImageRemoved = () => {
    setAvatarUrl('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.register.passwordMismatch'));
      return;
    }

    // Create user with avatar URL
    createUser({
      variables: {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        avatar: avatarUrl,
      },
    });
  };

  if (success) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
          px: 2,
        }}
      >
        <Card sx={{ maxWidth: 400, p: 3, textAlign: 'center' }}>
          <CardContent>
            <Typography level="h3" sx={{ mb: 2, color: 'success.500' }}>
              {t('auth.register.success')}
            </Typography>
            <Typography level="body1" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
              {t('auth.register.redirecting')}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
        px: 2,
        py: 4,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 600,
          p: 3,
          boxShadow: 'var(--joy-shadow-lg)',
        }}
      >
        <CardContent>
          <Typography level="h2" textAlign="center" sx={{ mb: 3, color: 'var(--joy-palette-text-primary)' }}>
            {t('auth.register.title')}
          </Typography>

          {error && (
            <Alert color="danger" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {/* Profile Image Upload */}
              <FormControl>
                <FormLabel>{t('auth.register.profilePicture')}</FormLabel>
                <ImageUpload
                  variant="avatar"
                  currentImageUrl={avatarUrl}
                  onImageUploaded={handleImageUploaded}
                  onImageRemoved={handleImageRemoved}
                  maxSizeInMB={5}
                  uploadButtonText={t('auth.register.choosePicture')}
                  removeButtonText={t('auth.register.removePicture')}
                  showPreview={true}
                  isRegistration={true}
                />
              </FormControl>

              <Grid container spacing={2}>
                <Grid xs={12} sm={6}>
                  <FormControl>
                    <FormLabel>{t('auth.register.firstName')}</FormLabel>
                    <Input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder={t('auth.register.firstName')}
                    />
                  </FormControl>
                </Grid>
                <Grid xs={12} sm={6}>
                  <FormControl>
                    <FormLabel>{t('auth.register.lastName')}</FormLabel>
                    <Input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder={t('auth.register.lastName')}
                    />
                  </FormControl>
                </Grid>
              </Grid>

              <FormControl>
                <FormLabel>{t('auth.register.username')}</FormLabel>
                <Input
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder={t('auth.register.username')}
                  required
                />
              </FormControl>

              <FormControl>
                <FormLabel>{t('auth.register.email')}</FormLabel>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t('auth.register.email')}
                  required
                />
              </FormControl>

              <FormControl>
                <FormLabel>{t('auth.register.password')}</FormLabel>
                <Input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t('auth.register.password')}
                  required
                />
              </FormControl>

              <FormControl>
                <FormLabel>{t('auth.register.confirmPassword')}</FormLabel>
                <Input
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder={t('auth.register.confirmPassword')}
                  required
                />
              </FormControl>

              <Button
                type="submit"
                loading={loading}
                fullWidth
                sx={{
                  mt: 2,
                  backgroundColor: 'var(--joy-palette-primary-700)',
                  '&:hover': {
                    backgroundColor: 'var(--joy-palette-primary-800)',
                  }
                }}
              >
                {loading ? t('auth.register.creatingAccount') : t('auth.register.createAccount')}
              </Button>
            </Stack>
          </form>

          <Typography textAlign="center" sx={{ mt: 3, color: 'var(--joy-palette-text-secondary)' }}>
            {t('auth.register.hasAccount')}{' '}
            <Link
              to="/login"
              style={{
                color: 'var(--joy-palette-primary-700)',
                textDecoration: 'none'
              }}
            >
              {t('auth.register.signIn')}
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
