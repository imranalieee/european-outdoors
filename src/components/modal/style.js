import styled from 'styled-components';
import { Dialog } from '@mui/material';

const ModalWrapper = styled(Dialog)`
  .MuiDialog-paper {
    background-color: ${({ theme }) => theme.colors.surface};
    .MuiFormControl-root .MuiFormLabel-root.MuiInputLabel-shrink {
      background-color: ${({ theme }) => theme.colors.surface};
    }
  }
  .MuiDialogTitle-root,
  .MuiDialogContent-root,
  .MuiDialogActions-root {
    padding: 48px;
  }
  .MuiDialogContent-root {
    padding-top: 0;
    padding-bottom: 24px;
    .MuiIconButton-root{
      padding:0;
      right:32px;
      top:32px;
      svg{
        margin-bottom:0;
        color:${({ theme }) => theme.colors.secondaryColor};
      }
    }
    .MuiBox-root {
      max-width: 296px;
      margin: 0 auto;
    }
 
    h2 {
      font-weight: 800;
      font-size: 24px;
      line-height: 28px;
      letter-spacing: 0.02em;
      color: ${({ theme }) => theme.colors.onPrimary};
      margin-bottom: 24px;
    }
    p {
      font-weight: 300;
      font-size: 16px;
      line-height: 24px;
      /* or 150% */

      text-align: center;

      /* H1 Color */

      color: ${({ theme }) => theme.colors.onPrimary};
    }
  }
  .MuiDialog-root {
    padding-bottom: 32px;
    border-bottom: 0px;
  }
  .MuiDialogTitle-root {
    font-size: ${({ theme }) => theme.colors.baseFontSizeLg};
    font-weight: 800;
    line-height: 28px;
    letter-spacing: 0.02em;
    color: ${({ theme }) => theme.colors.onPrimary};
    padding-bottom: 32px;
  }
  .MuiDialogActions-root {
    border-top: 0px;
    padding-top: 24px;
  }
`;
export default ModalWrapper;
