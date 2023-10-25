import moment from 'moment';
import React, { useState, useEffect } from 'react';
import { debounce, camelCase } from 'lodash';
import {
  Box, Stack, TableCell, TableRow
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

// icons
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// component
import LoaderWrapper from '../../../../components/loader/index';
import SearchInput from '../../../../components/searchInput/index';
import Table from '../../../../components/ag-grid-table/index';
import Pagination from '../../../../components/pagination/index';
import {
  poHistoryHeader, PO_STATUS,
  poHistorySort
} from '../../../../constants/index';

import {
  GetPoQueueHitory,
  SetPoQueueItemState
} from '../../../../redux/slices/purchasing';

// images
import noData from '../../../../static/images/no-data-table.svg';

const PoHistory = ({ props }) => {
  const dispatch = useDispatch();
  const params = useParams();
  const {
    _id
  } = props || {};

  const {
    poQueueHistory,
    totalPoQueueHistory,
    totalPoQueueHistoryCost,
    poQueueHistoryPageLimit,
    poQueueHistoryPageNumber,
    poQueueHistoryFilters,
    poQueueHistoryLoading
  } = useSelector((state) => state.poQueueItem);

  const [purchaseOrder, setPurchaseOrder] = useState();
  const [searchByPoId, setSearchByPoId] = useState('');

  const [sortValue, setSortValue] = useState({});

  function createData(
    poNo,
    supplier,
    Mfg,
    date,
    cost,
    quantity,
    poConfrimed,
    poPrinted,
    poReceived
  ) {
    return {
      poNo,
      supplier,
      Mfg,
      date,
      cost,
      quantity,
      poConfrimed,
      poPrinted,
      poReceived
    };
  }
  const data = [];
  for (let i = 0; i <= 1; i++) {
    data.push(
      createData(
        '1994022',
        'CRISSI',
        'ZDN282000',
        '28 Dec 2022 ',
        '$68.88 ',
        '1000',
        <CheckCircleOutlinedIcon sx={{ color: '#979797', fontSize: 16 }} />,
        <CheckCircleIcon sx={{ color: '#0FB600', width: 16 }} />,
        <CheckCircleOutlinedIcon sx={{ color: '#979797', fontSize: 16 }} />
      )
    );
  }

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

  const getPurchaseItemHitory = (id) => {
    const { id: productId } = params;
    const skip = (poQueueHistoryPageNumber - 1) * poQueueHistoryPageLimit;
    const limit = poQueueHistoryPageLimit;
    dispatch(GetPoQueueHitory({
      skip,
      limit,
      supplierId: id,
      filters: poQueueHistoryFilters,
      productId,
      poStatus: PO_STATUS.confirm,
      sortBy: sortValue
    }));
  };

  const handlePageNumber = (e) => {
    dispatch(SetPoQueueItemState({ field: 'poQueueHistoryPageNumber', value: e }));
  };

  const handlePageLimit = (e) => {
    dispatch(SetPoQueueItemState({ field: 'poQueueHistoryPageNumber', value: 1 }));
    dispatch(SetPoQueueItemState({ field: 'poQueueHistoryPageLimit', value: e }));
  };

  const handleSearch = debounce((e) => {
    const { value, name: key } = e.target;
    dispatch(SetPoQueueItemState({ field: 'poQueueHistoryPageNumber', value: 1 }));
    dispatch(SetPoQueueItemState({
      field: 'poQueueHistoryFilters',
      value: {
        ...poQueueHistoryFilters,
        searchByKeyWords: {
          ...poQueueHistoryFilters.searchByKeyWords,
          [key]: value
        }
      }
    }));
  }, 500);

  useEffect(() => {
    if (poQueueHistory?.length) {
      const po = poQueueHistory?.map((item) => {
        let isPrinted = false;
        let isReceived = false;
        let isConfirmed = false;
        if (item?.poStatus === 'CONFIRMED') {
          isConfirmed = true;
          isReceived = false;
          isPrinted = false;
        } else if (item?.poStatus === 'PRINTED') {
          isPrinted = true;
          isReceived = false;
          isConfirmed = true;
        } else if (item?.poStatus === 'RECEIVED') {
          isPrinted = true;
          isReceived = true;
          isConfirmed = true;
        } else if (item?.poStatus === 'CLOSED') {
          isPrinted = true;
          isReceived = true;
          isConfirmed = true;
        }
        return createData(
          item?.poId,
          item?.supplier?.code,
          item?.product?.mfgPartNo,
          item?.createdAt ? moment(new Date(item?.createdAt)).format('DD MMM YYYY') : '--',
          Number(item?.poTotalCost),
          Number(item?.poQuantity),
          <CheckCircleIcon sx={isConfirmed
            ? { color: '#0FB600', width: 16 }
            : { color: '#979797', width: 16 }}
          />,
          <CheckCircleIcon sx={isPrinted
            ? { color: '#0FB600', width: 16 }
            : { color: '#979797', width: 16 }}
          />,
          <CheckCircleIcon sx={isReceived
            ? { color: '#0FB600', width: 16 }
            : { color: '#979797', width: 16 }}
          />
        );
      });
      setPurchaseOrder(po);
    } else {
      setPurchaseOrder([]);
    }
  }, [poQueueHistory, totalPoQueueHistory]);

  useEffect(() => {
    if (_id) {
      getPurchaseItemHitory(_id);
    } else {
      dispatch(SetPoQueueItemState({ field: 'poQueueHistory', value: [] }));
      dispatch(SetPoQueueItemState({ field: 'totalPoQueueHistory', value: 0 }));
      dispatch(SetPoQueueItemState({ field: 'totalPoQueueHistoryCost', value: 0 }));
    }
  }, [poQueueHistoryFilters, poQueueHistoryPageNumber, poQueueHistoryPageLimit, _id, sortValue]);

  useEffect(() => {
    dispatch(SetPoQueueItemState({
      field: 'poQueueHistoryFilters',
      value: {
        ...poQueueHistoryFilters,
        searchByKeyWords: {
          ...poQueueHistoryFilters.searchByKeyWords,
          poId: ''
        }
      }
    }));
  }, []);

  return (
    <div>
      <Box display="flex" justifyContent="space-between" mb={1.5} alignItems="center">
        <h3 className="m-0">PO History</h3>
        <Stack spacing={2} direction="row" alignItems="center">
          <Box component="span" color="#5A5F7D">
            Total Quantity:
            <Box component="span" color="#272B41" fontWeight="600" marginLeft="2px">{totalPoQueueHistory || 0}</Box>
          </Box>
          <Box component="span" color="#5A5F7D">
            Total Amount:
            <Box component="span" color="#272B41" fontWeight="600" marginLeft="2px">
              $
              {Number(totalPoQueueHistoryCost || 0).toFixed(2)}
            </Box>
          </Box>
          <SearchInput
            autoComplete="off"
            name="poId"
            placeholder="Search by PO #"
            width="247px"
            onChange={(e) => {
              setSearchByPoId(e.target.value);
              handleSearch(e);
            }}
          />
        </Stack>
      </Box>
      <Box mt={3.125} position="relative">
        <Table
          tableHeader={poHistoryHeader}
          height="500px"
          bodyPadding="8px 12px"
          sortableHeader={poHistorySort}
          handleSort={handleSortChange}
          sortValue={sortValue}
        >
          {poQueueHistoryLoading
            ? <LoaderWrapper />
            : purchaseOrder?.length ? purchaseOrder?.map((row) => (
              <TableRow
                hover
                key={row.name}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row?.poNo || '--'}
                </TableCell>
                <TableCell>{row?.supplier || '--'}</TableCell>
                <TableCell>{row?.Mfg || '--'}</TableCell>
                <TableCell>{row?.date || '--'}</TableCell>
                <TableCell>{`$${Number(row?.cost || 0).toFixed(2)}`}</TableCell>
                <TableCell>{row?.quantity || '--'}</TableCell>
                <TableCell>{row?.poConfrimed || '--'}</TableCell>
                <TableCell>{row?.poPrinted || '--'}</TableCell>
                <TableCell>{row?.poReceived || '--'}</TableCell>
              </TableRow>
            )) : (
              !poQueueHistoryLoading && totalPoQueueHistory === 0 && (
                <TableRow>
                  <TableCell sx={{ borderBottom: '24px' }} colSpan={9} align="center">
                    <Box textAlign="center" display="flex" alignItems="center" justifyContent="center" height="250px">
                      {/* <img className="nodata-table-img" src={noData} height="100%" style={{ maxWidth: '100%' }} alt="no-Data" /> */}
                    </Box>
                  </TableCell>
                </TableRow>
              )
            )}
        </Table>
        <Pagination
          componentName="products"
          perPageRecord={poQueueHistory?.length || 0}
          total={totalPoQueueHistory || 0}
          totalPages={Math.ceil(totalPoQueueHistory / poQueueHistoryPageLimit)}
          offset={totalPoQueueHistory}
          pageNumber={poQueueHistoryPageNumber}
          pageLimit={poQueueHistoryPageLimit}
          handlePageLimitChange={handlePageLimit}
          handlePageNumberChange={handlePageNumber}
          position="relative"
          width="0"
        />
      </Box>
    </div>
  );
};

export default PoHistory;
