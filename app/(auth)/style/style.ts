import { createStyles, css } from "antd-style";

export const useStyles = createStyles(({ token }) => ({
  container: css`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: radial-gradient(circle at 0% 0%, #3a3f47 0%, #1a1c22 100%);
    padding: 24px;
  `,

  formContainer: css`
    background: rgba(58, 63, 71, 0.8);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    padding: 48px 40px;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    width: 100%;
    max-width: 440px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition: all 0.3s ease-in-out;

    &:hover {
      border-color: rgba(255, 255, 255, 0.15);
      transform: translateY(-4px);
    }
  `,

  headerSection: css`
    text-align: center;
    margin-bottom: 40px;
  `,

  formHeading: css`
    color: white !important;
    font-weight: 800 !important;
    margin-bottom: 8px !important;
  `,

  formSubtitle: css`
    color: #8c8c8c;
    font-size: 14px;
  `,

  form: css`
    .ant-form-item-label > label {
      color: #cbd5e0 !important;
      font-weight: 500;
    }

    /* Target both standard and password inputs */
    .ant-input-affix-wrapper, 
    .ant-input, 
    .ant-input-password {
      background: rgba(255, 255, 255, 0.03) !important;
      margin-left: 10px !important;
      color: white !important;
      padding: 10px 14px;
      border-radius: 8px;
      outline: none !important; /* Removes browser default */
      box-shadow: none !important; /* Removes AntD default blue glow */

      &:hover, &-focused, &:focus {
        border-color: ${token.colorPrimary} !important;
        background: rgba(255, 255, 255, 0.05) !important;
        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1) !important;
      }

      input {
        background: transparent !important;
        color: white !important;
        &::placeholder {
          color: #666;
        }
      }

      /* Fix for the eye icon and user icons */
      .anticon {
        color: #666;
      }
    }

    .ant-btn-primary {
      height: 48px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 4px 12px rgba(24, 144, 255, 0.25);
      border: none;
    }
  `,



  divider: css`
    margin: 24px 0 !important;
    border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
    span {
      color: #666 !important;
      font-size: 12px;
      background: transparent !important;
    }
  `,

  socialButton: css`
    width: 100%;
    height: 48px;
    background: transparent !important;
    color: white !important;
    border: 1px solid #4e545f !important;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    
    &:hover {
      background: rgba(255, 255, 255, 0.05) !important;
      border-color: white !important;
    }
  `,

  checkBoxContainer: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    a {
      font-size: 14px;
      color: ${token.colorPrimary};
      transition: opacity 0.2s;
      &:hover {
        opacity: 0.8;
      }
    }
  `,

  checkbox: css`
    color: #cbd5e0;
    span:last-child {
        color: #cbd5e0;
    }
    
    /* Next.js Links inside checkboxes (Terms) */
    a {
        color: ${token.colorPrimary};
        margin-left: 4px;
    }
  `,

  footerLinkSection: css`
    text-align: center;
    margin-top: 32px;
    color: #8c8c8c;

    a {
      font-weight: 600;
      color: ${token.colorPrimary};
      margin-left: 4px;
    }
  `,


  footerLinkText: css`
    color: #8c8c8c;
  `
}));