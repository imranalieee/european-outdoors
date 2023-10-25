import Styled from 'styled-components';

const RadioWrapper = Styled.span`
margin-bottom: ${(props) => (props.marginBottom ? props.marginBottom : '0')};
.MuiTypography-root  {
    color: ${({ theme }) => theme.colors.checkBoxColor};
    font-size: ${({ theme }) => theme.colors.baseFontSize};
           margin-left: -1px;
           letter-spacing: 0px;
}
.header-checkbox{
    .MuiButtonBase-root {
        padding:0
    }
    .MuiFormControlLabel-root {
            margin: 0;
    }
}
.body-checkbox{
        .MuiButtonBase-root {
        padding:0
    }
    .MuiFormControlLabel-root {
            margin: 0;
    }
}
.MuiButtonBase-root {
 padding: ${(props) => (props.padding ? props.padding : '')};
}
`;

export default RadioWrapper;
