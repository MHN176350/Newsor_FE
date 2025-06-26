import { Box, Typography, Card, CardContent, Button, Input, FormControl, FormLabel, Alert, Stack, Grid, Avatar, IconButton } from '@mui/joy';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { CREATE_USER } from '../graphql/mutations';
import { uploadImageToBackend, validateImageFile, createImagePreview } from '../utils/imageUtils';

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
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
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

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    setAvatarFile(file);
    const preview = await createImagePreview(file);
    setAvatarPreview(preview);
    setError(''); // Clear any previous errors
  };

  const removeImage = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setUploading(true);
    let avatarUrl = '';

    try {
      // Upload image first if selected
      if (avatarFile) {
        const uploadResult = await uploadImageToBackend(avatarFile);
        if (uploadResult.success) {
          avatarUrl = uploadResult.url;
        } else {
          throw new Error(uploadResult.error);
        }
      }

      // Then create user with avatar URL
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
    } catch (error) {
      setError(`Registration failed: ${error.message}`);
      setUploading(false);
    }
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    size="lg"
                    src={avatarPreview}
                    sx={{ width: 80, height: 80 }}
                  >
                    {!avatarPreview && '📷'}
                  </Avatar>
                  <Stack spacing={1}>
                    <Button
                      component="label"
                      variant="outlined"
                      size="sm"
                      sx={{ cursor: 'pointer' }}
                    >
                      Choose Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                      />
                    </Button>
                    {avatarPreview && (
                      <Button
                        variant="soft"
                        color="danger"
                        size="sm"
                        onClick={removeImage}
                      >
                        Remove
                      </Button>
                    )}
                    <Typography level="body3" sx={{ color: 'var(--joy-palette-text-tertiary)' }}>
                      Max 5MB • JPEG, PNG, WebP, GIF
                    </Typography>
                  </Stack>
                </Box>
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
                loading={loading || uploading}
                fullWidth
                sx={{
                  mt: 2,
                  backgroundColor: 'var(--joy-palette-primary-700)',
                  '&:hover': {
                    backgroundColor: 'var(--joy-palette-primary-800)',
                  }
                }}
              >
                {uploading ? 'Uploading Image...' : loading ? 'Creating Account...' : 'Create Account'}
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
