"use client";
import React, { useEffect, useState } from 'react';
import {
    Button, Table, Space, Modal, Form, Input, Select, DatePicker,
    message, Popconfirm, Typography, Tag, Tabs, Badge,
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined,
    EyeOutlined, SearchOutlined, UserAddOutlined,
} from '@ant-design/icons';
import { usePricingRequestActions, usePricingRequestState } from '@/providers/pricingRequestProvider';
import { useAuthState } from '@/providers/authProvider';
import {
    IPricingRequestDto, ICreatePricingRequestDto, IUpdatePricingRequestDto,
} from '@/providers/pricingRequestProvider/context';
import { useOpportunityActions, useOpportunityState } from '@/providers/opportunityProvider';
import dayjs from 'dayjs';
import type { TableProps } from 'antd';
import { useStyles } from '@/app/dashboard/(routes)/_styles/style';
import FormLabel from '@/app/dashboard/(routes)/_components/FormLabel';

const { Title, Text } = Typography;
const { TextArea } = Input;

/* ─── enum maps ─────────────────────────────────────────────────────── */
const STATUSES = [
    { value: 1, label: 'Pending', color: 'orange' },
    { value: 2, label: 'In Progress', color: 'blue' },
    { value: 3, label: 'Completed', color: 'green' },
    { value: 4, label: 'Cancelled', color: 'default' },
];

const PRIORITIES = [
    { value: 1, label: 'Low', color: 'default' },
    { value: 2, label: 'Medium', color: 'blue' },
    { value: 3, label: 'High', color: 'orange' },
    { value: 4, label: 'Urgent', color: 'red' },
];

const statusTag = (status: number, name: string) => {
    const s = STATUSES.find(s => s.value === status);
    return <Tag color={s?.color ?? 'default'}>{name || s?.label}</Tag>;
};

const priorityTag = (priority: number, name: string) => {
    const p = PRIORITIES.find(p => p.value === priority);
    return <Tag color={p?.color ?? 'default'}>{name || p?.label}</Tag>;
};

/* ─── component ─────────────────────────────────────────────────────── */
const PricingRequestsPage: React.FC = () => {
    const { getPricingRequests, getPendingPricingRequests, getMyPricingRequests,
        createPricingRequest, updatePricingRequest, deletePricingRequest,
        assignPricingRequest, completePricingRequest,
    } = usePricingRequestActions();
    const { pagedResult, pendingRequests, myRequests, isPending, isError } = usePricingRequestState();
    const { user } = useAuthState();

    const { styles } = useStyles();

    const { getOpportunities } = useOpportunityActions();
    const { pagedResult: oppsResult } = useOpportunityState();

    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [selected, setSelected] = useState<IPricingRequestDto | null>(null);
    const [assignUserId, setAssignUserId] = useState('');
    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();

    useEffect(() => {
        getPricingRequests({ pageSize: 100 });
        getPendingPricingRequests();
        getMyPricingRequests();
        getOpportunities({ pageSize: 100 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (isError) message.error('An error occurred. Please try again.');
    }, [isError]);

    /* ── tab switch ── */
    const handleTabChange = (key: string) => {
        setActiveTab(key);
        if (key === 'all') getPricingRequests({ pageSize: 100 });
        else if (key === 'mine') getMyPricingRequests();
        else if (key === 'pending') getPendingPricingRequests();
    };

    /* ── CRUD ── */
    const handleCreate = async (values: ICreatePricingRequestDto) => {
        await createPricingRequest({
            ...values,
            assignedToId: values.assignedToId ?? user?.userId,
            requiredByDate: values.requiredByDate
                ? dayjs(values.requiredByDate).toISOString()
                : undefined,
        });
        setIsCreateOpen(false);
        createForm.resetFields();
        getPricingRequests({ pageSize: 100 });
        message.success('Pricing request created');
    };

    const openEdit = (record: IPricingRequestDto) => {
        setSelected(record);
        editForm.setFieldsValue({
            title: record.title,
            description: record.description,
            priority: record.priority,
            requiredByDate: record.requiredByDate ? dayjs(record.requiredByDate) : undefined,
        });
        setIsEditOpen(true);
    };

    const handleUpdate = async (values: IUpdatePricingRequestDto) => {
        if (!selected) return;
        await updatePricingRequest(selected.id, {
            ...values,
            requiredByDate: values.requiredByDate
                ? dayjs(values.requiredByDate as unknown as string).toISOString()
                : undefined,
        });
        setIsEditOpen(false);
        getPricingRequests({ pageSize: 100 });
        message.success('Pricing request updated');
    };

    const handleDelete = async (id: string) => {
        await deletePricingRequest(id);
        getPricingRequests({ pageSize: 100 });
        message.success('Pricing request deleted');
    };

    const handleComplete = async (id: string) => {
        await completePricingRequest(id);
        getPricingRequests({ pageSize: 100 });
        message.success('Marked as complete');
    };

    const handleAssign = async () => {
        if (!selected || !assignUserId.trim()) return;
        await assignPricingRequest(selected.id, assignUserId.trim());
        setIsAssignOpen(false);
        setAssignUserId('');
        getPricingRequests({ pageSize: 100 });
        message.success('Assigned successfully');
    };

    /* ── tab data ── */
    const rawAll = pagedResult?.items;
    const rawPending = pendingRequests?.items;
    const rawMy = myRequests?.items;
    const allList: IPricingRequestDto[] = Array.isArray(rawAll) ? rawAll : [];
    const pendingList: IPricingRequestDto[] = Array.isArray(rawPending) ? rawPending : [];
    const myList: IPricingRequestDto[] = Array.isArray(rawMy) ? rawMy : [];

    const tabSource: Record<string, IPricingRequestDto[]> = {
        all: allList,
        mine: myList,
        pending: pendingList,
    };

    const displayData = (tabSource[activeTab] ?? allList).filter(r =>
        (r.title ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.requestedByName ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.opportunityTitle ?? '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const oppOptions = (oppsResult?.items ?? []).map(o => ({ value: o.id, label: o.title }));

    /* ── columns ── */
    const columns: TableProps<IPricingRequestDto>['columns'] = [
        {
            title: 'Ref #',
            dataIndex: 'requestNumber',
            width: 110,
            render: val => <span className={styles.monospaceText}>{val}</span>,
        },
        {
            title: 'Title',
            dataIndex: 'title',
            render: (val, record) => (
                <Button type="link" className={styles.primaryText} style={{ padding: 0, height: 'auto' }}
                    onClick={() => { setSelected(record); setIsViewOpen(true); }}>
                    {val}
                </Button>
            ),
        },
        {
            title: 'Opportunity',
            dataIndex: 'opportunityTitle',
            render: val => <span className={styles.bodyText}>{val || '—'}</span>,
        },
        {
            title: 'Priority',
            dataIndex: 'priority',
            render: (val, record) => priorityTag(val, record.priorityName),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (val, record) => statusTag(val, record.statusName),
        },
        {
            title: 'Assigned To',
            dataIndex: 'assignedToName',
            render: val => <span className={styles.bodyText}>{val || <Tag color="warning">Unassigned</Tag>}</span>,
        },
        {
            title: 'Required By',
            dataIndex: 'requiredByDate',
            render: val => <span className={styles.bodyText}>{val ? new Date(val).toLocaleDateString() : '—'}</span>,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="small">
                    <Button size="small" type="text" icon={<EyeOutlined />}
                        className={styles.btnView}
                        onClick={() => { setSelected(record); setIsViewOpen(true); }} />
                    {record.status !== 3 && record.status !== 4 && (
                        <>
                            <Button size="small" type="text" icon={<EditOutlined />}
                                className={styles.btnWarn}
                                onClick={() => openEdit(record)} />
                            <Button size="small" type="text" icon={<UserAddOutlined />}
                                className={styles.btnSuccess}
                                onClick={() => { setSelected(record); setAssignUserId(''); setIsAssignOpen(true); }} />
                        </>
                    )}
                    {record.status === 2 && (
                        <Popconfirm title="Mark as completed?" onConfirm={() => handleComplete(record.id)} okText="Yes" cancelText="No">
                            <Button size="small" type="text" icon={<CheckOutlined />} className={styles.btnSuccess} />
                        </Popconfirm>
                    )}
                    <Popconfirm title="Delete this request?" onConfirm={() => handleDelete(record.id)} okText="Yes" cancelText="No">
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
                    <Title level={2} className={styles.pageTitle}>Pricing Requests</Title>
                    <Text className={styles.pageSubtitle}>Manage pricing requests linked to opportunities</Text>
                </div>
                <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => setIsCreateOpen(true)}>
                    New Request
                </Button>
            </div>

            {/* Tabs + Search */}
            <div className={styles.toolbar}>
                <div className={styles.toolbarRow} style={{ justifyContent: 'space-between' }}>
                    <Tabs
                        activeKey={activeTab}
                        onChange={handleTabChange}
                        items={[
                            { key: 'all', label: <>All <Badge count={allList.length} showZero style={{ backgroundColor: '#1890ff', marginLeft: 6 }} /></> },
                            { key: 'mine', label: <>Mine <Badge count={myList.length} showZero style={{ backgroundColor: '#8c8c8c', marginLeft: 6 }} /></> },
                            { key: 'pending', label: <>Unassigned <Badge count={pendingList.length} showZero style={{ backgroundColor: '#faad14', marginLeft: 6 }} /></> },
                        ]}
                    />
                    <Input
                        prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
                        placeholder="Search by title, opportunity or requester…"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                        style={{ width: 300 }}
                        allowClear
                    />
                </div>
            </div>

            {/* Table */}
            <div className={styles.tableCard}>
                <Table
                    columns={columns}
                    dataSource={displayData}
                    rowKey="id"
                    loading={isPending}
                    size="middle"
                    scroll={{ x: 'max-content' }}
                    pagination={{ pageSize: 15, showSizeChanger: false }}
                    style={{ background: 'transparent' }}
                />
            </div>

            {/* ── Create Modal ── */}
            <Modal
                title={<span className={styles.pageTitle}>New Pricing Request</span>}
                open={isCreateOpen}
                onCancel={() => { setIsCreateOpen(false); createForm.resetFields(); }}
                onOk={() => createForm.submit()}
                okText="Create"
                width={580}
                styles={{ body: { background: 'transparent' }, header: { background: 'transparent' } }}
            >
                <Form form={createForm} layout="vertical" onFinish={handleCreate}>
                    <Form.Item name="opportunityId" label={<FormLabel text="Opportunity" required />}
                        rules={[{ required: true, message: 'Select an opportunity' }]}>
                        <Select options={oppOptions} placeholder="Select opportunity" showSearch />
                    </Form.Item>
                    <Form.Item name="title" label={<FormLabel text="Title" required />}
                        rules={[{ required: true, message: 'Enter a title' }]}>
                        <Input placeholder="e.g. Enterprise License Pricing" />
                    </Form.Item>
                    <Form.Item name="description" label={<FormLabel text="Description" />}>
                        <TextArea rows={3} placeholder="Details of what needs to be priced…" />
                    </Form.Item>
                    <div className={styles.formGrid}>
                        <Form.Item name="priority" label={<FormLabel text="Priority" />}>
                            <Select options={PRIORITIES.map(p => ({ value: p.value, label: p.label }))}
                                placeholder="Select priority" />
                        </Form.Item>
                        <Form.Item name="requiredByDate" label={<FormLabel text="Required By" />}>
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                    </div>
                </Form>
            </Modal>

            {/* ── Edit Modal ── */}
            <Modal
                title={<span className={styles.pageTitle}>Edit Pricing Request</span>}
                open={isEditOpen}
                onCancel={() => setIsEditOpen(false)}
                onOk={() => editForm.submit()}
                okText="Save"
                width={520}
                styles={{ body: { background: 'transparent' }, header: { background: 'transparent' } }}
            >
                <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
                    <Form.Item name="title" label={<FormLabel text="Title" />}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label={<FormLabel text="Description" />}>
                        <TextArea rows={3} />
                    </Form.Item>
                    <div className={styles.formGrid}>
                        <Form.Item name="priority" label={<FormLabel text="Priority" />}>
                            <Select options={PRIORITIES.map(p => ({ value: p.value, label: p.label }))} />
                        </Form.Item>
                        <Form.Item name="requiredByDate" label={<FormLabel text="Required By" />}>
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                    </div>
                </Form>
            </Modal>

            {/* ── Assign Modal ── */}
            <Modal
                title={<span className={styles.pageTitle}>Assign Request</span>}
                open={isAssignOpen}
                onCancel={() => setIsAssignOpen(false)}
                onOk={handleAssign}
                okText="Assign"
                width={400}
                styles={{ body: { background: 'transparent' }, header: { background: 'transparent' } }}
            >
                <div style={{ marginBottom: 12 }}>
                    <FormLabel text="User ID" required />
                </div>
                <Input
                    value={assignUserId}
                    onChange={e => setAssignUserId(e.target.value)}
                    placeholder="Paste user ID to assign"
                />
            </Modal>

            {/* ── View Modal ── */}
            <Modal
                title={<span className={styles.pageTitle}>Pricing Request Detail</span>}
                open={isViewOpen}
                onCancel={() => setIsViewOpen(false)}
                footer={null}
                width={560}
                styles={{ body: { background: 'transparent' }, header: { background: 'transparent' } }}
            >
                {selected && (
                    <div className={styles.detailContainer}>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Ref #</span>
                            <span className={styles.monospaceText}>{selected.requestNumber}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Title</span>
                            <span className={styles.detailValue}>{selected.title}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Opportunity</span>
                            <span className={styles.detailValue}>{selected.opportunityTitle || '—'}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Description</span>
                            <span className={styles.detailValue}>{selected.description || '—'}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Status</span>
                            <span>{statusTag(selected.status, selected.statusName)}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Priority</span>
                            <span>{priorityTag(selected.priority, selected.priorityName)}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Requested By</span>
                            <span className={styles.detailValue}>{selected.requestedByName || '—'}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Assigned To</span>
                            <span className={styles.detailValue}>{selected.assignedToName || <Tag color="warning">Unassigned</Tag>}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Required By</span>
                            <span className={styles.detailValue}>{selected.requiredByDate ? new Date(selected.requiredByDate).toLocaleDateString() : '—'}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Completed</span>
                            <span className={styles.detailValue}>{selected.completedDate ? new Date(selected.completedDate).toLocaleDateString() : '—'}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Created</span>
                            <span className={styles.mutedText}>{new Date(selected.createdAt).toLocaleString()}</span>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default PricingRequestsPage;
