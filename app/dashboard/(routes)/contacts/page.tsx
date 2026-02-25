"use client";
import React, { useEffect, useState } from 'react';
import { Button, Table, Space, Modal, Form, Input, Select, Switch, message, Popconfirm, Typography, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined, StarOutlined } from '@ant-design/icons';
import { useContactActions, useContactState } from '@/providers/contactProvider';
import { IContactDto, ICreateContactDto, IUpdateContactDto } from '@/providers/contactProvider/context';
import { useClientActions, useClientState } from '@/providers/clientProvider';
import { useRouter } from 'next/navigation';
import type { TableProps } from 'antd';

const { Title } = Typography;

const ContactsPage: React.FC = () => {
    const { getContacts, createContact, updateContact, deleteContact, setContactPrimary } = useContactActions();
    const { pagedResult, isPending, isError } = useContactState();
    const { getClients } = useClientActions();
    const { pagedResult: clientsResult } = useClientState();
    const router = useRouter();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<IContactDto | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [clientFilter, setClientFilter] = useState<string | undefined>(undefined);
    const [form] = Form.useForm();

    useEffect(() => {
        getContacts();
        getClients({ pageSize: 100 });
    }, []);

    useEffect(() => {
        if (isError) message.error('An error occurred. Please try again.');
    }, [isError]);

    const openCreate = () => {
        setEditingContact(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const openEdit = (contact: IContactDto, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingContact(contact);
        form.setFieldsValue(contact);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        await deleteContact(id);
        getContacts({ clientId: clientFilter });
    };

    const handleSetPrimary = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        await setContactPrimary(id);
        getContacts({ clientId: clientFilter });
        message.success('Primary contact updated');
    };

    const handleSubmit = async (values: ICreateContactDto | IUpdateContactDto) => {
        if (editingContact) {
            await updateContact(editingContact.id, values as IUpdateContactDto);
        } else {
            await createContact(values as ICreateContactDto);
        }
        setIsModalOpen(false);
        form.resetFields();
        getContacts({ clientId: clientFilter });
        message.success(`Contact ${editingContact ? 'updated' : 'created'} successfully`);
    };

    const handleClientFilter = (value: string | undefined) => {
        setClientFilter(value);
        getContacts({ clientId: value });
    };

    const filtered = (pagedResult?.items ?? []).filter(c =>
        c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.email ?? '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const clientOptions = (clientsResult?.items ?? []).map(c => ({ value: c.id, label: c.name }));

    const columns: TableProps<IContactDto>['columns'] = [
        {
            title: 'Name',
            dataIndex: 'fullName',
            render: (text, record) => (
                <Space>
                    <span style={{ color: 'white', fontWeight: 500 }}>{text}</span>
                    {record.isPrimaryContact && <Tag color="gold">Primary</Tag>}
                </Space>
            ),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            render: text => <span style={{ color: '#8c8c8c' }}>{text || '—'}</span>,
        },
        {
            title: 'Phone',
            dataIndex: 'phoneNumber',
            render: text => <span style={{ color: '#8c8c8c' }}>{text || '—'}</span>,
        },
        {
            title: 'Position',
            dataIndex: 'position',
            render: text => <span style={{ color: '#8c8c8c' }}>{text || '—'}</span>,
        },
        {
            title: 'Client',
            dataIndex: 'clientName',
            render: text => <Tag color="blue">{text}</Tag>,
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            render: active => <Tag color={active ? 'green' : 'red'}>{active ? 'Active' : 'Inactive'}</Tag>,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space onClick={e => e.stopPropagation()}>
                    <Button size="small" type="text" icon={<EyeOutlined />} style={{ color: '#1890ff' }}
                        onClick={() => router.push(`/dashboard/contacts/${record.id}`)} />
                    <Button size="small" type="text" icon={<EditOutlined />} style={{ color: '#52c41a' }}
                        onClick={e => openEdit(record, e)} />
                    {!record.isPrimaryContact && (
                        <Button size="small" type="text" icon={<StarOutlined />} style={{ color: '#faad14' }}
                            onClick={e => handleSetPrimary(record.id, e)} title="Set as primary" />
                    )}
                    <Popconfirm title="Delete this contact?" onConfirm={() => handleDelete(record.id)} okText="Yes" cancelText="No">
                        <Button size="small" type="text" icon={<DeleteOutlined />} style={{ color: '#ff4d4f' }} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ color: 'white', margin: 0 }}>Contacts</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>New Contact</Button>
            </div>

            <Space style={{ marginBottom: 16 }}>
                <Input
                    placeholder="Search by name or email..."
                    prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ width: 280, background: 'rgba(255,255,255,0.05)', borderColor: '#4e545f', color: 'white' }}
                />
                <Select
                    placeholder="Filter by client"
                    allowClear
                    options={clientOptions}
                    onChange={handleClientFilter}
                    style={{ width: 200 }}
                />
            </Space>

            <Table
                dataSource={filtered}
                columns={columns}
                loading={isPending}
                rowKey="id"
                onRow={record => ({ onClick: () => router.push(`/dashboard/contacts/${record.id}`), style: { cursor: 'pointer' } })}
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title={editingContact ? 'Edit Contact' : 'New Contact'}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={520}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
                    {!editingContact && (
                        <Form.Item name="clientId" label="Client" rules={[{ required: true, message: 'Required' }]}>
                            <Select options={clientOptions} showSearch optionFilterProp="label" />
                        </Form.Item>
                    )}
                    <Space.Compact style={{ width: '100%' }}>
                        <Form.Item name="firstName" label="First Name" rules={[{ required: true, message: 'Required' }]} style={{ flex: 1, marginRight: 8 }}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="lastName" label="Last Name" rules={[{ required: true, message: 'Required' }]} style={{ flex: 1 }}>
                            <Input />
                        </Form.Item>
                    </Space.Compact>
                    <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Invalid email' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="phoneNumber" label="Phone">
                        <Input />
                    </Form.Item>
                    <Form.Item name="position" label="Position">
                        <Input />
                    </Form.Item>
                    <Form.Item name="isPrimaryContact" label="Primary Contact" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button type="primary" htmlType="submit" loading={isPending}>
                                {editingContact ? 'Save Changes' : 'Create'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ContactsPage;
