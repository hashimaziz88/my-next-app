import { createStyles, css } from "antd-style";

/**
 * Activity-page-specific styles (tabs bar, detail modal rows, etc.).
 */
export const useActivityStyles = createStyles(() => ({
  tabsBar: css`
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 16px 16px 16px 16px;
    margin-bottom: 16px;
    overflow-x: auto;
  `,

  tabLabel: css`
    color: #8c8c8c;
    transition: color 0.2s;
  `,

  tabLabelActive: css`
    color: #1890ff;
  `,

  tabLabelWarning: css`
    color: #faad14;
  `,

  tabLabelDanger: css`
    color: #ff4d4f;
  `,

  detailLabel: css`
    color: #8c8c8c;
    min-width: 100px;
  `,

  completeNote: css`
    color: #8c8c8c;
    margin-bottom: 16px;
  `,

  overdueRow: css`
    background: rgba(255, 77, 79, 0.08) !important;
  `,
}));
