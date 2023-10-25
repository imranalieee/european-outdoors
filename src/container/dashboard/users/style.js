import styled from 'styled-components';

const UserWrapper = styled.div`
    .menu-button{
     border: 1px solid ${({ theme }) => theme.colors.primaryColor};
     width: 13px;
     height: 13px;
     border-radius:50px;
     padding:3px;
     margin-left:12px;
     cursor:pointer ;
    font-size:10px;
    }
    .rounded-image{
       border: '1px solid #3C76FF';
       padding: 1;
        border-radius: 50%;
    }
`;

export default UserWrapper;
