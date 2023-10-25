import Styled from "styled-components";

const UploadWrapper = Styled.div`
    padding-left:0px;
    padding-right:0;
    min-width:422px;
    margin: 0 auto;
.input-type{
    position: relative;
    input{
        position: absolute;
        opacity: 0;
        width: 100%;
        height: 100%;
    }
    input[type="file"] {
         cursor: pointer;
    }
    .uploaded-image-desc{
        font-size: ${({ theme }) => theme.colors.baseFontSizeXs};
        color: ${({ theme }) => theme.colors.labelColor};
    }
    
}
.upload-file{
    border: 1px dashed ${({ theme }) => theme.colors.inputBorder};;
    border-radius: 5px;
    padding:34px 20px;
    margin-bottom:5px;
    .upload{
        .icon-upload{
            font-size:30px;
            color:${({ theme }) => theme.colors.primaryColor};
        }
        span:nth-child(2){
            font-size: ${({ theme }) => theme.colors.baseFontSize};
            font-weight:400;   
            color: ${({ theme }) => theme.colors.bodyText};
            margin-top: 27px;
            margin-bottom: 26px;
        }
    }
}
&.view-order-upload{
    min-width:100px;
    .upload-file{
        padding:16px 20px;
        margin-bottom:0;
        span:nth-child(2){
            max-width:109px;
            text-align:center;
            margin-top: 22px;
    margin-bottom: 17px;
        }
    }
}
&.po-upload {
        min-width:100%;
        .upload-file{
            padding:21px 20px 18px;
            margin-bottom:0;
            .upload{
                span:nth-child(2){
                    margin-top: 23px;
                    margin-bottom: 19px;
                }
            }
        }
      
    }
`;
export default UploadWrapper;
