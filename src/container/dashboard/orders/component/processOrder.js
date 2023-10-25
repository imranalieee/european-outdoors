import CryptoJS from 'crypto-js';
import React, { useState, useEffect } from 'react';
import {
  Box, TableCell, TableRow, Tooltip
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  debounce, difference, isEmpty, camelCase
} from 'lodash';
import moment from 'moment';
import Table from '../../../../components/ag-grid-table';
import SearchInput from '../../../../components/searchInput';
import CheckBox from '../../../../components/checkbox';
import Button from '../../../../components/button';
import Select from '../../../../components/select';
import LoaderWrapper from '../../../../components/loader';
import Pagination from '../../../../components/pagination';
import OrderWorkflow from './orderWorkflow';

import {
  orderManagementByFilters,
  processOrderHeader,
  salesChannel as SALES_CHANNEL_LIST,
  PLATFORMS,
  orderProcessSort
} from '../../../../constants';
// redux
import {
  DownloadOrders,
  GetProcessOrders,
  SaveSelectedProcessOrders,
  SetProcessOrderState,
  SetOrderState
} from '../../../../redux/slices/order';
import { SetOrderPickSheetState } from '../../../../redux/slices/order/pick-sheet-slice';
// helpers
import { generateSalesChannelLink } from '../../../../../utils/helpers';
import ProductHeaderWrapper from '../../products/style';

const ProcessOrder = (props) => {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const {
    getProcessOrdersLoading,
    ordersDownloaded,
    processOrderFilters,
    processOrders,
    saveSelectedOrdersParams,
    totalProcessOrders
  } = useSelector((state) => state.processOrder);
  const {
    user: { permissions: { editOrders = false, viewOrders = false } = {} },
    user
  } = useSelector((state) => state.auth);
  const [orderNo, setOrderNo] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState({});
  const [searchByKeyWordsValue, setSearchByKeyWordsValue] = useState('');
  const [orderData, setOrderData] = useState([]);
  const [headerCheckBox, setHeaderCheckBox] = useState(false);
  const [ordersIds, setOrdersIds] = useState([]);
  const [selectedOrdersForDownload, setSelectedOrdersForDownload] = useState([]);
  const [sortValue, setSortValue] = useState({});

  function createData(
    _id,
    order,
    orderId,
    recipient,
    sale,
    date,
    action
  ) {
    return {
      _id,
      order,
      orderId,
      recipient,
      sale,
      date,
      action
    };
  }
  const data = [];
  for (let i = 0; i <= 3; i += 1) {
    data.push(
      createData(
        '1994589',
        '11-09513-33553',
        'Kody Antley',
        'Ebay Rapido',
        '28 Dec 2022 ',
        <Box component="span" className="icon-left-arrow pointer" onClick={() => setOrderNo(true)} />
      )
    );
  }

  const getProcessOrders = () => {
    const skip = (processOrderFilters.processOrderPageNumber - 1)
      * processOrderFilters.processOrderPageLimit;
    const limit = processOrderFilters.processOrderPageLimit;

    dispatch(GetProcessOrders({
      skip,
      limit,
      filters: processOrderFilters,
      sortBy: sortValue
    }));
  };

  const handlePageLimit = (e) => {
    dispatch(SetProcessOrderState({
      field: 'processOrderFilters',
      value: {
        ...processOrderFilters,
        processOrderPageLimit: e,
        processOrderPageNumber: 1
      }
    }));
  };

  const handlePageNumber = (e) => {
    dispatch(SetProcessOrderState({
      field: 'processOrderFilters',
      value: {
        ...processOrderFilters,
        processOrderPageNumber: e
      }
    }));
  };

  const handleFiltersChange = (e) => {
    const { name, value } = e.target;
    dispatch(SetProcessOrderState({
      field: 'processOrderFilters',
      value: {
        ...processOrderFilters,
        processOrderPageNumber: 1,
        [name]: value
      }
    }));
  };

  const handleSearch = debounce((value, key) => {
    dispatch(SetProcessOrderState({
      field: 'processOrderFilters',
      value: {
        ...processOrderFilters,
        processOrderPageNumber: 1,
        searchByKeyWords: {
          ...processOrderFilters?.searchByKeyWords,
          [key]: value
        }
      }
    }));
  }, 500);

  const handleHeaderCheckBoxClicked = (e) => {
    const allOrderIds = processOrders?.map((order) => (order._id));
    if (e.target.checked) {
      setHeaderCheckBox(true);
      setSelectedOrdersForDownload([...selectedOrdersForDownload, ...allOrderIds]);
    } else {
      const filteredId = selectedOrdersForDownload.filter(
        (id) => !allOrderIds.includes(id)
      );

      setHeaderCheckBox(false);
      setSelectedOrdersForDownload(filteredId);
    }
  };

  const handleCheckBoxClick = (e, oId) => {
    if (e.target.checked) {
      setSelectedOrdersForDownload([
        ...selectedOrdersForDownload,
        oId
      ]);
    } else {
      const ordersIdList = selectedOrdersForDownload.filter((id) => id !== oId);
      setSelectedOrdersForDownload([...ordersIdList]);
    }
  };

  const handleDownloadClickEvent = () => {
    if (selectedOrdersForDownload.length) {
      dispatch(SaveSelectedProcessOrders({
        selectIds: selectedOrdersForDownload,
        salesChannel: processOrderFilters.salesChannel
      }));
    }
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
    setHeaderCheckBox(false);
    getProcessOrders();
  }, [processOrderFilters, sortValue]);

  useEffect(() => {
    if (difference(ordersIds, selectedOrdersForDownload).length === 0) {
      setHeaderCheckBox(true);
    } else setHeaderCheckBox(false);
  }, [selectedOrdersForDownload]);

  useEffect(() => {
    if (processOrders?.length) {
      if (processOrderFilters?.searchByKeyWords?.orderNo
        && processOrderFilters?.searchByKeyWords?.orderNo !== ''
        && processOrders?.length === 1) {
        navigate(`/orders/process-orders/${processOrders[0]?._id}`);
        dispatch(SetProcessOrderState({
          field: 'processOrderFilters',
          value: {
            ...processOrderFilters,
            searchByKeyWords: ''
          }
        }));
      }
      const queueItemsIdList = processOrders.map((row) => (row._id));
      setOrdersIds(queueItemsIdList);

      if (difference(queueItemsIdList, selectedOrdersForDownload).length === 0) {
        setHeaderCheckBox(true);
      } else setHeaderCheckBox(false);

      const orderDataList = processOrders.map((order) => (
        createData(
          order._id,
          order.orderNo || '--',
          order.marketPlaceOrderId || '--',
          <Box className="product-name-clamp" component="span">
            {order.recipient
              ? order.recipient.length > 30 ? (
                <Tooltip placement="top-start" arrow title={order.recipient}>
                  <span>{order.recipient}</span>
                </Tooltip>
              ) : (
                <span>{order.recipient}</span>
              )
              : ' -- '}
          </Box>,
          PLATFORMS[order.salesChannel] || '--',
          order.orderDate ? moment(order.orderDate).format('LLL') : '--',
          <Box
            component="span"
            className="icon-left-arrow pointer"
            onClick={() => {
              setOrderNo(true);
              navigate(`/orders/process-orders/${order._id}`);
              // setSelectedOrder(order);
            }}
          />
        )
      ));
      setOrderData(orderDataList);
    } else {
      setHeaderCheckBox(false);
      setOrderData([]);
    }
  }, [processOrders]);

  useEffect(() => {
    if (ordersDownloaded) {
      setSelectedOrdersForDownload([]);
      dispatch(SetProcessOrderState({ field: 'ordersDownloaded', value: false }));
    }
  }, [ordersDownloaded]);

  useEffect(() => {
    if (saveSelectedOrdersParams) {
      const { userId } = user;
      const userIdJson = CryptoJS.AES.encrypt(String(userId), process.env.HASH).toString();
      const userIdData = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(userIdJson));
      dispatch(DownloadOrders({ userId: userIdData, isProcessOrder: true }));
      dispatch(SetProcessOrderState({ field: 'saveOrdersParams', value: false }));
    }
    return () => {
      dispatch(SetProcessOrderState({ field: 'saveSelectedOrdersParams', value: false }));
    };
  }, [saveSelectedOrdersParams]);

  useEffect(() => {
    if (!isEmpty(processOrderFilters?.searchByKeyWords?.orderNo)) {
      setSearchByKeyWordsValue(processOrderFilters?.searchByKeyWords?.orderNo || '');
    }
    dispatch(SetProcessOrderState({ field: 'selectLookUpProcess', value: false }));
    return () => {
      if (!window.location.pathname.startsWith('/orders' || '/orders/')) {
        dispatch(SetProcessOrderState({
          field: 'processOrderFilters',
          value: {
            salesChannel: '',
            processOrderPageLimit: 100,
            processOrderPageNumber: 1,
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
      }
    };
  }, []);

  return (
    <>
      <ProductHeaderWrapper>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <h2 className="m-0">Process Orders</h2>
          <Box  display="flex" gap={2} flexWrap="wrap" justifyContent="end" className="ms-auto">
            <Select
              vertical
              label="By Sales Channel:"
              value={processOrderFilters.salesChannel}
              placeholder="Select"
              menuItem={SALES_CHANNEL_LIST}
              width="188px"
              name="salesChannel"
              handleChange={handleFiltersChange}
              helperText=""
            />
            <SearchInput
              autoComplete="off"
              placeholder="Search by Order #"
              width="247px"
              onChange={(e) => {
                setSearchByKeyWordsValue(e.target.value);
                handleSearch(e.target.value, 'orderNo');
              }}
              value={searchByKeyWordsValue}
            />
            <Button
              startIcon={<span className="icon-download" />}
              className="icon-button"
              disabled={!editOrders || !selectedOrdersForDownload.length}
              onClick={handleDownloadClickEvent}
            />
          </Box>
        </Box>
      </ProductHeaderWrapper>
      <Box mt={3}>
        <Table
          fixed
          checkbox
          alignCenter
          tableHeader={processOrderFilters?.salesChannel === 'all'
            || !processOrderFilters?.salesChannel
            ? processOrderHeader
            : orderManagementByFilters}
          height="205px"
          bodyPadding="12px 10px"
          isChecked={headerCheckBox}
          handleHeaderCheckBoxClicked={handleHeaderCheckBoxClicked}
          sortableHeader={orderProcessSort}
          handleSort={handleSortChange}
          sortValue={sortValue}
        >
          {getProcessOrdersLoading
            ? <LoaderWrapper />
            : orderData.length ? (

              orderData.map((row) => (
                <TableRow
                  hover
                  key={row.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    <Box component="span" display="flex" alignItems="center" gap={1.5}>
                      <Box
                        component="span"
                        display="flex"
                        alignItems="center"
                        gap={2}
                      >
                        <CheckBox
                          key={row?._id}
                          marginBottom="0"
                          className="body-checkbox"
                          checked={selectedOrdersForDownload.includes(String(row._id))}
                          onClick={(e) => handleCheckBoxClick(e, row._id)}
                        />

                        {row.order}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {row.orderId
                      ? row.sale === 'Phone Order'
                        ? row.orderId
                        : (
                          <a
                            target="_blank"
                            color="#3C76FF"
                            href={generateSalesChannelLink({
                              id: row.orderId, salesChannel: row.sale
                            })}
                            rel="noreferrer"
                          >
                            {row.orderId}
                          </a>
                        )
                      : '--'}
                  </TableCell>
                  <TableCell>{row.recipient}</TableCell>
                  {(processOrderFilters?.salesChannel === 'all'
                    || !processOrderFilters?.salesChannel)
                    && <TableCell>{row.sale}</TableCell>}
                  <TableCell>{row.date}</TableCell>
                  <TableCell align="right">{row.action}</TableCell>
                </TableRow>
              ))
            ) : !getProcessOrdersLoading && totalProcessOrders === 0 && (
              <TableRow>
                <TableCell sx={{ borderBottom: '24px' }} colSpan={7} align="center">
                  <Box textAlign="center" display="flex" alignItems="center" justifyContent="center" height="calc(100vh - 266px)">
                    {/* <img className="nodata-table-img" src={noData} height="100%" style={{ maxWidth: '100%' }} alt="no-Data" /> */}
                  </Box>
                </TableCell>
              </TableRow>
            )}

        </Table>
        <Pagination
          componentName="orders"
          position="relative"
          width="0"
          perPageRecord={processOrders?.length || 0}
          total={totalProcessOrders}
          totalPages={Math.ceil(totalProcessOrders
            / processOrderFilters?.processOrderPageLimit)}
          offset={totalProcessOrders}
          pageNumber={processOrderFilters?.processOrderPageNumber}
          pageLimit={processOrderFilters?.processOrderPageLimit}
          handlePageLimitChange={handlePageLimit}
          handlePageNumberChange={handlePageNumber}
        />
      </Box>
    </>
  );
};

export default ProcessOrder;
