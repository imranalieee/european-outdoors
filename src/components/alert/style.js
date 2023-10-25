import Styled from 'styled-components';
import Alert from '@mui/material/Alert';

const AlertWrapper = Styled(Alert)`
    &.MuiAlert-root {
        font-size:12px;
        padding:2px 0px 0px 4px;
        &.MuiAlert-standardWarning{
            color:${({ theme }) => theme.colors.accentColorWarning};
            background-color:${({ theme }) => theme.colors.accentColorWarning}0d;
        }
        &.alert-workflow{
            font-weight: 400;
            line-height: 14px;
            background-color:${({ theme }) => theme.colors.accentColorWarning}0d;
            border: 1px solid ${({ theme }) => theme.colors.accentColorWarning};
            text-align:left;
            color:${({ theme }) => theme.colors.tableBody};
            justify-content:left;
            padding:7.5px 12px;
            display: flex;
            align-items: center;
            width:100%;
            margin-bottom:0;
            .MuiAlert-message{
                padding:0;
                letter-spacing:0;
            }
            .MuiAlert-icon{
                padding-top:0;
                padding-bottom:0;
                margin-right:8px;
                color:${({ theme }) => theme.colors.accentColorWarning};
                .MuiSvgIcon-root{
                    font-size:15px;
                }
            }
        }
        &.alert-progress{
            position:fixed;
            top: 72px;
            left: auto;
            right: 24px;
            z-index:1040;
            max-width:326px;
            padding-left:16px;
            padding-top:8px;
        }
    }
    &.MuiAlert-standardInfo{
        color:${({ theme }) => theme.colors.bodyText};
        background-color:${({ theme }) => theme.colors.accentOutlineInfo};
    }
    &.MuiAlert-standardSuccess{
        color:${({ theme }) => theme.colors.accentColorSuccess};
        background-color:${({ theme }) => theme.colors.accentColorSuccess}05 ;
            padding:4px 0px 0px 4px;
    }
     margin-bottom: ${(props) => (props.marginBottom ? `${props.marginBottom}` : '16px')};
    justify-content: center;

`;

export default AlertWrapper;
