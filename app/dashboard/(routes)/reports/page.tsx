"use client";

import React, { useEffect, useState } from 'react';
import {
    Row, Col, Table, Tag, Typography, Spin, Select, DatePicker,
    Tabs, Button, Segmented,
} from 'antd';
import {
    BarChartOutlined,
    TableOutlined,
    ReloadOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title as ChartTitlePlugin,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useReportState, useReportActions } from '@/providers/reportProvider';
import { useStyles } from '../_styles/style';
import { createStyles, css } from 'antd-style';
import type { ColumnsType } from 'antd/es/table';
import type {
    IOpportunityReportItemDto,
    ISalesByPeriodItemDto,
} from '@/providers/reportProvider/context';


ChartJS.register(
    CategoryScale, LinearScale, BarElement, LineElement,
    PointElement, ChartTitlePlugin, Tooltip, Legend
);

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

/* ─── Local styles ───────────────────────────────────────────── */
const useLocalStyles = createStyles(() => ({
    statCard: css`
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.10);
        border-radius: 12px;
        padding: 16px 20px;
    `,
    chartCard: css`
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 14px;
        padding: 20px;
        margin-top: 16px;
    `,
    chartWrap: css`
        position: relative;
        height: 320px;
    `,
    filterBar: css`
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 12px 16px;
        margin-bottom: 16px;
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        align-items: center;
    `,
    spinCenter: css`
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 80px;
    `,
    refreshBtn: css`
        color: #d4d4d4 !important;
        border-color: rgba(255,255,255,0.15) !important;
        background: rgba(255,255,255,0.04) !important;
    `,
}));

/* ─── Constants ──────────────────────────────────────────────── */
const STAGE_OPTIONS = [
    { value: 1, label: 'Lead' },
    { value: 2, label: 'Qualified' },
    { value: 3, label: 'Proposal' },
    { value: 4, label: 'Negotiation' },
    { value: 5, label: 'Closed Won' },
    { value: 6, label: 'Closed Lost' },
];

const STAGE_COLORS: Record<number, string> = {
    1: 'default', 2: 'blue', 3: 'cyan', 4: 'gold', 5: 'success', 6: 'error',
};

const CHART_GRID = 'rgba(255,255,255,0.06)';
const CHART_TEXT = 'rgba(255,255,255,0.55)';

const fmtCurrency = (v: number) =>
    new Intl.NumberFormat('en-ZA', {
        style: 'currency', currency: 'ZAR',
        notation: 'compact', maximumFractionDigits: 1,
    }).format(v ?? 0);

const fmtCurrencyFull = (v: number) =>
    new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(v ?? 0);

/* ─── Component ──────────────────────────────────────────────── */
const ReportsPage = () => {
    const { styles: shared } = useStyles();
    const { styles } = useLocalStyles();

    const { isPending, opportunitiesReport, salesByPeriodReport } = useReportState();
    const { getOpportunitiesReport, getSalesByPeriodReport } = useReportActions();

    /* Opportunities filters */
    const [oppStartDate, setOppStartDate] = useState<string | undefined>();
    const [oppEndDate, setOppEndDate] = useState<string | undefined>();
    const [oppStage, setOppStage] = useState<number | undefined>();

    /* Sales by period filters */
    const [periodStart, setPeriodStart] = useState<string | undefined>();
    const [periodEnd, setPeriodEnd] = useState<string | undefined>();
    const [groupBy, setGroupBy] = useState<'month' | 'week'>('month');
    const [chartView, setChartView] = useState<'value' | 'count'>('value');

    /* Initial fetches */
    useEffect(() => {
        getOpportunitiesReport({});
        getSalesByPeriodReport({ groupBy: 'month' });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleOppSearch = () => {
        getOpportunitiesReport({
            startDate: oppStartDate,
            endDate: oppEndDate,
            stage: oppStage,
        });
    };

    const handlePeriodSearch = () => {
        getSalesByPeriodReport({
            startDate: periodStart,
            endDate: periodEnd,
            groupBy,
        });
    };

    const handleGroupByChange = (val: 'month' | 'week') => {
        setGroupBy(val);
        getSalesByPeriodReport({
            startDate: periodStart,
            endDate: periodEnd,
            groupBy: val,
        });
    };

    /* ── Opportunities table ─────────────────────────────────── */
    const oppColumns: ColumnsType<IOpportunityReportItemDto> = [
        {
            title: 'Title',
            dataIndex: 'title',
            ellipsis: true,
            render: (v: string) => <Text style={{ color: 'white' }}>{v}</Text>,
        },
        {
            title: 'Client',
            dataIndex: 'clientName',
            ellipsis: true,
            render: (v: string) => <Text style={{ color: '#d4d4d4' }}>{v}</Text>,
        },
        {
            title: 'Owner',
            dataIndex: 'ownerName',
            ellipsis: true,
            render: (v: string) => <Text style={{ color: '#d4d4d4' }}>{v}</Text>,
        },
        {
            title: 'Stage',
            dataIndex: 'stage',
            render: (v: number, row) => (
                <Tag color={STAGE_COLORS[v] ?? 'default'}>{row.stageName}</Tag>
            ),
            filters: STAGE_OPTIONS.map(s => ({ text: s.label, value: s.value })),
            onFilter: (value, record) => record.stage === value,
        },
        {
            title: 'Value',
            dataIndex: 'estimatedValue',
            render: (v: number) => (
                <Text style={{ color: '#4f8ef7' }}>{fmtCurrencyFull(v)}</Text>
            ),
            sorter: (a, b) => a.estimatedValue - b.estimatedValue,
        },
        {
            title: 'Close Date',
            dataIndex: 'expectedCloseDate',
            render: (v: string) => <Text style={{ color: '#8c8c8c' }}>{v ? v.slice(0, 10) : '—'}</Text>,
            sorter: (a, b) =>
                new Date(a.expectedCloseDate).getTime() - new Date(b.expectedCloseDate).getTime(),
        },
        {
            title: 'Created',
            dataIndex: 'createdAt',
            render: (v: string) => <Text style={{ color: '#8c8c8c' }}>{v ? v.slice(0, 10) : '—'}</Text>,
        },
    ];

    /* ── Sales by period chart ───────────────────────────────── */
    const periodLabels = salesByPeriodReport?.map(r => r.period) ?? [];
    const periodChartData = {
        labels: periodLabels,
        datasets:
            chartView === 'value'
                ? [
                    {
                        label: 'Total Value',
                        data: salesByPeriodReport?.map(r => r.totalValue) ?? [],
                        backgroundColor: 'rgba(79,142,247,0.75)',
                        borderColor: '#4f8ef7',
                        borderWidth: 1.5,
                        borderRadius: 6,
                    },
                ]
                : [
                    {
                        label: 'Deals Won',
                        data: salesByPeriodReport?.map(r => r.dealsWon) ?? [],
                        backgroundColor: 'rgba(103,224,163,0.75)',
                        borderColor: '#67e0a3',
                        borderWidth: 1.5,
                        borderRadius: 6,
                    },
                ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { labels: { color: CHART_TEXT, font: { size: 12 } } },
            tooltip: {
                backgroundColor: 'rgba(20,20,30,0.92)',
                titleColor: '#fff',
                bodyColor: CHART_TEXT,
                borderColor: 'rgba(255,255,255,0.12)',
                borderWidth: 1,
                callbacks: {
                    label: (ctx: { parsed: { y: number } }) =>
                        chartView === 'value'
                            ? ` ${fmtCurrency(ctx.parsed.y)}`
                            : ` ${ctx.parsed.y} deals`,
                },
            },
        },
        scales: {
            x: { ticks: { color: CHART_TEXT, font: { size: 11 } }, grid: { color: CHART_GRID } },
            y: {
                ticks: {
                    color: CHART_TEXT,
                    font: { size: 11 },
                    callback: (v: string | number) =>
                        chartView === 'value' ? fmtCurrency(Number(v)) : String(v),
                },
                grid: { color: CHART_GRID },
            },
        },
    };

    /* ── Period summary stats ────────────────────────────────── */
    const totalDeals = salesByPeriodReport?.reduce((acc, r) => acc + r.dealsWon, 0) ?? 0;
    const totalValue = salesByPeriodReport?.reduce((acc, r) => acc + r.totalValue, 0) ?? 0;
    const avgDealSize =
        salesByPeriodReport && salesByPeriodReport.length > 0
            ? salesByPeriodReport.reduce((acc, r) => acc + r.averageDealSize, 0) / salesByPeriodReport.length
            : 0;

    /* ── Opportunities summary stats ─────────────────────────── */
    const oppTotal = opportunitiesReport?.length ?? 0;
    const oppTotalValue = opportunitiesReport?.reduce((acc, r) => acc + r.estimatedValue, 0) ?? 0;
    const oppWon = opportunitiesReport?.filter(r => r.stage === 5).length ?? 0;

    const tabItems = [
        {
            key: 'opportunities',
            label: (
                <span>
                    <TableOutlined /> Opportunities Report
                </span>
            ),
            children: (
                <div>
                    {/* Filters */}
                    <div className={styles.filterBar}>
                        <RangePicker
                            placeholder={['Start Date', 'End Date']}
                            onChange={(_, strings) => {
                                setOppStartDate(strings[0] || undefined);
                                setOppEndDate(strings[1] || undefined);
                            }}
                            style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.15)' }}
                        />
                        <Select
                            placeholder="Filter by stage"
                            allowClear
                            style={{ width: 180 }}
                            options={STAGE_OPTIONS}
                            onChange={setOppStage}
                        />
                        <Button
                            icon={<SearchOutlined />}
                            onClick={handleOppSearch}
                            loading={isPending}
                            type="primary"
                        >
                            Apply
                        </Button>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={() => {
                                setOppStartDate(undefined);
                                setOppEndDate(undefined);
                                setOppStage(undefined);
                                getOpportunitiesReport({});
                            }}
                            className={styles.refreshBtn}
                        >
                            Reset
                        </Button>
                    </div>

                    {/* Summary stats */}
                    <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
                        <Col xs={24} sm={8}>
                            <div className={styles.statCard}>
                                <div style={{ color: '#8c8c8c', fontSize: 12, marginBottom: 4 }}>Total Opportunities</div>
                                <div style={{ color: '#4f8ef7', fontSize: 22, fontWeight: 700 }}>{oppTotal}</div>
                            </div>
                        </Col>
                        <Col xs={24} sm={8}>
                            <div className={styles.statCard}>
                                <div style={{ color: '#8c8c8c', fontSize: 12, marginBottom: 4 }}>Total Pipeline Value</div>
                                <div style={{ color: '#67e0a3', fontSize: 22, fontWeight: 700 }}>{fmtCurrency(oppTotalValue)}</div>
                            </div>
                        </Col>
                        <Col xs={24} sm={8}>
                            <div className={styles.statCard}>
                                <div style={{ color: '#8c8c8c', fontSize: 12, marginBottom: 4 }}>Closed Won</div>
                                <div style={{ color: '#f7c948', fontSize: 22, fontWeight: 700 }}>{oppWon}</div>
                            </div>
                        </Col>
                    </Row>

                    {/* Table */}
                    {isPending ? (
                        <div className={styles.spinCenter}><Spin /></div>
                    ) : (
                        <div className={shared.tableCard}>
                            <Table<IOpportunityReportItemDto>
                                dataSource={opportunitiesReport ?? []}
                                columns={oppColumns}
                                rowKey="id"
                                size="small"
                                pagination={{ pageSize: 15, showSizeChanger: true }}
                                locale={{ emptyText: <Text style={{ color: '#8c8c8c' }}>No data — try adjusting filters</Text> }}
                                scroll={{ x: 900 }}
                            />
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'salesByPeriod',
            label: (
                <span>
                    <BarChartOutlined /> Sales by Period
                </span>
            ),
            children: (
                <div>
                    {/* Filters */}
                    <div className={styles.filterBar}>
                        <RangePicker
                            placeholder={['Start Date', 'End Date']}
                            onChange={(_, strings) => {
                                setPeriodStart(strings[0] || undefined);
                                setPeriodEnd(strings[1] || undefined);
                            }}
                            style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.15)' }}
                        />
                        <Segmented
                            value={groupBy}
                            options={[
                                { label: 'Monthly', value: 'month' },
                                { label: 'Weekly', value: 'week' },
                            ]}
                            onChange={(v) => handleGroupByChange(v as 'month' | 'week')}
                        />
                        <Button
                            icon={<SearchOutlined />}
                            onClick={handlePeriodSearch}
                            loading={isPending}
                            type="primary"
                        >
                            Apply
                        </Button>
                        <div style={{ marginLeft: 'auto' }}>
                            <Segmented
                                value={chartView}
                                options={[
                                    { label: 'Value', value: 'value' },
                                    { label: 'Deals', value: 'count' },
                                ]}
                                onChange={(v) => setChartView(v as 'value' | 'count')}
                            />
                        </div>
                    </div>

                    {/* Summary stat cards */}
                    <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
                        <Col xs={24} sm={8}>
                            <div className={styles.statCard}>
                                <div style={{ color: '#8c8c8c', fontSize: 12, marginBottom: 4 }}>Total Deals Won</div>
                                <div style={{ color: '#4f8ef7', fontSize: 22, fontWeight: 700 }}>{totalDeals}</div>
                            </div>
                        </Col>
                        <Col xs={24} sm={8}>
                            <div className={styles.statCard}>
                                <div style={{ color: '#8c8c8c', fontSize: 12, marginBottom: 4 }}>Total Revenue</div>
                                <div style={{ color: '#67e0a3', fontSize: 22, fontWeight: 700 }}>{fmtCurrency(totalValue)}</div>
                            </div>
                        </Col>
                        <Col xs={24} sm={8}>
                            <div className={styles.statCard}>
                                <div style={{ color: '#8c8c8c', fontSize: 12, marginBottom: 4 }}>Avg Deal Size</div>
                                <div style={{ color: '#f7c948', fontSize: 22, fontWeight: 700 }}>{fmtCurrency(avgDealSize)}</div>
                            </div>
                        </Col>
                    </Row>

                    {/* Bar chart */}
                    {isPending ? (
                        <div className={styles.spinCenter}><Spin /></div>
                    ) : (
                        <div className={styles.chartCard}>
                            <div className={styles.chartWrap}>
                                <Bar data={periodChartData} options={chartOptions as never} />
                            </div>
                        </div>
                    )}

                    {/* Period breakdown table */}
                    <div className={shared.tableCard} style={{ marginTop: 16 }}>
                        <Table<ISalesByPeriodItemDto>
                            dataSource={salesByPeriodReport ?? []}
                            rowKey="period"
                            size="small"
                            pagination={false}
                            locale={{ emptyText: <Text style={{ color: '#8c8c8c' }}>No data for selected period</Text> }}
                            columns={[
                                {
                                    title: 'Period',
                                    dataIndex: 'period',
                                    render: (v: string) => <Text style={{ color: '#d4d4d4' }}>{v}</Text>,
                                },
                                {
                                    title: 'Deals Won',
                                    dataIndex: 'dealsWon',
                                    align: 'center',
                                    render: (v: number) => <Text style={{ color: '#67e0a3' }}>{v}</Text>,
                                    sorter: (a, b) => a.dealsWon - b.dealsWon,
                                },
                                {
                                    title: 'Total Value',
                                    dataIndex: 'totalValue',
                                    render: (v: number) => (
                                        <Text style={{ color: '#4f8ef7' }}>{fmtCurrencyFull(v)}</Text>
                                    ),
                                    sorter: (a, b) => a.totalValue - b.totalValue,
                                },
                                {
                                    title: 'Avg Deal Size',
                                    dataIndex: 'averageDealSize',
                                    render: (v: number) => (
                                        <Text style={{ color: '#f7c948' }}>{fmtCurrencyFull(v)}</Text>
                                    ),
                                    sorter: (a, b) => a.averageDealSize - b.averageDealSize,
                                },
                            ]}
                        />
                    </div>
                </div>
            ),
        },
    ];

    return (
        <div className={shared.page}>
            {/* ── Header ───────────────────────────────────────── */}
            <div className={shared.pageHeader}>
                <div>
                    <Title level={2} className={shared.pageTitle}>Reports</Title>
                    <Text className={shared.pageSubtitle}>Filterable sales & opportunity analytics</Text>
                </div>
            </div>

            <Tabs
                items={tabItems}
                defaultActiveKey="opportunities"
                size="large"
            />
        </div>
    );
};

export default ReportsPage;
