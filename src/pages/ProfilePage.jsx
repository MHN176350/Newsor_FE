import { Box, Typography, Card, CardContent, Button, Input, FormControl, FormLabel, Alert, Stack, Avatar, Grid, Modal, ModalDialog, ModalClose } from '@mui/joy';
import { useState, useEffect } from 'react';
import { useAuth } from '../core/presentation/hooks/useAuth';
import { Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { CHANGE_PASSWORD } from '../graphql/mutations';
import ImageUpload from '../components/ImageUpload';
import { processImageUrlForDisplay } from '../utils/cloudinaryUtils';

export default function ProfilePage() {
  const { user, isAuthenticated, updateProfile, updateAvatar, loading, error } = useAuth();
  const [editing, setEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordMessage, setPasswordMessage] = useState('');
  const [formData, setFormData] = useState({
    bio: '',
    phone: '',
    dateOfBirth: '',
  });
  const [message, setMessage] = useState('');

  // Change password mutation
  const [changePassword, { loading: passwordLoading }] = useMutation(CHANGE_PASSWORD, {
    onCompleted: (data) => {
      if (data.changePassword.success) {
        setPasswordMessage('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordMessage('');
        }, 2000);
      } else {
        setPasswordMessage(data.changePassword.errors?.join(', ') || 'Failed to change password');
      }
    },
    onError: (error) => {
      setPasswordMessage('An error occurred while changing password.');
      console.error('Password change error:', error);
    },
  });

  // Initialize form data when user data is available
  useEffect(() => {
    if (user?.profile) {
      // Format date for HTML date input (YYYY-MM-DD)
      let formattedDate = '';
      if (user.profile.dateOfBirth) {
        const date = new Date(user.profile.dateOfBirth);
        if (!isNaN(date.getTime())) {
          formattedDate = date.toISOString().split('T')[0];
        }
      }
      
      setFormData({
        bio: user.profile.bio || '',
        phone: user.profile.phone || '',
        dateOfBirth: formattedDate || '',
      });
    }
  }, [user]);

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

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage('');

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordMessage('All fields are required.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage('New passwords do not match.');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordMessage('New password must be at least 8 characters long.');
      return;
    }

    try {
      await changePassword({
        variables: {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
      });
    } catch (err) {
      setPasswordMessage('Failed to change password. Please try again.');
      console.error('Password change error:', err);
    }
  };

  const handlePasswordModalClose = () => {
    setShowPasswordModal(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setPasswordMessage('');
  };

  const handleAvatarUploaded = async (imageUrl, profile) => {
    try {
      // Update the user data with the new avatar
      await updateAvatar(profile);
      setMessage('Avatar updated successfully!');
    } catch (err) {
      setMessage('Failed to update avatar. Please try again.');
      console.error('Avatar update error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    try {
      const result = await updateProfile({
        bio: formData.bio || null,
        phone: formData.phone || null,
        dateOfBirth: formData.dateOfBirth || null,
      });

      if (result.success) {
        setMessage('Profile updated successfully!');
        setEditing(false);
      } else {
        setMessage(result.errors?.join(', ') || 'Update failed');
      }
    } catch (err) {
      setMessage('Failed to update profile. Please try again.');
      console.error('Profile update error:', err);
    }
  };

  const handleCancel = () => {
    // Format date for HTML date input (YYYY-MM-DD)
    let formattedDate = '';
    if (user?.profile?.dateOfBirth) {
      const date = new Date(user.profile.dateOfBirth);
      if (!isNaN(date.getTime())) {
        formattedDate = date.toISOString().split('T')[0];
      }
    }
    
    setFormData({
      bio: user?.profile?.bio || '',
      phone: user?.profile?.phone || '',
      dateOfBirth: formattedDate || '',
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
              {/* Avatar Upload Section */}
              <Box sx={{ mb: 3 }}>
                {editing ? (
                  <ImageUpload
                    variant="avatar"
                    currentImageUrl={user?.profile?.avatarUrl}
                    onImageUploaded={handleAvatarUploaded}
                    maxSizeInMB={2}
                    uploadButtonText="Update Avatar"
                    removeButtonText="Remove Avatar"
                  />
                ) : (
                  <Avatar
                    size="lg"
                    src={processImageUrlForDisplay(user?.profile?.avatarUrl)}
                    sx={{ 
                      width: 120, 
                      height: 120,
                      mx: 'auto',
                      mb: 2
                    }}
                    onError={(e) => {
                      console.log('Avatar load error, falling back to initials:', e.target.src);
                      e.target.style.display = 'none'; // This will show the initials
                    }}
                  >
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </Avatar>
                )}
              </Box>
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
                      type="submit"
                      form="profile-form"
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

              {editing && (
                <Alert color="primary" variant="soft" sx={{ mb: 3 }}>
                  💡 Tip: Click "Edit Profile" to update your profile picture and information
                </Alert>
              )}

              <form id="profile-form" onSubmit={handleSubmit}>
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
                      value={editing ? (formData.phone || '') : (formData.phone || 'Not provided')}
                      onChange={handleChange}
                      disabled={!editing}
                      placeholder={editing ? "Enter your phone number" : ""}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Date of Birth</FormLabel>
                    <Input
                      name="dateOfBirth"
                      type={editing ? "date" : "text"}
                      value={editing ? (formData.dateOfBirth || '') : (formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString() : 'Not provided')}
                      onChange={handleChange}
                      disabled={!editing}
                      placeholder={editing ? "" : ""}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Bio</FormLabel>
                    <textarea
                      name="bio"
                      value={editing ? (formData.bio || '') : (formData.bio || 'No bio provided')}
                      onChange={handleChange}
                      disabled={!editing}
                      placeholder={editing ? "Tell us about yourself..." : ""}
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
              <Button 
                variant="outlined" 
                size="sm"
                onClick={() => setShowPasswordModal(true)}
              >
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

      {/* Change Password Modal */}
      <Modal open={showPasswordModal} onClose={handlePasswordModalClose}>
        <ModalDialog sx={{ width: 400 }}>
          <ModalClose />
          <Typography level="h4" sx={{ mb: 2 }}>
            Change Password
          </Typography>
          
          <form onSubmit={handlePasswordSubmit}>
            <Stack spacing={3}>
              {passwordMessage && (
                <Alert 
                  color={passwordMessage.includes('success') ? 'success' : 'danger'}
                  size="sm"
                >
                  {passwordMessage}
                </Alert>
              )}

              <FormControl required>
                <FormLabel>Current Password</FormLabel>
                <Input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                  disabled={passwordLoading}
                />
              </FormControl>

              <FormControl required>
                <FormLabel>New Password</FormLabel>
                <Input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password (min 8 characters)"
                  disabled={passwordLoading}
                />
              </FormControl>

              <FormControl required>
                <FormLabel>Confirm New Password</FormLabel>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  disabled={passwordLoading}
                />
              </FormControl>

              <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
                <Button
                  variant="plain"
                  onClick={handlePasswordModalClose}
                  disabled={passwordLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="solid"
                  loading={passwordLoading}
                  disabled={passwordLoading}
                >
                  Change Password
                </Button>
              </Stack>
            </Stack>
          </form>
        </ModalDialog>
      </Modal>
    </Box>
  );
}
