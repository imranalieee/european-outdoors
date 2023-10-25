import Styled from "styled-components";

const HeaderWrapper = Styled.div`
position: fixed;
top: 0;
width: 100%;
z-index:999;
    .MuiPaper-root {
        box-shadow:none;
    }
    .header-menu{
        display: flex;
        align-items: center;
        span:first-child{
            font-size: 12px;
            text-align: center;
        }
        span:nth-child(2){
            margin-left: 4px;
            font-size: ${({ theme }) => theme.colors.baseFontSize};
            color: ${({ theme }) => theme.colors.bodyText};
            font-weight:600;
            letter-spacing: 0.09px;

        }
    }
    .MuiMenuItem-root{
        padding-left:18px;
        padding-right:18px;
    }
.active{
    .MuiMenuItem-root{

                 span:first-child{
                    &::before{
                        color: ${({ theme }) => theme.colors.primaryColor};
                    }
                 }
                span:nth-child(2){
                        color: ${({ theme }) => theme.colors.primaryColor};
                }
        }
        a{
            text-decoration:none;
        }
    }
    .header-button{
        gap:12px;
        li{
            width: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding:0;
            button{
                padding-left:0;
                padding-right:0;
                font-size:14px;
                &:hover{
                background:none;
                }
            }
            &:hover{
                background:none;
            }
        }
        & > button{
            padding-left:0;
            &:hover{
                background:none;
            }
        }
    }
    .container-padding{
        padding-left: 14px;
        padding-right: 13px;
        .MuiToolbar-root {
            min-height:48px;
        }
    }
    .MuiBadge-badge{
        background-color:${({ theme }) => theme.colors.dangerColor}; ;
    }
`;

export default HeaderWrapper;
