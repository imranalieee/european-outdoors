import styled from 'styled-components';

const PdfWrapper = styled.div`
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
`;

export { PdfWrapper };
