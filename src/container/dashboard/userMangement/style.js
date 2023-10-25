import styled from 'styled-components';

const UserMangementWrapper = styled.div`
    .info-box{
        span:nth-child(1){
         color: ${({ theme }) => theme.colors.labelColor};
         font-size:${({ theme }) => theme.colors.baseFontSizeXs};
         padding-bottom: 5px;
        }
        span:nth-child(2){
         color: ${({ theme }) => theme.colors.tableBody};
        }
    }
    .edit-icon{
        border: 1px solid #3C76FF;
        position: absolute;
        padding: 4px;
        top: 104px;
        left: 95px;
        width: 24px;
        height: 24px;
        text-align: center;
        background-color: #fff;
    
    .padding-none{
        padding-top:2px;   
    }
}
`;

export default UserMangementWrapper;
