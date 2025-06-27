import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  Select,
  Option,
  Chip,
  Alert,
  Modal,
  ModalDialog,
  ModalClose,
  Stack,
  CircularProgress,
} from '@mui/joy';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USERS } from '../graphql/queries';
import { CHANGE_USER_ROLE } from '../graphql/mutations';
import { getRoleColor } from '../utils/constants';

export default function UserManagement() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { data, loading, error, refetch } = useQuery(GET_USERS);
  const [changeUserRole, { loading: changing }] = useMutation(CHANGE_USER_ROLE, {
    onCompleted: (data) => {
      if (data.changeUserRole.success) {
        setSuccessMessage('User role updated successfully!');
        setShowModal(false);
        setSelectedUser(null);
        setNewRole('');
        refetch();
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(data.changeUserRole.errors?.join(', ') || 'Failed to update user role');
      }
    },
    onError: (error) => {
      setErrorMessage('Error updating user role: ' + error.message);
    },
  });

  const users = data?.users || [];

  const handleRoleChange = (user) => {
    setSelectedUser(user);
    setNewRole((user.profile?.role || 'reader').toLowerCase());
    setShowModal(true);
    setErrorMessage('');
  };

  const handleConfirmRoleChange = () => {
    if (selectedUser && newRole) {
      changeUserRole({
        variables: {
          userId: parseInt(selectedUser.id, 10), // Convert string ID to integer
          newRole: newRole,
        },
      });
    }
  };

  const roleOptions = [
    { value: 'reader', label: 'Reader', color: 'primary' },
    { value: 'writer', label: 'Writer', color: 'success' },
    { value: 'manager', label: 'Manager', color: 'warning' },
    { value: 'admin', label: 'Admin', color: 'danger' },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress size="lg" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert color="danger">
        Error loading users: {error.message}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography level="h3" sx={{ mb: 3 }}>
        User Management
      </Typography>

      {successMessage && (
        <Alert color="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert color="danger" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      <Card variant="outlined">
        <CardContent>
          <Table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Current Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <Box>
                      <Typography level="body-sm" fontWeight="lg">
                        {user.firstName || user.lastName 
                          ? `${user.firstName} ${user.lastName}`.trim()
                          : user.username
                        }
                      </Typography>
                      <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
                        @{user.username}
                      </Typography>
                    </Box>
                  </td>
                  <td>
                    <Typography level="body-sm">
                      {user.email}
                    </Typography>
                  </td>
                  <td>
                    <Chip 
                      size="sm" 
                      color={getRoleColor(user.profile?.role || 'reader')}
                    >
                      {(user.profile?.role || 'reader').toUpperCase()}
                    </Chip>
                  </td>
                  <td>
                    <Chip 
                      size="sm" 
                      color={user.isActive ? 'success' : 'neutral'}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Chip>
                  </td>
                  <td>
                    <Button
                      size="sm"
                      variant="outlined"
                      onClick={() => handleRoleChange(user)}
                    >
                      Change Role
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>

      {/* Role Change Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <ModalDialog sx={{ minWidth: 400 }}>
          <ModalClose />
          <Typography level="h4" sx={{ mb: 2 }}>
            Change User Role
          </Typography>
          
          {selectedUser && (
            <Stack spacing={3}>
              <Box>
                <Typography level="body-sm" sx={{ mb: 1 }}>
                  User: <strong>{selectedUser.firstName} {selectedUser.lastName} (@{selectedUser.username})</strong>
                </Typography>
                <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                  Current Role: {selectedUser.profile?.role || 'reader'}
                </Typography>
              </Box>

              <Box>
                <Typography level="body-sm" sx={{ mb: 1 }}>
                  New Role:
                </Typography>
                <Select
                  value={newRole}
                  onChange={(event, value) => setNewRole(value)}
                  sx={{ width: '100%' }}
                >
                  {roleOptions.map((role) => (
                    <Option key={role.value} value={role.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip size="sm" color={role.color}>
                          {role.label}
                        </Chip>
                      </Box>
                    </Option>
                  ))}
                </Select>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => setShowModal(false)}
                  disabled={changing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmRoleChange}
                  loading={changing}
                >
                  Update Role
                </Button>
              </Box>
            </Stack>
          )}
        </ModalDialog>
      </Modal>
    </Box>
  );
}
