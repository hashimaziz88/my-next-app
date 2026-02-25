"use client";
import React, { useEffect, useState } from 'react';
import {
    Button, Table, Space, Modal, Form, Input, Select, Upload,
    message, Popconfirm, Typography, Tag, Progress,
} from 'antd';
import {
    UploadOutlined, DownloadOutlined, DeleteOutlined, EyeOutlined,
    SearchOutlined, FileOutlined, FilePdfOutlined, FileWordOutlined,
    FileExcelOutlined, FileImageOutlined, FileZipOutlined,
} from '@ant-design/icons';
import { useDocumentActions, useDocumentState } from '@/providers/documentProvider';
import { IDocumentDto } from '@/providers/documentProvider/context';
import { useOpportunityActions, useOpportunityState } from '@/providers/opportunityProvider';
import { useClientActions, useClientState } from '@/providers/clientProvider';
import type { TableProps } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import { useStyles } from '@/app/dashboard/(routes)/_styles/style';
import FormLabel from '@/app/dashboard/(routes)/_components/FormLabel';

const { Title, Text } = Typography;

/* ─── enum maps ───────────────────────────────────────────────────────── */
const DOC_CATEGORIES = [
    { value: 1, label: 'Contract', color: 'gold' },
    { value: 2, label: 'Proposal', color: 'blue' },
    { value: 3, label: 'Presentation', color: 'purple' },
    { value: 4, label: 'Quote', color: 'cyan' },
    { value: 5, label: 'Report', color: 'orange' },
];

const RELATED_TYPES = [
    { value: 1, label: 'Client' },
    { value: 2, label: 'Opportunity' },
    { value: 3, label: 'Proposal' },
    { value: 4, label: 'Contract' },
];

/* ─── helpers ─────────────────────────────────────────────────────────── */
const formatBytes = (bytes: number): string => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
};

const fileIcon = (contentType: string | undefined | null, fileName: string) => {
    const ct = contentType ?? '';
    const ext = (fileName ?? '').split('.').pop()?.toLowerCase() ?? '';
    if (ct.includes('pdf') || ext === 'pdf') return <FilePdfOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />;
    if (['doc', 'docx'].includes(ext)) return <FileWordOutlined style={{ color: '#1890ff', fontSize: 18 }} />;
    if (['xls', 'xlsx'].includes(ext)) return <FileExcelOutlined style={{ color: '#52c41a', fontSize: 18 }} />;
    if (ct.startsWith('image') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext))
        return <FileImageOutlined style={{ color: '#faad14', fontSize: 18 }} />;
    if (['zip', 'rar', '7z'].includes(ext)) return <FileZipOutlined style={{ color: '#722ed1', fontSize: 18 }} />;
    return <FileOutlined style={{ color: '#8c8c8c', fontSize: 18 }} />;
};

/* ─── component ───────────────────────────────────────────────────────── */
const DocumentsPage: React.FC = () => {
    const { getDocuments, uploadDocument, downloadDocument, deleteDocument } = useDocumentActions();
    const { pagedResult, downloadBlob, isPending, isError } = useDocumentState();

    const { getOpportunities } = useOpportunityActions();
    const { pagedResult: oppsResult } = useOpportunityState();
    const { getClients } = useClientActions();
    const { pagedResult: clientsResult } = useClientState();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<number | undefined>(undefined);
    const [filterRelatedType, setFilterRelatedType] = useState<number | undefined>(undefined);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<IDocumentDto | null>(null);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [relatedType, setRelatedType] = useState<number | undefined>(undefined);
    const [uploading, setUploading] = useState(false);
    const [uploadForm] = Form.useForm();
    const { styles } = useStyles();

    useEffect(() => {
        getDocuments({ pageSize: 100 });
        getOpportunities({ pageSize: 100 });
        getClients({ pageSize: 100 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (isError) message.error('An error occurred. Please try again.');
    }, [isError]);

    /* trigger browser download when blob lands in state */
    useEffect(() => {
        if (downloadBlob && selectedDoc) {
            const url = URL.createObjectURL(downloadBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = selectedDoc.fileName;
            link.click();
            URL.revokeObjectURL(url);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [downloadBlob]);

    /* filter refresh */
    useEffect(() => {
        getDocuments({ category: filterCategory, relatedToType: filterRelatedType, pageSize: 100 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterCategory, filterRelatedType]);

    const handleUpload = async (values: { category: number; description?: string; relatedToType: number; relatedToId: string }) => {
        if (fileList.length === 0) { message.warning('Please select a file'); return; }
        const file = fileList[0].originFileObj as File;
        const fd = new FormData();
        fd.append('file', file);
        fd.append('category', String(values.category));
        fd.append('relatedToType', String(values.relatedToType));
        fd.append('relatedToId', values.relatedToId);
        if (values.description) fd.append('description', values.description);

        setUploading(true);
        await uploadDocument(fd);
        setUploading(false);
        setIsUploadOpen(false);
        uploadForm.resetFields();
        setFileList([]);
        setRelatedType(undefined);
        getDocuments({ pageSize: 100 });
        message.success('Document uploaded');
    };

    const handleDownload = async (doc: IDocumentDto) => {
        setSelectedDoc(doc);
        await downloadDocument(doc.id);
    };

    const handleDelete = async (id: string) => {
        await deleteDocument(id);
        getDocuments({ pageSize: 100 });
        message.success('Document deleted');
    };

    /* data */
    const relatedOptions = relatedType === 2
        ? (oppsResult?.items ?? []).map(o => ({ value: o.id, label: o.title }))
        : (clientsResult?.items ?? []).map(c => ({ value: c.id, label: c.name }));

    const docs = (pagedResult?.items ?? []).filter(d =>
        d.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.uploadedByName ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.description ?? '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns: TableProps<IDocumentDto>['columns'] = [
        {
            title: 'File',
            dataIndex: 'fileName',
            render: (val, record) => (
                <Space>
                    {fileIcon(record.contentType, val)}
                    <span className={styles.primaryText}>{val}</span>
                </Space>
            ),
        },
        {
            title: 'Category',
            dataIndex: 'category',
            render: (val, record) => {
                const cat = DOC_CATEGORIES.find(c => c.value === val);
                return <Tag color={cat?.color ?? 'default'}>{record.categoryName || cat?.label}</Tag>;
            },
        },
        {
            title: 'Related To',
            dataIndex: 'relatedToTitle',
            render: (val, record) => val
                ? <Tag color="geekblue">{record.relatedToTypeName}: {val}</Tag>
                : <span className={styles.mutedTextSmall}>—</span>,
        },
        {
            title: 'Size',
            dataIndex: 'fileSize',
            render: val => <span className={styles.monospaceText}>{formatBytes(val)}</span>,
        },
        {
            title: 'Uploaded By',
            dataIndex: 'uploadedByName',
            render: val => <span className={styles.bodyText}>{val}</span>,
        },
        {
            title: 'Date',
            dataIndex: 'createdAt',
            render: val => <span className={styles.mutedText}>{val ? new Date(val).toLocaleDateString() : '—'}</span>,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        size="small" type="text" icon={<EyeOutlined />}
                        className={styles.btnView}
                        onClick={() => { setSelectedDoc(record); setIsViewOpen(true); }}
                    />
                    <Button
                        size="small" type="text" icon={<DownloadOutlined />}
                        className={styles.btnEdit}
                        loading={isPending && selectedDoc?.id === record.id}
                        onClick={() => handleDownload(record)}
                    />
                    <Popconfirm
                        title="Delete this document?"
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
                    <Title level={2} className={styles.pageTitle}>Documents</Title>
                    <Text className={styles.pageSubtitle}>File attachments for clients, opportunities, proposals and contracts</Text>
                </div>
                <Button type="primary" icon={<UploadOutlined />} size="large" onClick={() => setIsUploadOpen(true)}>
                    Upload File
                </Button>
            </div>

            {/* Filters */}
            <div className={styles.toolbar}>
                <div className={styles.toolbarRow}>
                    <Input
                        prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
                        placeholder="Search by filename or description…"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                        style={{ width: 300 }}
                        allowClear
                    />
                    <Select
                        options={[{ value: undefined, label: 'All Categories' }, ...DOC_CATEGORIES.map(c => ({ value: c.value, label: c.label }))]}
                        value={filterCategory}
                        onChange={v => setFilterCategory(v)}
                        style={{ width: 180 }}
                        placeholder="Category"
                    />
                    <Select
                        options={[{ value: undefined, label: 'All Entity Types' }, ...RELATED_TYPES]}
                        value={filterRelatedType}
                        onChange={v => setFilterRelatedType(v)}
                        style={{ width: 200 }}
                        placeholder="Entity Type"
                    />
                    <Text className={styles.mutedText} style={{ marginLeft: 'auto' }}>
                        {docs.length} {docs.length === 1 ? 'file' : 'files'}
                    </Text>
                </div>
            </div>

            {/* Table */}
            <div className={styles.tableCard}>
                <Table
                    columns={columns}
                    dataSource={docs}
                    rowKey="id"
                    loading={isPending && !uploading}
                    size="middle"
                    scroll={{ x: 'max-content' }}
                    pagination={{ pageSize: 15, showSizeChanger: false }}
                    style={{ background: 'transparent' }}
                />
            </div>

            {/* ── Upload Modal ── */}
            <Modal
                title={<span className={styles.pageTitle}>Upload Document</span>}
                open={isUploadOpen}
                onCancel={() => { setIsUploadOpen(false); uploadForm.resetFields(); setFileList([]); setRelatedType(undefined); }}
                onOk={() => uploadForm.submit()}
                okText="Upload"
                confirmLoading={uploading}
                width={560}
                styles={{ body: { background: 'transparent' }, header: { background: 'transparent' } }}
            >
                <Form form={uploadForm} layout="vertical" onFinish={handleUpload}>
                    {/* File picker — not managed by Form, just a regular Upload */}
                    <div style={{ marginBottom: 16 }}>
                        <div className={styles.fileLabel}>File <span className={styles.requiredStar}>*</span></div>
                        <Upload
                            fileList={fileList}
                            beforeUpload={file => { setFileList([file as unknown as UploadFile]); return false; }}
                            onRemove={() => setFileList([])}
                            maxCount={1}
                        >
                            <Button icon={<UploadOutlined />}>Select file (max 50 MB)</Button>
                        </Upload>
                        {uploading && <Progress percent={99} status="active" style={{ marginTop: 8 }} />}
                    </div>

                    <Form.Item name="category" label={<FormLabel text="Category" />}
                        rules={[{ required: true, message: 'Select a category' }]}>
                        <Select options={DOC_CATEGORIES.map(c => ({ value: c.value, label: c.label }))} placeholder="Select category" />
                    </Form.Item>

                    <div className={styles.formGrid}>
                        <Form.Item name="relatedToType" label={<FormLabel text="Entity Type" />}
                            rules={[{ required: true, message: 'Select entity type' }]}>
                            <Select
                                options={RELATED_TYPES}
                                placeholder="Select type"
                                onChange={v => { setRelatedType(v); uploadForm.setFieldValue('relatedToId', undefined); }}
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

                    <Form.Item name="description" label={<FormLabel text="Description" />}>
                        <Input placeholder="Optional description" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* ── View Modal ── */}
            <Modal
                title={<span className={styles.pageTitle}>{selectedDoc?.fileName}</span>}
                open={isViewOpen}
                onCancel={() => setIsViewOpen(false)}
                footer={
                    <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={() => selectedDoc && handleDownload(selectedDoc)}
                        loading={isPending}
                    >
                        Download
                    </Button>
                }
                width={480}
                styles={{ body: { background: 'transparent' }, header: { background: 'transparent' } }}
            >
                {selectedDoc && (
                    <div className={styles.detailContainer}>
                        {[
                            ['File Name', <Space key="fn">{fileIcon(selectedDoc.contentType, selectedDoc.fileName)}<span>{selectedDoc.fileName}</span></Space>],
                            ['Category', (() => { const cat = DOC_CATEGORIES.find(c => c.value === selectedDoc.category); return <Tag color={cat?.color ?? 'default'}>{selectedDoc.categoryName || cat?.label}</Tag>; })()],
                            ['Related To', selectedDoc.relatedToTypeName
                                ? <Tag color="geekblue">{selectedDoc.relatedToTypeName}</Tag>
                                : '—'],
                            ['File Size', formatBytes(selectedDoc.fileSize)],
                            ['Content Type', selectedDoc.contentType],
                            ['Uploaded By', selectedDoc.uploadedByName],
                            ['Uploaded At', selectedDoc.createdAt ? new Date(selectedDoc.createdAt).toLocaleString() : '—'],
                            ['Description', selectedDoc.description || '—'],
                        ].map(([label, value]) => (
                            <div key={label as string} className={styles.detailRow}>
                                <span className={styles.detailLabel}>{label}</span>
                                <span className={styles.detailValue}>{value}</span>
                            </div>
                        ))}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default DocumentsPage;
