import { Box, Typography, Card, CardContent, Button, Input, FormControl, FormLabel, Alert, Stack, Grid } from '@mui/joy';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { CREATE_USER } from '../graphql/mutations';
import ImageUpload from '../components/ImageUpload';

export default function RegisterPage() {
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

  const [createUser, { loading }] = useMutation(CREATE_USER, {
    onCompleted: (data) => {
      if (data.createUser?.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.createUser?.errors?.join(', ') || 'Registration failed');
      }
    },
    onError: (error) => {
      setError('Registration failed. Please try again.');
    },
  });

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
      setError('Passwords do not match');
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
              Registration Successful!
            </Typography>
            <Typography level="body1" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
              Redirecting to login page...
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
            Create Account
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
                <FormLabel>Profile Picture (Optional)</FormLabel>
                <ImageUpload
                  variant="avatar"
                  currentImageUrl={avatarUrl}
                  onImageUploaded={handleImageUploaded}
                  onImageRemoved={handleImageRemoved}
                  maxSizeInMB={5}
                  uploadButtonText="Choose Profile Picture"
                  removeButtonText="Remove Picture"
                  showPreview={true}
                  isRegistration={true}
                />
              </FormControl>

              <Grid container spacing={2}>
                <Grid xs={12} sm={6}>
                  <FormControl>
                    <FormLabel>First Name</FormLabel>
                    <Input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Enter your first name"
                    />
                  </FormControl>
                </Grid>
                <Grid xs={12} sm={6}>
                  <FormControl>
                    <FormLabel>Last Name</FormLabel>
                    <Input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Enter your last name"
                    />
                  </FormControl>
                </Grid>
              </Grid>

              <FormControl>
                <FormLabel>Username</FormLabel>
                <Input
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Choose a username"
                  required
                />
              </FormControl>

              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
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
                  placeholder="Choose a password"
                  required
                />
              </FormControl>

              <FormControl>
                <FormLabel>Confirm Password</FormLabel>
                <Input
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
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
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </Stack>
          </form>

          <Typography textAlign="center" sx={{ mt: 3, color: 'var(--joy-palette-text-secondary)' }}>
            Already have an account?{' '}
            <Link 
              to="/login" 
              style={{ 
                color: 'var(--joy-palette-primary-700)', 
                textDecoration: 'none' 
              }}
            >
              Sign in
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
