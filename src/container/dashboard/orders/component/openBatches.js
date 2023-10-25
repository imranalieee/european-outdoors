import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import ReactToPrint from 'react-to-print';
import { Box, TableCell, TableRow } from '@mui/material';
import { camelCase } from 'lodash';

import Table from '../../../../components/ag-grid-table/index';
import Pagination from '../../../../components/pagination/index';
import LoaderWrapper from '../../../../components/loader';

import Modal from './modals/printFormat';

import Print from '../../../../static/images/icon_print.svg';

import { batchDetailsHeader, orderBatchDetailSort } from '../../../../constants/index';

import { SetOrderState, SetProcessOrderState } from '../../../../redux/slices/order';
import { GetOrderBatchDetails, SetOrderPickSheetState } from '../../../../redux/slices/order/pick-sheet-slice';

const OpenBatches = () => {
  const dispatch = useDispatch();

  const { loading, orderBatches, totalBatches } = useSelector(
    (state) => state.orderPickSheet
  );

  const [avoidBatch, setAvoidBatch] = useState(false);
  const [completeBatch, setCompleteBatch] = useState(false);
  const [batchDetails, setBatchDetails] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageLimit, setPageLimit] = useState(100);
  const [batchId, setBatchId] = useState('');

  const [sortValue, setSortValue] = useState({});

  const handlePageLimit = (e) => {
    setPageLimit(e);
    setPageNumber(1);
  };

  const handlePageNumber = (e) => {
    setPageNumber(e);
  };

  const createData = (
    _id,
    batchPickId,
    printFormat,
    date,
    user,
    totalOrders,
    action
  ) => ({
    _id,
    batchPickId,
    printFormat,
    date,
    user,
    totalOrders,
    action
  });

  const getOrderBatchDetails = () => {
    const skip = (pageNumber - 1) * pageLimit;

    dispatch(GetOrderBatchDetails({ skip, limit: pageLimit, sortBy: sortValue }));
  };

  const handleSortChange = (e, header) => {
    const sortKey = camelCase(header);
    const currentSortValue = sortValue[sortKey];

    let newSortValue;

    if (!currentSortValue) {
      newSortValue = 'asc';
    } else if (currentSortValue === 'asc') {
      newSortValue = 'desc';
    } else {
      newSortValue = '';
    }

    setSortValue({
      [sortKey]: newSortValue
    });
  };

  useEffect(() => {
    if (orderBatches.length > 0) {
      const orderBatchesList = orderBatches.map((batch) => createData(
        batch._id,
        batch.batchPickId || '--',
        batch.printedFormat || '--',
        batch.printedAt
          ? moment(batch.printedAt).format('DD/MM/YYYY hh:mmA')
          : '--',
        batch.user || '--',
        batch.totalOrders || '--',
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            onClick={() => {
              setAvoidBatch(true);
              setBatchId(batch._id);
            }}
          >
            <img src={Print} alt="no-icon" className="pointer" />
          </Box>
        </Box>
      ));
      setBatchDetails(orderBatchesList);
    } else {
      setBatchDetails([]);
    }
  }, [orderBatches]);

  useEffect(() => {
    getOrderBatchDetails();
  }, [pageNumber, pageLimit, sortValue]);

  useEffect(() => () => {
    if (!window.location.pathname.startsWith('/orders' || '/orders/')) {
      dispatch(SetOrderState({
        field: 'orderManagerFilters',
        value: {
          salesChannel: '',
          orderStatus: '',
          orderManagerPageLimit: 100,
          orderManagerPageNumber: 1,
          searchByKeyWords: { orderNo: '' }
        }
      }));
      dispatch(SetOrderPickSheetState({
        field: 'pickSheetFilters',
        value: {
          salesChannel: '',
          pickSheetPageLimit: 100,
          pickSheetPageNumber: 1,
          searchByKeyWords: { orderNo: '' }
        }
      }));
      dispatch(SetProcessOrderState({
        field: 'processOrderFilters',
        value: {
          salesChannel: '',
          processOrderPageLimit: 100,
          processOrderPageNumber: 1,
          searchByKeyWords: { orderNo: '' }
        }
      }));
    }
  }, []);

  return (
    <>
      <Box mt={2.25}>
        {/* <ReactToPrint
          trigger={() => (
            <img
              src={Print}
              onClick={() => this.tableRef.current.onPrint()}
              alt="no-icon"
              className="pointer"
            />
          )}
          content={() => tableRef.current}
        /> */}
        <Table
          fixed
          alignCenter
          tableHeader={batchDetailsHeader}
          height="205px"
          bodyPadding="8px 11px"
          sortableHeader={orderBatchDetailSort}
          handleSort={handleSortChange}
          sortValue={sortValue}
        >
          {loading ? (
            <LoaderWrapper />
          ) : (
            batchDetails.map((row) => (
              <TableRow
                hover
                key={row._id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.batchPickId}
                </TableCell>
                <TableCell>{row.printFormat}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.user}</TableCell>
                <TableCell>{row.totalOrders}</TableCell>
                <TableCell>{row.action}</TableCell>
              </TableRow>
            ))
          )}
        </Table>
        <Pagination
          componentName="orders"
          position="relative"
          width="0"
          perPageRecord={orderBatches?.length || 0}
          total={totalBatches}
          totalPages={Math.ceil(totalBatches / pageLimit)}
          offset={totalBatches}
          pageNumber={pageNumber}
          pageLimit={pageLimit}
          handlePageLimitChange={handlePageLimit}
          handlePageNumberChange={handlePageNumber}
        />
      </Box>
      {/* <Modal
        show={completeBatch || avoidBatch}
        lastTitle={completeBatch ? 'Complete This Batch!' : 'Avoid This Batch!'}
        onClose={() => {
          setAvoidBatch(false);
          setCompleteBatch(false);
        }}
      /> */}
      {avoidBatch
        ? (
          <Modal
            show={avoidBatch}
            batchId={batchId}
            onClose={() => setAvoidBatch(false)}
          />
        ) : null }
    </>
  );
};

export default OpenBatches;
