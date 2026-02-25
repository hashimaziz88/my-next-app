"use client";
import React, { useEffect, useState } from 'react';
import {
    Button, Card, Tag, Typography, Descriptions, Space, Modal,
    Form, Input, Select, InputNumber, message, Timeline, Divider, Row, Col, Statistic
} from 'antd';
import { ArrowLeftOutlined, EditOutlined, SwapOutlined } from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import { useOpportunityActions, useOpportunityState } from '@/providers/opportunityProvider';
import { IUpdateOpportunityDto, IUpdateStageDto } from '@/providers/opportunityProvider/context';

const { Title, Text } = Typography;

const STAGES = [
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

const OpportunityDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { getOpportunity, updateOpportunity, getStageHistory, updateStage } = useOpportunityActions();
    const { currentOpportunity, stageHistory, isPending } = useOpportunityState();
    const router = useRouter();

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isStageOpen, setIsStageOpen] = useState(false);
    const [selectedStage, setSelectedStage] = useState<number | undefined>(undefined);
    const [editForm] = Form.useForm();
    const [stageForm] = Form.useForm();

    useEffect(() => {
        if (id) {
            getOpportunity(id);
            getStageHistory(id);
        }
    }, [id]);

    const openEdit = () => {
        editForm.setFieldsValue({
            ...currentOpportunity,
            expectedCloseDate: currentOpportunity?.expectedCloseDate?.split('T')[0],
        });
        setIsEditOpen(true);
    };

    const handleUpdate = async (values: IUpdateOpportunityDto) => {
        await updateOpportunity(id, values);
        setIsEditOpen(false);
        getOpportunity(id);
        message.success('Opportunity updated successfully');
    };

    const handleStageUpdate = async (values: IUpdateStageDto) => {
        await updateStage(id, values);
        setIsStageOpen(false);
        stageForm.resetFields();
        setSelectedStage(undefined);
        getOpportunity(id);
        getStageHistory(id);
        message.success('Stage updated successfully');
    };

    if (isPending && !currentOpportunity) {
        return <div style={{ color: 'white' }}>Loading...</div>;
    }

    if (!currentOpportunity) {
        return <div style={{ color: '#8c8c8c' }}>Opportunity not found.</div>;
    }

    const stage = STAGES.find(s => s.value === currentOpportunity.stage);
    const statCardStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <Button icon={<ArrowLeftOutlined />} type="text" style={{ color: '#8c8c8c' }} onClick={() => router.back()}>
                    Back
                </Button>
                <Space>
                    <Button icon={<SwapOutlined />} onClick={() => setIsStageOpen(true)}>Change Stage</Button>
                    <Button icon={<EditOutlined />} onClick={openEdit}>Edit</Button>
                </Space>
            </div>

            <div style={{ marginBottom: 24 }}>
                <Title level={2} style={{ color: 'white', margin: 0 }}>{currentOpportunity.title}</Title>
                <Space style={{ marginTop: 8 }}>
                    <Tag color={stage?.color}>{currentOpportunity.stageName || stage?.label}</Tag>
                    <Tag color="blue">{currentOpportunity.clientName}</Tag>
                    <Tag color={currentOpportunity.isActive ? 'green' : 'red'}>
                        {currentOpportunity.isActive ? 'Active' : 'Closed'}
                    </Tag>
                </Space>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={12} sm={6}>
                    <Card style={statCardStyle}>
                        <Statistic
                            title={<span style={{ color: '#8c8c8c' }}>Estimated Value</span>}
                            value={currentOpportunity.estimatedValue ?? 0}
                            prefix={currentOpportunity.currency}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card style={statCardStyle}>
                        <Statistic
                            title={<span style={{ color: '#8c8c8c' }}>Probability</span>}
                            value={currentOpportunity.probability ?? 0}
                            suffix="%"
                            valueStyle={{ color: 'white' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card style={statCardStyle}>
                        <Statistic
                            title={<span style={{ color: '#8c8c8c' }}>Expected Close</span>}
                            value={currentOpportunity.expectedCloseDate ? new Date(currentOpportunity.expectedCloseDate).toLocaleDateString() : '—'}
                            valueStyle={{ color: 'white', fontSize: 16 }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card style={statCardStyle}>
                        <Statistic
                            title={<span style={{ color: '#8c8c8c' }}>Source</span>}
                            value={currentOpportunity.sourceName || '—'}
                            valueStyle={{ color: 'white', fontSize: 16 }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={14}>
                    <Card style={statCardStyle}>
                        <Descriptions
                            title={<span style={{ color: 'white' }}>Opportunity Details</span>}
                            column={1}
                            labelStyle={{ color: '#8c8c8c' }}
                            contentStyle={{ color: 'white' }}
                        >
                            <Descriptions.Item label="Client">
                                <Button type="link" style={{ padding: 0, color: '#1890ff' }}
                                    onClick={() => router.push(`/dashboard/clients/${currentOpportunity.clientId}`)}>
                                    {currentOpportunity.clientName}
                                </Button>
                            </Descriptions.Item>
                            {currentOpportunity.contactName && (
                                <Descriptions.Item label="Contact">{currentOpportunity.contactName}</Descriptions.Item>
                            )}
                            {currentOpportunity.ownerName && (
                                <Descriptions.Item label="Owner">{currentOpportunity.ownerName}</Descriptions.Item>
                            )}
                            {currentOpportunity.description && (
                                <Descriptions.Item label="Description">{currentOpportunity.description}</Descriptions.Item>
                            )}
                            {currentOpportunity.lossReason && (
                                <Descriptions.Item label="Loss Reason">
                                    <Text style={{ color: '#ff4d4f' }}>{currentOpportunity.lossReason}</Text>
                                </Descriptions.Item>
                            )}
                            <Descriptions.Item label="Created At">
                                {currentOpportunity.createdAt ? new Date(currentOpportunity.createdAt).toLocaleDateString() : '—'}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>

                <Col xs={24} lg={10}>
                    <Card
                        title={<span style={{ color: 'white' }}>Stage History</span>}
                        style={statCardStyle}
                    >
                        {stageHistory && stageHistory.length > 0 ? (
                            <Timeline
                                items={stageHistory.map(h => ({
                                    color: STAGES.find(s => s.value === h.toStage)?.color ?? 'blue',
                                    children: (
                                        <div>
                                            <div style={{ color: 'white', fontSize: 13 }}>
                                                <Tag style={{ fontSize: 11 }}>{h.fromStageName}</Tag>
                                                {' → '}
                                                <Tag color={STAGES.find(s => s.value === h.toStage)?.color} style={{ fontSize: 11 }}>
                                                    {h.toStageName}
                                                </Tag>
                                            </div>
                                            <div style={{ color: '#8c8c8c', fontSize: 12, marginTop: 2 }}>
                                                {h.changedByName} · {new Date(h.changedAt).toLocaleDateString()}
                                            </div>
                                            {h.notes && <div style={{ color: '#8c8c8c', fontSize: 12 }}>{h.notes}</div>}
                                        </div>
                                    ),
                                }))}
                            />
                        ) : (
                            <Text style={{ color: '#8c8c8c' }}>No stage history yet.</Text>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Edit Modal */}
            <Modal title="Edit Opportunity" open={isEditOpen} onCancel={() => setIsEditOpen(false)} footer={null} width={540}>
                <Form form={editForm} layout="vertical" onFinish={handleUpdate} style={{ marginTop: 16 }}>
                    <Form.Item name="title" label="Title" rules={[{ required: true }]}><Input /></Form.Item>
                    <Space style={{ width: '100%', display: 'flex', gap: 16 }}>
                        <Form.Item name="estimatedValue" label="Estimated Value" style={{ flex: 1 }}>
                            <InputNumber style={{ width: '100%' }} min={0} />
                        </Form.Item>
                        <Form.Item name="currency" label="Currency" style={{ flex: 1 }}>
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
                    <Form.Item name="expectedCloseDate" label="Expected Close Date">
                        <Input type="date" />
                    </Form.Item>
                    <Form.Item name="description" label="Description">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setIsEditOpen(false)}>Cancel</Button>
                            <Button type="primary" htmlType="submit" loading={isPending}>Save Changes</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Stage Update Modal */}
            <Modal title="Change Stage" open={isStageOpen} onCancel={() => { setIsStageOpen(false); stageForm.resetFields(); setSelectedStage(undefined); }} footer={null} width={440}>
                <Form form={stageForm} layout="vertical" onFinish={handleStageUpdate} style={{ marginTop: 16 }}>
                    <Form.Item name="newStage" label="New Stage" rules={[{ required: true, message: 'Select a stage' }]}>
                        <Select
                            options={STAGES.map(s => ({ value: s.value, label: <Tag color={s.color}>{s.label}</Tag> }))}
                            onChange={val => setSelectedStage(val)}
                        />
                    </Form.Item>
                    <Form.Item name="notes" label="Notes">
                        <Input.TextArea rows={2} placeholder="Optional notes about this stage change" />
                    </Form.Item>
                    {selectedStage === 5 && (
                        <Form.Item name="lossReason" label="Loss Reason" rules={[{ required: true, message: 'Required for Lost stage' }]}>
                            <Input.TextArea rows={2} placeholder="Why was this opportunity lost?" />
                        </Form.Item>
                    )}
                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => { setIsStageOpen(false); stageForm.resetFields(); setSelectedStage(undefined); }}>Cancel</Button>
                            <Button type="primary" htmlType="submit" loading={isPending}>Update Stage</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default OpportunityDetailPage;
