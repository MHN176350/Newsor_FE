import React, { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { Card, Table, Input, Select, Tag, Typography, Button, Space, Spin, message, DatePicker } from 'antd';
import { SearchOutlined, FilterOutlined, ReloadOutlined, MailOutlined, PhoneOutlined, UserOutlined, ClockCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import { GET_CONTACT_MESSAGES } from '../graphql/queries';
import { SERVICE_CHOICES, formatDate } from '../utils/helpers';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const serviceOptions = Object.entries(SERVICE_CHOICES).map(([key, value]) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1)
}));

const ContactsPage = () => {
    const [searchText, setSearchText] = useState('');
    const [serviceFilter, setServiceFilter] = useState('');
    const [dateRange, setDateRange] = useState([null, null]);

    const fromDate = dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : undefined;
    const toDate = dateRange[1] ? dateRange[1].format('YYYY-MM-DD') : undefined;

    const { data, loading, error, refetch } = useQuery(GET_CONTACT_MESSAGES, {
        variables: {
            search: searchText || undefined,
            service: serviceFilter || undefined,
            fromDate,
            toDate
        }
    });

    const messages = data?.contactMessages || [];

    const filteredMessages = useMemo(() => {
        if (!searchText) return messages;
        return messages.filter(msg =>
            msg.name?.toLowerCase().includes(searchText.toLowerCase()) ||
            msg.email?.toLowerCase().includes(searchText.toLowerCase()) ||
            msg.phone?.toLowerCase().includes(searchText.toLowerCase())
        );
    }, [messages, searchText]);

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <span><UserOutlined style={{ marginRight: 4 }} />{text}</span>
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (text) => <span><MailOutlined style={{ marginRight: 4 }} />{text}</span>
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
            render: (text) => <span><PhoneOutlined style={{ marginRight: 4 }} />{text}</span>
        },
        {
            title: 'Service',
            dataIndex: 'service',
            key: 'service',
            render: (service) => (
                <Tag color="blue">{service?.charAt(0).toUpperCase() + service?.slice(1)}</Tag>
            )
        },
        {
            title: 'Message',
            dataIndex: 'message',
            key: 'message',
            render: (text) => <span style={{ whiteSpace: 'pre-line' }}>{text}</span>
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => <span><ClockCircleOutlined style={{ marginRight: 4 }} />{formatDate(date)}</span>
        }
    ];

    if (error) {
        message.error('Error loading contact messages: ' + error.message);
    }

    return (
        <div style={{ padding: 0, maxWidth: '100%' }}>
            <div style={{ marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0, color: '#1a1a1a' }}>
                    Contact Messages
                </Title>
                <Text type="secondary" style={{ fontSize: 16, marginTop: 8, display: 'block' }}>
                    Manage and review contact messages submitted by users
                </Text>
            </div>
            <Card
                className="contact-search-card"
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <SearchOutlined />
                        <span>Search & Filter Contacts</span>
                    </div>
                }
                style={{ marginBottom: 24, marginTop: 24 }}
                bodyStyle={{ padding: 20 }}
            >
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'stretch' }}>
                    <div style={{ flex: 2, minWidth: 320 }}>
                        <Input
                            size="large"
                            placeholder="Search by name, email, phone"
                            prefix={<SearchOutlined style={{ color: '#999' }} />}
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                            allowClear
                            style={{ borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', height: 40 }}
                        />
                    </div>
                    <div style={{ flex: 1, minWidth: 200, maxWidth: 240 }}>
                        <Select
                            size="large"
                            placeholder="All Services"
                            value={serviceFilter || null}
                            onChange={setServiceFilter}
                            allowClear
                            style={{ width: '100%', borderRadius: 8, height: 40 }}
                            suffixIcon={<FilterOutlined />}
                        >
                            <Select.Option value={null}>
                                <Tag color="default" style={{ margin: 0 }}>All Services</Tag>
                            </Select.Option>
                            {serviceOptions.map(option => (
                                <Select.Option key={option.value} value={option.value}>
                                    <Tag color="blue" style={{ margin: 0 }}>{option.label}</Tag>
                                </Select.Option>
                            ))}
                        </Select>
                    </div>
                    <div style={{ flex: 1, minWidth: 220, maxWidth: 260 }}>
                        <RangePicker
                            style={{ width: '100%', borderRadius: 8, height: 40 }}
                            size="large"
                            allowClear
                            value={dateRange}
                            onChange={val => setDateRange(val || [null, null])}
                            format="YYYY-MM-DD"
                            placeholder={["From date", "To date"]}
                            suffixIcon={<CalendarOutlined />}
                        />
                    </div>
                    {(searchText || serviceFilter || (dateRange[0] || dateRange[1])) && (
                        <Button
                            type="default"
                            onClick={() => { setSearchText(''); setServiceFilter(''); setDateRange([null, null]); refetch(); }}
                            style={{ borderRadius: 8, minWidth: 100, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            icon={<ReloadOutlined />}
                        >
                            Clear All
                        </Button>
                    )}
                </div>
                <div style={{ marginTop: 16, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text type="secondary">
                        Showing {filteredMessages.length} of {messages.length} messages
                        {searchText && <span> • Search: "{searchText}"</span>}
                        {serviceFilter ? (
                            <span> • Service: {serviceOptions.find(s => s.value === serviceFilter)?.label}</span>
                        ) : (
                            <span> • Service: All Services</span>
                        )}
                        {(dateRange[0] || dateRange[1]) && (
                            <span> • Date: {dateRange[0]?.format('YYYY-MM-DD') || '...'} ~ {dateRange[1]?.format('YYYY-MM-DD') || '...'}</span>
                        )}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        Last updated: {new Date().toLocaleTimeString()}
                    </Text>
                </div>
            </Card>
            <Card
                style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden' }}
                bodyStyle={{ padding: 0 }}
            >
                <div style={{ padding: '24px 0' }} className="contact-table-container">
                    {loading ? (
                        <Spin size="large" style={{ display: 'block', textAlign: 'center', margin: '50px 0' }} />
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={filteredMessages}
                            rowKey={(record, idx) => record.email + record.createdAt + idx}
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} messages`,
                                style: { padding: '16px 0' }
                            }}
                            style={{ background: '#fafafa', borderRadius: 8, padding: 16 }}
                        />
                    )}
                </div>
            </Card>
        </div>
    );
};

export default ContactsPage;
