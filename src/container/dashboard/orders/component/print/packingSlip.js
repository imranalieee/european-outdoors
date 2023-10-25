/* eslint-disable no-restricted-syntax */
/* eslint-disable react/display-name */
import React, { useEffect, useState } from 'react';
import {
  Box, TableRow, TableCell, Stack, Divider
} from '@mui/material';
import { isEmpty } from 'lodash';
import moment from 'moment';
import PrintBarcodeLabel from './barcodeFile';

import Table from '../../../../../components/ag-grid-table';

import { PdfWrapper } from './style';
import { packingSlipHeader, packingSlipTableHeader } from '../../../../../constants';

const PackingSlip = React.forwardRef(({ data }, ref) => {
  const [dataToPrint, setDataToPrint] = useState();

  useEffect(() => {
    const tmpData = [];
    if (!isEmpty(data)) {
      const totalKeys = Object.keys(data).length;
      let currentKey = 1;
      for (const [key, value] of Object.entries(data)) {
        const {
          batchPickId,
          orderNumber,
          customerDetails,
          orderItems = [],
          salesChannel,
          purchaseDate,
          subTotal,
          shippingPrice,
          taxPrice,
          discountPrice,
          grandTotal
        } = value;

        tmpData.push(
          <>
            <Box className="pdf-viewer-custom">
              <Box className="packing-slip-header" display="flex" justifyContent="space-between">
                <Box className="packing-slipheader-left" border="1px solid #000000" minWidth="300px">
                  <Box
                    component="h3"
                    sx={{
                      background: '#b4b4b4', padding: '5px', textAlign: 'center', fontSize: '14px', marginBottom: '0'
                    }}
                  >
                    Shipping Information
                  </Box>
                  <Box component="p" padding="10px" mb="0" display="flex" alignItems="center" height="calc(100% - 26px)">
                    {customerDetails?.customerName || '--'}
                    {' '}
                    <br />
                    {`${customerDetails?.shippingInfo?.zipCode || ''} ${customerDetails?.shippingInfo?.streetAddress || ''}`}
                    <br />
                    {`${customerDetails?.shippingInfo?.city ? `${customerDetails?.shippingInfo?.city},` : ''}
                    ${customerDetails?.shippingInfo?.country ? `${customerDetails?.shippingInfo?.country},` : ''}
                    ${customerDetails?.phoneNumber ? `${customerDetails?.phoneNumber},` : ''}
                     ${customerDetails?.shippingInfo?.state || ''}`}

                  </Box>
                </Box>
                <Box className="packing-slipheader-right">
                  <Box display="flex" gap="50px" justifyContent="space-between" alignItems="flex-end" mb="2">
                    <Box component="h3">Packing Slip</Box>
                    <Box>
                      <PrintBarcodeLabel value={orderNumber} width={2} height={50} />
                    </Box>
                  </Box>
                  <Table className="packing-slip-header-table" tableHeader={packingSlipHeader}>
                    <TableRow>
                      <TableCell>{purchaseDate ? moment(purchaseDate).format('MM/DD/yyyy') : '--'}</TableCell>
                      <TableCell>{orderNumber || '--'}</TableCell>
                      <TableCell>{salesChannel}</TableCell>
                    </TableRow>
                  </Table>
                </Box>
              </Box>
              <Box className="packing-slip-content" mt={3}>
                <Table tableHeader={packingSlipTableHeader} className="packing-slip-table">
                  {orderItems?.map((item, i) => (
                    <>
                      <TableRow key={i}>
                        <TableCell>{item.qty || 0}</TableCell>
                        <TableCell>{item.sku || '--'}</TableCell>
                        <TableCell>
                          <Box maxWidth={300} whiteSpace="normal">{item.title || '--'}</Box>
                        </TableCell>
                        <TableCell>
                          $
                          {item.price ? Number(item.price).toFixed(2) : 0.00}
                        </TableCell>
                        <TableCell>
                          $
                          {item.totalPrice ? Number(item.totalPrice).toFixed(2) : 0.00}
                        </TableCell>
                      </TableRow>
                      {item?.packedProducts?.map((pack, j) => (
                        <TableRow key={j} className={`nested-row ${j === 0 ? 'nested-row-first' : ''}`}>
                          <TableCell colSpan={5}>
                            <Table className="nested-table">
                              <TableRow>
                                <TableCell width="10%">
                                  <Box paddingLeft="25px">
                                    {(pack.qty || 1)}
                                  </Box>
                                </TableCell>
                                <TableCell width="20%">
                                  <Box whiteSpace="normal">
                                    {pack.sku || '--'}
                                  </Box>
                                </TableCell>
                                <TableCell width="70%">
                                  <Box maxWidth={300} whiteSpace="normal">{pack.title || '--'}</Box>
                                </TableCell>
                              </TableRow>
                            </Table>
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  ))}
                </Table>
                <Box display="flex" justifyContent="space-between" mt={3}>
                  <Box>
                    <Box component="h3">
                      Note:
                    </Box>
                    <Box border="1px solid #444444" minWidth={350} height={40} mb={2} />
                    <Box component="p" fontWeight={700} mb="0">
                      Batch Pick ID:
                      {' '}
                      {batchPickId || '--'}
                    </Box>
                  </Box>
                  <Box border="1px solid #000" maxWidth="190px" width="100%">
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      borderBottom="1px solid #000"
                    >
                      <Box
                        component="span"
                        color="#5A5F7D"
                        fontSize="13px"
                        fontWeight={400}
                        maxWidth="50%"
                        flex="50%"
                        p="2px 5px"
                        backgroundColor="#e3e3e3"
                      >
                        Total
                      </Box>
                      <Box
                        component="span"
                        color="#5A5F7D"
                        fontSize="13px"
                        fontWeight="400"
                        maxWidth="50%"
                        flex="50%"
                        p="2px 5px"
                        textAlign="right"
                      >
                        {`$${(subTotal || 0).toFixed(2)}`}
                      </Box>
                    </Box>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      borderBottom="1px solid #000"
                    >
                      <Box
                        component="span"
                        color="#5A5F7D"
                        fontSize="13px"
                        fontWeight={400}
                        maxWidth="50%"
                        flex="50%"
                        p="2px 5px"
                        backgroundColor="#e3e3e3"
                      >
                        Discount
                      </Box>
                      <Box
                        component="span"
                        color="#5A5F7D"
                        fontSize="13px"
                        fontWeight="400"
                        maxWidth="50%"
                        flex="50%"
                        p="2px 5px"
                        textAlign="right"
                      >
                        {`$${(discountPrice || 0).toFixed(2)}`}
                      </Box>
                    </Box>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      borderBottom="1px solid #000"
                    >
                      <Box
                        component="span"
                        color="#5A5F7D"
                        fontSize="13px"
                        fontWeight={400}
                        maxWidth="50%"
                        flex="50%"
                        p="2px 5px"
                        backgroundColor="#e3e3e3"
                      >
                        Tax
                      </Box>
                      <Box
                        component="span"
                        color="#5A5F7D"
                        fontSize="13px"
                        fontWeight="400"
                        maxWidth="50%"
                        flex="50%"
                        p="2px 5px"
                        textAlign="right"
                      >
                        {`$${(taxPrice || 0).toFixed(2)}`}
                      </Box>
                    </Box>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      borderBottom="1px solid #000"
                    >
                      <Box
                        component="span"
                        color="#5A5F7D"
                        fontSize="13px"
                        fontWeight={700}
                        maxWidth="50%"
                        flex="50%"
                        p="2px 5px"
                        backgroundColor="#e3e3e3"
                      >
                        Shipping
                      </Box>
                      <Box
                        component="span"
                        color="#5A5F7D"
                        fontSize="13px"
                        fontWeight="700"
                        maxWidth="50%"
                        flex="50%"
                        p="2px 5px"
                        textAlign="right"
                      >
                        {`$${(shippingPrice || 0).toFixed(2)}`}
                      </Box>
                    </Box>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                    >
                      <Box
                        component="span"
                        color="#5A5F7D"
                        fontSize="13px"
                        fontWeight={700}
                        maxWidth="50%"
                        flex="50%"
                        p="2px 5px"
                        backgroundColor="#e3e3e3"
                      >
                        Grand Total
                      </Box>
                      <Box
                        component="span"
                        color="#5A5F7D"
                        fontSize="13px"
                        fontWeight="700"
                        maxWidth="50%"
                        flex="50%"
                        p="2px 5px"
                        textAlign="right"
                      >
                        {`$${(grandTotal || 0).toFixed(2)}`}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
            <Divider
              sx={{
                marginTop: '8px',
                marginBottom: '8px'
              }}
            />
            {currentKey < totalKeys && (
            <div className="page-break" />
            )}
          </>
        );
        currentKey += 1;
      }
    }
    setDataToPrint(tmpData);
  }, [data]);

  return (
    <PdfWrapper ref={ref} className="print-document-only">
      {dataToPrint?.map((doc) => doc)}
    </PdfWrapper>
  );
});

export default PackingSlip;
