import { Box, Typography, Card, CardContent, Button, Input, FormControl, FormLabel, Alert, Stack, Avatar, Grid } from '@mui/joy';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMutation } from '@apollo/client';
import { UPDATE_USER_PROFILE } from '../graphql/mutations';
import { Link } from 'react-router-dom';

export default function ProfilePage() {
  const { user, isAuthenticated, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    bio: user?.profile?.bio || '',
    phone: user?.profile?.phone || '',
    dateOfBirth: user?.profile?.dateOfBirth || '',
  });
  const [message, setMessage] = useState('');

  const [updateProfile, { loading }] = useMutation(UPDATE_USER_PROFILE, {
    onCompleted: (data) => {
      if (data.updateUserProfile?.success) {
        updateUser({
          ...user,
          profile: {
            ...user.profile,
            ...data.updateUserProfile.profile,
          },
        });
        setMessage('Profile updated successfully!');
        setEditing(false);
      }
    },
    onError: (error) => {
      setMessage('Failed to update profile. Please try again.');
    },
  });

  if (!isAuthenticated) {
    return (
      <Box textAlign="center" py={6}>
        <Typography level="h3" sx={{ mb: 2 }}>
          Access Denied
        </Typography>
        <Typography level="body1" sx={{ mb: 3, color: 'var(--joy-palette-text-secondary)' }}>
          Please sign in to view your profile.
        </Typography>
        <Button component={Link} to="/login">
          Sign In
        </Button>
      </Box>
    );
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    updateProfile({
      variables: formData,
    });
  };

  const handleCancel = () => {
    setFormData({
      bio: user?.profile?.bio || '',
      phone: user?.profile?.phone || '',
      dateOfBirth: user?.profile?.dateOfBirth || '',
    });
    setEditing(false);
    setMessage('');
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography level="h1" sx={{ mb: 2, color: 'var(--joy-palette-text-primary)' }}>
          Profile
        </Typography>
        <Typography level="body1" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
          Manage your personal information and preferences
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Profile Overview */}
        <Grid xs={12} md={4}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                size="lg"
                src={user?.profile?.avatarUrl}
                sx={{ mb: 2, mx: 'auto', width: 100, height: 100 }}
              >
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </Avatar>
              <Typography level="h4" sx={{ mb: 1, color: 'var(--joy-palette-text-primary)' }}>
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography level="body2" sx={{ mb: 1, color: 'var(--joy-palette-text-secondary)' }}>
                @{user?.username}
              </Typography>
              <Typography level="body2" sx={{ mb: 2, color: 'var(--joy-palette-text-secondary)' }}>
                {user?.email}
              </Typography>
              <Box sx={{ display: 'inline-block', px: 2, py: 0.5, backgroundColor: 'var(--joy-palette-background-level2)', borderRadius: 'sm' }}>
                <Typography level="body3" sx={{ color: 'var(--joy-palette-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                  {user?.profile?.role || 'Reader'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Details */}
        <Grid xs={12} md={8}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography level="h3" sx={{ color: 'var(--joy-palette-text-primary)' }}>
                  Profile Information
                </Typography>
                {!editing ? (
                  <Button
                    variant="outlined"
                    size="sm"
                    onClick={() => setEditing(true)}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      size="sm"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSubmit}
                      loading={loading}
                    >
                      Save
                    </Button>
                  </Stack>
                )}
              </Box>

              {message && (
                <Alert color={message.includes('success') ? 'success' : 'danger'} sx={{ mb: 3 }}>
                  {message}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <Grid container spacing={2}>
                    <Grid xs={12} sm={6}>
                      <FormControl>
                        <FormLabel>First Name</FormLabel>
                        <Input
                          value={user?.firstName || ''}
                          disabled
                          placeholder="Not provided"
                        />
                      </FormControl>
                    </Grid>
                    <Grid xs={12} sm={6}>
                      <FormControl>
                        <FormLabel>Last Name</FormLabel>
                        <Input
                          value={user?.lastName || ''}
                          disabled
                          placeholder="Not provided"
                        />
                      </FormControl>
                    </Grid>
                  </Grid>

                  <FormControl>
                    <FormLabel>Email</FormLabel>
                    <Input
                      value={user?.email || ''}
                      disabled
                      type="email"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Phone</FormLabel>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!editing}
                      placeholder="Enter your phone number"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Date of Birth</FormLabel>
                    <Input
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Bio</FormLabel>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      disabled={!editing}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid var(--joy-palette-divider)',
                        fontFamily: 'inherit',
                        fontSize: '14px',
                        resize: 'vertical',
                        backgroundColor: editing ? 'transparent' : 'var(--joy-palette-background-level1)',
                      }}
                    />
                  </FormControl>
                </Stack>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Account Settings */}
      <Card variant="outlined" sx={{ mt: 4 }}>
        <CardContent>
          <Typography level="h3" sx={{ mb: 3, color: 'var(--joy-palette-text-primary)' }}>
            Account Settings
          </Typography>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
              <Box>
                <Typography level="body1" sx={{ color: 'var(--joy-palette-text-primary)' }}>
                  Change Password
                </Typography>
                <Typography level="body2" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
                  Update your password to keep your account secure
                </Typography>
              </Box>
              <Button variant="outlined" size="sm">
                Change
              </Button>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
              <Box>
                <Typography level="body1" sx={{ color: 'var(--joy-palette-text-primary)' }}>
                  Email Notifications
                </Typography>
                <Typography level="body2" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
                  Control how you receive notifications
                </Typography>
              </Box>
              <Button variant="outlined" size="sm">
                Manage
              </Button>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
              <Box>
                <Typography level="body1" sx={{ color: 'danger.500' }}>
                  Delete Account
                </Typography>
                <Typography level="body2" sx={{ color: 'var(--joy-palette-text-secondary)' }}>
                  Permanently delete your account and all data
                </Typography>
              </Box>
              <Button variant="outlined" color="danger" size="sm">
                Delete
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
