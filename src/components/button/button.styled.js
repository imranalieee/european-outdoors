import Styled from 'styled-components';
import Button from '@mui/material/Button';

const ButtonWrapper = Styled(Button)`
  &.MuiButtonBase-root {
    box-shadow:none;
    height:${(props) => (props.height ? `${props.height}` : '32px')};
    font-size: ${({ theme }) => theme.colors.baseFontSize};
    text-transform: ${(props) => (props.textTransform ? `${props.textTransform}` : 'capitalize')};
    justify-content: ${(props) => (props.justifyContent ? `${props.justifyContent}` : 'center')};
    background: ${(props) => (props.variant === 'contained' ? props.theme.colors.primaryColor : '')};
    min-width: ${(props) => `${props.width || ''}`};
    max-width: ${(props) => `${props.width || ''}`};
    color: ${(props) => (props.variant === 'contained'
    ? props.theme.colors.onPrimary
    : props.theme.colors.primaryColor)};
    font-weight:  ${({ theme }) => theme['bold-weight']};
    border-radius: ${(props) => (props.borderRadius ? `${props.borderRadius}` : '4px')};
    border-color:${(props) => (props.variant === 'text' ? '' : props.theme.colors.primaryColor)};
    border:${(props) => (props.variant === 'text'
    ? ''
    : `1px solid ${props.theme.colors.primaryColor}`)};  
    padding:${(props) => (props.padding ? `${props.padding}` : '4px 16px 4px 16px')};
    font-weight:600;
    letter-spacing:0px;
    &.MuiButton-textError{
         color: ${({ theme }) => theme.colors.dangerColor};
         border-color: ${({ theme }) => theme.colors.dangerColor};
          .MuiButton-startIcon{
            margin-right:6px;
             span{
               &::before{
                   color: ${({ theme }) => theme.colors.dangerColor};
               }
             }
           }
    }
    &.Mui-disabled{
           color: ${({ theme }) => theme.colors.labelColor};
            border-color: ${({ theme }) => theme.colors.labelColor};
           .MuiButton-startIcon{
             span{
               &::before{
                   color: ${({ theme }) => theme.colors.labelColor};
               }
             }
           }
           svg{
            color: ${({ theme }) => theme.colors.labelColor};
           }
    }
    .MuiButton-startIcon {
      font-size:16px;
      span,.MuiSvgIcon-root{
       font-size:16px;
       &::before{
      color: ${(props) => (props.variant === 'contained'
    ? props.theme.colors.onPrimary
    : props.theme.colors.primaryColor)};
       }

      }
    }
    &:hover{
      box-shadow:none;
    }
    &.btn-large{
      padding:0 59px;
    }
    &.btn-small{
          font-size: ${({ theme }) => theme.colors.baseFontSizeXs};
    }
    &.icon-button{
           &.danger-button{
             .MuiButton-startIcon {
              .icon-trash {
                &::before{
                            color: ${({ theme }) => theme.colors.dangerColor};
                }
              }
      }
      }
      .MuiButton-startIcon {
        margin:0;

      }
        padding: 0px 6px;
        min-width: 32px
    }
    &.icon-button.Mui-disabled{
      &.danger-button{
             .MuiButton-startIcon {
              .icon-trash {
                &::before{
                  color: ${({ theme }) => theme.colors.labelColor};
                }
              }
      }
      }
  
    }
    &.MuiButton-text{
      &.btn-text-custom{
      padding:0;
      min-height:10px;
      height:18px;
      &:hover{
        background:transparent;
      }
    }
    }
  }

`;

export default ButtonWrapper;
