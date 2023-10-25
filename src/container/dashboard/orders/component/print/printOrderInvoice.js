import React, { useEffect, useState } from 'react';
import {
  Box, TableRow, TableCell, Stack, Divider
} from '@mui/material';
import { isEmpty } from 'lodash';

import moment from 'moment';
import Table from '../../../../../components/ag-grid-table';

import { PdfWrapper } from './style';
import { printInvoiceHeader } from '../../../../../constants';

const PrintableInvoice = React.forwardRef(({ data }, ref) => {
  const [dataToPrint, setDataToPrint] = useState();

  useEffect(() => {
    const tmpData = [];
    if (!isEmpty(data)) {
      const totalKeys = Object.keys(data).length;
      let currentKey = 1;
      console.log({
        currentKey,
        totalKeys
      });
      for (const [key, value] of Object.entries(data)) {
        const {
          marketplaceOrderId,
          customerDetails,
          orderItems = [],
          salesChannel,
          purchaseDate,
          subTotal,
          shippingPrice,
          taxPrice,
          grandTotal
        } = value;

        tmpData.push(
          <Box className="pdf-viewer-custom">
            <Box
              className="print-invoice-header"
              display="flex"
              flexDirection="column"
              mb={3}
            >
              <Box component="span" fontSize="20px" fontWeight={400}>
                Ship To:
              </Box>
              <Box component="span" fontSize="20px" fontWeight={700}>
                {customerDetails?.customerName || '--'}
              </Box>
              <Box component="span" fontSize="20px" fontWeight={700}>
                {customerDetails?.shippingInfo?.zipCode ? `${customerDetails?.shippingInfo?.zipCode} ` : ''}
                {customerDetails?.shippingInfo?.streetAddress}
              </Box>
              <Box component="span" fontSize="20px" fontWeight={700}>
                {`
                ${customerDetails?.shippingInfo?.city ? `${customerDetails?.shippingInfo?.city},` : ''}
                 ${customerDetails?.shippingInfo?.state ? `${customerDetails?.shippingInfo?.state},` : ''}
                 ${customerDetails?.shippingInfo?.country ? `${customerDetails?.shippingInfo?.country},` : ''}
                 ${customerDetails?.shippingInfo?.country ? `${customerDetails?.phoneNumber}` : ''}
                `}
              </Box>
            </Box>
            <Box
              className="print-order-details"
              borderTop="1px solid rgba(151,151,151,0.25)"
              borderBottom="1px solid rgba(151,151,151,0.25)"
              pt={2}
              pb={2}
            >
              <Box fontWeight={500} fontSize="16px">
                {`Order ID: ${marketplaceOrderId || key || '--'}`}
              </Box>
              <Box compomnent="p">
                { `Thank you for buying from European Outdoors on ${salesChannel}
                Marketplace.`}
              </Box>
            </Box>
            <Box
              className="print-order-summary"
              display="flex"
              gap="50px"
              pt={2.5}
              pb={2.5}
            >
              <Box>
                <Box fontWeight={700} fontSize="14px" minWidth="130px">
                  Shipping Address:
                </Box>
                <Box fontWeight={500} fontSize="14px" minWidth="130px">
                  {customerDetails?.customerName || '--'}
                </Box>
                <Box fontWeight={500} fontSize="14px" minWidth="130px">
                  {customerDetails?.shippingInfo?.streetAddress}
                </Box>
                <Box fontWeight={500} fontSize="14px" minWidth="130px">
                  {`
                ${customerDetails?.shippingInfo?.city ? `${customerDetails?.shippingInfo?.city},` : ''}
                 ${customerDetails?.shippingInfo?.state ? `${customerDetails?.shippingInfo?.state},` : ''}
                 ${customerDetails?.shippingInfo?.country ? `${customerDetails?.shippingInfo?.country},` : ''}
                 ${customerDetails?.shippingInfo?.zipCode ? `${customerDetails?.shippingInfo?.zipCode}` : ''}`}
                </Box>
              </Box>
              <Box>
                <Box className="order-summary-item" display="flex" gap="50px" mb={1}>
                  <Box fontWeight={500} fontSize="14px" minWidth="130px">
                    Order Date:
                  </Box>
                  <Box compomnent="p" fontSize="14">
                    {purchaseDate ? moment(purchaseDate).format('ddd, MMM DD, YYYY') : '--'}
                  </Box>
                </Box>
                <Box className="order-summary-item" display="flex" gap="50px" mb={1}>
                  <Box fontWeight={500} fontSize="14px" minWidth="130px">
                    Shipping Service:
                  </Box>
                  <Box compomnent="p" fontSize="14">
                    Standard
                  </Box>
                </Box>
                <Box className="order-summary-item" display="flex" gap="50px" mb={1}>
                  <Box fontWeight={500} fontSize="14px" minWidth="130px">
                    Buyer Name:
                  </Box>
                  <Box compomnent="p" fontSize="14">
                    {customerDetails?.customerName || '--'}
                  </Box>
                </Box>
                <Box className="order-summary-item" display="flex" gap="50px" mb={1}>
                  <Box fontWeight={500} fontSize="14px" minWidth="130px">
                    Seller Name:
                  </Box>
                  <Box compomnent="p" fontSize="14">
                    European Outdoors
                  </Box>
                </Box>
              </Box>

            </Box>
            <Box>
              <Table
                fixed
                tableHeader={printInvoiceHeader}
                height="auto"
                bodyPadding="8px 11px"
              >
                {orderItems?.map((doc, i) => (
                  <TableRow
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    key={i}
                  >
                    <TableCell component="th" scope="row" width="70px">
                      <Box
                        component="span"
                        display="flex"
                        alignItems="center"
                        gap={0.5}
                      >
                        {doc?.qty}
                      </Box>
                    </TableCell>
                    <TableCell width="40%">
                      <Stack spacing={0.5} direction="column" fontSize="13px">
                        {/* <Box component="span" fontWeight={700}>
                          {doc?.title}
                        </Box> */}

                        <Box
                          component="span"
                          sx={{
                            textOverfow: 'auto',
                            whiteSpace: 'nowrap',
                            overflow: 'auto'
                          }}
                          fontWeight={700}
                          maxWidth="400px"
                        >
                          <Box component="span" maxWidth="200px" whiteSpace="normal">
                            {`Title: ${doc?.title}`}
                          </Box>
                        </Box>

                        <Box component="span" fontWeight={700} mt="2px">
                          {`SKU: ${doc?.sku}`}
                        </Box>
                        <Box component="span" fontWeight={700} mt="2px">
                          {`ASIN: ${doc?.asin}`}
                          {' '}
                        </Box>
                        <Box component="span" fontWeight={700} mt="2px">
                          {`Order Item ID: ${doc?.orderItemId}`}
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>{`$${(doc?.price || 0).toFixed(2)}`}</TableCell>
                    <TableCell>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        mb={0.5}
                        gap="15px"
                      >
                        <Box
                          component="span"
                          color="#5A5F7D"
                          fontSize="11px"
                          fontWeight={700}
                        >
                          Item subtotal
                        </Box>
                        <Box component="span" color="#5A5F7D" fontSize="13px">
                          {`$${((doc?.price || 0) * (doc?.qty || 0)).toFixed(2)}`}
                        </Box>
                      </Box>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        mb={0.5}
                        gap="15px"
                      >
                        <Box
                          component="span"
                          color="#5A5F7D"
                          fontSize="11px"
                          fontWeight={700}
                        >
                          Tax
                        </Box>
                        <Box component="span" color="#5A5F7D" fontSize="13px">
                          {`$${(doc?.tax || 0).toFixed(2)}`}
                        </Box>
                      </Box>
                      <Divider
                        sx={{
                          marginTop: '8px',
                          marginBottom: '8px',
                          borderTopColor: '#000000',
                          borderBottomColor: '#000000'
                        }}
                      />
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        mb={0.5}
                        gap="15px"
                      >
                        <Box
                          component="span"
                          color="#5A5F7D"
                          fontSize="11px"
                          fontWeight={700}
                        >
                          Item total
                        </Box>
                        <Box component="span" color="#5A5F7D" fontSize="13px">
                          {`${(((doc?.price || 0) * (doc?.qty || 0)) + (doc?.tax || 0)).toFixed(2)}`}
                        </Box>
                      </Box>
                      <Divider
                        sx={{
                          marginTop: '8px',
                          marginBottom: '8px'
                        // borderTopColor: '#000000',
                        // borderBottomColor: '#000000'
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </Table>
              <Divider
                sx={{
                  marginTop: '8px',
                  marginBottom: '8px',
                  borderTopColor: '#000000',
                  borderBottomColor: '#000000'
                }}
              />
              <Box
                display="flex"
                justifyContent="space-between"
                mt={1}
                justifyContent="flex-end"
                gap="15px"
                pr="10px"
                mb={1}
              >
                <Box
                  component="span"
                  color="#5A5F7D"
                  fontSize="13px"
                  fontWeight={400}
                >
                  Subtotal
                </Box>
                <Box
                  component="span"
                  color="#5A5F7D"
                  fontSize="13px"
                  fontWeight="400"
                >
                  {`$${(subTotal || 0).toFixed(2)}`}
                </Box>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                mt={1}
                justifyContent="flex-end"
                gap="15px"
                pr="10px"
                mb={1}
              >
                <Box
                  component="span"
                  color="#5A5F7D"
                  fontSize="13px"
                  fontWeight={400}
                >
                  Tax
                </Box>
                <Box
                  component="span"
                  color="#5A5F7D"
                  fontSize="13px"
                  fontWeight="400"
                >
                  {`$${(taxPrice || 0).toFixed(2)}`}
                </Box>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                mt={1}
                justifyContent="flex-end"
                gap="15px"
                pr="10px"
                mb={1}
              >
                <Box
                  component="span"
                  color="#5A5F7D"
                  fontSize="13px"
                  fontWeight={400}
                >
                  Shipping
                </Box>
                <Box
                  component="span"
                  color="#5A5F7D"
                  fontSize="13px"
                  fontWeight="400"
                >
                  {`$${(shippingPrice || 0).toFixed(2)}`}
                </Box>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                mt={1}
                justifyContent="flex-end"
                gap="15px"
                pr="10px"
                mb={3}
              >
                <Box
                  component="span"
                  color="#5A5F7D"
                  fontSize="13px"
                  fontWeight={700}
                >
                  Grand Total
                </Box>
                <Box
                  component="span"
                  color="#5A5F7D"
                  fontSize="13px"
                  fontWeight="700"
                >
                  {`$${(grandTotal || 0).toFixed(2)}`}
                </Box>
              </Box>
            </Box>
            <Box className="print-invoice-return" mt={3}>
              <Box fontWeight={700} mb={3}>
                Returning your item:
              </Box>
              <Box component="p">
                Go to "Your Account" on Amazon.com, click "Your Orders" and then
                click the "seller profile" link for this order to get information
                about the return and refund policies that apply.
              </Box>
              <Box component="p">
                Visit
                <a href="#"> https://www.amazon.com/returns </a>
                to print a return shipping label. Please have your order ID ready
              </Box>
              <Box component="p">
                <strong>Thanks for buying on Amazon Marketplace.</strong>
                {' '}
                To provide feedback for the seller please visit
                <a href="#"> www.amazon.com/feedback </a>
                . To contact the seller, go to Your Orders in Your Account. Click the seller's name
                under the appropriate product. Then, in the "Further Information" section, click "Contact the Seller".
              </Box>
            </Box>
            <Divider
              sx={{
                marginTop: '8px',
                marginBottom: '8px'
                //   borderTopColor: '#000000',
                //   borderBottomColor: '#000000'
              }}
            />
            {currentKey < totalKeys && (
              <div className="page-break" />
            )}
          </Box>
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

export default PrintableInvoice;
