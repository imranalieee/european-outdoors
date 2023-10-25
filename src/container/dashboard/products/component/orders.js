import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Stack, TableCell, TableRow
} from '@mui/material';
import {
  startCase, lowerCase, camelCase, debounce
} from 'lodash';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { RemoveRedEye } from '@mui/icons-material';
// component
import SearchInput from '../../../../components/searchInput/index';
import Table from '../../../../components/ag-grid-table/index';
import Pagination from '../../../../components/pagination/index';
import LoaderWrapper from '../../../../components/loader/index';
// redux
import { GetProductOrdersByProductId, SetProductState } from '../../../../redux/slices/product-slice';
import {
  ordersHeader,
  PLATFORMS,
  BADGE_CLASS,
  productOrderSort
} from '../../../../constants/index';

const Orders = ({ productId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    productOrders,
    getProductOrdersLoading,
    productOrdersTotal,
    productOrdersTotalQuantity,
    productOrderTotalAmount,
    loadTabData
  } = useSelector((state) => state.product);

  const {
    user: {
      permissions: { viewOrders }
    }
  } = useSelector((state) => state.auth);

  const [filters, setFilters] = useState({ searchBy: '' });
  const [searchByKeyWordsValue, setSearchByKeyWordsValue] = useState('');

  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageLimit: 100
  });

  const [data, setData] = useState([]);
  const [sortValue, setSortValue] = useState({});

  function createData(
    _id,
    orderNo,
    quantity,
    price,
    subTotal,
    sale,
    orderStatus,
    status,
    date,
    sku,
    action
  ) {
    return {
      _id,
      orderNo,
      quantity,
      price,
      subTotal,
      sale,
      orderStatus,
      status,
      date,
      sku,
      action
    };
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

  const getProductOrdersByProductId = () => {
    const { pageNumber, pageLimit } = pagination;
    const skip = (pageNumber - 1) * pageLimit;
    const limit = pageLimit;

    dispatch(GetProductOrdersByProductId({
      productId,
      skip,
      limit,
      filters,
      sortBy: sortValue
    }));
  };

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

  useEffect(() => {
    if (productOrders.length) {
      const productOrder = productOrders.map((row) => (
        createData(
          row.orderItemId,
          row.orderNumber,
          row.quantity || 0,
          row.unitPrice ? `$${Number(row.unitPrice).toFixed(2)}` : '$0.00',
          row.subTotal ? `$${Number(row.subTotal).toFixed(2)}` : '$0.00',
          row?.platform ? PLATFORMS[row?.platform] : '--',
          <Box
            className={BADGE_CLASS[camelCase(row.orderStatus)]}
          >
            {row.orderStatus ? startCase(lowerCase(row.orderStatus)) : '--'}
          </Box>,
          <Box
            className={BADGE_CLASS[camelCase(row.itemStatus)]}
          >
            {row.itemStatus ? startCase(lowerCase(row.itemStatus)) : '--'}
          </Box>,
          row.purchaseDate && row.purchaseDate !== ''
            ? moment(row.purchaseDate).format('LLL')
            : '--',
          row.sellerSku ? row.sellerSku : '--',
          <Box display="flex" gap={2}>
            {viewOrders
              ? (
                <RemoveRedEye
                  sx={{ color: '#3C76FF', width: 16 }}
                  className="pointer"
                  onClick={() => navigate(`/orders/${row.orderId}`)}
                />
              )
              : (
                <RemoveRedEye
                  sx={{ color: '#a1a1a1', width: 16 }}
                  className="pointer"
                />
              )}
          </Box>
        )
      ));

      setData(productOrder);
    } else {
      setData([]);
    }
  }, [productOrders]);

  useEffect(() => {
    if (productId) {
      getProductOrdersByProductId();
    }
  }, [pagination, filters, loadTabData, sortValue]);

  useEffect(() => () => {
    dispatch(SetProductState({ field: 'productOrderTotalAmount', value: 0 }));
    dispatch(SetProductState({ field: 'productOrdersTotalQuantity', value: 0 }));
    dispatch(SetProductState({ field: 'productOrdersTotal', value: 0 }));
    dispatch(SetProductState({ field: 'productOrders', value: [] }));
  }, []);

  return (
    <div>
      <Box display="flex" justifyContent="space-between" mb={1.5} alignItems="center">
        <h3 className="m-0">Orders</h3>
        <Stack spacing={2} direction="row" alignItems="center">
          <Box component="span" color="#5A5F7D">
            Total Quantity:
            <Box component="span" color="#272B41" fontWeight="600" marginLeft="2px">{productOrdersTotalQuantity || 0}</Box>
          </Box>
          <Box component="span" color="#5A5F7D">
            Total Amount:
            <Box component="span" color="#272B41" fontWeight="600" marginLeft="2px">{`$${productOrderTotalAmount ? Number(productOrderTotalAmount).toFixed(2) : '0.00'} `}</Box>
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
      <Box mt={3} position="relative">
        {getProductOrdersLoading ? <LoaderWrapper /> : null}
        <Table
          tableHeader={ordersHeader}
          height="500px"
          bodyPadding="14px 12px"
          sortableHeader={productOrderSort}
          handleSort={handleSortChange}
          sortValue={sortValue}
        >
          {data.map((row) => (
            <TableRow
              hover
              key={row.name}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.orderNo}
              </TableCell>
              <TableCell>{row.quantity}</TableCell>
              <TableCell>{row.price}</TableCell>
              <TableCell>{row.subTotal}</TableCell>
              <TableCell>{row.sale}</TableCell>
              <TableCell>{row.orderStatus}</TableCell>
              <TableCell>{row.status}</TableCell>
              <TableCell>{row.date}</TableCell>
              <TableCell>{row.sku}</TableCell>
              <TableCell>{row.action}</TableCell>
            </TableRow>
          ))}
        </Table>
        <Pagination
          position="relative"
          width="0"
          componentName="products"
          perPageRecord={productOrders?.length || 0}
          total={productOrdersTotal}
          totalPages={Math.ceil(productOrdersTotal / pagination.pageLimit)}
          offset={productOrdersTotal}
          pageNumber={pagination.pageNumber}
          pageLimit={pagination.pageLimit}
          handlePageLimitChange={handlePageLimit}
          handlePageNumberChange={handlePageNumber}
        />
      </Box>
    </div>
  );
};

export default Orders;
