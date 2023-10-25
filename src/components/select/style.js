import Styled from 'styled-components';
import Select from '@mui/material/Select';

const SelectWrapper = Styled(Select)`
        max-height:32px;
    .MuiOutlinedInput-root{
        background-color:#000;
    }
    .MuiSelect-select{
        padding: 5px 12px;
        font-size: ${({ theme }) => theme.colors.baseFontSize};
        color:${({ theme }) => theme.colors.labelColor};
        
    }
    svg{
              color:${({ theme }) => theme.colors.primaryColor};
               font-size: ${({ theme }) => theme.colors.baseFontSizeMediumSmal};
               right:10px;
    }
    .MuiMenuItem-root{
        border-bottom: 1px solid black !important;

    }
`;

export default SelectWrapper;
