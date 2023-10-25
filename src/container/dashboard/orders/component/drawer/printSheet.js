import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { isEmpty } from 'lodash';
import ReactToPrint from 'react-to-print';
import {
  Box, Stack, Divider, TableRow, TableCell
} from '@mui/material';

import Drawer from '../../../../../components/drawer';
import Select from '../../../../../components/select';
import Button from '../../../../../components/button';
import Table from '../../../../../components/ag-grid-table';
import Pagination from '../../../../../components/pagination';
import LoaderWrapper from '../../../../../components/loader';
import PrintableTable from '../print/printPickSheet';
import PrintableOrderSheets from '../print/printOrderSheets';
import PackingSlip from '../print/packingSlip';

import PrintConfirm from '../modals/printConfrim';

import { pickOption, printSheetData, PLATFORMS } from '../../../../../constants';

import {
  AddOrderBatch,
  GetOrdersForPrintSheet,
  GetPickSheetPrintableData,
  GetOrderInvoicePrintableData,
  SetOrderPickSheetState,
  GetPickSheetAndPackingSlipPrintableData
} from '../../../../../redux/slices/order/pick-sheet-slice';

import NoData from '../../../../../static/images/no-data-table.svg';

const PrintSheet = (props) => {
  const {
    onClose,
    open,
    orderNumberList,
    setSelectedOrderNumbers,
    selectedOrdersForDownload
  } = props;

  const dispatch = useDispatch();

  const tableRef = useRef();
  const buttonRef = useRef();

  const {
    printSheetLoading,
    pdfDataLoading,
    pickSheetPrintableData,
    orderInvoicePrintableData,
    saveSelectedOrders,
    selectedOrders,
    totalSelectedOrders
  } = useSelector((state) => state.orderPickSheet);

  const {
    user: { name = '' }
  } = useSelector((state) => state.auth);

  const [printConfirm, setPrintConfirm] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageLimit, setPageLimit] = useState(100);
  const [ordersData, setOrdersData] = useState([]);
  const [printFormat, setPrintFormat] = useState(pickOption[0]?.value);

  const printCreateData = (
    _id,
    order,
    marketplaceOrderId,
    recipient,
    salesChannel,
    date
  ) => ({
    _id,
    order,
    marketplaceOrderId,
    recipient,
    salesChannel,
    date
  });

  const handlePageLimit = (e) => {
    setPageLimit(e);
    setPageNumber(1);
  };

  const handlePageNumber = (e) => {
    setPageNumber(e);
  };

  const handlePrintConfirm = () => {
    if (orderNumberList.length) {
      dispatch(AddOrderBatch({
        orderNumberList,
        printedFormat: printFormat
      }));
    }
    setPrintConfirm(false);
    onClose();
  };

  useEffect(() => {
    const skip = (pageNumber - 1)
      * pageLimit;
    if (saveSelectedOrders) {
      dispatch(GetOrdersForPrintSheet({ skip, limit: pageLimit }));
    }
  }, [pageNumber, pageLimit, saveSelectedOrders]);

  useEffect(() => {
    if (selectedOrders.length > 0) {
      const ordersList = selectedOrders.map((order) => printCreateData(
        order._id,
        order.orderNo || '--',
        order.marketplaceOrderId || '--',
        order.recipient || '--',
        order.salesChannel ? PLATFORMS[order.salesChannel] : '--',
        order.orderDate ? moment(order.orderDate).format('LLL') : '--'
      ));
      setOrdersData(ordersList);
    } else {
      setOrdersData([]);
    }
  }, [selectedOrders]);

  useEffect(() => {
    if (printFormat === 'Pick Sheet') {
      dispatch(GetPickSheetPrintableData({ orderIdsList: selectedOrdersForDownload }));
    } else if (printFormat === 'Packing Slip') {
      dispatch(GetOrderInvoicePrintableData({ orderIdsList: selectedOrdersForDownload }));
    } else if (printFormat === 'Pick Sheet & Packing Slip') {
      dispatch(GetPickSheetAndPackingSlipPrintableData({
        orderIdsList: selectedOrdersForDownload
      }));
    }
  }, [printFormat]);

  useEffect(() => () => {
    setSelectedOrderNumbers([]);
    dispatch(SetOrderPickSheetState({ field: 'totalSelectedOrders', value: 0 }));
    dispatch(SetOrderPickSheetState({ field: 'selectedOrders', value: [] }));
    dispatch(SetOrderPickSheetState({ field: 'batchCreated', value: false }));
    dispatch(SetOrderPickSheetState({ field: 'pickSheetPrintableData', value: {} }));
    dispatch(SetOrderPickSheetState({ field: 'orderInvoicePrintableData', value: {} }));
  }, []);

  return (
    <>
      <Drawer open={open} width="696px" close={onClose}>
        <Drawer open={open} width="1144px" close={onClose}>
          <Box display="flex" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <Box component="span" className="icon-left pointer" onClick={onClose} />
              <h2 className="m-0 pl-2">Print Sheet</h2>
            </Box>
            <Box display="flex" gap={2.25}>
              <Select
                vertical
                menuItem={pickOption}
                label="Print Format"
                value={printFormat}
                placeholder="Select Option"
                width="200px"
                handleChange={(e) => setPrintFormat(e.target.value)}
              />
              <Button
                text="View & Print"
                variant="outlined"
                startIcon={<span className="icon-print" />}
                onClick={() => buttonRef.current.click()}
              />

            </Box>
          </Box>
          <>
            <Divider sx={{ marginY: '24px' }} />
            <Box display="flex" gap={3}>
              <Stack spacing={0.7} sx={{ width: '198px' }}>
                <Box color="#979797" fontSize="11px">Batch Pick ID</Box>
                <Box color="#272B41" fontSize="13px">--</Box>
              </Stack>
              <Stack spacing={0.7} sx={{ width: '200px' }}>
                <Box color="#979797" fontSize="11px">Time & Date Printed</Box>
                <Box color="#272B41" fontSize="13px">{moment().format('DD/MM/YYYY hh:mm a') || '--'}</Box>
              </Stack>
              <Stack spacing={0.7} sx={{ width: '200px' }}>
                <Box color="#979797" fontSize="11px">User</Box>
                <Box color="#272B41" fontSize="13px">{name || '--'}</Box>
              </Stack>
              <Stack spacing={0.7} sx={{ width: '200px' }}>
                <Box color="#979797" fontSize="11px">Total Orders in Batch</Box>
                <Box color="#272B41" fontSize="13px">{totalSelectedOrders || '--'}</Box>
              </Stack>
              <Stack spacing={0.7}>
                <Box color="#979797" fontSize="11px">Printed Format</Box>
                <Box color="#272B41" fontSize="13px">{printFormat || '--'}</Box>
              </Stack>
            </Box>
            <Divider sx={{ marginY: '24px' }} />
            <Box>
              <Table fixed alignCenter tableHeader={printSheetData} height="220px" bodyPadding="11px 16px">
                {printSheetLoading || pdfDataLoading
                  ? <LoaderWrapper /> : ordersData.length > 0 ? (
                    ordersData.map((row) => (
                      <TableRow
                        hover
                        key={row._id}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell component="th" scope="row">
                          {row.order}
                        </TableCell>
                        <TableCell>{row.marketplaceOrderId}</TableCell>
                        <TableCell>{row.recipient}</TableCell>
                        <TableCell>{row.salesChannel}</TableCell>
                        <TableCell>{row.date}</TableCell>
                      </TableRow>
                    ))
                  ) : printSheetLoading && totalSelectedOrders === 0 && (
                  <TableRow>
                    <TableCell sx={{ borderBottom: '24px' }} colSpan={7} align="center">
                      <Box textAlign="center" display="flex" alignItems="center" justifyContent="center" height="calc(100vh - 266px)">
                        <img className="nodata-table-img" src={NoData} height="100%" style={{ maxWidth: '100%' }} alt="no-Data" />
                      </Box>
                    </TableCell>
                  </TableRow>
                  )}

              </Table>
              <Pagination
                componentName="orders"
                position="relative"
                width="0"
                perPageRecord={selectedOrders?.length || 0}
                total={totalSelectedOrders}
                totalPages={Math.ceil(totalSelectedOrders / pageLimit)}
                offset={totalSelectedOrders}
                pageNumber={pageNumber}
                pageLimit={pageLimit}
                handlePageLimitChange={handlePageLimit}
                handlePageNumberChange={handlePageNumber}
              />
            </Box>
          </>
        </Drawer>
      </Drawer>
      {printConfirm
        ? (
          <PrintConfirm
            show={printConfirm}
            onClose={() => setPrintConfirm(false)}
            onConfirm={handlePrintConfirm}
          />
        )
        : null}
      <ReactToPrint
        trigger={() => (
          <button ref={buttonRef} style={{ display: 'none' }} />
        )}
        content={() => tableRef.current}
        onAfterPrint={() => {
         setPrintConfirm(true);
        }}
      />
      {
        printFormat === 'Pick Sheet' && !isEmpty(pickSheetPrintableData)
          ? (
            <PrintableTable data={pickSheetPrintableData} ref={tableRef} />
          ) : printFormat === 'Packing Slip' ? (
            <PackingSlip data={orderInvoicePrintableData} ref={tableRef} />
          ) : printFormat === 'Pick Sheet & Packing Slip' && !isEmpty(pickSheetPrintableData) ? (
            <PrintableOrderSheets
              orderInvoicePrintableData={orderInvoicePrintableData}
              pickSheetPrintableData={pickSheetPrintableData}
              tableRef={tableRef}
            />
          ) : null
      }
    </>
  );
};

export default PrintSheet;
