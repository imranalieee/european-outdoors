import styled from 'styled-components';

const StepperStyle = styled.div`
    .stepper-steps{
        margin-bottom:27px;
        margin-left: -68px;
        margin-right: -68px;
        .drawer-fullwidth &{
            margin-left: 140px;
            margin-right: 153px;
        }
            .MuiStepLabel-label{
                color: ${({ theme }) => theme.colors.labelColor};
                font-weight:700;
                font-size: ${({ theme }) => theme.colors.baseFontSizeSm};
                line-height:20px;
                &.Mui-active{
                    color:black;
                }
            }
    }
    .upload-step{
        margin-top:11px;
        .step-title{
            text-align:center;
            display: block;
            margin-bottom:24px;
            font-size: ${({ theme }) => theme.colors.baseFontSizeXs};
            line-height:14px;
            padding-top:11px;
            a{
                margin-left:2px;
            }
        }
        
    }
    .step-mapping{
        label{
            font-size: ${({ theme }) => theme.colors.baseFontSizeXs};
                line-height:12px;
            }
            input{
        
            }
            .position-relative.input-wrapper{
                line-height:12px;
            }
        .EZDrawer__container &{
            width: 100% !important;
        }
        .mapping-header-fields
        {
           margin-left:0px;
           padding-bottom:35px;
            ul{
                padding:0;
                margin:0;
                list-style: none;
                
                li{
                    width: 100%;
                    max-width: 291px;
                    margin-right:30px;
                }
            }
        }
        .mapping-header-options{
            margin-left:-1px;
            h3{
                margin-bottom:20px;
            }
            p.mapping-note{
                margin-top:24px;
                text-align:center;
                font-size: 13px;
                line-height: 16px;
                color:#757575;
                margin-bottom:54px;

            }
            .mapping-header-cols{
                padding-left:1px;
                flex-wrap: wrap;
            }
            .mapping-header-col{
                max-width:130px;
                min-width:130px;
                margin-right:30px;
                width:100%;
                .mapping-header{
                    margin-bottom: 19px;
                    input{
          
                    }
                    select{

                    }
                }
                ul{
                    padding-left: 14px;
                    li{
                        font-size:13px;
                        line-height:16px;
                        margin-bottom:17px;
                        color:#757575;
                    }
                }
            }
        }
        .btn{
            max-width:282px;
            margin:0 auto;
            display:block;
        } 
        .btn.disabled,.btn:disabled{
            background-color:${({ theme }) => theme.colors.labelColor};
            opacity: 1;
        }
        .modal{

        }
    }
    .step-congrats{
        text-align:center;
        padding-top:23px;
        max-width:417px;
        margin:0 auto;
        position:relative;
        /* left:-3px; */
        .step-image{
            margin-bottom:46px;
        }
        h1{
            margin-bottom:26px;
        }
        p{
            line-height:16px;
            color:${({ theme }) => theme.colors.labelColor};
            margin-bottom: 55px;
            /* margin-left: -6px; */
        }
        .btn{
            max-width:274px;
        }
    }
    
`;
export default StepperStyle;
