"use client";
import React, { useEffect, useState } from 'react';
import { Button, Table, Space, Modal, Form, Input, Select, message, Popconfirm, Typography, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { useClientActions, useClientState } from '@/providers/clientProvider';
import { IClientDto, ICreateClientDto, IUpdateClientDto } from '@/providers/clientProvider/context';
import { useRouter } from 'next/navigation';
import type { TableProps } from 'antd';
import { useStyles } from '@/app/dashboard/(routes)/_styles/style';
import FormLabel from '@/app/dashboard/(routes)/_components/FormLabel';

const { Title, Text } = Typography;

const CLIENT_TYPES = [
    { value: 0, label: 'Individual' },
    { value: 1, label: 'SME' },
    { value: 2, label: 'Enterprise' },
];

const ClientsPage: React.FC = () => {
    const { getClients, createClient, updateClient, deleteClient } = useClientActions();
    const { pagedResult, isPending, isError } = useClientState();
    const router = useRouter();
    const { styles } = useStyles();

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
            render: text => <span className={styles.primaryText}>{text}</span>,
        },
        {
            title: 'Industry',
            dataIndex: 'industry',
            render: text => text ? <Tag color="blue">{text}</Tag> : <span className={styles.mutedText}>—</span>,
        },
        {
            title: 'Company Size',
            dataIndex: 'companySize',
            render: text => <span className={styles.mutedText}>{text || '—'}</span>,
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
                    <Button size="small" type="text" icon={<EyeOutlined />} className={styles.btnView}
                        onClick={() => router.push(`/dashboard/clients/${record.id}`)} />
                    <Button size="small" type="text" icon={<EditOutlined />} className={styles.btnEdit}
                        onClick={e => openEdit(record, e)} />
                    <Popconfirm title="Delete this client?" onConfirm={() => handleDelete(record.id)} okText="Yes" cancelText="No">
                        <Button size="small" type="text" icon={<DeleteOutlined />} className={styles.btnDelete} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.pageHeader}>
                <div>
                    <Title level={2} className={styles.pageTitle}>Clients</Title>
                    <Text className={styles.pageSubtitle}>Manage your client companies and accounts</Text>
                </div>
                <Button type="primary" icon={<PlusOutlined />} size="large" onClick={openCreate}>New Client</Button>
            </div>

            {/* Toolbar */}
            <div className={styles.toolbar}>
                <Input
                    placeholder="Search by name or industry…"
                    prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                    style={{ maxWidth: 320 }}
                    allowClear
                />
            </div>

            {/* Table */}
            <div className={styles.tableCard}>
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
                title={<span className={styles.pageTitle}>{editingClient ? 'Edit Client' : 'New Client'}</span>}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                okText={editingClient ? 'Save Changes' : 'Create'}
                width={520}
                styles={{ body: { background: 'transparent' }, header: { background: 'transparent' } }}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
                    <Form.Item name="name" label={<FormLabel text="Company Name" />} rules={[{ required: true, message: 'Required' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="industry" label={<FormLabel text="Industry" />}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="companySize" label={<FormLabel text="Company Size" />}>
                        <Input placeholder="e.g. 1–50, 51–200, 200+" />
                    </Form.Item>
                    <Form.Item name="website" label={<FormLabel text="Website" />}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="billingAddress" label={<FormLabel text="Billing Address" />}>
                        <Input.TextArea rows={2} />
                    </Form.Item>
                    <Form.Item name="taxNumber" label={<FormLabel text="Tax Number" />}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="clientType" label={<FormLabel text="Client Type" />}>
                        <Select options={CLIENT_TYPES} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ClientsPage;
