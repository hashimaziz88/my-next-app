"use client";
import React, { useEffect, useState } from 'react';
import { Button, Table, Space, Modal, Form, Input, Select, message, Popconfirm, Typography, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { useClientActions, useClientState } from '@/providers/clientProvider';
import { IClientDto, ICreateClientDto, IUpdateClientDto } from '@/providers/clientProvider/context';
import { useRouter } from 'next/navigation';
import type { TableProps } from 'antd';

const { Title, Text } = Typography;

const pageStyle: React.CSSProperties = { padding: 24, minHeight: '100vh', background: 'transparent' };
const cardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
};

const CLIENT_TYPES = [
    { value: 0, label: 'Individual' },
    { value: 1, label: 'SME' },
    { value: 2, label: 'Enterprise' },
];

const ClientsPage: React.FC = () => {
    const { getClients, createClient, updateClient, deleteClient } = useClientActions();
    const { pagedResult, isPending, isError } = useClientState();
    const router = useRouter();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<IClientDto | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [form] = Form.useForm();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { getClients(); }, []);

    useEffect(() => {
        if (isError) message.error('An error occurred. Please try again.');
    }, [isError]);

    const openCreate = () => {
        setEditingClient(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const openEdit = (client: IClientDto, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingClient(client);
        form.setFieldsValue(client);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        await deleteClient(id);
        getClients();
    };

    const handleSubmit = async (values: ICreateClientDto | IUpdateClientDto) => {
        if (editingClient) {
            await updateClient(editingClient.id, values as IUpdateClientDto);
        } else {
            await createClient(values as ICreateClientDto);
        }
        setIsModalOpen(false);
        form.resetFields();
        getClients();
        message.success(`Client ${editingClient ? 'updated' : 'created'} successfully`);
    };

    const filtered = (pagedResult?.items ?? []).filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.industry ?? '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns: TableProps<IClientDto>['columns'] = [
        {
            title: 'Name',
            dataIndex: 'name',
            render: text => <span style={{ color: 'white', fontWeight: 500 }}>{text}</span>,
        },
        {
            title: 'Industry',
            dataIndex: 'industry',
            render: text => text ? <Tag color="blue">{text}</Tag> : <span style={{ color: '#8c8c8c' }}>—</span>,
        },
        {
            title: 'Company Size',
            dataIndex: 'companySize',
            render: text => <span style={{ color: '#8c8c8c' }}>{text || '—'}</span>,
        },
        {
            title: 'Contacts',
            dataIndex: 'contactsCount',
            align: 'center',
            render: n => <Tag color="geekblue">{n}</Tag>,
        },
        {
            title: 'Opportunities',
            dataIndex: 'opportunitiesCount',
            align: 'center',
            render: n => <Tag color="purple">{n}</Tag>,
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
                        onClick={() => router.push(`/dashboard/clients/${record.id}`)} />
                    <Button size="small" type="text" icon={<EditOutlined />} style={{ color: '#52c41a' }}
                        onClick={e => openEdit(record, e)} />
                    <Popconfirm title="Delete this client?" onConfirm={() => handleDelete(record.id)} okText="Yes" cancelText="No">
                        <Button size="small" type="text" icon={<DeleteOutlined />} style={{ color: '#ff4d4f' }} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={pageStyle}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <Title level={2} style={{ color: 'white', margin: 0 }}>Clients</Title>
                    <Text style={{ color: '#8c8c8c' }}>Manage your client companies and accounts</Text>
                </div>
                <Button type="primary" icon={<PlusOutlined />} size="large" onClick={openCreate}>New Client</Button>
            </div>

            {/* Toolbar */}
            <div style={{ ...cardStyle, padding: '12px 16px', marginBottom: 16 }}>
                <Input
                    placeholder="Search by name or industry…"
                    prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ maxWidth: 320, background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)', color: 'white' }}
                    allowClear
                />
            </div>

            {/* Table */}
            <div style={cardStyle}>
                <Table
                    dataSource={filtered}
                    columns={columns}
                    loading={isPending}
                    rowKey="id"
                    size="middle"
                    scroll={{ x: 'max-content' }}
                    onRow={record => ({ onClick: () => router.push(`/dashboard/clients/${record.id}`), style: { cursor: 'pointer' } })}
                    pagination={{ pageSize: 10, showSizeChanger: false }}
                    style={{ background: 'transparent' }}
                />
            </div>

            <Modal
                title={<span style={{ color: 'white' }}>{editingClient ? 'Edit Client' : 'New Client'}</span>}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                okText={editingClient ? 'Save Changes' : 'Create'}
                width={520}
                styles={{ body: { background: 'transparent' }, header: { background: 'transparent' } }}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
                    <Form.Item name="name" label={<span style={{ color: '#d4d4d4' }}>Company Name</span>} rules={[{ required: true, message: 'Required' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="industry" label={<span style={{ color: '#d4d4d4' }}>Industry</span>}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="companySize" label={<span style={{ color: '#d4d4d4' }}>Company Size</span>}>
                        <Input placeholder="e.g. 1–50, 51–200, 200+" />
                    </Form.Item>
                    <Form.Item name="website" label={<span style={{ color: '#d4d4d4' }}>Website</span>}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="billingAddress" label={<span style={{ color: '#d4d4d4' }}>Billing Address</span>}>
                        <Input.TextArea rows={2} />
                    </Form.Item>
                    <Form.Item name="taxNumber" label={<span style={{ color: '#d4d4d4' }}>Tax Number</span>}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="clientType" label={<span style={{ color: '#d4d4d4' }}>Client Type</span>}>
                        <Select options={CLIENT_TYPES} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ClientsPage;
