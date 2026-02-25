"use client";
import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Row, Statistic, Tag, Typography, Descriptions, Space, Modal, Form, Input, Select, message } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import { useClientActions, useClientState } from '@/providers/clientProvider';
import { IUpdateClientDto } from '@/providers/clientProvider/context';

const { Title } = Typography;

const CLIENT_TYPES = [
    { value: 0, label: 'Individual' },
    { value: 1, label: 'SME' },
    { value: 2, label: 'Enterprise' },
];

const ClientDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { getClient, getClientStats, updateClient } = useClientActions();
    const { currentClient, clientStats, isPending } = useClientState();
    const router = useRouter();

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        if (id) {
            getClient(id);
            getClientStats(id);
        }
    }, [id]);

    const openEdit = () => {
        form.setFieldsValue(currentClient);
        setIsEditOpen(true);
    };

    const handleUpdate = async (values: IUpdateClientDto) => {
        await updateClient(id, values);
        setIsEditOpen(false);
        getClient(id);
        message.success('Client updated successfully');
    };

    if (isPending && !currentClient) {
        return <div style={{ color: 'white' }}>Loading...</div>;
    }

    if (!currentClient) {
        return <div style={{ color: '#8c8c8c' }}>Client not found.</div>;
    }

    const statCardStyle = {
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <Space>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        type="text"
                        style={{ color: '#8c8c8c' }}
                        onClick={() => router.back()}
                    >
                        Back
                    </Button>
                </Space>
                <Button icon={<EditOutlined />} onClick={openEdit}>Edit Client</Button>
            </div>

            <div style={{ marginBottom: 24 }}>
                <Title level={2} style={{ color: 'white', margin: 0 }}>{currentClient.name}</Title>
                <Space style={{ marginTop: 8 }}>
                    {currentClient.industry && <Tag color="blue">{currentClient.industry}</Tag>}
                    {currentClient.companySize && <Tag color="geekblue">{currentClient.companySize}</Tag>}
                    <Tag color={currentClient.isActive ? 'green' : 'red'}>
                        {currentClient.isActive ? 'Active' : 'Inactive'}
                    </Tag>
                </Space>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={12} sm={6}>
                    <Card style={statCardStyle}>
                        <Statistic
                            title={<span style={{ color: '#8c8c8c' }}>Contacts</span>}
                            value={clientStats?.totalContacts ?? currentClient.contactsCount ?? 0}
                            style={{ color: 'white' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card style={statCardStyle}>
                        <Statistic
                            title={<span style={{ color: '#8c8c8c' }}>Opportunities</span>}
                            value={clientStats?.totalOpportunities ?? currentClient.opportunitiesCount ?? 0}
                            style={{ color: 'white' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card style={statCardStyle}>
                        <Statistic
                            title={<span style={{ color: '#8c8c8c' }}>Contracts</span>}
                            value={clientStats?.totalContracts ?? currentClient.contractsCount ?? 0}
                            style={{ color: 'white' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card style={statCardStyle}>
                        <Statistic
                            title={<span style={{ color: '#8c8c8c' }}>Active Opportunities</span>}
                            value={clientStats?.activeOpportunities ?? 0}
                            style={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Descriptions
                    title={<span style={{ color: 'white' }}>Client Information</span>}
                    column={{ xs: 1, sm: 2 }}
                    labelStyle={{ color: '#8c8c8c' }}
                    contentStyle={{ color: 'white' }}
                >
                    <Descriptions.Item label="Website">
                        {currentClient.website
                            ? <a href={currentClient.website} target="_blank" rel="noreferrer" style={{ color: '#1890ff' }}>{currentClient.website}</a>
                            : '—'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tax Number">{currentClient.taxNumber || '—'}</Descriptions.Item>
                    <Descriptions.Item label="Billing Address" span={2}>{currentClient.billingAddress || '—'}</Descriptions.Item>
                    <Descriptions.Item label="Created By">{currentClient.createdByName || '—'}</Descriptions.Item>
                    <Descriptions.Item label="Created At">
                        {currentClient.createdAt ? new Date(currentClient.createdAt).toLocaleDateString() : '—'}
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            <Modal
                title="Edit Client"
                open={isEditOpen}
                onCancel={() => setIsEditOpen(false)}
                footer={null}
                width={520}
            >
                <Form form={form} layout="vertical" onFinish={handleUpdate} style={{ marginTop: 16 }}>
                    <Form.Item name="name" label="Company Name" rules={[{ required: true, message: 'Required' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="industry" label="Industry"><Input /></Form.Item>
                    <Form.Item name="companySize" label="Company Size"><Input /></Form.Item>
                    <Form.Item name="website" label="Website"><Input /></Form.Item>
                    <Form.Item name="billingAddress" label="Billing Address"><Input.TextArea rows={2} /></Form.Item>
                    <Form.Item name="taxNumber" label="Tax Number"><Input /></Form.Item>
                    <Form.Item name="clientType" label="Client Type"><Select options={CLIENT_TYPES} /></Form.Item>
                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setIsEditOpen(false)}>Cancel</Button>
                            <Button type="primary" htmlType="submit" loading={isPending}>Save Changes</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ClientDetailPage;
