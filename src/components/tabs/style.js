import Styled from 'styled-components';
import Box from '@mui/material/Box';

const TabsWrapper = Styled(Box)`
 // beacause tab take bydefault padding so we use important
 .MuiTabs-root{
   min-height:0px;
 } 
    padding: 0 !important;
    .MuiTabs-flexContainer {
      justify-content:${(props) => (props.center ? 'center' : 'left')};
      gap:12px;
    }
    &.view-order-tabs{
      .MuiTabs-flexContainer {
      gap:0px;
    }
    }
    .MuiTab-root {
                 position: relative;
                  color: ${({ theme }) => theme.colors.labelColor};
                    font-size: ${({ theme }) => theme.colors.baseFontSizeXs};
                  justify-content:flex-start;
                    min-width:17px;
                    padding:${(props) => (props.center
    ? '8px 12px'
    : props.customPadding
      ? props.customPadding
      : '6px 11px 7px 12px')};
                    min-height:14px;
                    font-weight:600;
                    letter-spacing: 0.06px;
              &.Mui-selected {
                     color: ${({ theme }) => theme.colors.primaryColor};
              }
    }
    .MuiTabs-indicator {
         background-color: ${({ theme }) => theme.colors.primaryColor};
         bottom:0px;
    }
    &.order-custom-tabs{
      & > .MuiTabs-root{
        position:sticky;
        top:48px;
        background-color: #ffffff;
        border-bottom: 1px solid rgb(151, 151, 151, 0.25);
        z-index: 999;
      }
    }
`;

export default TabsWrapper;
