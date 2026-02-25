"use client";
import React, { useEffect, useState } from 'react';
import {
    Button, Table, Space, Modal, Form, Input, Select, DatePicker,
    InputNumber, message, Popconfirm, Typography, Tag, Tabs, Badge,
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined,
    CloseOutlined, EyeOutlined, SearchOutlined,
} from '@ant-design/icons';
import { useActivityActions, useActivityState } from '@/providers/activityProvider';
import { useAuthState } from '@/providers/authProvider';
import {
    IActivityDto, ICreateActivityDto, IUpdateActivityDto, ICompleteActivityDto,
} from '@/providers/activityProvider/context';
import { useOpportunityActions, useOpportunityState } from '@/providers/opportunityProvider';
import { useClientActions, useClientState } from '@/providers/clientProvider';
import dayjs from 'dayjs';
import type { TableProps } from 'antd';
import { useStyles } from '@/app/dashboard/(routes)/_styles/style';
import { useActivityStyles } from '@/app/dashboard/(routes)/activities/style/style';
import FormLabel from '@/app/dashboard/(routes)/_components/FormLabel';

const { Title, Text } = Typography;
const { TextArea } = Input;

/* ─── enum maps (api integer values) ─────────────────────────────────── */
const ACTIVITY_TYPES = [
    { value: 1, label: 'Meeting', color: 'blue' },
    { value: 2, label: 'Call', color: 'green' },
    { value: 3, label: 'Email', color: 'cyan' },
    { value: 4, label: 'Task', color: 'orange' },
    { value: 5, label: 'Presentation', color: 'purple' },
];

const PRIORITIES = [
    { value: 1, label: 'Low', color: 'default' },
    { value: 2, label: 'Medium', color: 'blue' },
    { value: 3, label: 'High', color: 'orange' },
    { value: 4, label: 'Urgent', color: 'red' },
];

const STATUSES = [
    { value: 1, label: 'Scheduled', color: 'blue' },
    { value: 2, label: 'Completed', color: 'green' },
    { value: 3, label: 'Cancelled', color: 'default' },
];

const RELATED_TYPES = [
    { value: 1, label: 'Client' },
    { value: 2, label: 'Opportunity' },
    { value: 3, label: 'Proposal' },
    { value: 4, label: 'Contract' },
];

/* ─── helpers ─────────────────────────────────────────────────────────── */
const statusTag = (status: number, name: string) => {
    const s = STATUSES.find(s => s.value === status);
    return <Tag color={s?.color ?? 'default'}>{name || s?.label}</Tag>;
};

const typeTag = (type: number, name: string) => {
    const t = ACTIVITY_TYPES.find(t => t.value === type);
    return <Tag color={t?.color ?? 'default'}>{name || t?.label}</Tag>;
};

const priorityTag = (priority: number, name: string) => {
    const p = PRIORITIES.find(p => p.value === priority);
    return <Tag color={p?.color ?? 'default'}>{name || p?.label}</Tag>;
};

/* ─── component ───────────────────────────────────────────────────────── */
const ActivitiesPage: React.FC = () => {
    const { getActivities, getMyActivities, getUpcomingActivities, getOverdueActivities,
        createActivity, updateActivity, deleteActivity, completeActivity, cancelActivity,
    } = useActivityActions();
    const { pagedResult, upcomingActivities, overdueActivities, isPending, isError } = useActivityState();
    const { user } = useAuthState();

    const { styles } = useStyles();
    const { styles: act, cx } = useActivityStyles();

    const { getOpportunities } = useOpportunityActions();
    const { pagedResult: oppsResult } = useOpportunityState();
    const { getClients } = useClientActions();
    const { pagedResult: clientsResult } = useClientState();

    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isCompleteOpen, setIsCompleteOpen] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState<IActivityDto | null>(null);
    const [relatedType, setRelatedType] = useState<number | undefined>(undefined);
    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();
    const [completeForm] = Form.useForm();

    useEffect(() => {
        getActivities({ pageSize: 100 });
        getUpcomingActivities(14);
        getOverdueActivities();
        getOpportunities({ pageSize: 100 });
        getClients({ pageSize: 100 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (isError) message.error('An error occurred. Please try again.');
    }, [isError]);

    /* tab switch */
    const handleTabChange = (key: string) => {
        setActiveTab(key);
        if (key === 'all') getActivities({ pageSize: 100 });
        else if (key === 'mine') getMyActivities();
        else if (key === 'upcoming') getUpcomingActivities(14);
        else if (key === 'overdue') getOverdueActivities();
    };

    /* CRUD helpers */
    const handleCreate = async (values: ICreateActivityDto) => {
        await createActivity({
            ...values,
            dueDate: values.dueDate ? dayjs(values.dueDate).toISOString() : values.dueDate,
            assignedToId: values.assignedToId ?? user?.userId,
        });
        setIsCreateOpen(false);
        createForm.resetFields();
        setRelatedType(undefined);
        getActivities({ pageSize: 100 });
        message.success('Activity created');
    };

    const openEdit = (record: IActivityDto) => {
        setSelectedActivity(record);
        editForm.setFieldsValue({
            subject: record.subject,
            description: record.description,
            priority: record.priority,
            dueDate: record.dueDate ? dayjs(record.dueDate) : undefined,
            duration: record.duration,
            location: record.location,
            outcome: record.outcome,
        });
        setIsEditOpen(true);
    };

    const handleUpdate = async (values: IUpdateActivityDto) => {
        if (!selectedActivity) return;
        await updateActivity(selectedActivity.id, {
            ...values,
            dueDate: values.dueDate ? dayjs(values.dueDate as unknown as string).toISOString() : undefined,
        });
        setIsEditOpen(false);
        getActivities({ pageSize: 100 });
        message.success('Activity updated');
    };

    const handleDelete = async (id: string) => {
        await deleteActivity(id);
        getActivities({ pageSize: 100 });
        message.success('Activity deleted');
    };

    const openComplete = (record: IActivityDto) => {
        setSelectedActivity(record);
        completeForm.resetFields();
        setIsCompleteOpen(true);
    };

    const handleComplete = async (values: ICompleteActivityDto) => {
        if (!selectedActivity) return;
        await completeActivity(selectedActivity.id, values);
        setIsCompleteOpen(false);
        getActivities({ pageSize: 100 });
        message.success('Activity marked as completed');
    };

    const handleCancel = async (id: string) => {
        await cancelActivity(id);
        getActivities({ pageSize: 100 });
        message.success('Activity cancelled');
    };

    /* data for current tab */
    const rawItems = pagedResult?.items;
    const allList: IActivityDto[] = Array.isArray(rawItems) ? rawItems : [];
    const upcomingList = Array.isArray(upcomingActivities) ? upcomingActivities : [];
    const overdueList = Array.isArray(overdueActivities) ? overdueActivities : [];

    const tabData: Record<string, IActivityDto[]> = {
        all: allList,
        mine: allList,   // getMyActivities() reuses pagedResult
        upcoming: upcomingList,
        overdue: overdueList,
    };
    const displayData = (tabData[activeTab] ?? allList).filter(a =>
        (a.subject ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.assignedToName ?? '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    /* related-entity options for create form */
    const relatedOptions = relatedType === 2
        ? (oppsResult?.items ?? []).map(o => ({ value: o.id, label: o.title }))
        : (clientsResult?.items ?? []).map(c => ({ value: c.id, label: c.name }));

    /* table columns */
    const columns: TableProps<IActivityDto>['columns'] = [
        {
            title: 'Subject',
            dataIndex: 'subject',
            render: (val, record) => (
                <Button
                    type="link"
                    className={styles.primaryText}
                    style={{ padding: 0, height: 'auto' }}
                    onClick={() => { setSelectedActivity(record); setIsViewOpen(true); }}
                >
                    {val}
                </Button>
            ),
        },
        {
            title: 'Type',
            dataIndex: 'type',
            render: (val, record) => typeTag(val, record.typeName),
        },
        {
            title: 'Related To',
            dataIndex: 'relatedToTitle',
            render: (val, record) => val
                ? <Tag color="geekblue">{record.relatedToTypeName}: {val}</Tag>
                : <span className={styles.mutedTextSmall}>—</span>,
        },
        {
            title: 'Assigned To',
            dataIndex: 'assignedToName',
            render: val => <span className={styles.bodyText}>{val || '—'}</span>,
        },
        {
            title: 'Priority',
            dataIndex: 'priority',
            render: (val, record) => priorityTag(val, record.priorityName),
        },
        {
            title: 'Due Date',
            dataIndex: 'dueDate',
            render: (val, record) => (
                <span style={{ color: record.isOverdue && record.status === 1 ? '#ff4d4f' : '#d4d4d4' }}>
                    {val ? new Date(val).toLocaleDateString() : '—'}
                    {record.isOverdue && record.status === 1 && ' ⚠'}
                </span>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (val, record) => statusTag(val, record.statusName),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        size="small" type="text" icon={<EyeOutlined />}
                        className={styles.btnView}
                        onClick={() => { setSelectedActivity(record); setIsViewOpen(true); }}
                    />
                    {record.status === 1 && (
                        <>
                            <Button
                                size="small" type="text" icon={<EditOutlined />}
                                className={styles.btnWarn}
                                onClick={() => openEdit(record)}
                            />
                            <Button
                                size="small" type="text" icon={<CheckOutlined />}
                                className={styles.btnSuccess}
                                onClick={() => openComplete(record)}
                            />
                            <Popconfirm
                                title="Cancel this activity?"
                                onConfirm={() => handleCancel(record.id)}
                                okText="Yes" cancelText="No"
                            >
                                <Button size="small" type="text" icon={<CloseOutlined />} className={styles.btnWarn} />
                            </Popconfirm>
                        </>
                    )}
                    <Popconfirm
                        title="Delete this activity?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes" cancelText="No"
                    >
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
                    <Title level={2} className={styles.pageTitle} >Activities</Title>
                    <Text className={styles.pageSubtitle}>Track calls, meetings, emails and tasks</Text>
                </div>
                <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => setIsCreateOpen(true)}>
                    Log Activity
                </Button>
            </div>

            {/* Tabs + search */}
            <div className={act.tabsBar}>
                <div className={styles.toolbarRow} style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Tabs
                        activeKey={activeTab}
                        onChange={handleTabChange}
                        items={[
                            { key: 'all', label: <span className={cx(act.tabLabel, activeTab === 'all' && act.tabLabelActive)}>All <Badge count={allList.length} showZero style={{ backgroundColor: '#1890ff' }} /></span> },
                            { key: 'mine', label: <span className={cx(act.tabLabel, activeTab === 'mine' && act.tabLabelActive)}>My Activities</span> },
                            { key: 'upcoming', label: <span className={cx(act.tabLabel, activeTab === 'upcoming' && act.tabLabelWarning)}>Upcoming <Badge count={upcomingList.length} showZero style={{ backgroundColor: '#faad14' }} /></span> },
                            { key: 'overdue', label: <span className={cx(act.tabLabel, activeTab === 'overdue' && act.tabLabelDanger)}>Overdue <Badge count={overdueList.length} showZero style={{ backgroundColor: '#ff4d4f' }} /></span> },
                        ]}
                    />
                    <Input
                        prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
                        placeholder="Search by subject or assignee…"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                        style={{ width: 280 }}
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
                title={<span className={styles.pageTitle}>Log New Activity</span>}
                open={isCreateOpen}
                onCancel={() => { setIsCreateOpen(false); createForm.resetFields(); setRelatedType(undefined); }}
                onOk={() => createForm.submit()}
                okText="Create"
                width={640}
                styles={{ body: { background: 'transparent' }, header: { background: 'transparent' } }}
            >
                <Form form={createForm} layout="vertical" onFinish={handleCreate}>
                    <Form.Item name="type" label={<FormLabel text="Activity Type" />}
                        rules={[{ required: true, message: 'Select a type' }]}>
                        <Select options={ACTIVITY_TYPES.map(t => ({ value: t.value, label: t.label }))}
                            placeholder="Select type" />
                    </Form.Item>
                    <Form.Item name="subject" label={<FormLabel text="Subject" />}
                        rules={[{ required: true, message: 'Enter a subject' }]}>
                        <Input placeholder="e.g. Discovery call with Acme" />
                    </Form.Item>
                    <Form.Item name="description" label={<FormLabel text="Description" />}>
                        <TextArea rows={3} placeholder="Optional details…" />
                    </Form.Item>
                    <div className={styles.formGrid}>
                        <Form.Item name="relatedToType" label={<FormLabel text="Related Entity Type" />}>
                            <Select
                                options={RELATED_TYPES}
                                placeholder="None"
                                allowClear
                                onChange={v => { setRelatedType(v); createForm.setFieldValue('relatedToId', undefined); }}
                            />
                        </Form.Item>
                        <Form.Item name="relatedToId" label={<FormLabel text="Related To" />}>
                            <Select
                                options={relatedOptions}
                                placeholder="Select record"
                                allowClear
                                disabled={!relatedType}
                                showSearch
                            />
                        </Form.Item>
                        <Form.Item name="priority" label={<FormLabel text="Priority" />}>
                            <Select options={PRIORITIES.map(p => ({ value: p.value, label: p.label }))} placeholder="Medium" />
                        </Form.Item>
                        <Form.Item name="dueDate" label={<FormLabel text="Due Date" />}
                            rules={[{ required: true, message: 'Pick a due date' }]}>
                            <DatePicker style={{ width: '100%' }} showTime format="YYYY-MM-DD HH:mm" />
                        </Form.Item>
                        <Form.Item name="duration" label={<FormLabel text="Duration (min)" />}>
                            <InputNumber min={1} placeholder="60" style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item name="location" label={<FormLabel text="Location" />}>
                            <Input placeholder="e.g. Google Meet" />
                        </Form.Item>
                    </div>
                </Form>
            </Modal>

            {/* ── Edit Modal ── */}
            <Modal
                title={<span className={styles.pageTitle}>Edit Activity</span>}
                open={isEditOpen}
                onCancel={() => setIsEditOpen(false)}
                onOk={() => editForm.submit()}
                okText="Save"
                width={580}
                styles={{ body: { background: 'transparent' }, header: { background: 'transparent' } }}
            >
                <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
                    <Form.Item name="subject" label={<FormLabel text="Subject" />}
                        rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label={<FormLabel text="Description" />}>
                        <TextArea rows={3} />
                    </Form.Item>
                    <div className={styles.formGrid}>
                        <Form.Item name="priority" label={<FormLabel text="Priority" />}>
                            <Select options={PRIORITIES.map(p => ({ value: p.value, label: p.label }))} />
                        </Form.Item>
                        <Form.Item name="dueDate" label={<FormLabel text="Due Date" />}>
                            <DatePicker style={{ width: '100%' }} showTime format="YYYY-MM-DD HH:mm" />
                        </Form.Item>
                        <Form.Item name="duration" label={<FormLabel text="Duration (min)" />}>
                            <InputNumber min={1} style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item name="location" label={<FormLabel text="Location" />}>
                            <Input />
                        </Form.Item>
                    </div>
                    <Form.Item name="outcome" label={<FormLabel text="Outcome" />}>
                        <TextArea rows={2} placeholder="What was the outcome?" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* ── Complete Modal ── */}
            <Modal
                title={<span className={styles.pageTitle}>Complete Activity</span>}
                open={isCompleteOpen}
                onCancel={() => setIsCompleteOpen(false)}
                onOk={() => completeForm.submit()}
                okText="Mark Complete"
                okButtonProps={{ style: { background: '#52c41a', borderColor: '#52c41a' } }}
                styles={{ body: { background: 'transparent' }, header: { background: 'transparent' } }}
            >
                <p className={act.completeNote}>
                    Completing: <strong style={{ color: 'white' }}>{selectedActivity?.subject}</strong>
                </p>
                <Form form={completeForm} layout="vertical" onFinish={handleComplete}>
                    <Form.Item name="outcome" label={<FormLabel text="Outcome / Notes" />}>
                        <TextArea rows={4} placeholder="What happened? What was agreed?" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* ── View Drawer ── */}
            <Modal
                title={<span className={styles.pageTitle}>{selectedActivity?.subject}</span>}
                open={isViewOpen}
                onCancel={() => setIsViewOpen(false)}
                footer={null}
                width={560}
                styles={{ body: { background: 'transparent' }, header: { background: 'transparent' } }}
            >
                {selectedActivity && (
                    <div className={styles.detailContainer}>
                        {[
                            ['Type', typeTag(selectedActivity.type, selectedActivity.typeName)],
                            ['Status', statusTag(selectedActivity.status, selectedActivity.statusName)],
                            ['Priority', priorityTag(selectedActivity.priority, selectedActivity.priorityName)],
                            ['Related To', selectedActivity.relatedToTitle
                                ? <Tag color="geekblue">{selectedActivity.relatedToTypeName}: {selectedActivity.relatedToTitle}</Tag>
                                : '—'],
                            ['Assigned To', selectedActivity.assignedToName || '—'],
                            ['Due Date', selectedActivity.dueDate ? new Date(selectedActivity.dueDate).toLocaleString() : '—'],
                            ['Duration', selectedActivity.duration ? `${selectedActivity.duration} min` : '—'],
                            ['Location', selectedActivity.location || '—'],
                            ['Description', selectedActivity.description || '—'],
                            ['Outcome', selectedActivity.outcome || '—'],
                        ].map(([label, value]) => (
                            <div key={label as string} className={styles.detailRow}>
                                <span className={styles.detailLabelNarrow}>{label}</span>
                                <span className={styles.detailValue}>{value}</span>
                            </div>
                        ))}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ActivitiesPage;
