import Styled from 'styled-components';
import { Box } from '@mui/material';

const SearchWrapper = Styled(Box)`
 label{
    font-size: ${({ theme }) => theme.colors.baseFontSizeXs};
    color: ${({ theme }) => theme.colors.labelColor};
    margin-bottom:5px;

 }
 .MuiInputBase-input{
    height:${(props) => (props.height ? `${props.height}` : '')};
    font-size:${(props) => (props.large ? '16px' : '')};
   font-weight:${(props) => (props.large ? '700' : '')};
 }
`;

export default SearchWrapper;
