import styled from 'styled-components';
import Popover from '@mui/material/Popover';

const PopoverWrapper = styled(Popover)`
  .MuiPopover-paper {
    background: #ffffff;
    border: 1px solid #d9d9d9;
    box-shadow: 0px 0px 1px #cacaca;
    border-radius: 4px;
    .popover-title {
      margin-bottom: 16px;
      font-weight: 700;
      font-size: 16px;
      line-height: 20px;
      color: #002050;
    }
  }
  &.approve-popover {
    .MuiPopover-paper {
      padding: 0;
    }
    .popover-content-custom{
      padding: 16px;
    }
    .approve-table{
        height:auto;
        max-height: 222px;
        .MuiTable-root{
            min-width:400px;
        }
    }
  }
`;
export { PopoverWrapper };
