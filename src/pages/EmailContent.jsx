import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Card, Input, Button, Typography, message, Space } from 'antd';
import { EyeOutlined, SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import { GET_EMAIL_TEMPLATE } from '../graphql/queries';
import { UPDATE_EMAIL_TEMPLATE } from '../graphql/mutations';
import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';


const { Title, Text } = Typography;
const { TextArea } = Input;

const EmailContent = () => {
  const { data, loading, error, refetch } = useQuery(GET_EMAIL_TEMPLATE);
  const [updateEmailTemplate, { loading: saving }] = useMutation(UPDATE_EMAIL_TEMPLATE);

  const [subject, setSubject] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (data?.firstEmailTemplate) {
      setSubject(data.firstEmailTemplate.subject || '');
      setHtmlContent(data.firstEmailTemplate.htmlContent || '');
    }
  }, [data]);

  const handleSave = async () => {
    try {
      const res = await updateEmailTemplate({
        variables: { subject, htmlContent }
      });
      if (res.data?.updateEmailTemplate?.success) {
        message.success('Email template saved successfully!');
        refetch();
      } else {
        message.error('Failed to save. ' + (res.data?.updateEmailTemplate?.errors?.join(', ') || ''));
      }
    } catch (err) {
      message.error('Error saving template: ' + err.message);
    }
  };

  if (loading) return <div style={{ padding: 32, textAlign: 'center' }}>Loading...</div>;
  if (error) return <div style={{ padding: 32, color: 'red' }}>Error: {error.message}</div>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <Title level={2}>Email Template Editor</Title>
      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <Text strong>Subject:</Text>
            <Input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Email subject"
              style={{ marginTop: 8 }}
              maxLength={200}
            />
          </div>
          <div>
            <Text strong>HTML Content:</Text>
            <div style={{ marginTop: 8 }}>
              <CodeMirror
                value={htmlContent}
                height="200px"
                extensions={[html()]}
                onChange={(value) => setHtmlContent(value)}
                theme="light"
                basicSetup={{
                  lineNumbers: true,
                  highlightActiveLine: true,
                  autocompletion: true,
                }}
                style={{
                  border: '1px solid #eee',
                  borderRadius: 4,
                  fontSize: 16,
                }}
              />
            </div>
          </div>
          <Space>
            <Button
              icon={<EyeOutlined />}
              onClick={() => setShowPreview(!showPreview)}
              type={showPreview ? 'primary' : 'default'}
            >
              {showPreview ? 'Hide Preview' : 'View'}
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
            >
              Reload
            </Button>
          </Space>
        </Space>
      </Card>
      {showPreview && (
        <Card title="Preview" style={{ marginBottom: 24 }}>
          <iframe
            title="Email Preview"
            srcDoc={htmlContent}
            style={{ width: '100%', minHeight: 300, border: '1px solid #eee', borderRadius: 4 }}
          />
        </Card>
      )}
      <div style={{ textAlign: 'right' }}>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={saving}
          onClick={handleSave}
          size="large"
        >
          Save
        </Button>
      </div>
    </div>
  );
};

export default EmailContent;