"use client";

import React, { useEffect } from 'react';
import { Row, Col, Table, Tag, Typography, Spin, Button } from 'antd';
import {
    RiseOutlined,
    TrophyOutlined,
    FileProtectOutlined,
    DollarCircleOutlined,
    ReloadOutlined,
    WarningOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined,
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
    Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { useDashboardState, useDashboardActions } from '@/providers/dashboardProvider';
import { useStyles } from '@/app/dashboard/(routes)/_styles/style';
import { createStyles, css } from 'antd-style';
import type { ColumnsType } from 'antd/es/table';
import type { ISalesPerformanceDto } from '@/providers/dashboardProvider/context';
import type { IContractDto } from '@/providers/contractProvider/context';

ChartJS.register(
    CategoryScale, LinearScale, BarElement, LineElement,
    PointElement, ChartTitlePlugin, Tooltip, Legend, Filler
);

const { Title, Text } = Typography;

/* ─── Local styles ───────────────────────────────────────────── */
const useLocalStyles = createStyles(() => ({
    kpiCard: css`
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.10);
        border-radius: 14px;
        padding: 20px 24px;
        height: 100%;
        transition: border-color 0.2s;
        &:hover { border-color: rgba(255, 255, 255, 0.22); }
    `,
    kpiIcon: css`
        width: 44px;
        height: 44px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        margin-bottom: 12px;
    `,
    chartCard: css`
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 14px;
        padding: 20px;
    `,
    chartTitle: css`
        color: #d4d4d4;
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 14px;
        display: block;
        text-transform: uppercase;
        letter-spacing: 0.4px;
    `,
    chartWrap: css`
        position: relative;
        height: 260px;
    `,
    activityCard: css`
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 14px 16px;
        display: flex;
        align-items: center;
        gap: 14px;
    `,
    activityIcon: css`
        width: 40px;
        height: 40px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        flex-shrink: 0;
    `,
    spinCenter: css`
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 60vh;
    `,
    refreshBtn: css`
        color: #d4d4d4 !important;
        border-color: rgba(255,255,255,0.15) !important;
        background: rgba(255,255,255,0.04) !important;
        &:hover { border-color: rgba(255,255,255,0.30) !important; }
    `,
}));

/* ─── Chart theme ────────────────────────────────────────────── */
const CHART_GRID = 'rgba(255,255,255,0.06)';
const CHART_TEXT = 'rgba(255,255,255,0.55)';
const STAGE_COLORS = ['#4f8ef7', '#67e0a3', '#f7c948', '#f76f6f', '#b57bff', '#5bc0eb'];

const baseScales = {
    x: { ticks: { color: CHART_TEXT, font: { size: 11 } }, grid: { color: CHART_GRID } },
    y: { ticks: { color: CHART_TEXT, font: { size: 11 } }, grid: { color: CHART_GRID } },
};

const basePlugins = {
    legend: { labels: { color: CHART_TEXT, font: { size: 12 } } },
    tooltip: {
        backgroundColor: 'rgba(20,20,30,0.92)',
        titleColor: '#fff',
        bodyColor: CHART_TEXT,
        borderColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1,
    },
};

/* ─── Formatters ─────────────────────────────────────────────── */
const fmtCurrency = (v: number) =>
    new Intl.NumberFormat('en-ZA', {
        style: 'currency', currency: 'ZAR',
        notation: 'compact', maximumFractionDigits: 1,
    }).format(v ?? 0);

const fmtNumber = (v: number) =>
    new Intl.NumberFormat('en-ZA', { notation: 'compact' }).format(v ?? 0);

const winRateTagColor = (rate: number) => {
    if (rate >= 60) return 'success';
    if (rate >= 40) return 'warning';
    return 'error';
};

const daysLeftTagColor = (days: number) => {
    if (days <= 7) return 'error';
    if (days <= 14) return 'warning';
    return 'orange';
};

/* ─── Component ──────────────────────────────────────────────── */
const DashboardPage = () => {
    const { styles: shared } = useStyles();
    const { styles } = useLocalStyles();

    const {
        isPending,
        overview,
        pipelineMetrics,
        salesPerformance,
        contractsExpiring,
    } = useDashboardState();

    const {
        getDashboardOverview,
        getDashboardPipelineMetrics,
        getSalesPerformance,
        getActivitiesSummary,
        getContractsExpiring,
    } = useDashboardActions();

    const fetchAll = () => {
        getDashboardOverview();
        getDashboardPipelineMetrics();
        getSalesPerformance(5);
        getActivitiesSummary();
        getContractsExpiring(30);
    };

    useEffect(() => {
        getDashboardOverview();
        getDashboardPipelineMetrics();
        getSalesPerformance(5);
        getActivitiesSummary();
        getContractsExpiring(30);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ── Pipeline bar chart ──────────────────────────────────── */
    const pipelineChartData = {
        labels: pipelineMetrics?.stages?.map(s => s.stageName) ?? [],
        datasets: [{
            label: 'Pipeline Value',
            data: pipelineMetrics?.stages?.map(s => s.value) ?? [],
            backgroundColor: STAGE_COLORS.map(c => c + 'bb'),
            borderColor: STAGE_COLORS,
            borderWidth: 1.5,
            borderRadius: 6,
        }],
    };

    /* ── Revenue line chart ──────────────────────────────────── */
    const revenueChartData = {
        labels: overview?.revenue?.monthlyTrend?.map(m => m.month) ?? [],
        datasets: [{
            label: 'Revenue',
            data: overview?.revenue?.monthlyTrend?.map(m => m.value) ?? [],
            borderColor: '#4f8ef7',
            backgroundColor: 'rgba(79,142,247,0.12)',
            pointBackgroundColor: '#4f8ef7',
            pointRadius: 4,
            borderWidth: 2,
            fill: true,
            tension: 0.35,
        }],
    };

    /* ── Sales performance columns ───────────────────────────── */
    const perfColumns: ColumnsType<ISalesPerformanceDto> = [
        {
            title: 'Name',
            dataIndex: 'userName',
            render: (v: string) => <Text style={{ color: 'white' }}>{v}</Text>,
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
            render: (v: number) => <Text style={{ color: '#4f8ef7' }}>{fmtCurrency(v)}</Text>,
            sorter: (a, b) => a.totalValue - b.totalValue,
        },
        {
            title: 'Win Rate',
            dataIndex: 'winRate',
            render: (v: number) => (
                <Tag color={winRateTagColor(v)}>
                    {(v ?? 0).toFixed(1)}%
                </Tag>
            ),
            sorter: (a, b) => a.winRate - b.winRate,
        },
        {
            title: 'Activities Done',
            dataIndex: 'activitiesCompleted',
            align: 'center',
            render: (v: number) => <Text style={{ color: '#d4d4d4' }}>{v}</Text>,
        },
    ];

    /* ── Expiring contracts columns ──────────────────────────── */
    const expiringColumns: ColumnsType<IContractDto> = [
        {
            title: 'Contract',
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
            title: 'End Date',
            dataIndex: 'endDate',
            render: (v: string) => <Text style={{ color: '#8c8c8c' }}>{v ? v.slice(0, 10) : '—'}</Text>,
        },
        {
            title: 'Days Left',
            dataIndex: 'daysUntilExpiry',
            align: 'center',
            render: (v: number) => (
                <Tag color={daysLeftTagColor(v)}>
                    {v} day{v === 1 ? '' : 's'}
                </Tag>
            ),
            sorter: (a, b) => (a.daysUntilExpiry ?? 999) - (b.daysUntilExpiry ?? 999),
            defaultSortOrder: 'ascend',
        },
    ];

    if (isPending && !overview) {
        return (
            <div className={styles.spinCenter}>
                <Spin size="large" />
            </div>
        );
    }

    const opp = overview?.opportunities;
    const con = overview?.contracts;
    const act = overview?.activities;

    return (
        <div className={shared.page}>
            {/* ── Header ───────────────────────────────────────── */}
            <div className={shared.pageHeader}>
                <div>
                    <Title level={2} className={shared.pageTitle}>Dashboard</Title>
                    <Text className={shared.pageSubtitle}>Sales performance overview</Text>
                </div>
                <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchAll}
                    loading={isPending}
                    className={styles.refreshBtn}
                >
                    Refresh
                </Button>
            </div>

            {/* ── KPI cards ────────────────────────────────────── */}
            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                <Col xs={24} sm={12} lg={6}>
                    <div className={styles.kpiCard}>
                        <div className={styles.kpiIcon} style={{ background: 'rgba(79,142,247,0.15)', color: '#4f8ef7' }}>
                            <RiseOutlined />
                        </div>
                        <div style={{ marginBottom: 6 }}>
                            <div style={{ color: '#8c8c8c', fontSize: 12, marginBottom: 4 }}>Pipeline Value</div>
                            <div style={{ color: '#4f8ef7', fontSize: 22, fontWeight: 700 }}>{fmtCurrency(opp?.pipelineValue ?? 0)}</div>
                        </div>
                        <Text style={{ color: '#8c8c8c', fontSize: 12 }}>{opp?.totalCount ?? 0} open opportunities</Text>
                    </div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <div className={styles.kpiCard}>
                        <div className={styles.kpiIcon} style={{ background: 'rgba(103,224,163,0.15)', color: '#67e0a3' }}>
                            <TrophyOutlined />
                        </div>
                        <div style={{ marginBottom: 6 }}>
                            <div style={{ color: '#8c8c8c', fontSize: 12, marginBottom: 4 }}>Win Rate</div>
                            <div style={{ color: '#67e0a3', fontSize: 22, fontWeight: 700 }}>{(opp?.winRate ?? 0).toFixed(1)}%</div>
                        </div>
                        <Text style={{ color: '#8c8c8c', fontSize: 12 }}>{opp?.wonCount ?? 0} deals closed won</Text>
                    </div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <div className={styles.kpiCard}>
                        <div className={styles.kpiIcon} style={{ background: 'rgba(247,201,72,0.15)', color: '#f7c948' }}>
                            <FileProtectOutlined />
                        </div>
                        <div style={{ marginBottom: 6 }}>
                            <div style={{ color: '#8c8c8c', fontSize: 12, marginBottom: 4 }}>Active Contracts</div>
                            <div style={{ color: '#f7c948', fontSize: 22, fontWeight: 700 }}>{fmtNumber(con?.totalActiveCount ?? 0)}</div>
                        </div>
                        <Text style={{ color: '#8c8c8c', fontSize: 12 }}>{con?.expiringThisMonthCount ?? 0} expiring this month</Text>
                    </div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <div className={styles.kpiCard}>
                        <div className={styles.kpiIcon} style={{ background: 'rgba(247,111,111,0.15)', color: '#f76f6f' }}>
                            <DollarCircleOutlined />
                        </div>
                        <div style={{ marginBottom: 6 }}>
                            <div style={{ color: '#8c8c8c', fontSize: 12, marginBottom: 4 }}>Contract Value</div>
                            <div style={{ color: '#f76f6f', fontSize: 22, fontWeight: 700 }}>{fmtCurrency(con?.totalContractValue ?? 0)}</div>
                        </div>
                        <Text style={{ color: '#8c8c8c', fontSize: 12 }}>Total active contract value</Text>
                    </div>
                </Col>
            </Row>

            {/* ── Charts ───────────────────────────────────────── */}
            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                <Col xs={24} lg={14}>
                    <div className={styles.chartCard}>
                        <span className={styles.chartTitle}>Pipeline by Stage</span>
                        <div className={styles.chartWrap}>
                            <Bar
                                data={pipelineChartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        ...basePlugins,
                                        legend: { display: false },
                                        tooltip: {
                                            ...basePlugins.tooltip,
                                            callbacks: { label: (ctx) => ` ${fmtCurrency(Number(ctx.parsed.y ?? 0))}` },
                                        },
                                    },
                                    scales: {
                                        x: baseScales.x,
                                        y: {
                                            ...baseScales.y,
                                            ticks: {
                                                ...baseScales.y.ticks,
                                                callback: (v) => fmtCurrency(Number(v)),
                                            },
                                        },
                                    },
                                }}
                            />
                        </div>
                    </div>
                </Col>
                <Col xs={24} lg={10}>
                    <div className={styles.chartCard}>
                        <span className={styles.chartTitle}>Revenue Trend</span>
                        <div className={styles.chartWrap}>
                            <Line
                                data={revenueChartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        ...basePlugins,
                                        legend: { display: false },
                                        tooltip: {
                                            ...basePlugins.tooltip,
                                            callbacks: { label: (ctx) => ` ${fmtCurrency(Number(ctx.parsed.y ?? 0))}` },
                                        },
                                    },
                                    scales: {
                                        x: baseScales.x,
                                        y: {
                                            ...baseScales.y,
                                            ticks: {
                                                ...baseScales.y.ticks,
                                                callback: (v) => fmtCurrency(Number(v)),
                                            },
                                        },
                                    },
                                }}
                            />
                        </div>
                    </div>
                </Col>
            </Row>

            {/* ── Activities summary + Expiring contracts ───────── */}
            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                <Col xs={24} lg={8}>
                    <div className={styles.chartCard} style={{ height: '100%' }}>
                        <span className={styles.chartTitle}>Activities</span>
                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <div className={styles.activityCard}>
                                <div className={styles.activityIcon} style={{ background: 'rgba(91,192,235,0.15)', color: '#5bc0eb' }}>
                                    <ClockCircleOutlined />
                                </div>
                                <div>
                                    <div style={{ color: '#5bc0eb', fontSize: 26, fontWeight: 700, lineHeight: 1.2 }}>
                                        {act?.upcomingCount ?? 0}
                                    </div>
                                    <Text style={{ color: '#8c8c8c', fontSize: 12 }}>Upcoming</Text>
                                </div>
                            </div>
                            <div className={styles.activityCard}>
                                <div className={styles.activityIcon} style={{ background: 'rgba(247,111,111,0.15)', color: '#f76f6f' }}>
                                    <ExclamationCircleOutlined />
                                </div>
                                <div>
                                    <div style={{ color: '#f76f6f', fontSize: 26, fontWeight: 700, lineHeight: 1.2 }}>
                                        {act?.overdueCount ?? 0}
                                    </div>
                                    <Text style={{ color: '#8c8c8c', fontSize: 12 }}>Overdue</Text>
                                </div>
                            </div>
                            <div className={styles.activityCard}>
                                <div className={styles.activityIcon} style={{ background: 'rgba(103,224,163,0.15)', color: '#67e0a3' }}>
                                    <CheckCircleOutlined />
                                </div>
                                <div>
                                    <div style={{ color: '#67e0a3', fontSize: 26, fontWeight: 700, lineHeight: 1.2 }}>
                                        {act?.completedTodayCount ?? 0}
                                    </div>
                                    <Text style={{ color: '#8c8c8c', fontSize: 12 }}>Completed Today</Text>
                                </div>
                            </div>
                        </div>
                    </div>
                </Col>
                <Col xs={24} lg={16}>
                    <div className={styles.chartCard}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <WarningOutlined style={{ color: '#f7c948' }} />
                            <span className={styles.chartTitle} style={{ marginBottom: 0 }}>
                                Contracts Expiring Soon
                            </span>
                        </div>
                        <Table<IContractDto>
                            dataSource={contractsExpiring ?? []}
                            columns={expiringColumns}
                            rowKey="id"
                            size="small"
                            pagination={false}
                            scroll={{ y: 220 }}
                            locale={{
                                emptyText: (
                                    <Text style={{ color: '#8c8c8c' }}>No contracts expiring in 30 days</Text>
                                ),
                            }}
                        />
                    </div>
                </Col>
            </Row>

            {/* ── Sales performance ────────────────────────────── */}
            <div className={styles.chartCard}>
                <span className={styles.chartTitle}>Top Sales Performance</span>
                <Table<ISalesPerformanceDto>
                    dataSource={salesPerformance ?? []}
                    columns={perfColumns}
                    rowKey="userId"
                    size="small"
                    pagination={false}
                    locale={{
                        emptyText: <Text style={{ color: '#8c8c8c' }}>No performance data</Text>,
                    }}
                />
            </div>
        </div>
    );
};

export default DashboardPage;