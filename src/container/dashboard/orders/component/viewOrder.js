import React, { useState, useEffect, useRef } from 'react';
import {
  Stack,
  Box,
  TableCell,
  TableRow,
  Divider,
  Grid,
  Tooltip
} from '@mui/material';
import LocalPrintshopOutlinedIcon from '@mui/icons-material/LocalPrintshopOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import CryptoJS from 'crypto-js';
import { useParams, useNavigate } from 'react-router-dom';
import {
  isEmpty, camelCase, lowerCase, startCase
} from 'lodash';
import ReactToPrint from 'react-to-print';

// component
import Button from '../../../../components/button';
import Select from '../../../../components/select';
import Table from '../../../../components/ag-grid-table';
import Upload from '../../../../components/upload';
import Tabs from '../../../../components/tabs';
import SaveChanging from './modals/changeSave';
import LoaderWrapper from '../../../../components/loader';
import ItemDelete from './modals/delete';
import EditShipByModal from './modals/editShip';
import PackingSlip from './print/packingSlip';

// Redux
import {
  GetOrderAttachmentByOrderId,
  GetOrderDetail,
  GetOrderInvoicePrintableData,
  GetOrderPaymentDetail,
  SaveOrderAttachment,
  SetOrderState,
  SetOrderNotifyState,
  UpdateOrderAttachmentById,
  UpdateOrderStatusByOrderId,
  UpdateOrderById,
  SetProcessOrderState
} from '../../../../redux/slices/order';
import { SetOrderPickSheetState } from '../../../../redux/slices/order/pick-sheet-slice';
import {
  GetS3PreSignedUrl,
  SetOtherState
} from '../../../../redux/slices/other-slice';
import { SetPackState } from '../../../../redux/slices/pack-slice';
// images
import noData from '../../../../static/images/no-data.svg';
import Pdf from '../../../../static/images/pdf.svg';
import DownArrow from '../../../../static/images/arrow-up.svg';
import IconPdf from '../../../../static/images/icon-pdf.svg';
import IconCsv from '../../../../static/images/icon-csv.svg';
import IconXls from '../../../../static/images/icon-xls.svg';
import IconDoc from '../../../../static/images/icon-doc.svg';
import IconFile from '../../../../static/images/icon-file.svg';
// helpers
import {
  UploadDocumentOnS3,
  UploadedFileSize,
  generateSalesChannelLink
} from '../../../../../utils/helpers';
// constant
import {
  BADGE_CLASS,
  EXTENSIONS_LIST,
  orderStatus,
  fileDocumentHeader,
  PLATFORMS
} from '../../../../constants';

import ItemOrdered from './itemOrder';
import RelationalProductTab from './relationalProductTab';
import ShipmentTracking from './newShipmentTracking';

const Warehouse = ({ value }) => (
  <Box
    component="p"
    mt={-0.875}
    lineHeight="16px"
    letterSpacing="0px"
    color="#5A5F7D"
    marginBottom="5px"
  >
    {value}
  </Box>
);

const OrderNo = (props) => {
  const { onClose } = props;

  const tableRef = useRef();

  const params = useParams();
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const {
    preSignedUrl,
    fileUploadKey,
    success: otherSuccess,
    loading: otherLoading
  } = useSelector((state) => state.other);

  const {
    stockJobProgress
  } = useSelector((state) => state.other);

  const {
    user: { userId, permissions: { editOrders = false } = {} }
  } = useSelector((state) => state.auth);

  const { viewOrderPaymentDetail } = useSelector((state) => state.orderPayment);

  const {
    viewOrderAttachments,
    getOrderAttachmentLoading,
    updateOrderAttachmentLoading,
    orderAttachmentUpdated,
    order,
    orderCustomerDetail,
    updateOrderStatusLoading,
    success,
    getOrderDetailLoading,
    updateOrderLoading,
    orderUpdated,
    orderInvoicePrintableData,
    pdfDataLoading,
    progress
  } = useSelector((state) => state.order);

  const [orderId, setOrderId] = useState(null);
  const [saveChange, setSaveChange] = useState(false);
  const [deleteItem, setDeleteItem] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [tabTableValue, setTabTableValue] = useState(0);
  const [shipDate, setShipDate] = useState(false);
  const [platform, setPlatform] = useState('');
  const [updateShipByDateError, setUpdateShipByDateError] = useState('');
  const [orderStatusList, setOrderStatusList] = useState([]);

  const [orderDocsData, setOrderDocsData] = useState([]);
  const [deleteAttachmentId, setDeleteAttachmentId] = useState('');
  // const [orderId, setOrderId] = useState('');
  const [attachment, setAttachment] = useState();
  const [attachmentLoading, setAttachmentLoading] = useState(false);
  const [attachmentResponse, setAttachmentResponse] = useState(false);
  const [attachmentName, setAttachmentName] = useState('');
  const [updatedShipByDate, setUpdatedShipByDate] = useState(null);

  const [status, setStatus] = useState('');
  const [tabs, setTabs] = useState([
    {
      title: 'Warehouse Inst',
      component: <Warehouse value="" tabValue={0} />
    },
    {
      title: 'Customer Memo',
      component: <Warehouse tabValue={1} value="" />
    }
  ]);

  const [tabsTable, setTabsTable] = useState([
    {
      title: 'Item Ordered',
      component: (
        <ItemOrdered platform={platform} orderId={orderId} status={status} />
      )
    },
    {
      title: 'Relational Product',
      component: (
        <RelationalProductTab platform={platform} orderId={orderId} status={status} />
      )
    },
    {
      title: 'Shipment & tracking',
      component: <ShipmentTracking />
    }
  ]);

  const [lookup, setLookup] = useState(false);
  const [statusUpdated, setStatusUpdated] = useState(false);

  function createData(fileName, size, date, action) {
    return {
      fileName,
      size,
      date,
      action
    };
  }

  const data = [];
  for (let i = 0; i <= 3; i += 1) {
    data.push(
      createData(
        <Stack direction="row" spacing={1} alignItems="center">
          <img src={Pdf} alt="no-file" />
          <Tooltip arrow title="FileName.PDF">
            <span className="filename-ellipses">FileName.PDF</span>
          </Tooltip>
        </Stack>,
        '256 MB',
        'Mon Aug 29 2022 15:58',
        <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
          <img src={DownArrow} width="16" alt="no-arroow" className="pointer" />
          <Box
            component="span"
            className="icon-trash pointer"
            onClick={() => setDeleteItem(true)}
          />
        </Stack>
      )
    );
  }

  const downloadAttachment = async (key) => {
    const userIdJson = CryptoJS.AES.encrypt(
      String(userId),
      process.env.HASH
    ).toString();
    const userIdData = CryptoJS.enc.Base64.stringify(
      CryptoJS.enc.Utf8.parse(userIdJson)
    );
    window.open(
      `${process.env.API_URL}/non-secure-route/download-file?uploadBucket=orderDocs&key=${key}&userId=${userIdData}`
    );
  };

  const handleDeleteOrderAttachment = () => {
    if (!isEmpty(deleteAttachmentId)) {
      dispatch(
        UpdateOrderAttachmentById({
          paramsToUpdate: { archived: true },
          orderAttachmentId: String(deleteAttachmentId),
          pageName: 'viewOrder'
        })
      );
    }
  };

  const getOrderDetail = () => {
    dispatch(GetOrderDetail({ orderId }));
  };

  const getOrderAttachments = () => {
    dispatch(GetOrderAttachmentByOrderId({ orderId }));
  };

  const handleChangeAttachment = async (e) => {
    const { files } = e.target;

    if (files?.length) {
      const file = files[0];

      const extension = file.name.split('.').pop();

      if (!EXTENSIONS_LIST.includes(extension)) {
        dispatch(
          SetOrderNotifyState({
            message:
              'Only accept doc with following extensions jpeg, .jpg, .png, .gif, .bmp, .tiff, .tif, .webp, .svg, .ico, .psd, .ai, .eps, .docm, .docx, .dot, .csv, .tsv, .xlx, .xlsm, .xlsb, .xltx, .pdf, .xltm, .xls, .xlt, .xml, .xlam, .xla, .xlw, .xlr, .txt, .slk, .dif, .xps, .rtf, .dotx, .dotm, .docb, .doc, .xlsx, .json',
            type: 'error'
          })
        );
        return;
      }

      setAttachment(file);

      setAttachmentLoading(true);

      const fileName = file.name.split('.')[0];
      setAttachmentName(file.name);

      const formattedFileName = fileName.replace(/\s/g, '-');
      dispatch(
        GetS3PreSignedUrl({
          fileName: `${formattedFileName}-${moment().format(
            'YYYY-MM-DD HH:mm:ss'
          )}.${extension}`,
          fileType: file.type,
          fileExtension: extension,
          uploadBucket: 'orderDocs',
          id: String(orderId)
        })
      );
    }
    e.target.value = null;
  };

  const handleUploadAttachmentOnS3 = async () => {
    const response = await UploadDocumentOnS3({
      preSignedUrl,
      file: attachment
    });
    if (response) {
      setAttachmentResponse(true);
    } else {
      dispatch(
        SetOrderNotifyState({
          message: 'File Uploading failed on S3',
          type: 'error'
        })
      );
    }

    setAttachmentLoading(false);
  };

  const handleStatus = (e) => {
    setStatus(e.target.value);
  };

  const handleUpdateOrderStatus = () => {
    const statusOrder = camelCase(lowerCase(order.orderStatus));

    setStatusUpdated(false);
    if (status !== statusOrder) {
      dispatch(
        UpdateOrderStatusByOrderId({
          orderId,
          status
        })
      );
    } else {
      dispatch(
        SetOrderNotifyState({ message: 'Nothing Updated', type: 'info' })
      );
      setSaveChange(false);
    }
  };

  const getOrderPaymentDetail = () => {
    dispatch(GetOrderPaymentDetail({ orderId, pageName: 'viewOrder' }));
  };

  const handleClickMarketPlace = ({ e, id, salesChannel }) => {
    const link = generateSalesChannelLink({
      id,
      salesChannel
    });

    e.target.href = link;
  };

  const handleSaveShipDate = () => {
    if (isEmpty(updateShipByDateError)) {
      if (updatedShipByDate && moment(updatedShipByDate).isValid()) {
        dispatch(UpdateOrderById({ shipBy: updatedShipByDate, orderId }));
      } else {
        setUpdateShipByDateError('Select the valid date');
      }
    } else {
      setUpdateShipByDateError('ShipBy date should be after the order received on date');
    }
  };

  const handleShipDateChange = (e) => {
    setUpdatedShipByDate(e.target.value);

    if (order.purchaseDate && moment(e.target.value).isBefore(order.purchaseDate)) {
      setUpdateShipByDateError('Ship Date should be after the order Received Date');
    } else {
      setUpdateShipByDateError('');
    }
  };

  const handleNotification = () => {
    if (stockJobProgress === 100) {
      const { id } = params;
      if (!isEmpty(id)) {
        dispatch(GetOrderDetail({ orderId: id }));
      }
      dispatch(SetOrderState({
        field: 'loadOrderItems',
        value: true
      }));
      dispatch(SetOtherState({
        field: 'stockJobProgress',
        value: undefined
      }));
    }
  };

  useEffect(() => {
    dispatch(SetOrderState({
      field: 'progress',
      value: undefined
    }));
    const { id } = params;

    setOrderId(id);
    const updatedTabs = tabsTable.map((tab) => {
      if (tab.title === 'Item Ordered') {
        return {
          ...tab,
          component: <ItemOrdered
            platform={platform}
            orderId={id}
            status={status}
          />
        };
      }
      // Handle other tabs if necessary
      return tab;
    });
    setTabsTable(updatedTabs);
    return () => {
    };
  }, []);

  useEffect(() => {
    if (!isEmpty(platform)) {
      // const { id } = params;

      // const updatedTabs = tabsTable.map((tab) => {
      //   if (tab.title === 'Item Ordered') {
      //     return {
      //       ...tab,
      //       component: <ItemOrdered
      //         platform={platform}
      //         orderId={id}
      //         status={status}
      //       />
      //     };
      //   }
      //   // Handle other tabs if necessary
      //   return tab;
      // });
      // setTabsTable(updatedTabs);

      setTabsTable([
        {
          title: 'Item Ordered',
          component: (
            <ItemOrdered
              platform={platform}
              orderId={orderId}
            />
          )
        },
        {
          title: 'Relational Product',
          component: (
            <RelationalProductTab platform={platform} orderId={orderId} status={status} />
          )
        },
        {
          title: 'Shipment & tracking',
          component: <ShipmentTracking />
        }
      ]);
    }
  }, [platform]);

  // useEffect(() => {
  //   if (statusUpdated) {
  //     setTabsTable([
  //       {
  //         title: 'Item Ordered',
  //         component: (
  //           <ItemOrdered
  //             platform={platform}
  //             orderId={orderId}
  //             status={status}
  //           />
  //         )
  //       },
  //       {
  //         title: 'Shipment & tracking',
  //         component: <ShipmentTracking />
  //       }
  //     ]);
  //   }
  // }, [statusUpdated]);

  useEffect(() => {
    if (viewOrderAttachments.length) {
      const attachmentData = viewOrderAttachments?.map((row) => {
        const fileExtension = row?.key?.split('.')?.pop()?.toLowerCase();
        let iconToShow = '';
        if (fileExtension === 'pdf') {
          iconToShow = IconPdf;
        } else if (fileExtension === 'csv') {
          iconToShow = IconCsv;
        } else if (fileExtension === 'xlsx') {
          iconToShow = IconXls;
        } else if (fileExtension === 'docx' || fileExtension === 'doc') {
          iconToShow = IconDoc;
        } else {
          iconToShow = IconFile;
        }
        return createData(
          <Stack key={row._id} direction="row" spacing={1} alignItems="center">
            <img src={iconToShow} alt="no-file" />
            <Tooltip arrow title={row.key.split('/')[1]}>
              <span className="filename-ellipses">{row.key.split('/')[1]}</span>
            </Tooltip>
          </Stack>,
          row.size,
          moment(row.uploadedDate).format('llll'),
          <Stack direction="row" spacing={1.5}>
            <img
              src={DownArrow}
              width="16"
              alt="no-arrow"
              className="pointer"
              onClick={() => downloadAttachment(row.key)}
            />
            <Box
              sx={{
                opacity: !editOrders ? 0.5 : 1,
                pointerEvents: !editOrders ? 'none' : 'auto'
              }}
              component="span"
              className="icon-trash pointer"
              deleteItem
              onClick={() => {
                setDeleteItem(true);
                setDeleteAttachmentId(row?._id);
              }}
            />
          </Stack>
        );
      });

      setOrderDocsData(attachmentData);
    } else setOrderDocsData([]);
  }, [viewOrderAttachments]);

  useEffect(() => {
    if (preSignedUrl !== '') {
      handleUploadAttachmentOnS3();
    }
  }, [preSignedUrl]);

  useEffect(() => {
    if (!attachmentLoading) {
      dispatch(SetOtherState({ field: 'preSignedUrl', value: '' }));
      setAttachmentResponse(false);
    }
  }, [attachmentLoading]);

  useEffect(() => {
    if (attachmentResponse) {
      const sizeOfFile = UploadedFileSize(attachment.size);
      setAttachmentName('');
      dispatch(
        SaveOrderAttachment({
          orderId,
          key: fileUploadKey,
          size: sizeOfFile,
          uploadedDate: new Date(),
          pageName: 'viewOrder'
        })
      );
    }
  }, [attachmentResponse]);

  useEffect(() => {
    if (tabs?.length) {
      setTabs([
        {
          title: 'Warehouse Inst',
          component: (
            <Warehouse value={order.warehouseInstruction} tabValue={tabValue} />
          )
        },
        {
          title: 'Customer Memo',
          component: (
            <Warehouse value={order.customerMemo} tabValue={tabValue} />
          )
        }
      ]);
    }
  }, [tabValue, order]);

  useEffect(() => {
    if (!isEmpty(order)) {
      const {
        orderStatus: statusOfOrder,
        salesChannel
      } = order;

      const statusOrder = camelCase(lowerCase(statusOfOrder));

      if (statusOrder === 'onHold') {
        setOrderStatusList([{
          value: 'backOrdered',
          label: 'Back Ordered'
        }, {
          value: 'cancelled',
          label: 'Cancelled'
        }]);
      } else {
        setOrderStatusList(orderStatus);
      }

      setPlatform(salesChannel);
    }
  }, [order]);

  useEffect(() => {
    if (orderAttachmentUpdated) {
      setDeleteAttachmentId('');
      dispatch(
        SetOrderState({ field: 'orderAttachmentUpdated', value: false })
      );
    }
  }, [orderAttachmentUpdated]);

  useEffect(() => {
    if (!otherSuccess && !otherLoading) {
      setAttachmentLoading(false);
    }
  }, [otherSuccess, otherLoading]);

  useEffect(() => {
    if (!updateOrderStatusLoading) {
      setSaveChange(false);
    }
    if (success && !updateOrderStatusLoading) {
      setStatusUpdated(true);
      setStatus('');
    }
  }, [success, updateOrderStatusLoading]);

  useEffect(() => {
    if (orderUpdated) {
      setShipDate(false);
      dispatch(SetOrderState({ field: 'orderUpdated', value: false }));
    }
  }, [orderUpdated]);

  useEffect(() => {
    if (orderId) {
      dispatch(GetOrderInvoicePrintableData({ orderId }));

      setTabsTable([{
        title: 'Item Ordered',
        component: (
          <ItemOrdered platform={platform} orderId={orderId} status={status} />
        )
      },
      {
        title: 'Relational Product',
        component: (
          <RelationalProductTab platform={platform} orderId={orderId} status={status} />
        )
      },
      {
        title: 'Shipment & tracking',
        component: <ShipmentTracking />
      }]);

      getOrderDetail();
      getOrderAttachments();
      getOrderPaymentDetail();
    }
  }, [orderId]);

  useEffect(() => () => {
    dispatch(SetOrderState({ field: 'order', value: {} }));
    dispatch(SetOrderState({ field: 'orderCustomerDetail', value: {} }));
    dispatch(
      SetOrderState({ field: 'viewOrderAttachments', value: [] })
    );
    dispatch(SetOrderState({ field: 'viewOrderItems', value: [] }));
    dispatch(SetOrderState({ field: 'orderInvoicePrintableData', value: {} }));
    dispatch(SetPackState({ field: 'packDetailProductId', value: null }));
    dispatch(SetPackState({ field: 'totalItemsInPack', value: 0 }));
    dispatch(SetPackState({ field: 'packItems', value: [] }));
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

  useEffect(() => {
    handleNotification();
  }, [stockJobProgress]);

  return (
    <>
      {getOrderDetailLoading || pdfDataLoading ? <LoaderWrapper /> : null}
      <Box
        display="flex"
        justifyContent="space-between"
        pt={3}
        pb={3}
        marginTop="-24px"
        sx={{
          position: 'sticky',
          top: '81px',
          zIndex: '999',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid rgb(151, 151, 151, 0.25)'
        }}
      >
        <Stack alignItems="center" direction="row" spacing={3}>
          <Box
            component="span"
            className="icon-left pointer"
            onClick={() => {
              // onClose();
              navigate(-1);
              // dispatch(SetOrderState({ field: 'order', value: {} }));
              // dispatch(
              //   SetOrderState({ field: 'viewOrderAttachments', value: [] })
              // );
              // dispatch(SetOrderState({ field: 'viewOrderItems', value: [] }));
            }}
          />
          <h2 className="m-0 pl-2">
            Order No:
            {' '}
            {order?.orderNumber || '--'}
          </h2>
        </Stack>
        <Box display="flex" alignItems="center">
          <Box
            className={BADGE_CLASS[camelCase(order.orderStatus)]}
            fontSize="13px"
            fontWeight="600"
          >
            {order.orderStatus ? startCase(lowerCase(order.orderStatus)) : '--'}
          </Box>
          <Box ml={2}>
            <Box component="span" color="#979797" fontSize="11px" mr="4px">
              Status updated:
            </Box>
            <Box component="span" color="#272B41" fontSize="!3px">
              {order.updatedAt && order.updatedAt !== ''
                ? moment(order.updatedAt).format('LLL')
                : '--'}
            </Box>
          </Box>
        </Box>
      </Box>
      <Divider sx={{ marginBottom: '24px' }} />
      <Grid container columnSpacing={3}>
        <Grid item md={5}>
          <Grid container>
            <Grid md={5}>
              <Stack>
                <Box color="#979797" fontSize="11px" textTransform="uppercase">
                  Sales channel
                </Box>
                <Box mt={0.75} color="#272B41" fontSize="13px">
                  {order?.salesChannel ? PLATFORMS[order?.salesChannel] : '--'}
                </Box>
              </Stack>
              <Stack mt={3}>
                <Box color="#979797" fontSize="11px" textTransform="uppercase">
                  Marketplace Order ID
                </Box>
                <Box mt={0.75} color="#272B41" fontSize="13px">
                  {order.marketplaceOrderId
                    ? order.sale === 'Phone Order'
                      ? order.marketplaceOrderId
                      : (
                        <a
                          onClick={(e) => handleClickMarketPlace({
                            e,
                            id: order.marketplaceOrderId,
                            salesChannel: PLATFORMS[order.salesChannel]
                          })}
                          href="#"
                          target="_blank"
                          color="#3C76FF"
                          rel="noreferrer"
                        >
                          {order.marketplaceOrderId}
                        </a>
                      )
                    : '--'}
                </Box>
              </Stack>
              <Stack mt={3}>
                <Box color="#979797" fontSize="11px" textTransform="uppercase">
                  ORDER RECEIVED ON
                </Box>
                <Box mt={0.75} color="#272B41" fontSize="13px">
                  {order?.purchaseDate
                    ? moment(order.purchaseDate).format('ddd, Do MMM YYYY')
                    : '--'}
                  {' '}
                </Box>
              </Stack>
            </Grid>
            <Grid md={5}>
              <Stack>
                <Box color="#979797" fontSize="11px" textTransform="uppercase">
                  Customer Name
                </Box>
                <Box mt={0.75} color="#272B41" fontSize="13px">
                  {orderCustomerDetail?.customerName || '--'}
                </Box>
              </Stack>
              <Stack mt={3}>
                <Box color="#979797" fontSize="11px" textTransform="uppercase">
                  SHIPPING ADDRESS
                </Box>
                <Box mt={0.75} color="#272B41" fontSize="13px">
                  <Box mb={1}>
                    {
                      PLATFORMS[order.salesChannel] !== 'Phone Order'
                        ? orderCustomerDetail?.shippingInfo?.name || '--'
                        : orderCustomerDetail?.customerName || '--'
                    }
                  </Box>
                  <Box mb={1}>
                    {
                      ([
                        orderCustomerDetail?.shippingInfo?.streetAddress || '',
                        orderCustomerDetail?.shippingInfo?.city || '',
                        orderCustomerDetail?.shippingInfo?.state || '',
                        orderCustomerDetail?.shippingInfo?.zipCode || '',
                        orderCustomerDetail?.shippingInfo?.country || ''
                      ].filter((address) => address).join(', ')) || '--'
                    }
                  </Box>
                  <Box mb={1}>
                    {
                      PLATFORMS[order.salesChannel] !== 'Phone Order'
                        ? orderCustomerDetail?.shippingInfo?.phoneNo || '--'
                        : orderCustomerDetail?.phoneNumber || '--'
                    }
                  </Box>
                  <Box mb={1}>
                    {PLATFORMS[order.salesChannel] !== 'Phone Order'
                      ? orderCustomerDetail?.shippingInfo?.email
                        ? orderCustomerDetail?.shippingInfo?.email.length > 40 ? (
                          <Tooltip arrow title={orderCustomerDetail?.shippingInfo?.email}>
                            <a
                              // style={{
                              //   overflow: 'hidden',
                              //   textOverflow: 'ellipsis',
                              //   display: 'inline-block',
                              //   maxWidth: '100%'
                              // }}
                              fontSize="13px"
                              color="#3C76FF"
                              href={`mailto:${orderCustomerDetail?.shippingInfo?.email}`}
                            >
                              {orderCustomerDetail?.shippingInfo?.email}
                            </a>
                          </Tooltip>
                        ) : (
                          <a
                            // style={{
                            //   overflow: 'hidden',
                            //   textOverflow: 'ellipsis',
                            //   display: 'inline-block',
                            //   maxWidth: '100%'
                            // }}
                            fontSize="13px"
                            color="#3C76FF"
                            href={`mailto:${orderCustomerDetail?.shippingInfo?.email}`}
                          >
                            {orderCustomerDetail?.shippingInfo?.email}
                          </a>
                        ) : (
                          '--'
                        )
                      : orderCustomerDetail?.email
                        ? orderCustomerDetail?.email.length > 40 ? (
                          <Tooltip arrow title={orderCustomerDetail?.email}>
                            <a
                              // style={{
                              //   overflow: 'hidden',
                              //   textOverflow: 'ellipsis',
                              //   display: 'inline-block',
                              //   maxWidth: '100%'
                              // }}
                              fontSize="13px"
                              color="#3C76FF"
                              href={`mailto:${orderCustomerDetail?.shippingInfo?.email}`}
                            >
                              {orderCustomerDetail?.email}
                            </a>
                          </Tooltip>
                        ) : (
                          <a
                            // style={{
                            //   overflow: 'hidden',
                            //   textOverflow: 'ellipsis',
                            //   display: 'inline-block',
                            //   maxWidth: '100%'
                            // }}
                            fontSize="13px"
                            color="#3C76FF"
                            href={`mailto:${orderCustomerDetail?.shippingInfo?.email}`}
                          >
                            {orderCustomerDetail?.email}
                          </a>
                        )
                        : '--'}
                  </Box>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Grid>
        <Grid item md={7}>
          <Stack mb={3}>
            <Box color="#979797" fontSize="11px" textTransform="uppercase" display="flex" alignItems="center" gap="4px">
              SHIP BY DATE
              {
                PLATFORMS[order.salesChannel] === 'VC Purchase Orders'
                  ? (
                    <Box
                      component="span"
                      className="icon-edit cursor-pointer"
                      onClick={() => {
                        setShipDate(true);
                      }}
                    />
                  )
                  : null
              }

            </Box>
            <Box mt={0.75} color="#272B41" fontSize="13px">
              {
                order?.shipBy
                  ? moment(order?.shipBy).format('ddd, Do MMM YYYY')
                  : '--'
              }
              {' '}
            </Box>
          </Stack>
          <EditShipByModal
            show={shipDate}
            onClose={() => {
              setShipDate(false);
              setUpdateShipByDateError('');
            }}
            helperText={updateShipByDateError}
            date={updatedShipByDate}
            handleDateChange={handleShipDateChange}
            onConfirm={handleSaveShipDate}
            loading={updateOrderLoading}
          />
          <Stack mb={3}>
            <Box color="#979797" fontSize="11px" textTransform="uppercase">
              DELIVERY BY DATE
            </Box>
            <Box mt={0.75} color="#272B41" fontSize="13px">
              {order?.deliverBy
                ? moment(order?.deliverBy).format('ddd, Do MMM YYYY')
                : '--'}
            </Box>
          </Stack>
          <Box display="flex" mb={3}>
            <Box display="flex" alignItems="center" className="step-active">
              <Box display="flex" alignItems="center">
                <CheckCircleOutlineOutlinedIcon
                  sx={{
                    fontSize: '16px',
                    color: '#0FB600',
                    marginRight: '8px'
                  }}
                />
                <Box component="span" fontWeight="600" color="#979797">
                  Imported Order
                  <InfoOutlinedIcon
                    sx={{
                      fontSize: '16px',
                      color: '#3C76FF',
                      marginLeft: '3px',
                      marginTop: '-3px'
                    }}
                  />
                </Box>
              </Box>
              <Divider
                sx={{ width: '62px', marginRight: '13px', marginLeft: '20px' }}
              />
            </Box>
            <Box display="flex" alignItems="center" className="step-active">
              <Box display="flex" alignItems="center">
                <Box
                  component="span"
                  mr={1}
                  className="icon-checkCircle"
                  fontSize={16}
                >
                  <span className="path1" />
                  <span className="path2" />
                </Box>
                <Box component="span" fontWeight="600" color="#272B41">
                  Printed
                </Box>
              </Box>
              <Divider
                sx={{ width: '63px', marginRight: '17px', marginLeft: '17px' }}
              />
            </Box>
            <Box display="flex" alignItems="center">
              <Box display="flex" alignItems="center">
                <CheckCircleOutlineOutlinedIcon
                  sx={{
                    fontSize: '16px',
                    color: '#979797',
                    marginRight: '8px'
                  }}
                />
                <Box
                  component="span"
                  fontWeight="600"
                  color="#979797"
                  mr={-0.125}
                >
                  Picked
                </Box>
              </Box>
            </Box>
          </Box>
          <Box display="flex" gap={2}>
            <Select
              disabled={camelCase(lowerCase(order?.orderStatus)) === 'cancelled'}
              label="Update Order Status:"
              placeholder="Select"
              vertical
              value={status}
              menuItem={orderStatusList}
              width="115px"
              name="status"
              handleChange={handleStatus}
            />
            <ReactToPrint
              trigger={() => (
                <Button
                  disabled={!editOrders}
                  text="Print Invoice"
                  startIcon={
                    <LocalPrintshopOutlinedIcon color="#3C76FF" fontSize="16px" />
                  }
                />
              )}
              content={() => tableRef.current}
              onClick={() => onClose()}
            />
            <Button
              disabled={!editOrders
                || (order.orderStatus === 'PRINTED'
                  ? false
                  : order.orderStatus !== 'SHIPPED')}
              text="Lookup Manager Order"
              startIcon={<span className="icon-products" />}
              onClick={() => {
                navigate(`/orders/process-orders/${params.id}`);
              }}
            />
            <Button
              disabled={!editOrders || (status === '' || camelCase(lowerCase(status)) === camelCase(lowerCase(order?.orderStatus)))}
              variant="contained"
              text="Save Changes"
              onClick={() => setSaveChange(true)}
              startIcon={<span className="icon-Save" />}
            />
          </Box>
        </Grid>
      </Grid>
      <Divider sx={{ marginY: '24px' }} />
      <Grid container columnSpacing={3}>
        <Grid item md={7}>
          <Box padding={2} border="1px solid #D9D9D9" borderRadius="4px">
            <Grid container columnSpacing={3}>
              <Grid item md={4}>
                <Upload
                  className="view-order-upload"
                  loading={attachmentLoading}
                  handleChangeAttachment={handleChangeAttachment}
                  title="Drag or Click to Upload File"
                  attachmentName={attachmentName}
                  accept=".jpeg, .jpg, .png, .gif, .bmp, .tiff, .tif, .webp, .svg, .ico, .psd, .ai, .eps, .docm, .docx, .dot, .csv, .tsv, .xlx, .xlsm, .xlsb, .xltx, .pdf, .xltm, .xls, .xlt, .xml, .xlam, .xla, .xlw, .xlr, .txt, .slk, .dif, .xps, .rtf, .dotx, .dote, .docb, .doc, .xlsx, .json"
                  disabled={!editOrders || attachmentLoading}
                />
              </Grid>
              <Grid item md={8}>
                <Box mt={0.125} position="relative">
                  <Table
                    alignCenter
                    tableHeader={fileDocumentHeader}
                    maxheight="200px"
                    bodyPadding="12px 14px"
                    className="file-upload-table"
                  >
                    {updateOrderAttachmentLoading
                      || getOrderAttachmentLoading ? (
                      <LoaderWrapper />
                    ) : orderDocsData.length ? (
                      orderDocsData.map((row) => (
                        <TableRow
                          hover
                          key={row._id}
                          sx={{
                            '&:last-child td, &:last-child th': { border: 0 }
                          }}
                        >
                          <TableCell component="th" scope="row">
                            {row.fileName}
                          </TableCell>
                          <TableCell>{row.size}</TableCell>
                          <TableCell>{row.date}</TableCell>
                          <TableCell align="right">{row.action}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableCell colSpan={4}>
                        <Box textAlign="center" m={-2} maxHeight="120px" mt="-6px">
                          <img src={noData} alt="no-Dta" />
                        </Box>
                      </TableCell>
                    )}
                  </Table>
                  <Divider sx={{ backgroundColor: '#979797', margin: 0 }} />
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Grid>
        <Grid item md={5}>
          <Grid container columnSpacing={3}>
            <Grid item md={6}>
              <Box
                borderRadius={1}
                border="1px solid #D9D9D9"
                p={2}
                minHeight="196px"
              >
                <Tabs
                  className="view-order-tabs"
                  tabs={tabs}
                  value={tabValue}
                  onTabChange={(newValue) => setTabValue(newValue)}
                  customPadding="0px 12px 9px 12px"
                />
              </Box>
            </Grid>
            <Grid item md={6}>
              <Box
                borderRadius={1}
                border="1px solid #D9D9D9"
                p={2}
                minHeight="196px"
              >
                <h3>Payment Details</h3>
                <Divider sx={{ marginTop: '16px', marginBottom: '14px' }} />
                <Box display="flex" justifyContent="space-between" mb={1.5}>
                  <Box component="span" color="#979797" fontSize="11px">
                    Subtotal
                  </Box>
                  <Box component="span" color="#5A5F7D" fontSize="13px">
                    $
                    {viewOrderPaymentDetail?.subTotal
                      ? Number(viewOrderPaymentDetail?.subTotal).toFixed(2)
                      : 0}
                  </Box>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1.5}>
                  <Box component="span" color="#979797" fontSize="11px">
                    Tax
                  </Box>
                  <Box component="span" color="#5A5F7D" fontSize="13px">
                    $
                    {viewOrderPaymentDetail?.taxPrice
                      ? Number(viewOrderPaymentDetail?.taxPrice).toFixed(2)
                      : 0}
                  </Box>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1.5}>
                  <Box component="span" color="#979797" fontSize="11px">
                    Shipping
                  </Box>
                  <Box component="span" color="#5A5F7D" fontSize="13px">
                    $
                    {viewOrderPaymentDetail?.shippingPrice
                      ? Number(viewOrderPaymentDetail?.shippingPrice).toFixed(2)
                      : 0}
                  </Box>
                </Box>
                <Divider sx={{ marginTop: '8px', marginBottom: '12px' }} />
                <Box display="flex" justifyContent="space-between">
                  <Box component="span" color="#979797" fontSize="11px">
                    Total
                  </Box>
                  <Box
                    component="span"
                    color="#272B41"
                    fontSize="13px"
                    fontWeight="600"
                  >
                    $
                    {(
                      (viewOrderPaymentDetail?.subTotal
                        ? Number(viewOrderPaymentDetail?.subTotal.toFixed(2))
                        : 0)
                      + (viewOrderPaymentDetail?.taxPrice
                        ? Number(viewOrderPaymentDetail?.taxPrice.toFixed(2))
                        : 0)
                      + (viewOrderPaymentDetail?.shippingPrice
                        ? Number(
                          viewOrderPaymentDetail?.shippingPrice.toFixed(2)
                        )
                        : 0)
                    )?.toFixed(2)}
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Divider sx={{ marginTop: '20px', marginBottom: '34px' }} />
      <Tabs
        tabs={tabsTable}
        value={tabTableValue}
        onTabChange={(newValue) => setTabTableValue(newValue)}
        customPadding="0px 12px 9px 12px"
      />
      <SaveChanging
        loading={updateOrderStatusLoading}
        show={saveChange}
        onConfirm={handleUpdateOrderStatus}
        onClose={() => setSaveChange(false)}
      />
      <ItemDelete
        show={deleteItem}
        lastTitle="Delete This File!"
        onClose={() => setDeleteItem(false)}
        onDelete={() => {
          handleDeleteOrderAttachment();
          setDeleteItem(false);
        }}
      />
      {!pdfDataLoading && !isEmpty(orderInvoicePrintableData)
        ? <PackingSlip data={orderInvoicePrintableData} ref={tableRef} />
        : null}

    </>
  );
};

export default OrderNo;
