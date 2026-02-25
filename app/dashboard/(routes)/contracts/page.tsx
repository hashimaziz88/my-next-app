"use client";
import React, { useEffect, useState } from 'react';
import {
    Button, Table, Space, Modal, Form, Input, Select, DatePicker,
    InputNumber, Switch, message, Popconfirm, Typography, Tag, Tabs,
    Badge, Steps, Row, Col, Divider, Alert,
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
    SearchOutlined, CheckOutlined, CloseOutlined, ReloadOutlined,
    WarningOutlined,
} from '@ant-design/icons';
import { useContractActions, useContractState } from '@/providers/contractProvider';
import { useAuthState } from '@/providers/authProvider';
import {
    IContractDto, ICreateContractDto, IUpdateContractDto, ICreateContractRenewalDto,
} from '@/providers/contractProvider/context';
import { useClientActions, useClientState } from '@/providers/clientProvider';
import { useOpportunityActions, useOpportunityState } from '@/providers/opportunityProvider';
import dayjs from 'dayjs';
import type { TableProps } from 'antd';
import { useStyles } from '@/app/dashboard/(routes)/_styles/style';
import FormLabel from '@/app/dashboard/(routes)/_components/FormLabel';

const { Title, Text } = Typography;
const { TextArea } = Input;

/* ─── enum maps ─────────────────────────────────────────────────────── */
const STATUSES = [
    { value: 1, label: 'Draft', color: 'default', step: 0 },
    { value: 2, label: 'Active', color: 'green', step: 1 },
    { value: 3, label: 'Expired', color: 'orange', step: 2 },
    { value: 4, label: 'Renewed', color: 'blue', step: 3 },
    { value: 5, label: 'Cancelled', color: 'red', step: 2 },
];


const statusTag = (status: number, name: string) => {
    const s = STATUSES.find(s => s.value === status);
    return <Tag color={s?.color ?? 'default'}>{name || s?.label}</Tag>;
};

const formatCurrency = (amount: number, currency = 'USD') =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount ?? 0);

/* ─── component ─────────────────────────────────────────────────────── */
const ContractsPage: React.FC = () => {
    const {
        getContracts, getContract, createContract, updateContract, deleteContract,
        getExpiringContracts, activateContract, cancelContract,
        createRenewal,
    } = useContractActions();
    const { pagedResult, expiringContracts, currentContract, isPending, isError } = useContractState();
    const { user } = useAuthState();

    const { styles } = useStyles();

    const { getClients } = useClientActions();
    const { pagedResult: clientsResult } = useClientState();
    const { getOpportunities } = useOpportunityActions();
    const { pagedResult: oppsResult } = useOpportunityState();

    const [activeTab, setActiveTab] = useState('all');
    const [statusFilter, setStatusFilter] = useState<number | undefined>();
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isRenewalOpen, setIsRenewalOpen] = useState(false);
    const [selected, setSelected] = useState<IContractDto | null>(null);
    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();
    const [renewalForm] = Form.useForm();

    useEffect(() => {
        getContracts({ pageSize: 100 });
        getExpiringContracts(30);
        getClients({ pageSize: 100 });
        getOpportunities({ pageSize: 100 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (isError) message.error('An error occurred. Please try again.');
    }, [isError]);

    /* ── tab switch ── */
    const handleTabChange = (key: string) => {
        setActiveTab(key);
        if (key === 'all') getContracts({ pageSize: 100, status: statusFilter });
        else if (key === 'expiring') getExpiringContracts(30);
    };

    const refresh = () => {
        getContracts({ pageSize: 100, status: statusFilter });
        getExpiringContracts(30);
    };

    /* ── CRUD ── */
    const handleCreate = async (values: ICreateContractDto) => {
        await createContract({
            ...values,
            ownerId: values.ownerId ?? user?.userId ?? '',
            startDate: dayjs(values.startDate).toISOString(),
            endDate: dayjs(values.endDate).toISOString(),
        });
        setIsCreateOpen(false);
        createForm.resetFields();
        refresh();
        message.success('Contract created');
    };

    const openEdit = (record: IContractDto) => {
        setSelected(record);
        editForm.setFieldsValue({
            title: record.title,
            contractValue: record.contractValue,
            currency: record.currency,
            endDate: record.endDate ? dayjs(record.endDate) : undefined,
            renewalNoticePeriod: record.renewalNoticePeriod,
            autoRenew: record.autoRenew,
            terms: record.terms,
        });
        setIsEditOpen(true);
    };

    const handleUpdate = async (values: IUpdateContractDto) => {
        if (!selected) return;
        await updateContract(selected.id, {
            ...values,
            endDate: values.endDate ? dayjs(values.endDate as unknown as string).toISOString() : undefined,
        });
        setIsEditOpen(false);
        refresh();
        if (isDetailOpen) await getContract(selected.id);
        message.success('Contract updated');
    };

    const handleDelete = async (id: string) => {
        await deleteContract(id);
        refresh();
        message.success('Contract deleted');
    };

    const openDetail = async (record: IContractDto) => {
        setSelected(record);
        await getContract(record.id);
        setIsDetailOpen(true);
    };

    const handleActivate = async (id: string) => {
        await activateContract(id);
        refresh();
        if (isDetailOpen) await getContract(id);
        message.success('Contract activated');
    };

    const handleCancel = async (id: string) => {
        await cancelContract(id);
        refresh();
        if (isDetailOpen) await getContract(id);
        message.success('Contract cancelled');
    };

    const handleCreateRenewal = async (values: ICreateContractRenewalDto) => {
        if (!selected) return;
        await createRenewal(selected.id, values);
        setIsRenewalOpen(false);
        renewalForm.resetFields();
        refresh();
        if (isDetailOpen) await getContract(selected.id);
        message.success('Renewal initiated');
    };

    /* ── display data ── */
    const rawAll = pagedResult?.items;
    const rawExpiring = expiringContracts?.items;
    const allList: IContractDto[] = Array.isArray(rawAll) ? rawAll : [];
    const expiringList: IContractDto[] = Array.isArray(rawExpiring) ? rawExpiring : [];

    const sourceList = activeTab === 'expiring' ? expiringList : allList;
    const displayData = sourceList.filter(c =>
        (c.title ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.clientName ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.contractNumber ?? '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const clientOptions = (clientsResult?.items ?? []).map(c => ({ value: c.id, label: c.name }));
    const oppOptions = (oppsResult?.items ?? []).map(o => ({ value: o.id, label: o.title }));

    /* ── status stepper ── */
    const statusStepItems = [
        { title: 'Draft' },
        { title: 'Active' },
        { title: 'Closed' },
    ];

    const currentStep = (status: number): number => {
        if (status === 1) return 0;
        if (status === 2) return 1;
        return 2;
    };

    const stepStatus = (status: number): 'finish' | 'process' | 'error' => {
        if (status === 5) return 'error';
        if (status === 2) return 'process';
        return 'finish';
    };

    /* ── columns ── */
    const columns: TableProps<IContractDto>['columns'] = [
        {
            title: 'Ref #',
            dataIndex: 'contractNumber',
            width: 120,
            render: val => <span className={styles.monospaceText}>{val}</span>,
        },
        {
            title: 'Title',
            dataIndex: 'title',
            render: (val, record) => (
                <Button type="link" className={styles.primaryText} style={{ padding: 0, height: 'auto' }}
                    onClick={() => openDetail(record)}>
                    {val}
                </Button>
            ),
        },
        {
            title: 'Client',
            dataIndex: 'clientName',
            render: val => <span className={styles.bodyText}>{val || '—'}</span>,
        },
        {
            title: 'Value',
            dataIndex: 'contractValue',
            render: (val, record) => (
                <span className={styles.primaryText}>{formatCurrency(val, record.currency)}</span>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (val, record) => statusTag(val, record.statusName),
        },
        {
            title: 'End Date',
            dataIndex: 'endDate',
            render: (val, record) => (
                <span style={{ color: record.isExpiringSoon && record.status === 2 ? '#faad14' : '#d4d4d4' }}>
                    {val ? new Date(val).toLocaleDateString() : '—'}
                    {record.isExpiringSoon && record.status === 2 && (
                        <WarningOutlined style={{ marginLeft: 6, color: '#faad14' }} />
                    )}
                </span>
            ),
        },
        {
            title: 'Days Left',
            dataIndex: 'daysUntilExpiry',
            width: 90,
            render: (val, record) => record.status === 2
                ? <span style={{ color: val <= 30 ? '#faad14' : '#d4d4d4' }}>{val ?? '—'}</span>
                : <span className={styles.mutedTextSmall}>—</span>,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="small">
                    <Button size="small" type="text" icon={<EyeOutlined />}
                        className={styles.btnView}
                        onClick={() => openDetail(record)} />
                    {(record.status === 1 || record.status === 2) && (
                        <Button size="small" type="text" icon={<EditOutlined />}
                            className={styles.btnWarn}
                            onClick={() => openEdit(record)} />
                    )}
                    {record.status === 1 && (
                        <Popconfirm title="Activate this contract?" onConfirm={() => handleActivate(record.id)} okText="Activate" cancelText="No">
                            <Button size="small" type="text" icon={<CheckOutlined />} className={styles.btnSuccess} />
                        </Popconfirm>
                    )}
                    {record.status === 2 && (
                        <>
                            <Button size="small" type="text" icon={<ReloadOutlined />}
                                className={styles.btnView}
                                onClick={() => { setSelected(record); renewalForm.resetFields(); setIsRenewalOpen(true); }} />
                            <Popconfirm title="Cancel this contract?" onConfirm={() => handleCancel(record.id)} okText="Cancel it" cancelText="No">
                                <Button size="small" type="text" icon={<CloseOutlined />} className={styles.btnDelete} />
                            </Popconfirm>
                        </>
                    )}
                    {record.status === 1 && (
                        <Popconfirm title="Delete this contract?" onConfirm={() => handleDelete(record.id)} okText="Yes" cancelText="No">
                            <Button size="small" type="text" icon={<DeleteOutlined />} className={styles.btnDelete} />
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.pageHeader}>
                <div>
                    <Title level={2} className={styles.pageTitle}>Contracts</Title>
                    <Text className={styles.pageSubtitle}>Manage client contracts and renewal lifecycle</Text>
                </div>
                <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => setIsCreateOpen(true)}>
                    New Contract
                </Button>
            </div>

            {/* Tabs + Toolbar */}
            <div className={styles.toolbar}>
                <div className={styles.toolbarRow} style={{ justifyContent: 'space-between' }}>
                    <Space wrap>
                        <Tabs
                            activeKey={activeTab}
                            onChange={handleTabChange}
                            style={{ marginBottom: 0 }}
                            items={[
                                { key: 'all', label: <>All <Badge count={allList.length} showZero style={{ backgroundColor: '#1890ff', marginLeft: 6 }} /></> },
                                { key: 'expiring', label: <><WarningOutlined style={{ color: '#faad14' }} /> Expiring Soon <Badge count={expiringList.length} showZero style={{ backgroundColor: '#faad14', marginLeft: 6 }} /></> },
                            ]}
                        />
                        <Select
                            placeholder="Filter by status"
                            allowClear
                            style={{ width: 160 }}
                            options={STATUSES.map(s => ({ value: s.value, label: s.label }))}
                            value={statusFilter}
                            onChange={val => {
                                setStatusFilter(val);
                                getContracts({ pageSize: 100, status: val });
                                setActiveTab('all');
                            }}
                        />
                    </Space>
                    <Input
                        prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
                        placeholder="Search by title, client or ref…"
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
                    rowClassName={record =>
                        record.isExpiringSoon && record.status === 2 ? 'expiring-row' : ''
                    }
                />
            </div>

            {/* ── Create Modal ── */}
            <Modal
                title={<span className={styles.pageTitle}>New Contract</span>}
                open={isCreateOpen}
                onCancel={() => { setIsCreateOpen(false); createForm.resetFields(); }}
                onOk={() => createForm.submit()}
                okText="Create"
                width={680}
                styles={{ body: { background: 'transparent' }, header: { background: 'transparent' } }}
            >
                <Form form={createForm} layout="vertical" onFinish={handleCreate}>
                    <Form.Item name="clientId" label={<FormLabel text="Client" required />}
                        rules={[{ required: true, message: 'Select a client' }]}>
                        <Select options={clientOptions} placeholder="Select client" showSearch />
                    </Form.Item>
                    <Form.Item name="title" label={<FormLabel text="Contract Title" required />}
                        rules={[{ required: true, message: 'Enter a title' }]}>
                        <Input placeholder="e.g. Enterprise Software License Agreement" />
                    </Form.Item>
                    <div className={styles.formGrid}>
                        <Form.Item name="opportunityId" label={<FormLabel text="Opportunity (optional)" />}>
                            <Select options={oppOptions} placeholder="Link to opportunity" allowClear showSearch />
                        </Form.Item>
                        <Form.Item name="currency" label={<FormLabel text="Currency" />} initialValue="USD">
                            <Select options={[
                                { value: 'USD', label: 'USD' },
                                { value: 'EUR', label: 'EUR' },
                                { value: 'GBP', label: 'GBP' },
                                { value: 'ZAR', label: 'ZAR' },
                            ]} />
                        </Form.Item>
                        <Form.Item name="contractValue" label={<FormLabel text="Contract Value" required />}
                            rules={[{ required: true, message: 'Enter contract value' }]}>
                            <InputNumber min={0} style={{ width: '100%' }} placeholder="0.00" />
                        </Form.Item>
                        <Form.Item name="renewalNoticePeriod" label={<FormLabel text="Renewal Notice (days)" />} initialValue={30}>
                            <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item name="startDate" label={<FormLabel text="Start Date" required />}
                            rules={[{ required: true, message: 'Select start date' }]}>
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item name="endDate" label={<FormLabel text="End Date" required />}
                            rules={[{ required: true, message: 'Select end date' }]}>
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                    </div>
                    <Form.Item name="autoRenew" label={<FormLabel text="Auto Renew" />} valuePropName="checked" initialValue={false}>
                        <Switch />
                    </Form.Item>
                    <Form.Item name="terms" label={<FormLabel text="Terms & Conditions" />}>
                        <TextArea rows={3} placeholder="Contract terms…" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* ── Edit Modal ── */}
            <Modal
                title={<span className={styles.pageTitle}>Edit Contract</span>}
                open={isEditOpen}
                onCancel={() => setIsEditOpen(false)}
                onOk={() => editForm.submit()}
                okText="Save"
                width={580}
                styles={{ body: { background: 'transparent' }, header: { background: 'transparent' } }}
            >
                <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
                    <Form.Item name="title" label={<FormLabel text="Title" />}>
                        <Input />
                    </Form.Item>
                    <div className={styles.formGrid}>
                        <Form.Item name="contractValue" label={<FormLabel text="Contract Value" />}>
                            <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item name="currency" label={<FormLabel text="Currency" />}>
                            <Select options={[
                                { value: 'USD', label: 'USD' },
                                { value: 'EUR', label: 'EUR' },
                                { value: 'GBP', label: 'GBP' },
                                { value: 'ZAR', label: 'ZAR' },
                            ]} />
                        </Form.Item>
                        <Form.Item name="endDate" label={<FormLabel text="End Date" />}>
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item name="renewalNoticePeriod" label={<FormLabel text="Renewal Notice (days)" />}>
                            <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                    </div>
                    <Form.Item name="autoRenew" label={<FormLabel text="Auto Renew" />} valuePropName="checked">
                        <Switch />
                    </Form.Item>
                    <Form.Item name="terms" label={<FormLabel text="Terms & Conditions" />}>
                        <TextArea rows={3} />
                    </Form.Item>
                </Form>
            </Modal>

            {/* ── Detail Modal ── */}
            <Modal
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 40 }}>
                        <span className={styles.pageTitle}>
                            {currentContract?.contractNumber} — {currentContract?.title}
                        </span>
                        {currentContract && statusTag(currentContract.status, currentContract.statusName)}
                    </div>
                }
                open={isDetailOpen}
                onCancel={() => setIsDetailOpen(false)}
                footer={
                    <Space wrap>
                        {currentContract?.status === 1 && (
                            <Popconfirm title="Activate this contract?" onConfirm={() => handleActivate(currentContract.id)} okText="Activate">
                                <Button type="primary" icon={<CheckOutlined />} style={{ background: '#52c41a', borderColor: '#52c41a' }}>
                                    Activate
                                </Button>
                            </Popconfirm>
                        )}
                        {currentContract?.status === 2 && (
                            <>
                                <Button icon={<ReloadOutlined />} onClick={() => { setSelected(currentContract); renewalForm.resetFields(); setIsRenewalOpen(true); }}>
                                    Start Renewal
                                </Button>
                                <Popconfirm title="Cancel this contract?" onConfirm={() => handleCancel(currentContract.id)} okText="Cancel it">
                                    <Button danger icon={<CloseOutlined />}>Cancel Contract</Button>
                                </Popconfirm>
                            </>
                        )}
                        {(currentContract?.status === 1 || currentContract?.status === 2) && (
                            <Button icon={<EditOutlined />} onClick={() => { if (currentContract) openEdit(currentContract); }}>
                                Edit
                            </Button>
                        )}
                        <Button onClick={() => setIsDetailOpen(false)}>Close</Button>
                    </Space>
                }
                width={760}
                styles={{ body: { background: 'transparent' }, header: { background: 'transparent' }, footer: { background: 'transparent' } }}
            >
                {currentContract && (
                    <>
                        {/* Status stepper */}
                        <Steps
                            current={currentStep(currentContract.status)}
                            status={stepStatus(currentContract.status)}
                            items={statusStepItems}
                            style={{ marginBottom: 24 }}
                            size="small"
                        />

                        {/* Expiry warning */}
                        {currentContract.isExpiringSoon && currentContract.status === 2 && (
                            <Alert
                                type="warning"
                                icon={<WarningOutlined />}
                                showIcon
                                description={`Expires in ${currentContract.daysUntilExpiry} day${currentContract.daysUntilExpiry === 1 ? '' : 's'} — consider initiating a renewal.`}
                                style={{ marginBottom: 16, background: 'rgba(250,173,20,0.1)', border: '1px solid rgba(250,173,20,0.3)' }}
                            />
                        )}

                        {/* Key metrics */}
                        <Row gutter={16} style={{ marginBottom: 16 }}>
                            <Col span={8}>
                                <div className={styles.card} style={{ padding: '12px 16px' }}>
                                    <Text className={styles.mutedText} style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Contract Value</Text>
                                    <Text className={styles.primaryText} style={{ fontSize: 20, fontWeight: 600 }}>
                                        {formatCurrency(currentContract.contractValue, currentContract.currency)}
                                    </Text>
                                </div>
                            </Col>
                            <Col span={8}>
                                <div className={styles.card} style={{ padding: '12px 16px' }}>
                                    <Text className={styles.mutedText} style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Ends</Text>
                                    <Text className={styles.primaryText} style={{ fontSize: 18, fontWeight: 600 }}>
                                        {currentContract.endDate ? new Date(currentContract.endDate).toLocaleDateString() : '—'}
                                    </Text>
                                </div>
                            </Col>
                            <Col span={8}>
                                <div className={styles.card} style={{ padding: '12px 16px' }}>
                                    <Text className={styles.mutedText} style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>Days Until Expiry</Text>
                                    <Text style={{ fontSize: 20, fontWeight: 600, color: currentContract.daysUntilExpiry <= 30 && currentContract.status === 2 ? '#faad14' : 'white' }}>
                                        {currentContract.status === 2 ? (currentContract.daysUntilExpiry ?? '—') : '—'}
                                    </Text>
                                </div>
                            </Col>
                        </Row>

                        {/* Details */}
                        <div className={styles.detailContainer}>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Client</span>
                                <span className={styles.detailValue}>{currentContract.clientName || '—'}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Opportunity</span>
                                <span className={styles.detailValue}>{currentContract.opportunityTitle || '—'}</span>
                            </div>
                            {currentContract.proposalNumber && (
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Proposal</span>
                                    <span className={styles.monospaceText}>{currentContract.proposalNumber}</span>
                                </div>
                            )}
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Owner</span>
                                <span className={styles.detailValue}>{currentContract.ownerName || '—'}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Start Date</span>
                                <span className={styles.detailValue}>
                                    {currentContract.startDate ? new Date(currentContract.startDate).toLocaleDateString() : '—'}
                                </span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Auto Renew</span>
                                <span className={styles.detailValue}>{currentContract.autoRenew ? 'Yes' : 'No'}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Notice Period</span>
                                <span className={styles.detailValue}>{currentContract.renewalNoticePeriod} days</span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Renewals</span>
                                <span className={styles.detailValue}>{currentContract.renewalsCount ?? 0}</span>
                            </div>
                            {currentContract.terms && (
                                <>
                                    <Divider style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '8px 0' }} />
                                    <div className={styles.detailRow} style={{ flexDirection: 'column', gap: 4 }}>
                                        <span className={styles.detailLabel}>Terms</span>
                                        <Text className={styles.bodyText} style={{ whiteSpace: 'pre-wrap' }}>{currentContract.terms}</Text>
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                )}
            </Modal>

            {/* ── Renewal Modal ── */}
            <Modal
                title={<span className={styles.pageTitle}>Start Contract Renewal</span>}
                open={isRenewalOpen}
                onCancel={() => { setIsRenewalOpen(false); renewalForm.resetFields(); }}
                onOk={() => renewalForm.submit()}
                okText="Initiate Renewal"
                width={480}
                styles={{ body: { background: 'transparent' }, header: { background: 'transparent' } }}
            >
                <Form form={renewalForm} layout="vertical" onFinish={handleCreateRenewal}>
                    <Form.Item name="renewalOpportunityId" label={<FormLabel text="Link to Opportunity (optional)" />}>
                        <Select options={oppOptions} placeholder="Link renewal to an opportunity" allowClear showSearch />
                    </Form.Item>
                    <Form.Item name="notes" label={<FormLabel text="Renewal Notes" />}>
                        <TextArea rows={3} placeholder="Notes about this renewal…" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ContractsPage;
