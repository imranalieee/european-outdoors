import Styled from 'styled-components';

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
    padding:22px 20px;
    margin-bottom:5px;
    .upload{
        margin-left:363px;
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
            margin-left:24px;
        }
    }
    .attachment-name{
        max-width:300px;
        white-space:nowrap;
        overflow: hidden;
        text-overflow:ellipsis;
    }
}
`;
export default UploadWrapper;
