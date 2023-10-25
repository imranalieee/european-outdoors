import Styled from 'styled-components';

const RadioBoxWrapper = Styled.span`
display:block ;
.MuiTypography-root  {
    color: ${({ theme }) => theme.colors.checkBoxColor};
    font-size: ${({ theme }) => theme.colors.baseFontSize};
           margin-left: -1px;
           letter-spacing: 0px;
}

.MuiButtonBase-root {
 padding: ${(props) => (props.padding ? props.padding : '0')};
}
.MuiFormControlLabel-root {
            margin: 0;
    }
`;

export default RadioBoxWrapper;
