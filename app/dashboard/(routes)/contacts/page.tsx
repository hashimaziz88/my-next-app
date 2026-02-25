"use client";
import React, { useEffect, useState } from 'react';
import { Button, Table, Space, Modal, Form, Input, Select, Switch, message, Popconfirm, Typography, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined, StarOutlined } from '@ant-design/icons';
import { useContactActions, useContactState } from '@/providers/contactProvider';
import { IContactDto, ICreateContactDto, IUpdateContactDto } from '@/providers/contactProvider/context';
import { useClientActions, useClientState } from '@/providers/clientProvider';
import { useRouter } from 'next/navigation';
import type { TableProps } from 'antd';
import { useStyles } from '@/app/dashboard/(routes)/_styles/style';
import FormLabel from '@/app/dashboard/(routes)/_components/FormLabel';

const { Title, Text } = Typography;

const ContactsPage: React.FC = () => {
    const { getContacts, createContact, updateContact, deleteContact, setContactPrimary } = useContactActions();
    const { pagedResult, isPending, isError } = useContactState();
    const { getClients } = useClientActions();
    const { pagedResult: clientsResult } = useClientState();
    const router = useRouter();
    const { styles } = useStyles();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<IContactDto | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [clientFilter, setClientFilter] = useState<string | undefined>(undefined);
    const [form] = Form.useForm();

    useEffect(() => {
        getContacts();
        getClients({ pageSize: 100 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                    <span className={styles.primaryText}>{text}</span>
                    {record.isPrimaryContact && <Tag color="gold">Primary</Tag>}
                </Space>
            ),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            render: text => <span className={styles.mutedText}>{text || '—'}</span>,
        },
        {
            title: 'Phone',
            dataIndex: 'phoneNumber',
            render: text => <span className={styles.mutedText}>{text || '—'}</span>,
        },
        {
            title: 'Position',
            dataIndex: 'position',
            render: text => <span className={styles.mutedText}>{text || '—'}</span>,
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
                    <Button size="small" type="text" icon={<EyeOutlined />} className={styles.btnView}
                        onClick={() => router.push(`/dashboard/contacts/${record.id}`)} />
                    <Button size="small" type="text" icon={<EditOutlined />} className={styles.btnEdit}
                        onClick={e => openEdit(record, e)} />
                    {!record.isPrimaryContact && (
                        <Button size="small" type="text" icon={<StarOutlined />} className={styles.btnWarn}
                            onClick={e => handleSetPrimary(record.id, e)} title="Set as primary" />
                    )}
                    <Popconfirm title="Delete this contact?" onConfirm={() => handleDelete(record.id)} okText="Yes" cancelText="No">
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
                    <Title level={2} className={styles.pageTitle}>Contacts</Title>
                    <Text className={styles.pageSubtitle}>Manage people associated with your client accounts</Text>
                </div>
                <Button type="primary" icon={<PlusOutlined />} size="large" onClick={openCreate}>New Contact</Button>
            </div>

            {/* Toolbar */}
            <div className={`${styles.toolbar} ${styles.toolbarRow}`}>
                <Input
                    placeholder="Search by name or email…"
                    prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                    style={{ width: 280 }}
                    allowClear
                />
                <Select
                    placeholder="Filter by client"
                    allowClear
                    options={clientOptions}
                    onChange={handleClientFilter}
                    style={{ width: 220 }}
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
                    onRow={record => ({ onClick: () => router.push(`/dashboard/contacts/${record.id}`), style: { cursor: 'pointer' } })}
                    pagination={{ pageSize: 10, showSizeChanger: false }}
                    style={{ background: 'transparent' }}
                />
            </div>

            <Modal
                title={<span className={styles.pageTitle}>{editingContact ? 'Edit Contact' : 'New Contact'}</span>}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                okText={editingContact ? 'Save Changes' : 'Create'}
                confirmLoading={isPending}
                width={520}
                styles={{ body: { background: 'transparent' }, header: { background: 'transparent' } }}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
                    {!editingContact && (
                        <Form.Item name="clientId" label={<FormLabel text="Client" />} rules={[{ required: true, message: 'Required' }]}>
                            <Select options={clientOptions} showSearch />
                        </Form.Item>
                    )}
                    <div className={styles.formGrid}>
                        <Form.Item name="firstName" label={<FormLabel text="First Name" />} rules={[{ required: true, message: 'Required' }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="lastName" label={<FormLabel text="Last Name" />} rules={[{ required: true, message: 'Required' }]}>
                            <Input />
                        </Form.Item>
                    </div>
                    <Form.Item name="email" label={<FormLabel text="Email" />} rules={[{ type: 'email', message: 'Invalid email' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="phoneNumber" label={<FormLabel text="Phone" />}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="position" label={<FormLabel text="Position" />}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="isPrimaryContact" label={<FormLabel text="Primary Contact" />} valuePropName="checked">
                        <Switch />
                    </Form.Item>

                </Form>
            </Modal>
        </div>
    );
};

export default ContactsPage;
