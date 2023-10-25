import styled from 'styled-components';

const SwitchWrapper = styled.div`
position: relative;
.MuiFormControlLabel-root {
  margin:0;
}
.MuiButtonBase-root.MuiSwitch-switchBase.Mui-checked{
    transform:${(props) => (props.danger ? 'translateX(72px)' : props.translate ? props.translate : 'translateX(44px)')};
    transform:${(props) => (props.largeSwitch ? 'translateX(100px)' : '')};
}
.MuiSwitch-thumb {
  background-color:${(props) => (props.thumbColor ? props.thumbColor : '#3C76FF')};
}
.MuiSwitch-switchBase {
  &::before{
    content:${(props) => (props.offText ? `'${props.offText}'` : `'${'Pack'}'`)};
    color: #fff;
    position: absolute;
    right:${(props) => (props.largeSwitch ? '37px' : props.rightSpacing ? props.rightSpacing : '29px')};
    font-size:11px;
    white-space:nowrap;
  }
   &::after{
  content:${(props) => (props.offText ? `'${props.onText}'` : `'${'Pack'}'`)};
    color: ${({ theme }) => theme.colors.bodyText};
    font-size:11px;
    position:absolute;
    left:${(props) => (props.largeSwitch ? '37px' : props.leftSpacing ? props.leftSpacing : '29px')};
    white-space:nowrap;
  }
}
.Mui-checked {
  .MuiSwitch-thumb {
   background-color:#fff;
}

}
.MuiButtonBase-root {
  &.MuiSwitch-switchBase{
    &.Mui-checked+.MuiSwitch-track{
          background-color:${(props) => (props.danger ? '#E61F00' : '#3C76FF')};
          opacity:1 ;
    }
  }
}
`;

export default SwitchWrapper;
