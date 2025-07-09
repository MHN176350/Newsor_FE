import React from 'react';
import { Card, Empty } from 'antd';
import { FileImageOutlined } from '@ant-design/icons';

const Media = () => {
  return (
    <div>
      <h1>Media Management</h1>
      <p>Manage uploaded files and media</p>
      
      <Card>
        <Empty
          image={<FileImageOutlined style={{ fontSize: '48px', color: '#ccc' }} />}
          description="Media management functionality coming soon"
        />
      </Card>
    </div>
  );
};

export default Media;
