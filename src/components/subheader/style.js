import Styled from 'styled-components';

const SubHeaderWrapper = Styled.div`
position: sticky;
top: 48px;
width: 100%;
z-index:999;
background-color:#ffffff;
left:0;
padding-left:24px;
padding-right:24px;

margin-bottom:24px;
.subheader-list{
      justify-content:${(props) => (props.center ? 'center' : 'left')};
      gap:12px;
      border-bottom:1px solid rgba(151,151,151,0.50);
}
    .subhead-item{
      .subhead-item-inner{

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
                  }
              &.item-active {
                     .subhead-item-inner{
                      color: ${({ theme }) => theme.colors.primaryColor};
                      &:after{
                        content:'';
                        position: absolute;
                        height: 2px;
                        bottom: 0;
                        width: 100%;
                        -webkit-transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
                        transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
                        background-color: ${({ theme }) => theme.colors.primaryColor};
                        left:0;
                      }
                     }
              }
    }

`;

export default SubHeaderWrapper;
