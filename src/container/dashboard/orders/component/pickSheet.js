import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { debounce, difference, camelCase } from 'lodash';
import moment from 'moment';
import {
  Box, TableCell, TableRow
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { ReactSVG } from 'react-svg';
import Table from '../../../../components/ag-grid-table';
import Select from '../../../../components/select';
import SearchInput from '../../../../components/searchInput';
import CheckBox from '../../../../components/checkbox';
import PrintSheetDrawer from './drawer/printSheet';
import Button from '../../../../components/button';
import Pagination from '../../../../components/pagination';
import LoaderWrapper from '../../../../components/loader';

import IconBatch from '../../../../static/images/icon-batch.svg';

import {
  printPickHeader, salesChannel, packItem,
  PLATFORMS,
  SALES_CHANNELS,
  orderPickSheetSort
} from '../../../../constants';

import {
  SetOrderState,
  SetProcessOrderState
} from '../../../../redux/slices/order';
import {
  DownloadOrders,
  GetPickSheetOrders,
  SetOrderPickSheetState,
  SaveSelectedOrdersId
} from '../../../../redux/slices/order/pick-sheet-slice';
// helpers
import { generateSalesChannelLink } from '../../../../../utils/helpers';
import ProductHeaderWrapper from '../../products/style';

const PickSheet = () => {
  const dispatch = useDispatch();

  const {
    loading,
    ordersDownloaded,
    pickSheetFilters,
    pickSheetOrders,
    totalPickSheetOrders
  } = useSelector((state) => state.orderPickSheet);

  const {
    user: { permissions: { viewOrders = false } = {} },
    user
  } = useSelector((state) => state.auth);

  const navigate = useNavigate();

  const [batchDetails, setBatchDetails] = useState(false);
  const [printSheet, setPrintSheet] = useState(false);
  const [checked, setChecked] = useState(false);
  const [headerCheckBox, setHeaderCheckBox] = useState(false);
  const [selectedOrdersForDownload, setSelectedOrdersForDownload] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [searchByKeyWordsValue, setSearchByKeyWordsValue] = useState('');
  const [ordersIds, setOrdersIds] = useState([]);
  const [selectedOrderNumbers, setSelectedOrderNumbers] = useState([]);
  const [orderIdsList, setOrderIdsList] = useState([]);

  const [sortValue, setSortValue] = useState({});

  function createData(
    _id,
    order,
    orderId,
    recipient,
    sale,
    date
  ) {
    return {
      _id,
      order,
      orderId,
      recipient,
      sale,
      date
    };
  }

  const getPickSheetOrders = () => {
    const skip = (pickSheetFilters.pickSheetPageNumber - 1)
      * pickSheetFilters.pickSheetPageLimit;
    const limit = pickSheetFilters.pickSheetPageLimit;

    dispatch(GetPickSheetOrders({
      filters: pickSheetFilters,
      skip,
      limit,
      sortBy: sortValue
    }));
  };

  const handlePageLimit = (e) => {
    dispatch(SetOrderPickSheetState({
      field: 'pickSheetFilters',
      value: {
        ...pickSheetFilters,
        pickSheetPageLimit: e,
        pickSheetPageNumber: 1
      }
    }));
  };

  const handlePageNumber = (e) => {
    dispatch(SetOrderPickSheetState({
      field: 'pickSheetFilters',
      value: {
        ...pickSheetFilters,
        pickSheetPageNumber: e
      }
    }));
  };

  const handleFiltersChange = (e) => {
    const { name, value } = e.target;
    dispatch(SetOrderPickSheetState({
      field: 'pickSheetFilters',
      value: {
        ...pickSheetFilters,
        pickSheetPageNumber: 1,
        [name]: value
      }
    }));
  };

  const handleSearch = debounce((value, key) => {
    dispatch(SetOrderPickSheetState({
      field: 'pickSheetFilters',
      value: {
        ...pickSheetFilters,
        pickSheetPageNumber: 1,
        searchByKeyWords: {
          ...pickSheetFilters.searchByKeyWords,
          [key]: value
        }
      }
    }));
  }, 500);

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

  const handleHeaderCheckBoxClicked = (e) => {
    const allOrderIds = pickSheetOrders.map((order) => (order._id));
    const allOrderNumbers = pickSheetOrders.map((order) => (order.orderNo));
    if (e.target.checked) {
      setHeaderCheckBox(true);
      setSelectedOrdersForDownload([...selectedOrdersForDownload, ...allOrderIds]);
      setSelectedOrderNumbers([...selectedOrderNumbers, ...allOrderNumbers]);
    } else {
      const filteredId = selectedOrdersForDownload.filter(
        (id) => !allOrderIds.includes(id)
      );
      const filteredOrderNumber = selectedOrderNumbers.filter(
        (orderNo) => !allOrderNumbers.includes(orderNo)
      );

      setHeaderCheckBox(false);
      setSelectedOrdersForDownload(filteredId);
      setSelectedOrderNumbers(filteredOrderNumber);
    }
  };

  const handleCheckBoxClick = (e, oId, orderNo) => {
    if (e.target.checked) {
      setSelectedOrdersForDownload([
        ...selectedOrdersForDownload,
        oId
      ]);
      setSelectedOrderNumbers([
        ...selectedOrderNumbers,
        orderNo
      ]);
    } else {
      const ordersIdList = selectedOrdersForDownload.filter((id) => id !== oId);
      setSelectedOrdersForDownload([...ordersIdList]);
      const orderNumbersList = selectedOrderNumbers.filter((ordNo) => ordNo !== orderNo);
      setSelectedOrderNumbers([...orderNumbersList]);
    }
  };

  const handleDownloadClickEvent = () => {
    if (selectedOrdersForDownload.length) {
      const { userId } = user;
      dispatch(DownloadOrders({
        userId,
        selectIds: selectedOrdersForDownload,
        salesChannel: pickSheetFilters.salesChannel
      }));
    }
  };

  const handlePrintSheet = () => {
    if (selectedOrdersForDownload.length) {
      dispatch(SaveSelectedOrdersId({
        selectIds: selectedOrdersForDownload,
        salesChannel: pickSheetFilters.salesChannel
      }));
      setOrderIdsList(selectedOrdersForDownload);
      let allOrderIds = pickSheetOrders.map((order) => (order._id));

      if (selectedOrdersForDownload.length) {
        allOrderIds = [...allOrderIds, ...selectedOrdersForDownload];
      }
      const filteredId = selectedOrdersForDownload.filter(
        (id) => !allOrderIds.includes(id)
      );
      setHeaderCheckBox(false);
      setSelectedOrdersForDownload(filteredId);
      setPrintSheet(true);
    }
  };

  useEffect(() => {
    if (pickSheetFilters.salesChannel && !printSheet) {
      getPickSheetOrders();
    }
  }, [pickSheetFilters, printSheet, sortValue]);

  useEffect(() => {
    if (!printSheet) {
      dispatch(SetOrderPickSheetState({
        field: 'pickSheetFilters',
        value: {
          ...pickSheetFilters,
          pickSheetPageNumber: 1
        }
      }));
    }
  }, [printSheet]);

  useEffect(() => {
    if (difference(ordersIds, selectedOrdersForDownload).length === 0) {
      setHeaderCheckBox(true);
    } else setHeaderCheckBox(false);
  }, [selectedOrdersForDownload]);

  useEffect(() => {
    if (pickSheetOrders.length) {
      const queueItemsIdList = pickSheetOrders.map((row) => (row._id));
      setOrdersIds(queueItemsIdList);

      if (difference(queueItemsIdList, selectedOrdersForDownload).length === 0) {
        setHeaderCheckBox(true);
      } else setHeaderCheckBox(false);

      const ordersList = pickSheetOrders.map((order) => (
        createData(
          order._id,
          order.orderNo || '--',
          order.marketPlaceOrderId || '--',
          order.recipient || '--',
          order.salesChannel ? PLATFORMS[order.salesChannel] : '--',
          order.orderDate ? moment(order.orderDate).format('LLL') : '--'
        )
      ));
      setOrdersData(ordersList);
    } else {
      setHeaderCheckBox(false);
      setOrdersData([]);
    }
  }, [pickSheetOrders]);

  useEffect(() => {
    setSearchByKeyWordsValue(pickSheetFilters?.searchByKeyWords?.orderNo || '');

    if (pickSheetFilters.salesChannel === '') {
      dispatch(SetOrderPickSheetState({
        field: 'pickSheetFilters',
        value: {
          ...pickSheetFilters,
          salesChannel: SALES_CHANNELS.ALL
        }
      }));
    }
    setSelectedOrderNumbers([]);
    return () => {
      if (!window.location.pathname.startsWith('/orders' || '/orders/')) {
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

  useEffect(() => {
    if (ordersDownloaded) {
      setSelectedOrdersForDownload([]);
      setSelectedOrderNumbers([]);
      dispatch(SetOrderPickSheetState({ field: 'ordersDownloaded', value: false }));
    }
  }, [ordersDownloaded]);

  return (
    <>
      {/* {!batchDetails
        ?  */}
      {/* ( */}
      <>
        <ProductHeaderWrapper>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <h2 className="m-0">Pick Sheet</h2>
            <Box display="flex" gap={2} flexWrap="wrap" justifyContent="end" className="ms-auto">
              <Select
                vertical
                label="By Sales Channel:"
                placeholder="Select"
                menuItem={salesChannel}
                width="131px"
                handleChange={handleFiltersChange}
                value={pickSheetFilters.salesChannel}
                name="salesChannel"
              />
              <Select vertical label="Pack/Non Pack:" value="" placeholder="Select" menuItem={packItem} width="131px" />
              <SearchInput
                autoComplete="off"
                placeholder="Search by Order #"
                width="240px"
                value={searchByKeyWordsValue}
                onChange={(e) => {
                  setSearchByKeyWordsValue(e.target.value);
                  handleSearch(e.target.value, 'orderNo');
                }}
              />
              <Button
                startIcon={<span className="icon-download" />}
                className="icon-button"
                disabled={!viewOrders || !selectedOrdersForDownload.length}
                onClick={handleDownloadClickEvent}
              />
              <Button
                startIcon={<ReactSVG className="icon-batch-custom" src={IconBatch} />}
                text="Batch Details"
                onClick={() => navigate('/orders/pick-sheet/batch-detail')}
              />
              <Button
                startIcon={<span className={`icon-${checked ? 'Save' : 'print'}`} />}
                text="Print Sheet"
                disabled={!viewOrders || !selectedOrdersForDownload.length}
                onClick={handlePrintSheet}
              />
            </Box>
          </Box>
        </ProductHeaderWrapper>
        <Box mt={3}>
          <Table
            fixed
            checkbox
            alignCenter
            tableHeader={printPickHeader}
            height="195px"
            bodyPadding="10px 12px"
            isChecked={headerCheckBox}
            handleHeaderCheckBoxClicked={handleHeaderCheckBoxClicked}
            sortableHeader={orderPickSheetSort}
            handleSort={handleSortChange}
            sortValue={sortValue}
          >
            {loading ? <LoaderWrapper /> : ordersData.length > 0 ? (
              ordersData.map((row) => (
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
                        gap={1.5}
                      >
                        <CheckBox
                          key={row?._id}
                          marginBottom="0"
                          className="body-checkbox"
                          checked={selectedOrdersForDownload.includes(String(row._id))}
                          onClick={(e) => handleCheckBoxClick(e, row._id, row.order)}
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
                  <TableCell>{row.sale}</TableCell>
                  <TableCell>{row.date}</TableCell>
                </TableRow>
              ))
            ) : !loading && totalPickSheetOrders === 0 && (
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
            perPageRecord={pickSheetOrders?.length || 0}
            total={totalPickSheetOrders}
            totalPages={Math.ceil(totalPickSheetOrders / pickSheetFilters.pickSheetPageLimit)}
            offset={totalPickSheetOrders}
            pageNumber={pickSheetFilters.pickSheetPageNumber}
            pageLimit={pickSheetFilters.pickSheetPageLimit}
            handlePageLimitChange={handlePageLimit}
            handlePageNumberChange={handlePageNumber}
          />
        </Box>
      </>
      {/* ) */}
      {/* // : <BatchDetails onClose={() => setBatchDetails(false)} />} */}
      {printSheet
        ? (
          <PrintSheetDrawer
            open={printSheet}
            onClose={() => setPrintSheet(false)}
            orderNumberList={selectedOrderNumbers}
            setSelectedOrderNumbers={setSelectedOrderNumbers}
            selectedOrdersForDownload={orderIdsList}
          />
        )
        : null}
    </>
  );
};

export default PickSheet;
