"use client";
import React, { useEffect, useState } from 'react';
import { Button, Table, Space, Modal, Form, Input, Select, InputNumber, message, Popconfirm, Typography, Tag, Card, Segmented } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined, AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useOpportunityActions, useOpportunityState } from '@/providers/opportunityProvider';
import { IOpportunityDto, ICreateOpportunityDto } from '@/providers/opportunityProvider/context';
import { useClientActions, useClientState } from '@/providers/clientProvider';
import { useRouter } from 'next/navigation';
import type { TableProps } from 'antd';

const { Title, Text } = Typography;

const STAGES: { value: number; label: string; color: string }[] = [
    { value: 0, label: 'Lead', color: '#1890ff' },
    { value: 1, label: 'Qualified', color: '#13c2c2' },
    { value: 2, label: 'Proposal', color: '#faad14' },
    { value: 3, label: 'Negotiation', color: '#fa8c16' },
    { value: 4, label: 'Won', color: '#52c41a' },
    { value: 5, label: 'Lost', color: '#ff4d4f' },
];

const SOURCES = [
    { value: 0, label: 'Website' },
    { value: 1, label: 'Referral' },
    { value: 2, label: 'Cold Call' },
    { value: 3, label: 'Email' },
    { value: 4, label: 'Social Media' },
    { value: 5, label: 'Event' },
    { value: 6, label: 'Other' },
];

const OpportunitiesPage: React.FC = () => {
    const { getOpportunities, createOpportunity, deleteOpportunity } = useOpportunityActions();
    const { pagedResult, isPending, isError } = useOpportunityState();
    const { getClients } = useClientActions();
    const { pagedResult: clientsResult } = useClientState();
    const router = useRouter();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'table' | 'kanban'>('kanban');
    const [form] = Form.useForm();

    useEffect(() => {
        getOpportunities({ pageSize: 100 });
        getClients({ pageSize: 100 });
    }, []);

    useEffect(() => {
        if (isError) message.error('An error occurred. Please try again.');
    }, [isError]);

    const handleDelete = async (id: string) => {
        await deleteOpportunity(id);
        getOpportunities({ pageSize: 100 });
    };

    const handleSubmit = async (values: ICreateOpportunityDto) => {
        await createOpportunity(values);
        setIsModalOpen(false);
        form.resetFields();
        getOpportunities({ pageSize: 100 });
        message.success('Opportunity created successfully');
    };

    const clientOptions = (clientsResult?.items ?? []).map(c => ({ value: c.id, label: c.name }));
    const allOpps = (pagedResult?.items ?? []);

    const filtered = allOpps.filter(o =>
        o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.clientName ?? '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stageTag = (stage: number, stageName: string) => {
        const s = STAGES.find(s => s.value === stage);
        return <Tag color={s?.color ?? 'default'}>{stageName || s?.label}</Tag>;
    };

    const columns: TableProps<IOpportunityDto>['columns'] = [
        {
            title: 'Title',
            dataIndex: 'title',
            render: text => <span style={{ color: 'white', fontWeight: 500 }}>{text}</span>,
        },
        {
            title: 'Client',
            dataIndex: 'clientName',
            render: text => <Tag color="blue">{text}</Tag>,
        },
        {
            title: 'Stage',
            dataIndex: 'stage',
            render: (stage, record) => stageTag(stage, record.stageName),
        },
        {
            title: 'Value',
            dataIndex: 'estimatedValue',
            render: (val, record) => (
                <span style={{ color: '#52c41a', fontWeight: 500 }}>
                    {record.currency} {(val ?? 0).toLocaleString()}
                </span>
            ),
        },
        {
            title: 'Probability',
            dataIndex: 'probability',
            render: val => <span style={{ color: '#8c8c8c' }}>{val ?? 0}%</span>,
        },
        {
            title: 'Close Date',
            dataIndex: 'expectedCloseDate',
            render: date => <span style={{ color: '#8c8c8c' }}>{date ? new Date(date).toLocaleDateString() : '—'}</span>,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space onClick={e => e.stopPropagation()}>
                    <Button size="small" type="text" icon={<EyeOutlined />} style={{ color: '#1890ff' }}
                        onClick={() => router.push(`/dashboard/opportunities/${record.id}`)} />
                    <Popconfirm title="Delete this opportunity?" onConfirm={() => handleDelete(record.id)} okText="Yes" cancelText="No">
                        <Button size="small" type="text" icon={<DeleteOutlined />} style={{ color: '#ff4d4f' }} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const KanbanView = () => (
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 16, minHeight: 400 }}>
            {STAGES.map(stage => {
                const stageOpps = filtered.filter(o => o.stage === stage.value);
                const total = stageOpps.reduce((sum, o) => sum + (o.estimatedValue ?? 0), 0);
                return (
                    <div key={stage.value} style={{ minWidth: 240, flex: '0 0 240px' }}>
                        <div style={{
                            borderTop: `3px solid ${stage.color}`,
                            background: 'rgba(255,255,255,0.04)',
                            borderRadius: '8px 8px 0 0',
                            padding: '10px 14px',
                            marginBottom: 8,
                        }}>
                            <span style={{ color: stage.color, fontWeight: 600 }}>{stage.label}</span>
                            <span style={{ color: '#8c8c8c', marginLeft: 8, fontSize: 12 }}>({stageOpps.length})</span>
                            {total > 0 && (
                                <div style={{ color: '#52c41a', fontSize: 11, marginTop: 2 }}>
                                    R {total.toLocaleString()}
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {stageOpps.map(opp => (
                                <Card
                                    key={opp.id}
                                    size="small"
                                    onClick={() => router.push(`/dashboard/opportunities/${opp.id}`)}
                                    style={{
                                        background: 'rgba(255,255,255,0.06)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        cursor: 'pointer',
                                    }}
                                    styles={{ body: { padding: '10px 12px' } }}
                                >
                                    <div style={{ color: 'white', fontWeight: 500, fontSize: 13, marginBottom: 4 }}>{opp.title}</div>
                                    <div style={{ color: '#8c8c8c', fontSize: 12, marginBottom: 4 }}>{opp.clientName}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: '#52c41a', fontSize: 12, fontWeight: 500 }}>
                                            {opp.currency} {(opp.estimatedValue ?? 0).toLocaleString()}
                                        </span>
                                        <span style={{ color: '#8c8c8c', fontSize: 11 }}>{opp.probability ?? 0}%</span>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ color: 'white', margin: 0 }}>Opportunities</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setIsModalOpen(true); }}>
                    New Opportunity
                </Button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Input
                    placeholder="Search by title or client..."
                    prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ maxWidth: 300, background: 'rgba(255,255,255,0.05)', borderColor: '#4e545f', color: 'white' }}
                />
                <Segmented
                    value={viewMode}
                    onChange={val => setViewMode(val as 'table' | 'kanban')}
                    options={[
                        { value: 'kanban', icon: <AppstoreOutlined /> },
                        { value: 'table', icon: <UnorderedListOutlined /> },
                    ]}
                />
            </div>

            {viewMode === 'kanban' ? (
                <KanbanView />
            ) : (
                <Table
                    dataSource={filtered}
                    columns={columns}
                    loading={isPending}
                    rowKey="id"
                    onRow={record => ({ onClick: () => router.push(`/dashboard/opportunities/${record.id}`), style: { cursor: 'pointer' } })}
                    pagination={{ pageSize: 10 }}
                />
            )}

            <Modal
                title="New Opportunity"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={560}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
                    <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Required' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="clientId" label="Client" rules={[{ required: true, message: 'Required' }]}>
                        <Select options={clientOptions} showSearch optionFilterProp="label" />
                    </Form.Item>
                    <Space style={{ width: '100%', display: 'flex', gap: 16 }}>
                        <Form.Item name="estimatedValue" label="Estimated Value" rules={[{ required: true, message: 'Required' }]} style={{ flex: 1 }}>
                            <InputNumber style={{ width: '100%' }} min={0} />
                        </Form.Item>
                        <Form.Item name="currency" label="Currency" initialValue="ZAR" style={{ flex: 1 }}>
                            <Input />
                        </Form.Item>
                    </Space>
                    <Space style={{ width: '100%', display: 'flex', gap: 16 }}>
                        <Form.Item name="probability" label="Probability (%)" style={{ flex: 1 }}>
                            <InputNumber style={{ width: '100%' }} min={0} max={100} />
                        </Form.Item>
                        <Form.Item name="source" label="Source" style={{ flex: 1 }}>
                            <Select options={SOURCES} />
                        </Form.Item>
                    </Space>
                    <Form.Item name="expectedCloseDate" label="Expected Close Date" rules={[{ required: true, message: 'Required' }]}>
                        <Input type="date" />
                    </Form.Item>
                    <Form.Item name="description" label="Description">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button type="primary" htmlType="submit" loading={isPending}>Create</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default OpportunitiesPage;
