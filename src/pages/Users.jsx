import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Tag, 
  Button, 
  Modal, 
  Form, 
  Select, 
  message, 
  Space,
  Alert,
  Spin
} from 'antd';
import { EditOutlined, UserOutlined } from '@ant-design/icons';
import { useQuery, useMutation } from '@apollo/client';
import { GET_USERS, CHANGE_USER_ROLE } from '../graphql/queries';
import { getRoleColor, formatDate, USER_ROLES } from '../utils/helpers';

const Users = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Fetch users
  const { data, loading, error, refetch } = useQuery(GET_USERS);
  
  // Change user role mutation
  const [changeUserRole, { loading: changing }] = useMutation(CHANGE_USER_ROLE, {
    onCompleted: (data) => {
      if (data.changeUserRole.success) {
        message.success('User role updated successfully!');
        setIsModalVisible(false);
        setSelectedUser(null);
        form.resetFields();
        refetch();
      } else {
        message.error(data.changeUserRole.errors?.join(', ') || 'Failed to update user role');
      }
    },
    onError: (error) => {
      message.error('Error updating user role: ' + error.message);
    }
  });

  const users = data?.users || [];
  
  // Filter out admin users from the role change table for security
  const nonAdminUsers = users.filter(user => 
    user.profile?.role?.toLowerCase() !== USER_ROLES.ADMIN.toLowerCase()
  );

  const handleRoleChange = (user) => {
    setSelectedUser(user);
    form.setFieldsValue({
      newRole: user.profile?.role || USER_ROLES.READER
    });
    setIsModalVisible(true);
  };

  const handleSubmit = (values) => {
    if (selectedUser) {
      changeUserRole({
        variables: {
          userId: parseInt(selectedUser.id, 10),
          newRole: values.newRole
        }
      });
    }
  };

  const columns = [
    {
      title: 'User',
      dataIndex: 'username',
      key: 'username',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {record.firstName || record.lastName 
              ? `${record.firstName} ${record.lastName}`.trim()
              : record.username
            }
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            @{record.username}
          </div>
        </div>
      )
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Role',
      dataIndex: 'profile',
      key: 'role',
      render: (profile) => (
        <Tag color={getRoleColor(profile?.role || USER_ROLES.READER)}>
          {(profile?.role || USER_ROLES.READER).toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      )
    },
    {
      title: 'Joined',
      dataIndex: 'dateJoined',
      key: 'dateJoined',
      render: (date) => formatDate(date)
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleRoleChange(record)}
          >
            Change Role
          </Button>
        </Space>
      )
    }
  ];

  const roleOptions = [
    { value: USER_ROLES.READER, label: 'Reader' },
    { value: USER_ROLES.WRITER, label: 'Writer' },
    { value: USER_ROLES.MANAGER, label: 'Manager' }
    // Admin role is excluded for security reasons
  ];

  if (error) {
    return (
      <Alert
        message="Error loading users"
        description={error.message}
        type="error"
        showIcon
      />
    );
  }

  return (
    <div>
      <h1>User Management</h1>
      <p>Manage user roles and permissions</p>

      <Card>
        <div style={{ marginBottom: '16px' }}>
          <Space>
            <UserOutlined />
            <span>Total Users: {users.length}</span>
            <span>|</span>
            <span>Manageable Users: {nonAdminUsers.length}</span>
          </Space>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            Admin users are not shown in the role management table for security reasons.
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={nonAdminUsers}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} users`
          }}
        />
      </Card>

      {/* Role Change Modal */}
      <Modal
        title={`Change Role for ${selectedUser?.firstName || selectedUser?.username}`}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedUser(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <div style={{ marginBottom: '16px' }}>
            <p><strong>Current Role:</strong> {selectedUser?.profile?.role || USER_ROLES.READER}</p>
            <p><strong>Email:</strong> {selectedUser?.email}</p>
          </div>

          <Form.Item
            label="New Role"
            name="newRole"
            rules={[{ required: true, message: 'Please select a new role' }]}
          >
            <Select placeholder="Select a role">
              {roleOptions.map(option => (
                <Select.Option key={option.value} value={option.value}>
                  <Tag color={getRoleColor(option.value)}>
                    {option.label}
                  </Tag>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={changing}>
                Update Role
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users;
