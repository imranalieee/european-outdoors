import Styled from 'styled-components';

const RangeSlider = Styled.div`
 margin-bottom: ${(props) => (props.marginBottom ? `${props.marginBottom}` : '16px')};
 label{
    font-size: ${({ theme }) => theme.colors.baseFontSizeXs};
    color: ${({ theme }) => theme.colors.labelColor};
    margin-bottom:5px;

 }
 .MuiSlider-root{
     padding: 5px 0;
     color: ${({ theme }) => theme.colors.primaryColor};
 }
 .MuiSlider-valueLabel.MuiSlider-valueLabelOpen{
     transform: translateY(75%) scale(1);
 }
 .MuiSlider-valueLabelCircle,.MuiSlider-valueLabelLabel{
          color: ${({ theme }) => theme.colors.tableBody};
 }
 .MuiSlider-valueLabelOpen {
    .MuiSlider-valueLabelCircle{
          color: ${({ theme }) => theme.colors.tableBody};
 }
 }
`;

export default RangeSlider;
