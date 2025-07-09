import React from 'react';
import { Card, Empty } from 'antd';
import { SettingOutlined } from '@ant-design/icons';

const Settings = () => {
  return (
    <div>
      <h1>System Settings</h1>
      <p>Configure system settings and preferences</p>
      
      <Card>
        <Empty
          image={<SettingOutlined style={{ fontSize: '48px', color: '#ccc' }} />}
          description="System settings functionality coming soon"
        />
      </Card>
    </div>
  );
};

export default Settings;
