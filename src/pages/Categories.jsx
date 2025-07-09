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
  Popconfirm
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined,
  FolderOutlined 
} from '@ant-design/icons';
import { useQuery, useMutation } from '@apollo/client';
import { 
  GET_CATEGORIES, 
  CREATE_CATEGORY, 
  UPDATE_CATEGORY, 
  DELETE_CATEGORY 
} from '../graphql/queries';
import { formatDate } from '../utils/helpers';

const Categories = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create' or 'edit'
  const [form] = Form.useForm();

  // Fetch categories
  const { data, loading, error, refetch } = useQuery(GET_CATEGORIES);

  // Create category mutation
  const [createCategory, { loading: creating }] = useMutation(CREATE_CATEGORY, {
    onCompleted: (data) => {
      if (data.createCategory.success) {
        message.success('Category created successfully!');
        setIsModalVisible(false);
        form.resetFields();
        refetch();
      } else {
        message.error(data.createCategory.errors?.join(', ') || 'Failed to create category');
      }
    },
    onError: (error) => {
      message.error('Error creating category: ' + error.message);
    }
  });

  // Update category mutation
  const [updateCategory, { loading: updating }] = useMutation(UPDATE_CATEGORY, {
    onCompleted: (data) => {
      if (data.updateCategory.success) {
        message.success('Category updated successfully!');
        setIsModalVisible(false);
        setSelectedCategory(null);
        form.resetFields();
        refetch();
      } else {
        message.error(data.updateCategory.errors?.join(', ') || 'Failed to update category');
      }
    },
    onError: (error) => {
      message.error('Error updating category: ' + error.message);
    }
  });

  // Delete category mutation
  const [deleteCategory, { loading: deleting }] = useMutation(DELETE_CATEGORY, {
    onCompleted: (data) => {
      if (data.deleteCategory.success) {
        message.success('Category deleted successfully!');
        refetch();
      } else {
        message.error(data.deleteCategory.errors?.join(', ') || 'Failed to delete category');
      }
    },
    onError: (error) => {
      message.error('Error deleting category: ' + error.message);
    }
  });

  const categories = data?.categories || [];

  const handleCreate = () => {
    setModalType('create');
    setSelectedCategory(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (category) => {
    setModalType('edit');
    setSelectedCategory(category);
    form.setFieldsValue({
      name: category.name,
      description: category.description || ''
    });
    setIsModalVisible(true);
  };

  const handleSubmit = (values) => {
    if (modalType === 'create') {
      createCategory({
        variables: {
          name: values.name,
          description: values.description
        }
      });
    } else {
      updateCategory({
        variables: {
          id: parseInt(selectedCategory.id),
          name: values.name,
          description: values.description
        }
      });
    }
  };

  const handleDelete = (id) => {
    deleteCategory({
      variables: { id: parseInt(id) }
    });
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <div style={{ fontWeight: 'bold' }}>
          <FolderOutlined style={{ marginRight: '8px' }} />
          {text}
        </div>
      )
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => text || '-'
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
            title="Are you sure you want to delete this category?"
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
        message="Error loading categories"
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
          <h1>Category Management</h1>
          <p>Manage article categories</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          Create Category
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} categories`
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={modalType === 'create' ? 'Create Category' : 'Edit Category'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedCategory(null);
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
              { required: true, message: 'Please enter category name' },
              { min: 2, message: 'Name must be at least 2 characters' },
              { max: 50, message: 'Name must be less than 50 characters' }
            ]}
          >
            <Input placeholder="Enter category name" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              { max: 200, message: 'Description must be less than 200 characters' }
            ]}
          >
            <Input.TextArea 
              placeholder="Enter category description (optional)"
              rows={3}
            />
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

export default Categories;
