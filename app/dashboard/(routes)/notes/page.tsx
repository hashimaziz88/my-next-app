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
import { useStyles } from '@/app/dashboard/(routes)/_styles/style';
import FormLabel from '@/app/dashboard/(routes)/_components/FormLabel';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

/* ─── enum maps ───────────────────────────────────────────────────────── */
const RELATED_TYPES = [
    { value: 1, label: 'Client' },
    { value: 2, label: 'Opportunity' },
    { value: 3, label: 'Proposal' },
    { value: 4, label: 'Contract' },
];


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
    const { styles } = useStyles();

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
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.pageHeader}>
                <div>
                    <Title level={2} className={styles.pageTitle}>Notes</Title>
                    <Text className={styles.pageSubtitle}>Freeform notes attached to any entity</Text>
                </div>
                <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => setIsCreateOpen(true)}>
                    Add Note
                </Button>
            </div>

            {/* Filters */}
            <div className={styles.toolbar}>
                <div className={styles.toolbarRow}>
                    <Input
                        prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
                        placeholder="Search notes…"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                        style={{ width: 280 }}
                        allowClear
                    />
                    <Select
                        options={[{ value: undefined, label: 'All Entity Types' }, ...RELATED_TYPES]}
                        value={filterRelatedType}
                        onChange={v => setFilterRelatedType(v)}
                        style={{ width: 200 }}
                        placeholder="Filter by entity type"
                    />
                    <Text className={styles.mutedText} style={{ marginLeft: 'auto' }}>
                        {notes.length} {notes.length === 1 ? 'note' : 'notes'}
                    </Text>
                </div>
            </div>

            {/* Notes list */}
            {isPending && (
                <div className={styles.spinCenter}>
                    <Spin size="large" />
                </div>
            )}
            {!isPending && notes.length === 0 && (
                <Empty
                    description={<span className={styles.mutedText}>No notes yet. Add the first one.</span>}
                    style={{ padding: 60 }}
                />
            )}
            {!isPending && notes.length > 0 && (
                <>
                    {notes.map(note => (
                        <Card key={note.id} className={styles.noteCard} styles={{ body: { padding: '16px 20px' } }}>
                            <div className={styles.noteActions}>
                                <div className={styles.noteBody}>
                                    {/* metadata row */}
                                    <div className={styles.noteMetaRow}>
                                        {!!note.relatedToType && (
                                            <Tag color="geekblue">
                                                {note.relatedToTypeName}
                                            </Tag>
                                        )}
                                        {note.isPrivate
                                            ? <Tag icon={<LockOutlined />} color="orange">Private</Tag>
                                            : <Tag icon={<GlobalOutlined />} color="default">Shared</Tag>
                                        }
                                        <span className={styles.mutedTextSmall}>
                                            by {note.createdByName} · {formatDate(note.createdAt)}
                                        </span>
                                    </div>
                                    {/* content */}
                                    <Paragraph
                                        className={styles.bodyText}
                                        style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}
                                        ellipsis={{ rows: 4, expandable: true, symbol: 'read more' }}
                                    >
                                        {note.content}
                                    </Paragraph>
                                </div>
                                <Space>
                                    <Button
                                        size="small" type="text" icon={<EditOutlined />}
                                        className={styles.btnWarn}
                                        onClick={() => openEdit(note)}
                                    />
                                    <Popconfirm
                                        title="Delete this note?"
                                        onConfirm={() => handleDelete(note.id)}
                                        okText="Yes" cancelText="No"
                                    >
                                        <Button size="small" type="text" icon={<DeleteOutlined />} className={styles.btnDelete} />
                                    </Popconfirm>
                                </Space>
                            </div>
                        </Card>
                    ))}
                </>
            )}

            {/* ── Create Modal ── */}
            <Modal
                title={<span className={styles.pageTitle}>Add Note</span>}
                open={isCreateOpen}
                onCancel={() => { setIsCreateOpen(false); createForm.resetFields(); setRelatedType(undefined); }}
                onOk={() => createForm.submit()}
                okText="Save Note"
                width={560}
                styles={{ body: { background: 'transparent' }, header: { background: 'transparent' } }}
            >
                <Form form={createForm} layout="vertical" onFinish={handleCreate}>
                    <Form.Item name="content" label={<FormLabel text="Note Content" />}
                        rules={[{ required: true, message: 'Write something' }]}>
                        <TextArea rows={5} placeholder="Write your note here…" />
                    </Form.Item>
                    <div className={styles.formGrid}>
                        <Form.Item name="relatedToType" label={<FormLabel text="Entity Type" />}
                            rules={[{ required: true, message: 'Select entity type' }]}>
                            <Select
                                options={RELATED_TYPES}
                                placeholder="Select type"
                                onChange={v => { setRelatedType(v); createForm.setFieldValue('relatedToId', undefined); }}
                            />
                        </Form.Item>
                        <Form.Item name="relatedToId" label={<FormLabel text="Linked Record" />}
                            rules={[{ required: true, message: 'Select a record' }]}>
                            <Select
                                options={relatedOptions}
                                placeholder="Select record"
                                disabled={!relatedType}
                                showSearch
                            />
                        </Form.Item>
                    </div>
                    <Form.Item name="isPrivate" label={<FormLabel text="Private" />} valuePropName="checked">
                        <Switch checkedChildren={<LockOutlined />} unCheckedChildren={<GlobalOutlined />} />
                    </Form.Item>
                </Form>
            </Modal>

            {/* ── Edit Modal ── */}
            <Modal
                title={<span className={styles.pageTitle}>Edit Note</span>}
                open={isEditOpen}
                onCancel={() => setIsEditOpen(false)}
                onOk={() => editForm.submit()}
                okText="Update"
                width={480}
                styles={{ body: { background: 'transparent' }, header: { background: 'transparent' } }}
            >
                <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
                    <Form.Item name="content" label={<FormLabel text="Content" />}
                        rules={[{ required: true }]}>
                        <TextArea rows={5} />
                    </Form.Item>
                    <Form.Item name="isPrivate" label={<FormLabel text="Private" />} valuePropName="checked">
                        <Switch checkedChildren={<LockOutlined />} unCheckedChildren={<GlobalOutlined />} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default NotesPage;
