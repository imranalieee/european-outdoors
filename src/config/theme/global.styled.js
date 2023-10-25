import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
    body{

        font-size:${({ theme }) => theme.colors.baseFontSize};
        font-weight:400;
        line-height:normal;
        font-family: 'Inter';
    }
    h1,h2,h3,h4,h5,h6{
        font-weight:700;
         color:${({ theme }) => theme.colors.checkBoxColor}
    }
    a{
        color:${({ theme }) => theme.colors.primaryColor};
        text-decoration:none;
    }
    ul{
        margin:0;
        padding:0;
        list-style:none;
      }
    .title{
        font-size:${({ theme }) => theme.colors.baseFontSizeXl};
        line-height:44px;
        margin-bottom:32px;
    }
    h1{
        font-size:${({ theme }) => theme.colors.baseFontSizeXl};
    }
    h2{
        font-size:${({ theme }) => theme.colors.baseFontSizeLg};
        line-height:28px;
    }
    h3{
        font-size:${({ theme }) => theme.colors.baseFontSizeSm}
    }
    button{
        font-size:${({ theme }) => theme.colors.baseFontSize} 
    }
    .pt-0{
        padding-top:4px ;
    }
    .pl-2{
        padding-left:8px;
    }
    .label-color{
               color:${({ theme }) => theme.colors.tableBody}
    }
    .MuiDivider-root{
        border-color:${({ theme }) => theme.colors.labelColor}!important;
    }
    label{
    font-size: ${({ theme }) => theme.colors.baseFontSizeXs};
    color: ${({ theme }) => theme.colors.labelColor};
    margin-bottom:4px;
 }
 .steps-divider{
  width: 62px;
  margin-right: 13px !important;
  margin-left: 13px !important;
  @media (max-width: 400px) {
    width: 31px;
  }
 }
 .icon-primay-color{
     &::before{
                 color:${({ theme }) => theme.colors.primaryColor};
     }
 }
    .form-label{
        color:${({ theme }) => theme.colors.labelColor};
        &.stripe-label{
            margin-bottom:4px;
        }
    }
    .mt-lg{
        margin-top:32px;
    }
    .stripe-input{
        border: 1px solid ${({ theme }) => theme.colors.secondaryVariant};
        line-height:18px;
        border-radius:4px;
        color: ${({ theme }) => theme.colors.bodyText};
        font-size: ${({ theme }) => theme.colors.baseFontSize};
        height:32px;
        padding:6px 11px;
    }
    .content-wrapper{
        padding:30px 24px;
    }
    .primary-color{
        color:${({ theme }) => theme.colors.primaryColor};
    }
    .cursor-pointer{
        cursor:pointer;
    }
    .text-success{
        color:${({ theme }) => theme.colors.accentColorSuccess}!important;
    }
    .text-default{
        color:${({ theme }) => theme.colors.labelColor}!important;
    }
    .text-error{
        color:${({ theme }) => theme.colors.dangerColor}!important;   
    }
    .pointer{
        cursor: pointer;
    }
    .icon-lock{
        &.active{
            &::before{
                color:${({ theme }) => theme.colors.primaryColor};  
            }
        }
    }
    .badge{
    border-radius:50px ;
    padding:4px 8px ;
    font-size:${({ theme }) => theme.colors.baseFontSizeXs};
    font-weight:600;
    height:22px;
    display:inline-block;
    &.success   {
    color:${({ theme }) => theme.colors.accentColorSuccess};
    background-color:${({ theme }) => theme.colors.accentColorSuccess}10 ;
    border:1px solid ${({ theme }) => theme.colors.accentColorSuccess};
    letter-spacing: 0;
    }
    &.started{
        color:${({ theme }) => theme.colors.informationText};
        background-color:${({ theme }) => theme.colors.informationText}10 ;
        border:1px solid ${({ theme }) => theme.colors.informationText};
    }
    &.progress{
        color:${({ theme }) => theme.colors.accentColorWarning};
        background-color:${({ theme }) => theme.colors.accentColorWarning}10 ;
        border:1px solid ${({ theme }) => theme.colors.accentColorWarning};
    }
    &.failed{
        color:${({ theme }) => theme.colors.dangerColor};
        background-color:${({ theme }) => theme.colors.dangerColor}10 ;
        border:1px solid ${({ theme }) => theme.colors.dangerColor};
    }
    &.primary{
    color:${({ theme }) => theme.colors.primaryColor};
    background-color:${({ theme }) => theme.colors.primaryColor}10 ;
    border:1px solid ${({ theme }) => theme.colors.primaryColor};
    }
    &.commit{
    color:${({ theme }) => theme.colors.accentColorPrimary};
    background-color:${({ theme }) => theme.colors.accentColorPrimary}10 ;
    border:1px solid ${({ theme }) => theme.colors.accentColorPrimary};
    }
    &.archived{
        color:${({ theme }) => theme.colors.labelColor};
        background-color:${({ theme }) => theme.colors.labelColor}10 ;
        border:1px solid ${({ theme }) => theme.colors.labelColor};
        }
    &.warning{
        color:${({ theme }) => theme.colors.accentColorWarningVariant};
        background-color:${({ theme }) => theme.colors.accentColorWarningVariant}10 ;
        border:1px solid ${({ theme }) => theme.colors.accentColorWarningVariant};  
        }
    &.closed{
        color:#08979C;
        background-color:rgba(8, 151, 156, 0.05);
        border:1px solid #08979C;  
        }
    }

    .permission-menu{
        .MuiList-root {
            .MuiCheckbox-root {
                font-size:${({ theme }) => theme.colors.baseFontSize} ;
                color:${({ theme }) => theme.colors.bodyText};
                 padding: 6px 16px;

            }
            .MuiButtonBase-root{
                .Mui-focusVisible{
                    background:transparent;
                }
            }
        }
        &.lock-menu{
              .MuiList-root {
            .MuiButtonBase-root{
                 padding: 4px 12px;

            }
        }
        }
    }
        .rounded-image{
       border: 1px solid #3C76FF;
       padding: 8px;
       width: 125px;
       height: 125px;
        border-radius: 50%;
    }
    .MuiList-root {
        .MuiButtonBase-root {
                font-size:${({ theme }) => theme.colors.baseFontSize} ;
        }
    }
      .drawer-list{
          padding-top:5px!important;
      .MuiListItem-root {
        float:left;
        width:151px;
      }
    }
    .user-list{
        padding-top:0px!important;
        .MuiListItem-root {
        float:left;
        width:224px;
      } 
    }
     .password-strength{
        top:1px;
        div{
            margin: 2px 0 0 !important;
        }
          div{
            width:177px;
            div{
              height:4px!important;
              margin: 0;
              position:relative;
              &:nth-child(1){
                &:before{
                content:'';
                height:4px;
                background-color:#F9FAFC;
                width: 4px;
                position:absolute;
                left:19px;
              }
              }
              &:nth-child(3){
                &:before{
                content:'';
                height:4px;
                background-color:#F9FAFC;
                width: 4px;
                position:absolute;
                left:19px;
              }
              }
              &:nth-child(5){
                &:before{
                content:'';
                height:4px;
                background-color:#F9FAFC;
                width: 4px;
                position:absolute;
                left:19px;
              }
              }
              &:nth-child(7){
                &:before{
                content:'';
                height:4px;
                background-color:#F9FAFC;
                width: 4px;
                position:absolute;
                left:19px;
              }
              }
            }
        }
    }
    .Toastify__progress-bar {
    width: 6px;
    height: 100%;
    }
    .Toastify__toast-icon{
        width:16px;
        margin-inline-end: 13px;
    }
    .Toastify__toast-container{
    min-width:442px;
    }
    .Toastify__toast-body{
        padding: 10px 6px;
    }
    .Toastify__close-button{
            position: absolute;
            right: 6px;
            top: 10px;
    }
    .sm-fontSize{
        &::before{
            font-size:8px ;
        }
        &.primary{
            &::before{
                color:${({ theme }) => theme.colors.primaryColor};
            }
        }
    }
    .status{
        width:6px;
        height:6px;
        border-radius:50px;
        display:inline-block;
        &.success{
        background-color:${({ theme }) => theme.colors.accentColorSuccess};
        }
        &.warning{
           background-color:${({ theme }) => theme.colors.accentColorWarning};
        }
        &.danger{
               background-color:${({ theme }) => theme.colors.dangerColor};
        }
        &.info{
            background-color:${({ theme }) => theme.colors.primaryColor};
     }
    }
    .pack{
        &.disabled{
            .icon-products {
                &::before{
                      color:${({ theme }) => theme.colors.inputBorder};
                }
            }
           color:${({ theme }) => theme.colors.inputBorder};
        }
        &.active{
             .icon-products {
                &::before{
                      color:${({ theme }) => theme.colors.primaryColor};
                }
            }
           color:${({ theme }) => theme.colors.primaryColor};
        }
    }
    .MuiIconButton-root{
        .MuiSvgIcon-root {
          color:${({ theme }) => theme.colors.primaryColor};
        }
    }
        .icon-Save{
        &.color-primary{
            &::before{
                         color:${({ theme }) => theme.colors.primaryColor};
            }
        }
    }
    .step-active{
        hr{
            border-color:${({ theme }) =>
        theme.colors.accentColorSuccess}!important;
            opacity: 1;
        }
    }
    .MuiPickersLayout-root {
        .MuiPickersCalendarHeader-label{
               font-size:${({ theme }) => theme.colors.baseFontSize} ;
        }
        .MuiDayCalendar-header {
            .MuiDayCalendar-weekDayLabel{
                      font-size:${({ theme }) => theme.colors.baseFontSize} ;
            }
        }
        .MuiPickersDay-root {
         font-size:${({ theme }) => theme.colors.baseFontSize} ;
        }
    }
    .product-name-clamp{
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;  
        overflow: hidden;
        span{
            white-space: normal;
        }
    }
.icon-print,.icon-left-arrow,.icon-edit{
    &.disabled{
        &::before{
                color:${({ theme }) => theme.colors.labelColor};
        }
    }
}
.icon-trash{
    &.disabled{
        &::before{
                color:${({ theme }) => theme.colors.labelColor};
        }
      }
}
    .hover-image{
        position:relative;
        min-width: 40px;
        min-height:40px;
        img{
         transform-origin: 20% 40%;
        transition: transform 0.5s, filter 0.5s ease-in-out, z-index 1s ease-out;
        transform-origin: top left;
        position:relative;
        z-index: 0;
        }
        &:hover{
            img{
               filter: brightness(100%);
                transform: scale(4.6);
                position: absolute;
                box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.16);
                border-radius: 2px;
                z-index: 1;
                transition: transform 0.5s, filter 0.5s ease-in-out, z-index 0s ease-in;
            }
        }
    }
    .product-name-clamp{
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;  
        overflow: hidden;
        span{
            white-space: normal;
        }
    }
    .MuiTooltip-popper{
        &.custom-tooltip{
            .MuiTooltip-tooltip{
                background: ${({ theme }) => theme.colors.onPrimary};
                color: ${({ theme }) => theme.colors.bodyText};
                padding:11px 12px;
                border: 1px solid ${({ theme }) => theme.colors.inputBorder};
                box-shadow:0px 3px 6px rgba(0, 0, 0, 0.12);
                &.onImage{
                    min-width:224px
                }
                
            }
            .MuiTooltip-arrow{
                color:  ${({ theme }) => theme.colors.onPrimary};
                &:before{
                    border: 1px solid #d9d9d9;
                }
            }
        }
    }
    .payment-details-content{
        label{
            line-height:14px;
        }
        .MuiButton-text{
            .MuiButton-startIcon{
                margin-right:4px;
                .icon-edit{
                    font-size: 12px;
                }
            }
        }
    }
    .transform-none{
        text-transform: none!important;
    }
    .icon-reload-custom{
        font-size: 16px;
        line-height: 13px;
    }
    .MuiAutocomplete-noOptions {
        font-size: 14px;
        font-weight: 400;
        line-height: 17px;
    }
    .nodata-table-img{
        max-width: 100%;
        max-width: 100%;
        /* position: absolute;
        top: 54%;
        left: 50%;
        transform: translate(-50%, -50%);
        height: 57vh; */

    }
    .recieving-scan .MuiInputBase-input{
        padding:6px 28px 5px 17px!important;
    }
    .menu-export-as{
        .MuiPaper-root.MuiMenu-paper{
            width: 110px;
        }
    }
    .icon-Save.icon-save-custom{
        color:${({ theme }) => theme.colors.primaryColor};
        &:before{
            color:${({ theme }) => theme.colors.primaryColor};
        }
    }
    .filename-ellipses{
        max-width: 200px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .icon-batch-custom{
        margin-top:-3px;
    }
    .order-workflow-boxes{
        max-height: 250px;
        overflow: auto;
    }
    @media all {
  .page-break {
    display: none;
  }
}

.print-document-only{
    display: none;
   }
   .print-document-flex{
    display:none!important;
   }
   .barcode-title-custom{
    word-wrap:break-word;
   }
  @media print {
   .page-break {
    margin-top: 1rem;
    display: block;
    page-break-before: always;
   }
   .print-document-only{
    display: block;
   }
   .print-document-flex{
    display:flex!important;
   }
  }

@media print {
  html, body {
    height: initial !important;
    overflow: initial !important;
    -webkit-print-color-adjust: exact;
  }
  .page-break {
    page-break-before: always;
  }
}

@page {
  size: auto;
  margin: 10mm;
  margin-top:15mm;
  margin-bottom: 20mm
}
.included-marketplace {
    padding-top:15px;
    .platform-list {
      ul {
        display: flex;
        li {
          border-right: 1px solid #000000;
          padding-left:5px;
          padding-right:5px;
          &:last-of-type {
            border-right: 0;
          }
        }
      }
    }
  }
  .column-ellipses-clamp{
    max-width: 250px;
    min-width:150px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .alert-progress{
    .MuiAlert-icon {
        font-size:12px;
        margin-right:8px;
    }
  }
`;
export default GlobalStyles;
