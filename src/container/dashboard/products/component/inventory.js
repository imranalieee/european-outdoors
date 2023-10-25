import React, { useState, useEffect } from 'react';
import {
  Box, Stack, TableCell, TableRow
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import {
  startCase, lowerCase, camelCase, debounce
} from 'lodash';
// component
import SearchInput from '../../../../components/searchInput/index';
import Table from '../../../../components/ag-grid-table/index';
import Pagination from '../../../../components/pagination/index';
import LoaderWrapper from '../../../../components/loader';
// redux
import { GetInventoryHistoryByProductId, SetInventoryHistoryState } from '../../../../redux/slices/inventory-history';
// constants
import {
  inventoryHeader,
  PLATFORMS,
  BADGE_CLASS,
  productInventorySort
} from '../../../../constants/index';

const Inventory = ({ productId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [data, setData] = useState([]);

  const [filters, setFilters] = useState({ searchBy: '' });
  const [searchByKeyWordsValue, setSearchByKeyWordsValue] = useState('');

  const [sortValue, setSortValue] = useState({});

  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageLimit: 100
  });

  const {
    totalInventoryHistoryCount,
    inventoryHistory,
    getInventoryHistoryLoading,
    totalInInventoryQuantity,
    totalOutInventoryQuantity
  } = useSelector((state) => state.inventoryHistory);

  const {
    loadTabData
  } = useSelector((state) => state.product);

  function createData(
    _id,
    isCustomerOrder,
    quantity,
    orderNumber,
    orderStatus,
    addedBy,
    marketplaceChannel,
    timestamp
  ) {
    return {
      _id,
      isCustomerOrder,
      quantity,
      orderNumber,
      orderStatus,
      addedBy,
      marketplaceChannel,
      timestamp
    };
  }

  const handlePageLimit = (e) => {
    setPagination({
      pageLimit: e,
      pageNumber: 1
    });
  };

  const handlePageNumber = (e) => {
    setPagination({
      ...pagination,
      pageNumber: e
    });
  };

  const handleSearch = debounce((value) => {
    setFilters({
      ...filters,
      searchBy: value
    });
    setPagination({
      ...pagination,
      pageNumber: 1
    });
  }, 500);

  const getInventoryHistory = () => {
    const { pageNumber, pageLimit } = pagination;
    const skip = (pageNumber - 1) * pageLimit;
    const limit = pageLimit;

    dispatch(GetInventoryHistoryByProductId({
      filters,
      productId,
      skip,
      limit,
      sortBy: sortValue
    }));
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
    if (inventoryHistory.length) {
      const productOrder = inventoryHistory.map((row) => (
        createData(
          row._id,
          row.transaction ? startCase((lowerCase(row.transaction))) : '--',
          row.quantity || '--',
          row.transaction === 'MANUAL_ORDER' || row.transaction === 'MANUAL_ORDER_REVISION' ? '--' : row.isCustomerOrder ? row.orderNumber : row.poNumber,
          (row.orderStatus || row.poStatus)
            ? (
              <Box
                className={
                  row.isCustomerOrder ? BADGE_CLASS[camelCase(row.orderStatus)]
                    : BADGE_CLASS[camelCase(row.poStatus)]
                }
              >
                {row.isCustomerOrder
                  ? startCase(lowerCase(row.orderStatus))
                  : startCase(lowerCase(row.poStatus))}
              </Box>
            )
            : '--',
          row.addedBy || '--',
          row.marketplaceChannel ? PLATFORMS[row.marketplaceChannel] : '--',
          row.timestamp && row.timestamp !== ''
            ? moment(row.timestamp).format('LLL')
            : '--'
        )
      ));

      setData(productOrder);
    } else {
      setData([]);
    }
  }, [inventoryHistory]);

  useEffect(() => {
    if (productId) getInventoryHistory();
  }, [pagination, filters, productId, loadTabData, sortValue]);

  useEffect(() => () => {
    dispatch(SetInventoryHistoryState({ field: 'totalOutInventoryQuantity', value: 0 }));
    dispatch(SetInventoryHistoryState({ field: 'totalInInventoryQuantity', value: 0 }));
    dispatch(SetInventoryHistoryState({ field: 'totalInventoryHistoryCount', value: 0 }));
    dispatch(SetInventoryHistoryState({ field: 'inventoryHistory', value: [] }));
  }, []);

  return (
    <div>
      <Box display="flex" justifyContent="space-between" mb={1.5} alignItems="center">
        <h3 className="m-0">Inventory I/O </h3>
        <Stack spacing={1.75} direction="row" alignItems="center">
          <Box component="span" color="#5A5F7D">
            Total In Quantity:
            <Box component="span" color="#272B41" fontWeight="600" marginLeft="2px">{totalInInventoryQuantity || 0}</Box>
          </Box>
          <Box component="span" color="#5A5F7D">
            Total Out Quantity:
            <Box component="span" color="#272B41" fontWeight="600" marginLeft="2px">{totalOutInventoryQuantity || 0}</Box>
          </Box>
          <SearchInput
            placeholder="Search by Order #"
            width="247px"
            onChange={(e) => {
              setSearchByKeyWordsValue(e.target.value);
              handleSearch(e.target.value);
            }}
            value={searchByKeyWordsValue}
          />
        </Stack>
      </Box>
      <Box position="relative" mt={3.125}>
        {getInventoryHistoryLoading ? <LoaderWrapper /> : null}
        <Table
          tableHeader={inventoryHeader}
          height="500px"
          sortableHeader={productInventorySort}
          handleSort={handleSortChange}
          sortValue={sortValue}
        >
          {data.map((row) => (
            <TableRow
              hover
              key={row._id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">{row.isCustomerOrder}</TableCell>
              <TableCell>{row.quantity}</TableCell>
              <TableCell>{row.orderNumber}</TableCell>
              <TableCell>{row.timestamp}</TableCell>
              <TableCell>{row.orderStatus}</TableCell>
              <TableCell>{row.addedBy}</TableCell>
              <TableCell>{row.marketplaceChannel}</TableCell>
            </TableRow>
          ))}
        </Table>
        <Pagination
          position="relative"
          width="0"
          componentName="products"
          perPageRecord={inventoryHistory?.length || 0}
          total={totalInventoryHistoryCount}
          totalPages={Math.ceil(totalInventoryHistoryCount / pagination.pageLimit)}
          offset={totalInventoryHistoryCount}
          pageNumber={pagination.pageNumber}
          pageLimit={pagination.pageLimit}
          handlePageLimitChange={handlePageLimit}
          handlePageNumberChange={handlePageNumber}
        />
        {/* <Pagination total="13368" position="relative" width="0" offset={20} /> */}
      </Box>
    </div>
  );
};

export default Inventory;
