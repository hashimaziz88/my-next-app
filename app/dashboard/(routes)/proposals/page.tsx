"use client";
import React, { useEffect, useState } from 'react';
import {
    Button, Table, Space, Modal, Form, Input, Select, DatePicker,
    InputNumber, message, Popconfirm, Typography, Tag, Divider,
    Statistic, Row, Col,
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
    SearchOutlined, SendOutlined, CheckOutlined, CloseOutlined,
} from '@ant-design/icons';
import { useProposalActions, useProposalState } from '@/providers/proposalProvider';
import {
    IProposalDto, ICreateProposalDto, IUpdateProposalDto,
    ICreateProposalLineItemDto, IProposalLineItemDto,
} from '@/providers/proposalProvider/context';
import { useOpportunityActions, useOpportunityState } from '@/providers/opportunityProvider';
import dayjs from 'dayjs';
import type { TableProps } from 'antd';
import { useStyles } from '@/app/dashboard/(routes)/_styles/style';
import FormLabel from '@/app/dashboard/(routes)/_components/FormLabel';

const { Title, Text } = Typography;
const { TextArea } = Input;

/* ─── enum maps ─────────────────────────────────────────────────────── */
const STATUSES = [
    { value: 1, label: 'Draft', color: 'default' },
    { value: 2, label: 'Submitted', color: 'blue' },
    { value: 3, label: 'Rejected', color: 'red' },
    { value: 4, label: 'Approved', color: 'green' },
    { value: 5, label: 'Expired', color: 'orange' },
    { value: 6, label: 'Cancelled', color: 'default' },
];

const statusTag = (status: number, name: string) => {
    const s = STATUSES.find(s => s.value === status);
    return <Tag color={s?.color ?? 'default'}>{name || s?.label}</Tag>;
};

const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount ?? 0);
};

/* ─── empty line item ────────────────────────────────────────────────── */
let _lineItemSeq = 0;
const emptyItem = (): ICreateProposalLineItemDto & { _key: number } => ({
    productServiceName: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    discount: 0,
    taxRate: 0,
    _key: ++_lineItemSeq,
});

/* ─── component ─────────────────────────────────────────────────────── */
const ProposalsPage: React.FC = () => {
    const {
        getProposals, getProposal, createProposal, updateProposal, deleteProposal,
        addLineItem, updateLineItem, deleteLineItem,
        submitProposal, approveProposal, rejectProposal,
    } = useProposalActions();
    const { pagedResult, currentProposal, isPending, isError } = useProposalState();

    const { styles } = useStyles();

    const { getOpportunities } = useOpportunityActions();
    const { pagedResult: oppsResult } = useOpportunityState();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<number | undefined>();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isLineItemOpen, setIsLineItemOpen] = useState(false);
    const [editingLineItem, setEditingLineItem] = useState<IProposalLineItemDto | null>(null);
    const [selected, setSelected] = useState<IProposalDto | null>(null);
    /* inline line items for the create form */
    const [draftItems, setDraftItems] = useState<(ICreateProposalLineItemDto & { _key: number })[]>([emptyItem()]);
    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();
    const [lineItemForm] = Form.useForm();

    useEffect(() => {
        getProposals({ pageSize: 100 });
        getOpportunities({ pageSize: 100 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (isError) message.error('An error occurred. Please try again.');
    }, [isError]);

    /* ── helpers ── */
    const refresh = () => getProposals({ pageSize: 100, status: statusFilter });

    const openDetail = async (record: IProposalDto) => {
        setSelected(record);
        await getProposal(record.id);
        setIsDetailOpen(true);
    };

    /* ── CRUD ── */
    const handleCreate = async (values: ICreateProposalDto) => {
        await createProposal({
            ...values,
            validUntil: values.validUntil
                ? dayjs(values.validUntil).toISOString()
                : undefined,
            lineItems: draftItems.filter(i => i.productServiceName),
        });
        setIsCreateOpen(false);
        createForm.resetFields();
        setDraftItems([emptyItem()]);
        refresh();
        message.success('Proposal created');
    };

    const openEdit = (record: IProposalDto) => {
        setSelected(record);
        editForm.setFieldsValue({
            title: record.title,
            description: record.description,
            currency: record.currency,
            validUntil: record.validUntil ? dayjs(record.validUntil) : undefined,
        });
        setIsEditOpen(true);
    };

    const handleUpdate = async (values: IUpdateProposalDto) => {
        if (!selected) return;
        await updateProposal(selected.id, {
            ...values,
            validUntil: values.validUntil
                ? dayjs(values.validUntil as unknown as string).toISOString()
                : undefined,
        });
        setIsEditOpen(false);
        refresh();
        message.success('Proposal updated');
    };

    const handleDelete = async (id: string) => {
        await deleteProposal(id);
        refresh();
        message.success('Proposal deleted');
    };

    const handleSubmit = async (id: string) => {
        await submitProposal(id);
        refresh();
        if (isDetailOpen) await getProposal(id);
        message.success('Proposal submitted for approval');
    };

    const handleApprove = async (id: string) => {
        await approveProposal(id);
        refresh();
        if (isDetailOpen) await getProposal(id);
        message.success('Proposal approved');
    };

    const handleReject = async (id: string) => {
        await rejectProposal(id);
        refresh();
        if (isDetailOpen) await getProposal(id);
        message.success('Proposal rejected');
    };

    /* ── line item management (inside detail modal) ── */
    const openAddLineItem = () => {
        setEditingLineItem(null);
        lineItemForm.resetFields();
        lineItemForm.setFieldsValue({ quantity: 1, unitPrice: 0, discount: 0, taxRate: 0 });
        setIsLineItemOpen(true);
    };

    const openEditLineItem = (li: IProposalLineItemDto) => {
        setEditingLineItem(li);
        lineItemForm.setFieldsValue({
            productServiceName: li.productServiceName,
            description: li.description,
            quantity: li.quantity,
            unitPrice: li.unitPrice,
            discount: li.discount,
            taxRate: li.taxRate,
        });
        setIsLineItemOpen(true);
    };

    const handleSaveLineItem = async (values: ICreateProposalLineItemDto) => {
        if (!currentProposal) return;
        if (editingLineItem) {
            await updateLineItem(currentProposal.id, editingLineItem.id, values);
        } else {
            await addLineItem(currentProposal.id, values);
        }
        setIsLineItemOpen(false);
        lineItemForm.resetFields();
        await getProposal(currentProposal.id);
        refresh();
        message.success(editingLineItem ? 'Line item updated' : 'Line item added');
    };

    const handleDeleteLineItem = async (lineItemId: string) => {
        if (!currentProposal) return;
        await deleteLineItem(currentProposal.id, lineItemId);
        await getProposal(currentProposal.id);
        refresh();
        message.success('Line item removed');
    };

    /* ── display data ── */
    const rawItems = pagedResult?.items;
    const allList: IProposalDto[] = Array.isArray(rawItems) ? rawItems : [];
    const displayData = allList.filter(p =>
        (p.title ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.clientName ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.proposalNumber ?? '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const oppOptions = (oppsResult?.items ?? []).map(o => ({ value: o.id, label: o.title }));

    /* ── draft item helpers ── */
    const updateDraftItem = (idx: number, field: keyof ICreateProposalLineItemDto, val: unknown) => {
        setDraftItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: val } : item));
    };
    const removeDraftItem = (idx: number) => {
        setDraftItems(prev => prev.filter((_, i) => i !== idx));
    };
    const draftTotal = draftItems.reduce((sum, item) => {
        const base = (item.quantity ?? 0) * (item.unitPrice ?? 0);
        const afterDiscount = base * (1 - (item.discount ?? 0) / 100);
        return sum + afterDiscount * (1 + (item.taxRate ?? 0) / 100);
    }, 0);

    /* ── columns ── */
    const columns: TableProps<IProposalDto>['columns'] = [
        {
            title: 'Ref #',
            dataIndex: 'proposalNumber',
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
            title: 'Opportunity',
            dataIndex: 'opportunityTitle',
            render: val => <span className={styles.bodyText}>{val || '—'}</span>,
        },
        {
            title: 'Total',
            dataIndex: 'totalAmount',
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
            title: 'Valid Until',
            dataIndex: 'validUntil',
            render: val => <span className={styles.bodyText}>{val ? new Date(val).toLocaleDateString() : '—'}</span>,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="small">
                    <Button size="small" type="text" icon={<EyeOutlined />}
                        className={styles.btnView}
                        onClick={() => openDetail(record)} />
                    {record.status === 1 && (
                        <>
                            <Button size="small" type="text" icon={<EditOutlined />}
                                className={styles.btnWarn}
                                onClick={() => openEdit(record)} />
                            <Popconfirm title="Submit this proposal for approval?" onConfirm={() => handleSubmit(record.id)} okText="Submit" cancelText="No">
                                <Button size="small" type="text" icon={<SendOutlined />} className={styles.btnSuccess} />
                            </Popconfirm>
                        </>
                    )}
                    {record.status === 2 && (
                        <>
                            <Popconfirm title="Approve this proposal?" onConfirm={() => handleApprove(record.id)} okText="Approve" cancelText="No">
                                <Button size="small" type="text" icon={<CheckOutlined />} className={styles.btnSuccess} />
                            </Popconfirm>
                            <Popconfirm title="Reject this proposal?" onConfirm={() => handleReject(record.id)} okText="Reject" cancelText="No">
                                <Button size="small" type="text" icon={<CloseOutlined />} className={styles.btnDelete} />
                            </Popconfirm>
                        </>
                    )}
                    {(record.status === 1 || record.status === 3) && (
                        <Popconfirm title="Delete this proposal?" onConfirm={() => handleDelete(record.id)} okText="Yes" cancelText="No">
                            <Button size="small" type="text" icon={<DeleteOutlined />} className={styles.btnDelete} />
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    /* ── line item columns (inside detail modal) ── */
    const lineItemColumns: TableProps<IProposalLineItemDto>['columns'] = [
        { title: 'Product / Service', dataIndex: 'productServiceName', render: val => <span className={styles.bodyText}>{val}</span> },
        { title: 'Qty', dataIndex: 'quantity', width: 60 },
        { title: 'Unit Price', dataIndex: 'unitPrice', render: val => formatCurrency(val) },
        { title: 'Discount %', dataIndex: 'discount', width: 100 },
        { title: 'Tax %', dataIndex: 'taxRate', width: 80 },
        {
            title: 'Total',
            dataIndex: 'totalPrice',
            render: val => <span className={styles.primaryText}>{formatCurrency(val)}</span>,
        },
        {
            title: '',
            key: 'li-actions',
            width: 80,
            render: (_, li) => (
                <Space>
                    <Button size="small" type="text" icon={<EditOutlined />} className={styles.btnWarn}
                        onClick={() => openEditLineItem(li)} />
                    <Popconfirm title="Remove this line item?" onConfirm={() => handleDeleteLineItem(li.id)} okText="Yes" cancelText="No">
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
                    <Title level={2} className={styles.pageTitle}>Proposals</Title>
                    <Text className={styles.pageSubtitle}>Create and manage client proposals</Text>
                </div>
                <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => setIsCreateOpen(true)}>
                    New Proposal
                </Button>
            </div>

            {/* Toolbar */}
            <div className={styles.toolbar}>
                <div className={styles.toolbarRow} style={{ justifyContent: 'space-between' }}>
                    <Space wrap>
                        <Select
                            placeholder="Filter by status"
                            allowClear
                            style={{ width: 180 }}
                            options={STATUSES.map(s => ({ value: s.value, label: s.label }))}
                            value={statusFilter}
                            onChange={val => {
                                setStatusFilter(val);
                                getProposals({ pageSize: 100, status: val });
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
                />
            </div>

            {/* ── Create Modal ── */}
            <Modal
                title={<span className={styles.pageTitle}>New Proposal</span>}
                open={isCreateOpen}
                onCancel={() => { setIsCreateOpen(false); createForm.resetFields(); setDraftItems([emptyItem()]); }}
                onOk={() => createForm.submit()}
                okText="Create"
                width={780}
                styles={{ body: { background: 'transparent' }, header: { background: 'transparent' } }}
            >
                <Form form={createForm} layout="vertical" onFinish={handleCreate}>
                    <Form.Item name="opportunityId" label={<FormLabel text="Opportunity" required />}
                        rules={[{ required: true, message: 'Select an opportunity' }]}>
                        <Select options={oppOptions} placeholder="Select opportunity" showSearch />
                    </Form.Item>
                    <Form.Item name="title" label={<FormLabel text="Proposal Title" required />}
                        rules={[{ required: true, message: 'Enter a title' }]}>
                        <Input placeholder="e.g. Enterprise CRM Solution Proposal" />
                    </Form.Item>
                    <Form.Item name="description" label={<FormLabel text="Description" />}>
                        <TextArea rows={2} placeholder="Overview or executive summary…" />
                    </Form.Item>
                    <div className={styles.formGrid}>
                        <Form.Item name="currency" label={<FormLabel text="Currency" />} initialValue="USD">
                            <Select options={[
                                { value: 'USD', label: 'USD' },
                                { value: 'EUR', label: 'EUR' },
                                { value: 'GBP', label: 'GBP' },
                                { value: 'ZAR', label: 'ZAR' },
                            ]} />
                        </Form.Item>
                        <Form.Item name="validUntil" label={<FormLabel text="Valid Until" />}>
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                    </div>

                    <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', marginTop: 8 }}>
                        <Text className={styles.mutedText}>Line Items</Text>
                    </Divider>

                    {/* Inline line items table */}
                    <div style={{ marginBottom: 8 }}>
                        {draftItems.map((item, idx) => (
                            <div key={item._key} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 80px 80px 36px', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                                <Input placeholder="Product / Service"
                                    value={item.productServiceName}
                                    onChange={e => updateDraftItem(idx, 'productServiceName', e.target.value)} />
                                <InputNumber placeholder="Qty" min={1} style={{ width: '100%' }}
                                    value={item.quantity}
                                    onChange={v => updateDraftItem(idx, 'quantity', v ?? 1)} />
                                <InputNumber placeholder="Unit Price" min={0} style={{ width: '100%' }}
                                    value={item.unitPrice}
                                    onChange={v => updateDraftItem(idx, 'unitPrice', v ?? 0)} />
                                <InputNumber placeholder="Disc %" min={0} max={100} style={{ width: '100%' }}
                                    value={item.discount}
                                    onChange={v => updateDraftItem(idx, 'discount', v ?? 0)} />
                                <InputNumber placeholder="Tax %" min={0} style={{ width: '100%' }}
                                    value={item.taxRate}
                                    onChange={v => updateDraftItem(idx, 'taxRate', v ?? 0)} />
                                <Button type="text" icon={<DeleteOutlined />} className={styles.btnDelete}
                                    onClick={() => removeDraftItem(idx)} disabled={draftItems.length === 1} />
                            </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                            <Button type="dashed" icon={<PlusOutlined />} size="small"
                                onClick={() => setDraftItems(prev => [...prev, emptyItem()])}>
                                Add line item
                            </Button>
                            <Text className={styles.primaryText} style={{ fontWeight: 600 }}>
                                Total: {formatCurrency(draftTotal, createForm.getFieldValue('currency') ?? 'USD')}
                            </Text>
                        </div>
                    </div>
                </Form>
            </Modal>

            {/* ── Edit Modal ── */}
            <Modal
                title={<span className={styles.pageTitle}>Edit Proposal</span>}
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
                        <Form.Item name="currency" label={<FormLabel text="Currency" />}>
                            <Select options={[
                                { value: 'USD', label: 'USD' },
                                { value: 'EUR', label: 'EUR' },
                                { value: 'GBP', label: 'GBP' },
                                { value: 'ZAR', label: 'ZAR' },
                            ]} />
                        </Form.Item>
                        <Form.Item name="validUntil" label={<FormLabel text="Valid Until" />}>
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                    </div>
                </Form>
            </Modal>

            {/* ── Detail Modal ── */}
            <Modal
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 40 }}>
                        <span className={styles.pageTitle}>
                            {currentProposal?.proposalNumber} — {currentProposal?.title}
                        </span>
                        {currentProposal && statusTag(currentProposal.status, currentProposal.statusName)}
                    </div>
                }
                open={isDetailOpen}
                onCancel={() => setIsDetailOpen(false)}
                footer={
                    <Space>
                        {currentProposal?.status === 1 && (
                            <Popconfirm title="Submit for approval?" onConfirm={() => handleSubmit(currentProposal.id)} okText="Submit">
                                <Button type="primary" icon={<SendOutlined />}>Submit</Button>
                            </Popconfirm>
                        )}
                        {currentProposal?.status === 2 && (
                            <>
                                <Popconfirm title="Approve this proposal?" onConfirm={() => handleApprove(currentProposal.id)} okText="Approve">
                                    <Button type="primary" icon={<CheckOutlined />} style={{ background: '#52c41a', borderColor: '#52c41a' }}>Approve</Button>
                                </Popconfirm>
                                <Popconfirm title="Reject this proposal?" onConfirm={() => handleReject(currentProposal.id)} okText="Reject">
                                    <Button danger icon={<CloseOutlined />}>Reject</Button>
                                </Popconfirm>
                            </>
                        )}
                        <Button onClick={() => setIsDetailOpen(false)}>Close</Button>
                    </Space>
                }
                width={820}
                styles={{ body: { background: 'transparent' }, header: { background: 'transparent' }, footer: { background: 'transparent' } }}
            >
                {currentProposal && (
                    <>
                        {/* Summary stats */}
                        <Row gutter={16} style={{ marginBottom: 16 }}>
                            <Col span={8}>
                                <div className={styles.card} style={{ padding: '12px 16px' }}>
                                    <Statistic
                                        title={<span className={styles.mutedText}>Total Amount</span>}
                                        formatter={() => <span style={{ color: '#1890ff', fontSize: 20 }}>{formatCurrency(currentProposal.totalAmount, currentProposal.currency)}</span>}
                                    />
                                </div>
                            </Col>
                            <Col span={8}>
                                <div className={styles.card} style={{ padding: '12px 16px' }}>
                                    <Statistic
                                        title={<span className={styles.mutedText}>Line Items</span>}
                                        formatter={() => <span style={{ color: 'white', fontSize: 20 }}>{currentProposal.lineItems?.length ?? 0}</span>}
                                    />
                                </div>
                            </Col>
                            <Col span={8}>
                                <div className={styles.card} style={{ padding: '12px 16px' }}>
                                    <Statistic
                                        title={<span className={styles.mutedText}>Valid Until</span>}
                                        formatter={() => <span style={{ color: 'white', fontSize: 18 }}>{currentProposal.validUntil ? new Date(currentProposal.validUntil).toLocaleDateString() : '—'}</span>}
                                    />
                                </div>
                            </Col>
                        </Row>

                        {/* Meta */}
                        <div className={styles.detailContainer} style={{ marginBottom: 16 }}>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Client</span>
                                <span className={styles.detailValue}>{currentProposal.clientName || '—'}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Opportunity</span>
                                <span className={styles.detailValue}>{currentProposal.opportunityTitle || '—'}</span>
                            </div>
                            {currentProposal.description && (
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Description</span>
                                    <span className={styles.detailValue}>{currentProposal.description}</span>
                                </div>
                            )}
                            <div className={styles.detailRow}>
                                <span className={styles.detailLabel}>Created By</span>
                                <span className={styles.detailValue}>{currentProposal.createdByName || '—'}</span>
                            </div>
                        </div>

                        <Divider style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                            <Text className={styles.mutedText}>Line Items</Text>
                        </Divider>

                        {/* Line items */}
                        {currentProposal.status === 1 && (
                            <Button type="dashed" icon={<PlusOutlined />} size="small"
                                style={{ marginBottom: 12 }}
                                onClick={openAddLineItem}>
                                Add line item
                            </Button>
                        )}
                        <Table
                            columns={lineItemColumns}
                            dataSource={currentProposal.lineItems ?? []}
                            rowKey="id"
                            size="small"
                            pagination={false}
                            scroll={{ x: 'max-content' }}
                            style={{ background: 'transparent' }}
                        />
                    </>
                )}
            </Modal>

            {/* ── Line Item Modal ── */}
            <Modal
                title={<span className={styles.pageTitle}>{editingLineItem ? 'Edit Line Item' : 'Add Line Item'}</span>}
                open={isLineItemOpen}
                onCancel={() => { setIsLineItemOpen(false); lineItemForm.resetFields(); }}
                onOk={() => lineItemForm.submit()}
                okText="Save"
                width={520}
                styles={{ body: { background: 'transparent' }, header: { background: 'transparent' } }}
            >
                <Form form={lineItemForm} layout="vertical" onFinish={handleSaveLineItem}>
                    <Form.Item name="productServiceName" label={<FormLabel text="Product / Service" required />}
                        rules={[{ required: true, message: 'Enter a name' }]}>
                        <Input placeholder="e.g. CRM Enterprise License" />
                    </Form.Item>
                    <Form.Item name="description" label={<FormLabel text="Description" />}>
                        <TextArea rows={2} />
                    </Form.Item>
                    <div className={styles.formGrid}>
                        <Form.Item name="quantity" label={<FormLabel text="Quantity" required />}
                            rules={[{ required: true }]}>
                            <InputNumber min={1} style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item name="unitPrice" label={<FormLabel text="Unit Price" required />}
                            rules={[{ required: true }]}>
                            <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item name="discount" label={<FormLabel text="Discount %" />} initialValue={0}>
                            <InputNumber min={0} max={100} style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item name="taxRate" label={<FormLabel text="Tax %" />} initialValue={0}>
                            <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default ProposalsPage;
