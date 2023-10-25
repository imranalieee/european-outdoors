import React from 'react';

import PrintableTable from './printPickSheet';
import PackingSlip from './packingSlip';

import { PdfWrapper } from './style';

const PrintableOrderSheets = (props) => {
  const { pickSheetPrintableData, orderInvoicePrintableData, tableRef } = props;

  return (
    <PdfWrapper ref={tableRef} className="print-document-only">
      <PrintableTable data={pickSheetPrintableData} ref={tableRef} />

      <div className="page-break" />
      <PackingSlip data={orderInvoicePrintableData} ref={tableRef} />

    </PdfWrapper>
  );
};

export default PrintableOrderSheets;
