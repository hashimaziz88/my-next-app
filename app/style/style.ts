import {createStyles, css} from 'antd-style';

export const useStyles = createStyles(({ token }) => ({

    container: css`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: radial-gradient(circle at 0% 0%, #3a3f47 0%, #1a1c22 100%);
    padding: 24px;
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

  heroSection: css`
    text-align: center;
    max-width: 600px;
    z-index: 1;
  `,

  heroTitle: css`
    color: white !important;
    font-size: 64px !important;
    font-weight: 800 !important;
    margin-bottom: 16px !important;
    background: linear-gradient(to bottom, #ffffff 30%, #8c8c8c 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  `,

  heroSubtitle: css`
    color: #cbd5e0;
    font-size: 18px;
    display: block;
    margin-bottom: 24px;
  `, 
  // Add to your useStyles in style.ts
logoContainer: css`
  margin-bottom: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  
  /* Adds a subtle glow to the logo */
  filter: drop-shadow(0 0 8px rgba(24, 144, 255, 0.3));
`,
backgroundGlow: css`
    position: absolute;
    width: 400px;
    height: 400px;
    background: ${token.colorPrimary};
    filter: blur(180px);
    opacity: 0.15;
    top: 10%;
    left: 5%;
    pointer-events: none;
  `,

  imageIcon: css`
    filter: brightness(0) invert(1);
    object-fit: contain;
  `,

  buttonGroup: css`
    display: flex;
    gap: 16px;
    justify-content: center;
    margin-top: 32px;
    
    /* This ensures both Link wrappers treat their children the same way */
    a {
      display: inline-block;
    }
  `,

  actionButton: css`
    width: 140px !important;
    height: 48px !important; /* Force identical height */
    display: flex !important;
    align-items: center;
    justify-content: center;
    font-weight: 600 !important;
    border-radius: 8px !important;
  `,

  // Override for the register button specifically
  registerButton: css`
    background: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid #4e545f !important;
    color: white !important;

    &:hover {
      background: rgba(255, 255, 255, 0.1) !important;
      border-color: white !important;
      color: white !important;
    }
  `,
}));