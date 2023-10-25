import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { camelCase, debounce } from 'lodash';
import moment from 'moment';
import {
  Box, Stack, TableCell, TableRow
} from '@mui/material';
// component
import SearchInput from '../../../../components/searchInput/index';
import Table from '../../../../components/ag-grid-table/index';
import Pagination from '../../../../components/pagination/index';
import LoaderWrapper from '../../../../components/loader';

// constants
import {
  BADGE_CLASS,
  PLATFORMS,
  reservedHeader,
  productReservedQtySort
} from '../../../../constants/index';
import { GetProductReservedOrders, SetProductState } from '../../../../redux/slices/product-slice';

const ReservedQty = (props) => {
  const { productId } = props;

  const dispatch = useDispatch();

  const {
    reservedOrders,
    totalReservedOrders,
    reservedOrdersLoading,
    loadTabData
  } = useSelector((state) => state.product);

  const [reservedOrdersData, setReservedOrdersData] = useState([]);
  const [searchBy, setSearchBy] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageLimit, setPageLimit] = useState(100);

  const [sortValue, setSortValue] = useState({});

  const createData = (
    _id,
    orderNo,
    orderDate,
    salesChannel,
    qty,
    status,
    itemStatus
  ) => ({
    _id,
    orderNo,
    orderDate,
    salesChannel,
    qty,
    status,
    itemStatus
  });

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

  const handlePageLimit = (e) => {
    setPageLimit(e);
    setPageNumber(1);
  };

  const handlePageNumber = (e) => {
    setPageNumber(e);
  };

  const handleSearchByOrderNo = debounce((value) => {
    setPageNumber(1);
    setSearchBy(value);
  }, 500);

  const getReservedOrders = () => {
    const skip = (pageNumber - 1)
      * pageLimit;

    dispatch(GetProductReservedOrders({
      productId,
      filters: { searchBy },
      skip,
      limit: pageLimit,
      sortBy: sortValue
    }));
  };

  useEffect(() => {
    if (reservedOrders?.length > 0) {
      const reservedOrdersList = reservedOrders.map((order) => (
        createData(
          order._id,
          order.orderNumber || '--',
          order.purchaseDate ? moment(order.purchaseDate).format('DD MMM yyyy') : '--',
          order.platform ? PLATFORMS[order.platform] : '--',
          order.quantity || '--',
          <Box className={BADGE_CLASS[camelCase(order.status)]}>{order.status}</Box>,
          <Box className={BADGE_CLASS[camelCase(order.status)]}>{order.itemStatus}</Box>
        )
      ));
      setReservedOrdersData(reservedOrdersList);
    } else {
      setReservedOrdersData([]);
    }
  }, [reservedOrders]);

  useEffect(() => {
    getReservedOrders();
  }, [searchBy, pageNumber, pageLimit, loadTabData, sortValue]);

  useEffect(() => () => {
    dispatch(SetProductState({ field: 'reservedOrders', value: [] }));
    dispatch(SetProductState({ field: 'totalReservedOrders', value: 0 }));
  }, []);

  return (
    <div>
      <Box display="flex" justifyContent="space-between" mb={1.5} alignItems="center">
        <h3 className="m-0">Reserved Quantity </h3>
        <Stack direction="row" alignItems="center">
          <SearchInput
            placeholder="Search by Order #"
            width="247px"
            value={orderNumber}
            onChange={(e) => {
              setOrderNumber(e.target.value);
              handleSearchByOrderNo(e.target.value);
            }}
          />
        </Stack>
      </Box>
      <Box mt={3.125} position="relative">
        <Table
          tableHeader={reservedHeader}
          height="500px"
          sortableHeader={productReservedQtySort}
          handleSort={handleSortChange}
          sortValue={sortValue}
        >
          {reservedOrdersLoading
            ? <LoaderWrapper />
            : reservedOrdersData.length > 0 ? reservedOrdersData?.map((row) => (
              <TableRow
                hover
                key={row._id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell>{row.orderNo}</TableCell>
                <TableCell>{row.orderDate}</TableCell>
                <TableCell>{row.salesChannel}</TableCell>
                <TableCell component="th" scope="row">
                  {row.qty}
                </TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>{row.itemStatus}</TableCell>
              </TableRow>
            )) : null}
        </Table>
        <Pagination
          componentName="products"
          position="relative"
          width="0"
          perPageRecord={reservedOrders?.length || 0}
          total={totalReservedOrders}
          totalPages={Math.ceil(totalReservedOrders / pageLimit)}
          offset={totalReservedOrders}
          pageNumber={pageNumber}
          pageLimit={pageLimit}
          handlePageLimitChange={handlePageLimit}
          handlePageNumberChange={handlePageNumber}
        />
      </Box>
    </div>
  );
};

export default ReservedQty;
