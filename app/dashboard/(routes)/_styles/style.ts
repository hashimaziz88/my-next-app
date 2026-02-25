import { createStyles, css } from "antd-style";

/**
 * Shared glass-grey styles used across all dashboard route pages.
 * Import with: const { styles, cx } = useStyles();
 */
export const useStyles = createStyles(() => ({
  /* ── Page shell ─────────────────────────────────────────── */
  page: css`
    padding: 24px;
    min-height: 100%;
    background: transparent;
  `,

  /* ── Glass card ─────────────────────────────────────────── */
  card: css`
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
  `,

  tableCard: css`
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    overflow: hidden;
  `,

  /* ── Toolbar (filter bar above tables / card lists) ─────── */
  toolbar: css`
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 12px 16px;
    margin-bottom: 16px;
  `,

  toolbarRow: css`
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    align-items: center;
  `,

  /* ── Page header row ─────────────────────────────────────── */
  pageHeader: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    color: white;
  `,

  pageTitle: css`
    color: white !important;
    margin: 0 !important;
  `,

  pageSubtitle: css`
    color: #8c8c8c;
  `,

  /* ── Typography helpers ──────────────────────────────────── */
  primaryText: css`
    color: white;
    font-weight: 500;
  `,

  bodyText: css`
    color: #d4d4d4;
  `,

  mutedText: css`
    color: #8c8c8c;
  `,

  mutedTextSmall: css`
    color: #666;
    font-size: 12px;
  `,

  monospaceText: css`
    color: #8c8c8c;
    font-family: monospace;
  `,

  /* ── Search input (glass theme, apply alongside style={{ width: NNN }}) ─ */
  searchInput: css`
    &.ant-input-affix-wrapper {
      background: rgba(255, 255, 255, 0.06) !important;
      border-color: rgba(255, 255, 255, 0.12) !important;
      color: white !important;

      .ant-input {
        background: transparent !important;
        color: white !important;
      }
    }
  `,

  /* ── Form helpers ────────────────────────────────────────── */
  formLabel: css`
    color: #d4d4d4;
  `,

  formGrid: css`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  `,

  fileLabel: css`
    color: #d4d4d4;
    margin-bottom: 6px;
  `,

  requiredStar: css`
    color: #ff4d4f;
  `,

  /* ── Detail view rows (in view modals) ───────────────────── */
  detailContainer: css`
    display: flex;
    flex-direction: column;
    gap: 12px;
  `,

  detailRow: css`
    display: flex;
    gap: 12px;
  `,

  detailLabel: css`
    color: #8c8c8c;
    min-width: 110px;
  `,

  detailLabelNarrow: css`
    color: #8c8c8c;
    min-width: 100px;
  `,

  detailValue: css`
    color: white;
  `,

  /* ── Note card ───────────────────────────────────────────── */
  noteCard: css`
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    margin-bottom: 12px;
  `,

  noteMetaRow: css`
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 8px;
    flex-wrap: wrap;
  `,

  noteActions: css`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
  `,

  noteBody: css`
    flex: 1;
  `,

  /* ── Loading / empty states ──────────────────────────────── */
  spinCenter: css`
    text-align: center;
    padding: 80px;
  `,

  /* ── Action button colours ───────────────────────────────── */
  btnView: css`
    color: #1890ff !important;
  `,

  btnEdit: css`
    color: #52c41a !important;
  `,

  btnDelete: css`
    color: #ff4d4f !important;
  `,

  btnWarn: css`
    color: #faad14 !important;
  `,

  btnSuccess: css`
    color: #52c41a !important;
  `,
}));
