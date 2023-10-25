import Styled from 'styled-components';

const DatePickerWrapper = Styled.div`
.MuiInputBase-root{
    padding-right:0px;
    height:0px;
}
.MuiSvgIcon-root{
    width:14px;
    height:14px ;
    padding:0;
}
.MuiInputBase-input {
    padding:0px;
    max-width:0px;
    &:hover{
       .MuiOutlinedInput-notchedOutline {
    border-color:transparent;
} 
    }
}
.MuiOutlinedInput-notchedOutline {
    border-color:transparent;
    display:none ;
}
`;
export default DatePickerWrapper;
