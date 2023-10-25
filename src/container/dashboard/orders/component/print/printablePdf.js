import React from 'react';
// import BatchPdf from '../../../../../static/batch.pdf';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
const pdfUrl = 'https://european-outdoors-po-email-attachment.s3.amazonaws.com/po/po-sheet2023-06-21+15%3A23%3A11.pdf'; // Replace with your PDF URL

const PrintableTable = React.forwardRef(({ data }, ref) => (
  <div className="pdf-viewer" ref={ref}>
    <Document file={pdfUrl}>
      <Page pageNumber={1} renderTextLayer={false} />
    </Document>
  </div>
));

export default PrintableTable;
