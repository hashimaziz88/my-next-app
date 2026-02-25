"use client";
import React, { useEffect, useState } from 'react';
import { Button, Card, Tag, Typography, Descriptions, Space, Modal, Form, Input, Switch, message } from 'antd';
import { ArrowLeftOutlined, EditOutlined, StarFilled } from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import { useContactActions, useContactState } from '@/providers/contactProvider';
import { IUpdateContactDto } from '@/providers/contactProvider/context';

const { Title } = Typography;

const ContactDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { getContact, updateContact, setContactPrimary } = useContactActions();
    const { currentContact, isPending } = useContactState();
    const router = useRouter();

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        if (id) getContact(id);
    }, [id]);

    const openEdit = () => {
        form.setFieldsValue(currentContact);
        setIsEditOpen(true);
    };

    const handleUpdate = async (values: IUpdateContactDto) => {
        await updateContact(id, values);
        setIsEditOpen(false);
        getContact(id);
        message.success('Contact updated successfully');
    };

    const handleSetPrimary = async () => {
        await setContactPrimary(id);
        getContact(id);
        message.success('Set as primary contact');
    };

    if (isPending && !currentContact) {
        return <div style={{ color: 'white' }}>Loading...</div>;
    }

    if (!currentContact) {
        return <div style={{ color: '#8c8c8c' }}>Contact not found.</div>;
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <Button icon={<ArrowLeftOutlined />} type="text" style={{ color: '#8c8c8c' }} onClick={() => router.back()}>
                    Back
                </Button>
                <Space>
                    {!currentContact.isPrimaryContact && (
                        <Button icon={<StarFilled />} onClick={handleSetPrimary} style={{ borderColor: '#faad14', color: '#faad14' }}>
                            Set as Primary
                        </Button>
                    )}
                    <Button icon={<EditOutlined />} onClick={openEdit}>Edit Contact</Button>
                </Space>
            </div>

            <div style={{ marginBottom: 24 }}>
                <Title level={2} style={{ color: 'white', margin: 0 }}>
                    {currentContact.fullName}
                </Title>
                <Space style={{ marginTop: 8 }}>
                    {currentContact.isPrimaryContact && <Tag color="gold" icon={<StarFilled />}>Primary Contact</Tag>}
                    {currentContact.position && <Tag color="blue">{currentContact.position}</Tag>}
                    <Tag color={currentContact.isActive ? 'green' : 'red'}>
                        {currentContact.isActive ? 'Active' : 'Inactive'}
                    </Tag>
                </Space>
            </div>

            <Card style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Descriptions
                    title={<span style={{ color: 'white' }}>Contact Information</span>}
                    column={{ xs: 1, sm: 2 }}
                    labelStyle={{ color: '#8c8c8c' }}
                    contentStyle={{ color: 'white' }}
                >
                    <Descriptions.Item label="First Name">{currentContact.firstName}</Descriptions.Item>
                    <Descriptions.Item label="Last Name">{currentContact.lastName}</Descriptions.Item>
                    <Descriptions.Item label="Email">
                        {currentContact.email
                            ? <a href={`mailto:${currentContact.email}`} style={{ color: '#1890ff' }}>{currentContact.email}</a>
                            : '—'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phone">
                        {currentContact.phoneNumber
                            ? <a href={`tel:${currentContact.phoneNumber}`} style={{ color: '#1890ff' }}>{currentContact.phoneNumber}</a>
                            : '—'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Position">{currentContact.position || '—'}</Descriptions.Item>
                    <Descriptions.Item label="Client">
                        <Button
                            type="link"
                            style={{ padding: 0, color: '#1890ff' }}
                            onClick={() => router.push(`/dashboard/clients/${currentContact.clientId}`)}
                        >
                            {currentContact.clientName}
                        </Button>
                    </Descriptions.Item>
                    <Descriptions.Item label="Created At">
                        {currentContact.createdAt ? new Date(currentContact.createdAt).toLocaleDateString() : '—'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Updated At">
                        {currentContact.updatedAt ? new Date(currentContact.updatedAt).toLocaleDateString() : '—'}
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            <Modal
                title="Edit Contact"
                open={isEditOpen}
                onCancel={() => setIsEditOpen(false)}
                footer={null}
                width={480}
            >
                <Form form={form} layout="vertical" onFinish={handleUpdate} style={{ marginTop: 16 }}>
                    <Form.Item name="firstName" label="First Name" rules={[{ required: true, message: 'Required' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="lastName" label="Last Name" rules={[{ required: true, message: 'Required' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Invalid email' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="phoneNumber" label="Phone"><Input /></Form.Item>
                    <Form.Item name="position" label="Position"><Input /></Form.Item>
                    <Form.Item name="isPrimaryContact" label="Primary Contact" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                    <Form.Item name="isActive" label="Active" valuePropName="checked">
                        <Switch />
                    </Form.Item>
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

export default ContactDetailPage;
