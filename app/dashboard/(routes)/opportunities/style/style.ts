import { createStyles, css } from "antd-style";

/**
 * Kanban board styles specific to the Opportunities page.
 */
export const useStyles = createStyles(() => ({
  board: css`
    display: flex;
    gap: 12px;
    overflow-x: auto;
    padding-bottom: 16px;
  `,

  column: css`
    min-width: 260px;
    flex-shrink: 0;
  `,

  columnHeader: css`
    padding: 12px;
    border-radius: 8px 8px 0 0;
    background: rgba(255, 255, 255, 0.04);
  `,

  columnTitle: css`
    color: white;
    font-weight: 500;
    font-size: 13px;
  `,

  columnBody: css`
    padding: 8px;
    min-height: 200px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-top: none;
    border-radius: 0 0 8px 8px;
  `,

  oppCard: css`
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 8px;
    cursor: pointer;
    transition: background 0.15s;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  `,

  oppCardTitle: css`
    color: white;
    font-weight: 500;
    margin-bottom: 4px;
    font-size: 13px;
  `,

  oppCardMeta: css`
    color: #8c8c8c;
    font-size: 12px;
  `,

  oppCardValue: css`
    color: #52c41a;
    font-weight: 500;
  `,
}));
