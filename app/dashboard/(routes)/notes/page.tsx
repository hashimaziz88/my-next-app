"use client";
import React, { useEffect, useState } from 'react';
import {
    Button, Card, Space, Modal, Form, Input, Select, message,
    Popconfirm, Typography, Tag, Empty, Spin, Switch,
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, LockOutlined,
    GlobalOutlined, SearchOutlined,
} from '@ant-design/icons';
import { useNoteActions, useNoteState } from '@/providers/noteProvider';
import { INoteDto, ICreateNoteDto, IUpdateNoteDto } from '@/providers/noteProvider/context';
import { useOpportunityActions, useOpportunityState } from '@/providers/opportunityProvider';
import { useClientActions, useClientState } from '@/providers/clientProvider';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

/* ─── enum maps ───────────────────────────────────────────────────────── */
const RELATED_TYPES = [
    { value: 1, label: 'Client' },
    { value: 2, label: 'Opportunity' },
    { value: 3, label: 'Proposal' },
    { value: 4, label: 'Contract' },
];

/* ─── styles ──────────────────────────────────────────────────────────── */
const pageStyle: React.CSSProperties = { padding: 24, minHeight: '100vh', background: 'transparent' };
const noteCardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    marginBottom: 12,
};
const headerCardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    marginBottom: 16,
    padding: '12px 16px',
};

/* ─── component ───────────────────────────────────────────────────────── */
const NotesPage: React.FC = () => {
    const { getNotes, createNote, updateNote, deleteNote } = useNoteActions();
    const { pagedResult, isPending, isError } = useNoteState();

    const { getOpportunities } = useOpportunityActions();
    const { pagedResult: oppsResult } = useOpportunityState();
    const { getClients } = useClientActions();
    const { pagedResult: clientsResult } = useClientState();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterRelatedType, setFilterRelatedType] = useState<number | undefined>(undefined);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedNote, setSelectedNote] = useState<INoteDto | null>(null);
    const [relatedType, setRelatedType] = useState<number | undefined>(undefined);
    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();

    useEffect(() => {
        getNotes({ pageSize: 100 });
        getOpportunities({ pageSize: 100 });
        getClients({ pageSize: 100 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (isError) message.error('An error occurred. Please try again.');
    }, [isError]);

    /* filter notes when relatedType filter changes */
    useEffect(() => {
        getNotes({ relatedToType: filterRelatedType, pageSize: 100 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterRelatedType]);

    const handleCreate = async (values: ICreateNoteDto) => {
        await createNote(values);
        setIsCreateOpen(false);
        createForm.resetFields();
        setRelatedType(undefined);
        getNotes({ pageSize: 100 });
        message.success('Note added');
    };

    const openEdit = (note: INoteDto) => {
        setSelectedNote(note);
        editForm.setFieldsValue({ content: note.content, isPrivate: note.isPrivate });
        setIsEditOpen(true);
    };

    const handleUpdate = async (values: IUpdateNoteDto) => {
        if (!selectedNote) return;
        await updateNote(selectedNote.id, values);
        setIsEditOpen(false);
        getNotes({ pageSize: 100 });
        message.success('Note updated');
    };

    const handleDelete = async (id: string) => {
        await deleteNote(id);
        getNotes({ pageSize: 100 });
        message.success('Note deleted');
    };

    /* related-entity options for create form */
    const relatedOptions = relatedType === 2
        ? (oppsResult?.items ?? []).map(o => ({ value: o.id, label: o.title }))
        : (clientsResult?.items ?? []).map(c => ({ value: c.id, label: c.name }));

    const notes = (pagedResult?.items ?? []).filter(n =>
        n.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (n.relatedToTypeName ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (n.createdByName ?? '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' }) +
            ' · ' + d.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div style={pageStyle}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <Title level={2} style={{ color: 'white', margin: 0 }}>Notes</Title>
                    <Text style={{ color: '#8c8c8c' }}>Freeform notes attached to any entity</Text>
                </div>
                <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => setIsCreateOpen(true)}>
                    Add Note
                </Button>
            </div>

            {/* Filters */}
            <div style={headerCardStyle}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Input
                        prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
                        placeholder="Search notes…"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{
                            width: 280, background: 'rgba(255,255,255,0.06)',
                            borderColor: 'rgba(255,255,255,0.12)', color: 'white',
                        }}
                        allowClear
                    />
                    <Select
                        options={[{ value: undefined, label: 'All Entity Types' }, ...RELATED_TYPES]}
                        value={filterRelatedType}
                        onChange={v => setFilterRelatedType(v)}
                        style={{ width: 200 }}
                        placeholder="Filter by entity type"
                    />
                    <Text style={{ color: '#8c8c8c', marginLeft: 'auto' }}>
                        {notes.length} {notes.length === 1 ? 'note' : 'notes'}
                    </Text>
                </div>
            </div>

            {/* Notes list */}
            {isPending && (
                <div style={{ textAlign: 'center', padding: 80 }}>
                    <Spin size="large" />
                </div>
            )}
            {!isPending && notes.length === 0 && (
                <Empty
                    description={<span style={{ color: '#8c8c8c' }}>No notes yet. Add the first one.</span>}
                    style={{ padding: 60 }}
                />
            )}
            {!isPending && notes.length > 0 && (
                <>
                    {notes.map(note => (
                        <Card key={note.id} style={noteCardStyle} styles={{ body: { padding: '16px 20px' } }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                                <div style={{ flex: 1 }}>
                                    {/* metadata row */}
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                                        {!!note.relatedToType && (
                                            <Tag color="geekblue">
                                                {note.relatedToTypeName}
                                            </Tag>
                                        )}
                                        {note.isPrivate
                                            ? <Tag icon={<LockOutlined />} color="orange">Private</Tag>
                                            : <Tag icon={<GlobalOutlined />} color="default">Shared</Tag>
                                        }
                                        <span style={{ color: '#666', fontSize: 12 }}>
                                            by {note.createdByName} · {formatDate(note.createdAt)}
                                        </span>
                                    </div>
                                    {/* content */}
                                    <Paragraph
                                        style={{ color: '#d4d4d4', marginBottom: 0, whiteSpace: 'pre-wrap' }}
                                        ellipsis={{ rows: 4, expandable: true, symbol: 'read more' }}
                                    >
                                        {note.content}
                                    </Paragraph>
                                </div>
                                <Space>
                                    <Button
                                        size="small" type="text" icon={<EditOutlined />}
                                        style={{ color: '#faad14' }}
                                        onClick={() => openEdit(note)}
                                    />
                                    <Popconfirm
                                        title="Delete this note?"
                                        onConfirm={() => handleDelete(note.id)}
                                        okText="Yes" cancelText="No"
                                    >
                                        <Button size="small" type="text" icon={<DeleteOutlined />} style={{ color: '#ff4d4f' }} />
                                    </Popconfirm>
                                </Space>
                            </div>
                        </Card>
                    ))}
                </>
            )}

            {/* ── Create Modal ── */}
            <Modal
                title={<span style={{ color: 'white' }}>Add Note</span>}
                open={isCreateOpen}
                onCancel={() => { setIsCreateOpen(false); createForm.resetFields(); setRelatedType(undefined); }}
                onOk={() => createForm.submit()}
                okText="Save Note"
                width={560}
                styles={{ body: { background: 'transparent' }, header: { background: 'transparent' } }}
            >
                <Form form={createForm} layout="vertical" onFinish={handleCreate}>
                    <Form.Item name="content" label={<span style={{ color: '#d4d4d4' }}>Note Content</span>}
                        rules={[{ required: true, message: 'Write something' }]}>
                        <TextArea rows={5} placeholder="Write your note here…" />
                    </Form.Item>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <Form.Item name="relatedToType" label={<span style={{ color: '#d4d4d4' }}>Entity Type</span>}
                            rules={[{ required: true, message: 'Select entity type' }]}>
                            <Select
                                options={RELATED_TYPES}
                                placeholder="Select type"
                                onChange={v => { setRelatedType(v); createForm.setFieldValue('relatedToId', undefined); }}
                            />
                        </Form.Item>
                        <Form.Item name="relatedToId" label={<span style={{ color: '#d4d4d4' }}>Linked Record</span>}
                            rules={[{ required: true, message: 'Select a record' }]}>
                            <Select
                                options={relatedOptions}
                                placeholder="Select record"
                                disabled={!relatedType}
                                showSearch
                            />
                        </Form.Item>
                    </div>
                    <Form.Item name="isPrivate" label={<span style={{ color: '#d4d4d4' }}>Private</span>} valuePropName="checked">
                        <Switch checkedChildren={<LockOutlined />} unCheckedChildren={<GlobalOutlined />} />
                    </Form.Item>
                </Form>
            </Modal>

            {/* ── Edit Modal ── */}
            <Modal
                title={<span style={{ color: 'white' }}>Edit Note</span>}
                open={isEditOpen}
                onCancel={() => setIsEditOpen(false)}
                onOk={() => editForm.submit()}
                okText="Update"
                width={480}
                styles={{ body: { background: 'transparent' }, header: { background: 'transparent' } }}
            >
                <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
                    <Form.Item name="content" label={<span style={{ color: '#d4d4d4' }}>Content</span>}
                        rules={[{ required: true }]}>
                        <TextArea rows={5} />
                    </Form.Item>
                    <Form.Item name="isPrivate" label={<span style={{ color: '#d4d4d4' }}>Private</span>} valuePropName="checked">
                        <Switch checkedChildren={<LockOutlined />} unCheckedChildren={<GlobalOutlined />} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default NotesPage;
