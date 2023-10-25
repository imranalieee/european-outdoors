import CryptoJS from 'crypto-js';
import React, { useState, useEffect } from 'react';
import {
  Box, TableCell, TableRow, Tooltip
} from '@mui/material';
import { utils, read } from 'xlsx';
import { useDispatch, useSelector } from 'react-redux';
import {
  camelCase, debounce, difference, extend, lowerCase, startCase, isEmpty
} from 'lodash';
import moment from 'moment';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';

// components
import { useNavigate } from 'react-router';
import Button from '../../../../components/button/index';
import CheckBox from '../../../../components/checkbox/index';
import LoaderWrapper from '../../../../components/loader';
import Pagination from '../../../../components/pagination/index';
import SearchInput from '../../../../components/searchInput/index';
import Select from '../../../../components/select/index';
import Table from '../../../../components/ag-grid-table/index';
import UploadModal from './modals/upload';
// redux
import {
  DownloadOrders,
  GetOrders,
  SaveSelectedOrdersId,
  SetOrderState,
  SetOrderNotifyState,
  SaveUploadedOrderSheetInDb
} from '../../../../redux/slices/order';
import { GetS3PreSignedUrl, SetOtherState } from '../../../../redux/slices/other-slice';
// helpers
import { UploadDocumentOnS3, generateSalesChannelLink } from '../../../../../utils/helpers';
import {
  BADGE_CLASS,
  orderManagementOrder,
  ORDER_STATUS,
  PLATFORMS,
  SALES_CHANNELS,
  salesChannel as SALES_CHANNEL_LIST,
  orderManagementBySalesChannel,
  orderManagementByOrderStatus,
  orderManagementByFilters,
  orderManagementSort
} from '../../../../constants/index';
import ProductHeaderWrapper from '../../products/style';

const headerFormat = ['orderNumber', 'stockNumberSku', 'quantity', 'unitCost', 'shippingDate', 'expectedDate', 'shippingMethod', 'shipToLocation', 'customerName', 'streetAddress', 'city', 'stateProvince', 'zipCode', 'emailAddress', 'phone'];
const OrderManager = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    getOrdersLoading,
    ordersDownloaded,
    orderManagerFilters,
    orders,
    saveSelectedOrdersParams,
    totalOrders,
    success,
    saveOrderJobTriggered,
    saveOrderJobTriggeredLoading,
    orderConfirmed
  } = useSelector((state) => state.order);

  const {
    user: { permissions: { editOrders = false, viewOrders = false } = {}, userId },
    user
  } = useSelector((state) => state.auth);

  const {
    preSignedUrl,
    fileUploadKey
  } = useSelector((state) => state.other);

  const [uploadOrder, setUploadOrder] = useState(false);
  const [newOrder, setNewOrder] = useState(false);
  const [searchByKeyWordsValue, setSearchByKeyWordsValue] = useState('');
  const [orderNo, setOrderNo] = useState(false);
  const [orderId, setOrderId] = useState('');

  const [orderData, setOrderData] = useState([]);
  const [headerCheckBox, setHeaderCheckBox] = useState(false);
  const [selectedOrdersForDownload, setSelectedOrdersForDownload] = useState([]);
  const [ordersIds, setOrdersIds] = useState([]);
  const [tableHeaders, setTableHeaders] = useState([]);

  const [attachmentName, setAttachmentName] = useState('');
  const [attachment, setAttachment] = useState();
  const [attachmentLoading, setAttachmentLoading] = useState(false);
  const [validUploadOrder, setValidUploadOrder] = useState(false);

  const [sortValue, setSortValue] = useState({});

  function createData(
    _id,
    orderNumber,
    oId,
    recipient,
    sale,
    status,
    date,
    action
  ) {
    return {
      _id,
      orderNumber,
      oId,
      recipient,
      sale,
      status,
      date,
      action
    };
  }

  const getOrders = () => {
    const skip = (orderManagerFilters.orderManagerPageNumber - 1)
      * orderManagerFilters.orderManagerPageLimit;
    const limit = orderManagerFilters.orderManagerPageLimit;

    dispatch(GetOrders({
      skip,
      limit,
      filters: orderManagerFilters,
      sortBy: sortValue
    }));
  };

  const handlePageLimit = (e) => {
    dispatch(SetOrderState({
      field: 'orderManagerFilters',
      value: {
        ...orderManagerFilters,
        orderManagerPageLimit: e,
        orderManagerPageNumber: 1
      }
    }));
  };

  const handlePageNumber = (e) => {
    dispatch(SetOrderState({
      field: 'orderManagerFilters',
      value: {
        ...orderManagerFilters,
        orderManagerPageNumber: e
      }
    }));
  };

  const handleFiltersChange = (e) => {
    const { name, value } = e.target;
    dispatch(SetOrderState({
      field: 'orderManagerFilters',
      value: {
        ...orderManagerFilters,
        orderManagerPageNumber: 1,
        [name]: value
      }
    }));
    if (name === 'salesChannel' && value === 'all' && orderManagerFilters.orderStatus === 'all') {
      setTableHeaders(orderManagementOrder);
    } else if (name === 'salesChannel' && value !== 'all' && orderManagerFilters.orderStatus === 'all') {
      setTableHeaders(orderManagementBySalesChannel);
    } else if (name === 'salesChannel' && value !== 'all' && orderManagerFilters.orderStatus !== 'all') {
      setTableHeaders(orderManagementByFilters);
    } else if (name === 'salesChannel' && value === 'all' && orderManagerFilters.orderStatus !== 'all') {
      setTableHeaders(orderManagementByOrderStatus);
    }
    if (name === 'orderStatus' && value === 'all' && orderManagerFilters.salesChannel === SALES_CHANNELS.ALL) {
      setTableHeaders(orderManagementOrder);
    } else if (name === 'orderStatus' && value !== 'all' && orderManagerFilters.salesChannel === SALES_CHANNELS.ALL) {
      setTableHeaders(orderManagementByOrderStatus);
    } else if (name === 'orderStatus' && value !== 'all' && orderManagerFilters.salesChannel !== SALES_CHANNELS.ALL) {
      setTableHeaders(orderManagementByFilters);
    } else if (name === 'orderStatus' && value === 'all' && orderManagerFilters.salesChannel !== SALES_CHANNELS.ALL) {
      setTableHeaders(orderManagementBySalesChannel);
    }
  };

  const handleSearch = debounce((value, key) => {
    dispatch(SetOrderState({
      field: 'orderManagerFilters',
      value: {
        ...orderManagerFilters,
        orderManagerPageNumber: 1,
        searchByKeyWords: {
          ...orderManagerFilters.searchByKeyWords,
          [key]: value
        }
      }
    }));
  }, 500);

  const handleHeaderCheckBoxClicked = (e) => {
    const allOrderIds = orders.map((order) => (order._id));
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
      dispatch(SaveSelectedOrdersId({
        selectIds: selectedOrdersForDownload,
        salesChannel: orderManagerFilters.salesChannel
      }));
    }
  };

  const validateHeaders = (target, pattern) => {
    target = target.map((value) => camelCase(value.toLowerCase().trim()));

    let isHeadersOk = true;
    for (let i = 0; i < pattern?.length; i += 1) {
      const headerValue = pattern[i];
      isHeadersOk = target.includes(headerValue);

      if (!isHeadersOk) break;
    }
    return isHeadersOk;
  };

  const handleChangeAttachment = async (e) => {
    const { files } = e.target;

    if (files?.length) {
      const file = files[0];
      const fileName = file.name.split('.')[0];

      const extensionFile = file.name.split('.').pop();

      if (extensionFile !== 'csv' && extensionFile !== 'xlsx') {
        dispatch(
          SetOrderNotifyState({
            message: 'Supported extension is csv && xlsx'
          })
        );
        return;
      }

      const reader = new FileReader();
      reader.readAsArrayBuffer(e.target.files[0]);
      reader.onload = async (event) => {
        const fileData = event.target.result;

        const workbook = read(fileData, { type: 'array', cellDates: true });
        const sheetName = workbook.SheetNames[0];

        const worksheet = workbook.Sheets[sheetName];

        const ordersData = utils.sheet_to_json(worksheet, {
          header: 0,
          defval: ''
        });

        if (ordersData && ordersData?.length) {
          const fileHeaders = Object.keys(ordersData[0]);

          const headerFormatValidated = validateHeaders(
            fileHeaders,
            headerFormat
          );

          if (headerFormatValidated) {
            setAttachment(file);
            setAttachmentName(fileName);
            setValidUploadOrder(true);
          } else {
            dispatch(
              SetOrderNotifyState({
                message: 'Error in sheet header format',
                type: 'error'
              })
            );
          }
        } else {
          dispatch(
            SetOrderNotifyState({
              message: 'Sheet is empty',
              type: 'error'
            })
          );
        }
      };
    }
  };

  const handleSaveAttachment = () => {
    const extension = attachment.name.split('.').pop();
    if (extension !== 'csv' && extension !== 'xlsx') {
      dispatch(
        SetOrderNotifyState({ message: 'Supported extension is csv && xlsx' })
      );
      return;
    }
    const formattedFileName = attachmentName.replace(/\s/g, '-');

    if (validUploadOrder) {
      setAttachmentLoading(true);

      dispatch(
        GetS3PreSignedUrl({
          fileName: `${formattedFileName}-${moment().format(
            'YYYY-MM-DD HH:mm:ss'
          )}.${extension}`,
          fileType: attachment.type,
          fileExtension: extension,
          uploadBucket: 'orderDocs'
        })
      );
    } else {
      setAttachmentName('');
      setAttachment(null);
      setValidUploadOrder(false);
      dispatch(
        SetOrderNotifyState({
          message: 'Upload Attachment is not valid',
          type: 'error'
        })
      );
    }
  };

  const handleUploadAttachmentOnS3 = async () => {
    const response = await UploadDocumentOnS3({
      preSignedUrl,
      file: attachment
    });

    if (response) {
      dispatch(
        SaveUploadedOrderSheetInDb({
          userId,
          fileUploadKey
        })
      );
    } else {
      setAttachmentLoading(false);
      dispatch(
        SetOrderNotifyState({
          message: 'File uploading failed on S3',
          type: 'error'
        })
      );
    }
  };

  const handleUploadOrderSheetClose = () => {
    setUploadOrder(false);
    setAttachment(null);
    setAttachmentName('');
    setAttachmentLoading(false);
  };

  useEffect(() => {
    if (preSignedUrl !== '' && !orderNo && !newOrder) {
      handleUploadAttachmentOnS3();
    }
  }, [preSignedUrl]);

  useEffect(() => {
    if (orderConfirmed) {
      dispatch(SetOrderNotifyState({ message: 'Confirm action done successfully', type: 'success' }));
      dispatch(SetOrderState({ field: 'orderConfirmed', value: false }));
    }
  }, [orderConfirmed]);

  useEffect(() => {
    if (success && saveOrderJobTriggered) {
      if (attachmentLoading) {
        setAttachmentLoading(false);
        setAttachmentName('');
        setUploadOrder(false);
        setAttachment(null);
        setValidUploadOrder(false);

        dispatch(SetOrderState({ field: 'saveOrderJobTriggered', value: false }));
        dispatch(SetOtherState({ field: 'preSignedUrl', value: '' }));
      }
    }
    if (!success && !saveOrderJobTriggeredLoading && attachmentLoading) {
      dispatch(SetOrderState({ field: 'saveOrderJobTriggered', value: false }));
      dispatch(SetOtherState({ field: 'preSignedUrl', value: '' }));
      setAttachmentLoading(false);
    }
  }, [success, saveOrderJobTriggeredLoading]);

  useEffect(() => {
    if (difference(ordersIds, selectedOrdersForDownload).length === 0) {
      setHeaderCheckBox(true);
    } else setHeaderCheckBox(false);
  }, [selectedOrdersForDownload]);

  useEffect(() => {
    if (ordersDownloaded) {
      setSelectedOrdersForDownload([]);
      dispatch(SetOrderState({ field: 'ordersDownloaded', value: false }));
    }
  }, [ordersDownloaded]);

  useEffect(() => {
    if (saveSelectedOrdersParams) {
      const userIdJson = CryptoJS.AES.encrypt(String(userId), process.env.HASH).toString();
      const userIdData = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(userIdJson));
      dispatch(DownloadOrders({ userId: userIdData, isProcessOrder: false }));
      dispatch(SetOrderState({ field: 'saveSelectedOrdersParams', value: false }));
    }
  }, [saveSelectedOrdersParams]);

  // useEffect(() => {
  //   if (orders?.length) {
  //     const orderDataList = orders.map((order) => (
  //       createData(
  //         order._id,
  //         order.orderNo || '--',
  //         order.marketPlaceOrderId || '--',
  //         <Box className="product-name-clamp" component="span">
  //           {order.recipient
  //             ? order.recipient.length > 30 ? (
  //               <Tooltip placement="top-start" arrow title={order.recipient}>
  //                 <span>{order.recipient}</span>
  //               </Tooltip>
  //             ) : (
  //               <span>{order.recipient}</span>
  //             )
  //             : ' -- '}
  //         </Box>,
  //         PLATFORMS[order.salesChannel] || '--',
  //         <Box component="span" className={BADGE_CLASS[camelCase(order.orderStatus)]}>{order.orderStatus ? startCase(lowerCase(order.orderStatus)) : '--'}</Box>,
  //         order.orderDate ? moment(order.orderDate).format('LLL') : '--',
  //         <Box
  //           component="span"
  //           className="icon-left-arrow pointer"
  //           onClick={() => {
  //             // setOrderId(order._id);
  //             navigate(`/orders/${order._id}`);
  //           }}
  //         />
  //       )
  //     ));
  //     setOrderData(orderDataList);
  //   } else {
  //     setOrderData([]);
  //   }
  // }, [orders, orderId]);

  const handleReloadPage = () => {
    dispatch(SetOrderState({
      field: 'orderManagerFilters',
      value: {
        orderManagerPageNumber: 1,
        orderManagerPageLimit: 100,
        salesChannel: 'all',
        orderStatus: 'all',
        searchByKeyWords: { orderNo: '' }
      }
    }));

    setSearchByKeyWordsValue('');
  };

  useEffect(() => {
    if (orders?.length) {
      const queueItemsIdList = orders.map((row) => (row._id));
      setOrdersIds(queueItemsIdList);

      if (difference(queueItemsIdList, selectedOrdersForDownload).length === 0) {
        setHeaderCheckBox(true);
      } else setHeaderCheckBox(false);
    } else {
      setHeaderCheckBox(false);
    }
  }, [orders]);

  useEffect(() => {
    if (!isEmpty(orderId)) setOrderNo(true);
  }, [orderId]);

  useEffect(() => {
    if (orderManagerFilters.salesChannel && !orderNo) {
      getOrders();
    }
  }, [orderManagerFilters, orderNo, sortValue]);

  useEffect(() => {
    if (orderManagerFilters.salesChannel && orderManagerFilters.salesChannel === SALES_CHANNELS.ALL && orderManagerFilters.orderStatus && orderManagerFilters.orderStatus === 'all') {
      setTableHeaders(orderManagementOrder);
    } else if (orderManagerFilters.salesChannel && orderManagerFilters.salesChannel !== SALES_CHANNELS.ALL && orderManagerFilters.orderStatus && orderManagerFilters.orderStatus === 'all') {
      setTableHeaders(orderManagementBySalesChannel);
    } else if (orderManagerFilters.salesChannel && orderManagerFilters.salesChannel !== SALES_CHANNELS.ALL && orderManagerFilters.orderStatus && orderManagerFilters.orderStatus !== 'all') {
      setTableHeaders(orderManagementByFilters);
    } else if (orderManagerFilters.salesChannel && orderManagerFilters.salesChannel === SALES_CHANNELS.ALL && orderManagerFilters.orderStatus && orderManagerFilters.orderStatus !== 'all') {
      setTableHeaders(orderManagementByOrderStatus);
    }

    setSearchByKeyWordsValue(orderManagerFilters?.searchByKeyWords?.orderNo || '');

    const filter = {};

    if (orderManagerFilters.salesChannel === '') {
      extend(filter, { salesChannel: SALES_CHANNELS.ALL });
    }

    if (orderManagerFilters.orderStatus === '') {
      extend(filter, { orderStatus: 'all' });
    }

    dispatch(SetOrderState({
      field: 'orderManagerFilters',
      value: {
        ...orderManagerFilters,
        ...filter
      }
    }));

    return () => {
      dispatch(SetOrderState({ field: 'orders', value: [] }));
      dispatch(SetOrderState({ field: 'totalOrders', value: 0 }));
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
      }
    };
  }, []);

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

  return (
    <>
      <ProductHeaderWrapper>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <h2 className="m-0">Order Manager</h2>
          <Box display="flex" gap={2} flexWrap="wrap" justifyContent="end" className="ms-auto">
            <Select
              vertical
              label="By Sales Channel:"
              value={orderManagerFilters.salesChannel}
              placeholder="Select"
              menuItem={SALES_CHANNEL_LIST}
              width="188px"
              name="salesChannel"
              handleChange={handleFiltersChange}
              helperText=""
            />
            <Select
              vertical
              label="By Order Status:"
              value={orderManagerFilters.orderStatus}
              placeholder="Select"
              menuItem={ORDER_STATUS}
              width="188px"
              name="orderStatus"
              handleChange={handleFiltersChange}
              helperText=""
            />
            <SearchInput
              autoComplete="off"
              placeholder="Search by Order #"
              width="188px"
              onChange={(e) => {
                setSearchByKeyWordsValue(e.target.value);
                handleSearch(e.target.value, 'orderNo');
              }}
              value={searchByKeyWordsValue}
            />
            <Button
              startIcon={<span className="icon-export-icon" />}
              className="icon-button"
              tooltip="Export Orders"
              disabled={!viewOrders || !selectedOrdersForDownload.length}
              onClick={handleDownloadClickEvent}
            />
            <Button
              startIcon={<span className="icon-union" />}
              className="icon-button"
              tooltip="Import Orders"
              disabled={!editOrders}
              onClick={() => setUploadOrder(true)}
            />
            <Button
              justifyContent="left"
              startIcon={<AddCircleOutlineOutlinedIcon />}
              width="135px"
              text="Add Order"
              variant="contained"
              disabled={!editOrders}
                  // onClick={() => setNewOrder(true)}
              onClick={() => { navigate('/orders/new-order'); }}
            />
          </Box>
        </Box>
      </ProductHeaderWrapper>
      <Box mt={3}>
        <Table
          fixed
          checkbox
          alignCenter
          tableHeader={tableHeaders.length > 0 ? tableHeaders : orderManagementOrder}
          height="207px"
          bodyPadding="12px 10px"
          isChecked={headerCheckBox}
          handleHeaderCheckBoxClicked={handleHeaderCheckBoxClicked}
          key="addItemToQueueHeader"
          sortableHeader={orderManagementSort}
          handleSort={handleSortChange}
          sortValue={sortValue}
        >
          {getOrdersLoading ? <LoaderWrapper /> : null }
          {
          orders.length > 0 ? (
            orders.map((row) => (
              <TableRow
                hover
                key={row._id}
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
                        onClick={(e) => handleCheckBoxClick(e, row._id)}
                      />
                      {row.orderNo || '--'}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  {
                    PLATFORMS[row.salesChannel] === 'Phone Order' ? row.marketPlaceOrderId || '--'
                      : (
                        <a
                          target="_blank"
                          color="#3C76FF"
                          href={generateSalesChannelLink({
                            id: row.marketPlaceOrderId, salesChannel: PLATFORMS[row.salesChannel]
                          })}
                          rel="noreferrer"
                        >
                          {row.marketPlaceOrderId}
                        </a>
                      )
                    }
                </TableCell>
                <TableCell>
                  <Box className="product-name-clamp" component="span">
                    {row.recipient
                      ? row.recipient.length > 30 ? (
                        <Tooltip placement="top-start" arrow title={row.recipient}>
                          <span>{row.recipient}</span>
                        </Tooltip>
                      ) : (
                        <span>{row.recipient}</span>
                      )
                      : ' -- '}
                  </Box>
                </TableCell>
                {orderManagerFilters.salesChannel === SALES_CHANNELS.ALL
                  ? <TableCell>{PLATFORMS[row.salesChannel]}</TableCell>
                  : null}
                {orderManagerFilters.orderStatus === 'all'
                  ? (
                    <TableCell>
                      <Box component="span" className={BADGE_CLASS[camelCase(row.orderStatus)]}>
                        {row.orderStatus ? startCase(lowerCase(row.orderStatus)) : '--'}
                      </Box>
                    </TableCell>
                  )
                  : null}
                <TableCell>
                  {
                   row.orderDate ? moment(row.orderDate).format('LLL') : '--'
                  }
                </TableCell>
                <TableCell align="right">
                  <Box
                    component="span"
                    className="icon-left-arrow pointer"
                    onClick={() => {
                      navigate(`/orders/${row._id}`);
                    }}
                  />
                </TableCell>

                {/* <TableCell align="right">
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
                            onClick={(e) => handleCheckBoxClick(e, row._id)}
                          />
                          {row.orderNumber}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{row.oId}</TableCell>
                    <TableCell>{row.recipient}</TableCell>
                    {orderManagerFilters.salesChannel === SALES_CHANNELS.ALL
                      ? <TableCell>{row.sale}</TableCell>
                      : null}
                    {orderManagerFilters.orderStatus === 'all'
                      ? <TableCell>{row.status}</TableCell>
                      : null}
                    <TableCell>{row.date}</TableCell>
                    <TableCell align="right">{row.action}</TableCell>
                  </TableRow>
                ))
              ) : !getOrdersLoading && totalOrders === 0 && (
                          className="icon-left-arrow pointer"
                          onClick={() => setOrderNo(true)}
                        />
                      </TableCell> */}
              </TableRow>
            ))
          ) : !getOrdersLoading && totalOrders === 0 && (
          <TableRow>
            <TableCell sx={{ borderBottom: '24px' }} colSpan={7} align="center">
              <Box
                textAlign="center"
                display="flex"
                alignItems="center"
                justifyContent="center"
                height="calc(100vh - 266px)"
              />
            </TableCell>
          </TableRow>
          )
          }

        </Table>
        <Pagination
          componentName="order-manager"
          position="relative"
          width="0"
          perPageRecord={orders?.length || 0}
          total={totalOrders}
          totalPages={Math.ceil(totalOrders / orderManagerFilters.orderManagerPageLimit)}
          offset={totalOrders}
          pageNumber={orderManagerFilters.orderManagerPageNumber}
          pageLimit={orderManagerFilters.orderManagerPageLimit}
          handlePageLimitChange={handlePageLimit}
          handlePageNumberChange={handlePageNumber}
          handleReloadPage={handleReloadPage}
        />
      </Box>
      <UploadModal
        show={uploadOrder}
        onClose={() => handleUploadOrderSheetClose()}
        accept=".xlsx, .csv"
        title="Drag & drop files or"
        supportedFormat="Support Format CSV or Xlsx File"
        handleChangeAttachment={handleChangeAttachment}
        attachmentName={attachmentName}
        attachmentLoading={attachmentLoading}
        handleSaveAttachment={handleSaveAttachment}
        disabled={attachmentLoading || !attachment}
      />
    </>
  );
};

export default OrderManager;
