import Styled from 'styled-components';

const SearchInputWrapper = Styled.div`
  input:placeholder-shown {
    text-overflow: ellipsis;
  }
  .return-arrow {
    font-size: 24px;
    position: absolute;
    right: 10px;
    top: 18px;
  }
  input {
    border: 1px solid #cfd8dc;
    height: 32px;
    width: 184px;
    border-radius: 4px;
    min-width: ${(props) => props.width};
    font-size: ${({ theme }) => theme.colors.baseFontSize};
    line-height: 18px;
  }
  svg {
    font-size: 12px;
    position: absolute;
    right: 10px;
    top: 9px;
    color: ${({ theme }) => theme.colors.primaryColor};
  }
`;

const InputWrapper = Styled.div`    
 margin-bottom: ${(props) => (props.marginBottom ? `${props.marginBottom}` : '16px')};

 .outlined-input{
    height: ${(props) => (props.height ? `${props.height}` : '32px')};
    border-radius: 4px;
    background: ${(props) => (props.background ? `${props.background}` : '#FCFCFC')};
    font-size: ${({ theme }) => theme.colors.baseFontSize};
    font-weight: ${({ theme }) => theme['semibold-weight']};
    color: ${({ theme }) => theme.colors.tableBody};
    padding-right:0px!important;
    letter-spacing:0;
    input{
       padding:8px 12px;
       text-align: ${(props) => (props.align ? `${props.align}` : 'left')};
           &::placeholder{
            font-size:13px;
            color: ${({ theme }) => theme.colors.labelColor};
          opacity: 0.5;
    }
    }
    input[type='date']{
      padding:8px 8px 8px 12px;
    }

     padding-right: 10px;
     &.MuiInputBase-multiline{
      height:auto;
     }
     &.input-textarea{
      padding: 6px 12px;
     }
     .password-icon-box{
      padding-right:12px;
      color: ${({ theme }) => theme.colors.primaryColor};
      font-size:16px;
      cursor:pointer;
     }
     &.input-textarea{
      padding:8px 12px 10px;
      min-height:179px;
      &.input-textarea-custom{
        padding-top:35px;
        align-items: start;
        min-height:80px;
      }
      .MuiInputBase-input{
        margin-top:-27px;
      }
     }
 }
 .table-input-small{
  background: ${({ theme }) => theme.colors.background};
  input{
    height:30px;
    padding:0;
    text-align:center;
    font-weight: 700;
    font-size: 16px;
    line-height: 20px;
    color: ${({ theme }) => theme.colors.bodyText};
  }
  .MuiOutlinedInput-notchedOutline{
    border-color: ${({ theme }) => theme.colors.background};
  }
  &:hover{
    .MuiOutlinedInput-notchedOutline{
      border-color:#d9d9d9;
    }
  }
 }
 .helper-text{
   font-size: 10px;
   // color: ${({ theme }) => theme.colors.dangerColor};
   margin-left: 0;
   position:absolute;
   letter-spacing:0;
    bottom: -18px;
    margin-left: 0;
 }
input[type="date"]::-webkit-calendar-picker-indicator {
    opacity: 1;
    display: block;
    background: url("https://european-outdoors.s3.amazonaws.com/date-icon.svg") no-repeat;
    width: 12px;
    height: 12px;
    margin-top:6px;
}

      input[type=number]::-webkit-inner-spin-button,
      input[type=number]::-webkit-outer-spin-button {
        opacity: 0;
        display:none;
      }
`;
export { SearchInputWrapper, InputWrapper };
