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
import { getRoleColor, USER_ROLES } from '../utils/constants';
import { useTranslation } from 'react-i18next';

export default function UserManagement() {
  const { t } = useTranslation();
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { data, loading, error, refetch } = useQuery(GET_USERS);
  const [changeUserRole, { loading: changing }] = useMutation(CHANGE_USER_ROLE, {
    onCompleted: (data) => {
      if (data.changeUserRole.success) {
        setSuccessMessage(t('userManagement.successUpdate'));
        setShowModal(false);
        setSelectedUser(null);
        setNewRole('');
        refetch();
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(data.changeUserRole.errors?.join(', ') || t('userManagement.failedUpdate'));
      }
    },
    onError: (error) => {
      setErrorMessage(t('userManagement.errorUpdate') + ': ' + error.message);
    },
  });

  const users = data?.users || [];
  
  // Filter out admin users from the role change table
  const nonAdminUsers = users.filter(user => 
    user.profile?.role?.toLowerCase() !== USER_ROLES.ADMIN.toLowerCase()
  );

  const handleRoleChange = (user) => {
    setSelectedUser(user);
    setNewRole((user.profile?.role || USER_ROLES.READER).toLowerCase());
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
    { value: USER_ROLES.READER, label: t('userManagement.roles.reader'), color: 'primary' },
    { value: USER_ROLES.WRITER, label: t('userManagement.roles.writer'), color: 'success' },
    { value: USER_ROLES.MANAGER, label: t('userManagement.roles.manager'), color: 'warning' },
    // Admin role is excluded from the dropdown for security reasons
    // Only super admins should be able to create other admins through backend
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
        {t('userManagement.errorLoadingUsers')}: {error.message}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography level="h3" sx={{ mb: 3 }}>
        {t('userManagement.title')}
      </Typography>

      <Box sx={{ mb: 3, p: 2, bgcolor: 'background.level1', borderRadius: 'md' }}>
        <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
          {t('userManagement.totalUsers', { total: users.length, manageable: nonAdminUsers.length })}
        </Typography>
        <Typography level="body-xs" sx={{ color: 'text.tertiary', mt: 0.5 }}>
          {t('userManagement.adminNotShown')}
        </Typography>
      </Box>

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
          {nonAdminUsers.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography level="body1" sx={{ color: 'text.secondary' }}>
                {t('userManagement.noUsers')}
              </Typography>
              <Typography level="body-sm" sx={{ color: 'text.tertiary', mt: 1 }}>
                {t('userManagement.noUsersSub')}
              </Typography>
            </Box>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>{t('userManagement.table.user')}</th>
                  <th>{t('userManagement.table.email')}</th>
                  <th>{t('userManagement.table.currentRole')}</th>
                  <th>{t('userManagement.table.status')}</th>
                  <th>{t('userManagement.table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {nonAdminUsers.map((user) => (
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
                        color={getRoleColor(user.profile?.role || USER_ROLES.READER)}
                      >
                        {(user.profile?.role || USER_ROLES.READER).toUpperCase()}
                      </Chip>
                    </td>
                    <td>
                      <Chip 
                        size="sm" 
                        color={user.isActive ? 'success' : 'neutral'}
                      >
                        {user.isActive ? t('userManagement.active') : t('userManagement.inactive')}
                      </Chip>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="outlined"
                        onClick={() => handleRoleChange(user)}
                      >
                        {t('userManagement.changeRole')}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Role Change Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <ModalDialog sx={{ minWidth: 400 }}>
          <ModalClose />
          <Typography level="h4" sx={{ mb: 2 }}>
            {t('userManagement.changeRoleTitle')}
          </Typography>
          
          {selectedUser && (
            <Stack spacing={3}>
              <Box>
                <Typography level="body-sm" sx={{ mb: 1 }}>
                  {t('userManagement.userLabel', { name: `${selectedUser.firstName} ${selectedUser.lastName}`.trim(), username: selectedUser.username })}
                </Typography>
                <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                  {t('userManagement.currentRoleLabel', { role: selectedUser.profile?.role || USER_ROLES.READER })}
                </Typography>
              </Box>

              <Box>
                <Typography level="body-sm" sx={{ mb: 1 }}>
                  {t('userManagement.newRoleLabel')}
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
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={handleConfirmRoleChange}
                  loading={changing}
                >
                  {t('userManagement.updateRole')}
                </Button>
              </Box>
            </Stack>
          )}
        </ModalDialog>
      </Modal>
    </Box>
  );
}
