import Styled from 'styled-components';
import Autocomplete from '@mui/material/Autocomplete';

const AutoCompleteWrapper = Styled(Autocomplete)`
    svg{
              color:${({ theme }) => theme.colors.primaryColor};
               font-size: ${({ theme }) => theme.colors.baseFontSizeMediumSmal};
    }
    .MuiInputBase-root {
                       font-size: ${({ theme }) => theme.colors.baseFontSize};
                       padding-top:4px!important;
                    padding-bottom:4px!important;
    }
    .MuiAutocomplete-endAdornment {
        top: calc(50% - 10px);
    }
`;

export default AutoCompleteWrapper;
