import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  message, 
  Space,
  Alert,
  Popconfirm,
  Tag,
  Switch
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined,
  TagOutlined 
} from '@ant-design/icons';
import { useQuery, useMutation } from '@apollo/client';
import { 
  GET_ADMIN_TAGS, 
  CREATE_TAG, 
  UPDATE_TAG, 
  DELETE_TAG,
  TOGGLE_TAG 
} from '../graphql/queries';
import { formatDate } from '../utils/helpers';

const Tags = () => {
  const [selectedTag, setSelectedTag] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create' or 'edit'
  const [form] = Form.useForm();

  // Fetch tags
  const { data, loading, error, refetch } = useQuery(GET_ADMIN_TAGS);

  // Create tag mutation
  const [createTag, { loading: creating }] = useMutation(CREATE_TAG, {
    onCompleted: (data) => {
      if (data.createTag.success) {
        message.success('Tag created successfully!');
        setIsModalVisible(false);
        form.resetFields();
        refetch();
      } else {
        message.error(data.createTag.errors?.join(', ') || 'Failed to create tag');
      }
    },
    onError: (error) => {
      message.error('Error creating tag: ' + error.message);
    }
  });

  // Update tag mutation
  const [updateTag, { loading: updating }] = useMutation(UPDATE_TAG, {
    onCompleted: (data) => {
      if (data.updateTag.success) {
        message.success('Tag updated successfully!');
        setIsModalVisible(false);
        setSelectedTag(null);
        form.resetFields();
        refetch();
      } else {
        message.error(data.updateTag.errors?.join(', ') || 'Failed to update tag');
      }
    },
    onError: (error) => {
      message.error('Error updating tag: ' + error.message);
    }
  });

  // Delete tag mutation
  const [deleteTag, { loading: deleting }] = useMutation(DELETE_TAG, {
    onCompleted: (data) => {
      if (data.deleteTag.success) {
        message.success('Tag deleted successfully!');
        refetch();
      } else {
        message.error(data.deleteTag.errors?.join(', ') || 'Failed to delete tag');
      }
    },
    onError: (error) => {
      message.error('Error deleting tag: ' + error.message);
    }
  });

  // Toggle tag mutation
  const [toggleTag, { loading: toggling }] = useMutation(TOGGLE_TAG, {
    onCompleted: (data) => {
      if (data.toggleTag.success) {
        message.success('Tag status updated successfully!');
        refetch();
      } else {
        message.error(data.toggleTag.errors?.join(', ') || 'Failed to update tag status');
      }
    },
    onError: (error) => {
      message.error('Error updating tag status: ' + error.message);
    }
  });

  const tags = data?.adminTags || [];

  const handleCreate = () => {
    setModalType('create');
    setSelectedTag(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (tag) => {
    setModalType('edit');
    setSelectedTag(tag);
    form.setFieldsValue({
      name: tag.name
    });
    setIsModalVisible(true);
  };

  const handleSubmit = (values) => {
    if (modalType === 'create') {
      createTag({
        variables: {
          name: values.name
        }
      });
    } else {
      updateTag({
        variables: {
          id: parseInt(selectedTag.id),
          name: values.name
        }
      });
    }
  };

  const handleDelete = (id) => {
    deleteTag({
      variables: { id: parseInt(id) }
    });
  };

  const handleToggle = (id) => {
    toggleTag({
      variables: { id: parseInt(id) }
    });
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <Tag color={record.isActive ? 'blue' : 'default'}>
            <TagOutlined style={{ marginRight: '4px' }} />
            {text}
          </Tag>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggle(record.id)}
          loading={toggling}
          checkedChildren="Active"
          unCheckedChildren="Inactive"
        />
      )
    },
    {
      title: 'Articles',
      dataIndex: 'articleCount',
      key: 'articleCount',
      render: (count) => `${count || 0} articles`
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
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
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this tag?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="default"
              danger
              size="small"
              icon={<DeleteOutlined />}
              loading={deleting}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  if (error) {
    return (
      <Alert
        message="Error loading tags"
        description={error.message}
        type="error"
        showIcon
      />
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h1>Tag Management</h1>
          <p>Manage article tags</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          Create Tag
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={tags}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} tags`
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={modalType === 'create' ? 'Create Tag' : 'Edit Tag'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedTag(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[
              { required: true, message: 'Please enter tag name' },
              { min: 2, message: 'Name must be at least 2 characters' },
              { max: 30, message: 'Name must be less than 30 characters' },
              { pattern: /^[a-zA-Z0-9\s-]+$/, message: 'Tag name can only contain letters, numbers, spaces, and hyphens' }
            ]}
          >
            <Input placeholder="Enter tag name" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={creating || updating}
              >
                {modalType === 'create' ? 'Create' : 'Update'}
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

export default Tags;
