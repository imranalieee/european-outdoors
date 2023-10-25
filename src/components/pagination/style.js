import styled from 'styled-components';

const PaginationWrapper = styled.div`
    position:${(props) => (props.position ? props.position : 'fixed')};
    width: ${(props) => `calc(100% - ${props.width || '48px'})`};
    bottom: 0;
  max-height:32px;
  .MuiSvgIcon-root {
       color:${({ theme }) => theme.colors.primaryColor};
           font-size:${({ theme }) => theme.colors.baseFontSizeMediumSmal} ;
  }
  .MuiPagination-ul{
    .MuiButtonBase-root {
       color:${({ theme }) => theme.colors.bodyText};
         font-size:${({ theme }) => theme.colors.baseFontSize} ;
         min-width: 13px;
         height: 32px;
         padding: 0px;
         margin: 0 4px;
         /* max-width:13px; */
         letter-spacing:0;
       &.Mui-selected {
         background-color:transparent ;
          color:${({ theme }) => theme.colors.primaryColor};
       }
    }
    .MuiPaginationItem-root {
         font-size:${({ theme }) => theme.colors.baseFontSize} ;
    }
  }
`;

export default PaginationWrapper;
