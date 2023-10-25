import React from 'react';
import { extend } from 'lodash';
import {
  Box
} from '@mui/material';
import { useBarcode } from '@createnextapp/react-barcode';

const PrintBarcodeLabel = React.forwardRef(({
  title, value, component, maxWidth, width, height
}, ref) => {
  const options = {
    width: width || 3,
    fontSize: 24
  };
  if (height) {
    extend(options, { height });
  }
  const { inputRef } = useBarcode({
    value,
    options
  });

  return (
    <Box
      className="print-document-flex"
      alignItems="center"
      ref={ref}
      flexDirection="column"
      gap="10px"
    >
      {component === 'marketplaceInventory' ? (
        <Box className="barcode-title-custom" component="h3" textAlign="center" maxWidth="400px" mb={0}>{title}</Box>
      ) : null}
      <svg width={300} ref={inputRef} />
    </Box>
  );
});

export default PrintBarcodeLabel;
