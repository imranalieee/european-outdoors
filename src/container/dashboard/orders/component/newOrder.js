import React, { useState, useEffect } from 'react';
import { isEmpty, startCase, extend } from 'lodash';
import {
  Stack,
  Box,
  TableCell,
  TableRow,
  Divider,
  Tooltip,
  Grid,
  Badge
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
// component
import moment from 'moment';
import Button from '../../../../components/button/index';
import Select from '../../../../components/select/index';
import Input from '../../../../components/inputs/input';
import Table from '../../../../components/ag-grid-table/index';
import Upload from '../../../../components/upload/index';
import Checkbox from '../../../../components/checkbox';
import Tabs from '../../../../components/tabs/index';
import DatePicker from '../../../../components/datePicker';
import SaveChanging from './modals/changeSave';
import ItemDelete from './modals/delete';
import Payment from './drawer/payment';
import ItemOrdered from './newItemOrder';
import LoaderWrapper from '../../../../components/loader';
import ConfirmOrder from './modals/confirmOrder';
// redux
import {
  AddNewOrder,
  GetOrderPaymentDetail,
  SaveOrderAttachment,
  SetOrderState,
  SetOrderNotifyState,
  SetOrderPaymentState,
  SetClearNewOrderData,
  UpdateOrderAttachmentById,
  SetProcessOrderState
} from '../../../../redux/slices/order';
import { SaveInventoryHistoryByOrderId } from '../../../../redux/slices/inventory-history';
import { SetOrderPickSheetState } from '../../../../redux/slices/order/pick-sheet-slice';
import {
  GetS3PreSignedUrl,
  SetOtherState
} from '../../../../redux/slices/other-slice';
// helpers
import {
  UploadDocumentOnS3,
  UploadedFileSize,
  ValidateEmail,
  ValidatePhoneNumber
} from '../../../../../utils/helpers';
// constant
import {
  EXTENSIONS_LIST,
  fileDocumentHeader,
  ADD_ORDER_STATUS as ORDER_STATUS,
  platform,
  SHIPPING_METHOD
} from '../../../../constants';
// images
import noData from '../../../../static/images/no-data.svg';
import Pdf from '../../../../static/images/pdf.svg';
import DownArrow from '../../../../static/images/arrow-up.svg';
import IconPdf from '../../../../static/images/icon-pdf.svg';
import IconCsv from '../../../../static/images/icon-csv.svg';
import IconXls from '../../../../static/images/icon-xls.svg';
import IconDoc from '../../../../static/images/icon-doc.svg';
import IconFile from '../../../../static/images/icon-file.svg';

const Warehouse = ({ value: prevValue, handleChange }) => {
  const { newOrderId } = useSelector((state) => state.order);
  const handleInstructionChange = (e) => {
    handleChange(e.target.value);
  };

  return (
    <Box mt="-12px">
      <Input
        autoComplete="off"
        placeholder={!newOrderId ? 'Enter' : ''}
        width="100%"
        multiline
        rows={7}
        marginBottom="0"
        className="input-textarea"
        onChange={handleInstructionChange}
        value={prevValue}
        disabled={newOrderId}
      />
    </Box>
  );
};

const OrderNo = () => {
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const {
    preSignedUrl,
    fileUploadKey,
    success: otherSuccess,
    loading: otherLoading
  } = useSelector((state) => state.other);

  const {
    user: { name, permissions: { editOrders = false } = {} },
    user
  } = useSelector((state) => state.auth);

  const { orderPaymentDetail } = useSelector((state) => state.orderPayment);

  const {
    orderItems,
    newOrderId,
    addNewOrderLoading,
    success: orderSuccess,
    orderAttachments,
    updateOrderAttachmentLoading,
    newOrder,
    newOrderCustomerDetail,
    itemsDeleted,
    orderItemUpdated,
    itemsAdded
  } = useSelector((state) => state.order);

  const [saveChange, setSaveChange] = useState(false);
  const [payment, setPayment] = useState(false);
  const [deleteItem, setDeleteItem] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [isBillingShippingAddressingSame, setIsBillingShippingAddressingSame] = useState(false);

  const [orderCustomerDetail, setOrderCustomerDetail] = useState({
    companyName: '',
    customerName: '',
    email: '',
    phoneNumber: '',
    fax: ''
  });
  const [orderDetail, setOrderDetail] = useState({
    status: 'backOrdered',
    shippingMethod: 'UPS Next Day Air'
  });
  const [deliveryDates, setDeliveryDates] = useState({
    shippingDate: moment().format('ddd, Do MMM YYYY'),
    beingDeliveredBy: moment().add(1, 'day').format('ddd, Do MMM YYYY'),
    endDeliveredBy: moment().add(2, 'day').format('ddd, Do MMM YYYY')
  });
  const [billInfo, setBillInfo] = useState({
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  const [shippingInfo, setShippingInfo] = useState({
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  const [saveOrderHelperText, setSaveOrderHelperText] = useState({
    companyName: '',
    customerName: '',
    email: '',
    phoneNumber: '',
    shippingDate: '',
    beingDeliveredBy: '',
    billingStreetAddress: '',
    billingCity: '',
    billingZipCode: '',
    shippingStreetAddress: '',
    shippingCity: '',
    shippingZipCode: ''
  });
  const [instructions, setInstructions] = useState({
    warehouseInstruction: '',
    customerMemo: ''
  });
  const [attachment, setAttachment] = useState();
  const [attachmentLoading, setAttachmentLoading] = useState(false);
  const [attachmentResponse, setAttachmentResponse] = useState(false);
  const [attachmentName, setAttachmentName] = useState('');

  const [orderDocsData, setOrderDocsData] = useState([]);
  const [deleteAttachmentId, setDeleteAttachmentId] = useState('');
  const [confirmOrder, setConfirmOrder] = useState(false);

  const handleCheckboxChange = () => {
    setIsBillingShippingAddressingSame(!isBillingShippingAddressingSame);
    setSaveOrderHelperText({
      ...saveOrderHelperText,
      shippingCity: '',
      shippingStreetAddress: '',
      shippingZipCode: '',
      shippingState: ''
    });
  };

  const handleInstructions = (value) => {
    let key = 'warehouseInstruction';
    if (tabValue === 1) key = 'customerMemo';

    setInstructions((prevInstructions) => ({
      ...prevInstructions,
      [key]: value
    }));
  };

  const [tabs, setTabs] = useState([
    {
      title: 'Warehouse Inst',
      component: (
        <Warehouse
          value={instructions.warehouseInstruction}
          handleChange={handleInstructions}
          tabValue={0}
        />
      )
    },
    {
      title: 'Customer Memo',
      component: (
        <Warehouse
          value={instructions.customerMemo}
          handleChange={handleInstructions}
          tabValue={1}
        />
      )
    }
  ]);

  function createData(fileName, size, date, action) {
    return {
      fileName,
      size,
      date,
      action
    };
  }

  const handleOrderCustomerPersonalInfo = (e) => {
    const { name, value } = e.target;

    if (name === 'phoneNumber') {
      if (/[^+\-0-9]/.test(value)) {
        return;
      }
    }

    setOrderCustomerDetail({
      ...orderCustomerDetail,
      [name]: value
    });

    const errors = {};
    if (name === 'email') {
      const emailError = ValidateEmail({ email: value });
      if (emailError !== '') {
        errors.email = emailError;
      } else {
        errors.email = '';
      }
    } else if (!isEmpty(value) && name === 'phoneNumber') {
      const phoneError = ValidatePhoneNumber(value);
      if (phoneError !== '') {
        errors.phoneNumber = phoneError;
      } else {
        errors.phoneNumber = '';
      }
    } else if (isEmpty(value) && name === 'phoneNumber') {
      errors.phoneNumber = '';
    }

    if (
      isEmpty(value)
      && ['companyName', 'customerName', 'email'].includes(name)
    ) {
      errors[name] = `${startCase(name)} is required!`;
    } else if (name !== 'phoneNumber' && name !== 'email') {
      errors[name] = '';
    }

    setSaveOrderHelperText((prevHelperText) => ({
      ...prevHelperText,
      ...errors
    }));
  };

  const handleOrderBillingInfo = (e) => {
    const { name, value } = e.target;

    setBillInfo({
      ...billInfo,
      [name]: value
    });

    const errors = {};
    if (
      isEmpty(value)
      && ['zipCode', 'streetAddress', 'state', 'city'].includes(name)
    ) {
      const errorName = `billing${name.charAt(0).toUpperCase()}${name.slice(1)}`;
      errors[errorName] = `${startCase(name)} is required!`;
    } else if (
      !isEmpty(value)
      && ['zipCode', 'streetAddress', 'state', 'city'].includes(name)
    ) {
      const errorName = `billing${name.charAt(0).toUpperCase()}${name.slice(1)}`;
      errors[errorName] = '';
    }

    setSaveOrderHelperText((prevHelperText) => ({
      ...prevHelperText,
      ...errors
    }));
  };

  const handleOrderShippingInfo = (e) => {
    const { name, value } = e.target;

    setShippingInfo({
      ...shippingInfo,
      [name]: value
    });

    const errors = {};
    if (
      isEmpty(value)
      && ['zipCode', 'streetAddress', 'state', 'city'].includes(name)
    ) {
      const errorName = `shipping${name.charAt(0).toUpperCase()}${name.slice(1)}`;
      errors[errorName] = `${startCase(name)} is required!`;
    } else if (
      !isEmpty(value)
      && ['zipCode', 'streetAddress', 'state', 'city'].includes(name)
    ) {
      const errorName = `shipping${name.charAt(0).toUpperCase()}${name.slice(1)}`;
      errors[errorName] = '';
    }

    setSaveOrderHelperText((prevHelperText) => ({
      ...prevHelperText,
      ...errors
    }));
  };

  const handleOrderDetail = (e) => {
    const { name, value } = e.target;

    setOrderDetail({
      ...orderDetail,
      [name]: value
    });
  };

  const handleTabChange = (e) => {
    setTabValue(e);
  };

  const handleDeliveryDate = (e, key) => {
    setDeliveryDates({
      ...deliveryDates,
      [key]: moment(e.$d).format('ddd, Do MMM YYYY')
    });
  };

  const handleSaveChanges = () => {
    const { companyName, customerName, email } = orderCustomerDetail;
    const {
      streetAddress, city, zipCode, state
    } = shippingInfo;
    const {
      streetAddress: billingStreetAddress,
      city: billingCity,
      zipCode: billingZipCode,
      state: billingState
    } = billInfo;

    const errors = {
      ...saveOrderHelperText
    };

    if (isEmpty(companyName)) errors.companyName = 'Company Name is required!';
    if (isEmpty(customerName)) { errors.customerName = 'Customer Name is required!'; }
    if (isEmpty(email)) errors.email = 'Email Name is required!';

    if (isEmpty(billingStreetAddress)) errors.billingStreetAddress = 'Street Address is required!';
    if (isEmpty(billingCity)) { errors.billingCity = 'City is required!'; }
    if (isEmpty(billingZipCode)) errors.billingZipCode = 'ZipCode Name is required!';
    if (isEmpty(billingState)) errors.billingState = 'State is required!';

    if (!isBillingShippingAddressingSame) {
      if (isEmpty(streetAddress)) errors.shippingStreetAddress = 'Street Address is required!';
      if (isEmpty(city)) { errors.shippingCity = 'City is required!'; }
      if (isEmpty(zipCode)) errors.shippingZipCode = 'ZipCode is required!';
      if (isEmpty(state)) errors.shippingState = 'State is required!';
    }

    setSaveOrderHelperText({
      ...saveOrderHelperText,
      ...errors
    });

    if (Object.values(errors).every((errorValue) => errorValue === '')) {
      setSaveChange(true);
    }
  };

  const handleSaveOrder = () => {
    dispatch(
      AddNewOrder({
        orderCustomerDetail,
        orderDetail,
        billInfo,
        shippingInfo,
        deliveryDates,
        isBillingShippingAddressingSame,
        instructions
      })
    );
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

  const downloadAttachment = async (key) => {
    const { userId } = user;
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
          orderAttachmentId: String(deleteAttachmentId)
        })
      );
    }
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
          id: String(newOrderId)
        })
      );
    }
    e.target.value = null;
  };

  useEffect(() => {
    if (attachmentResponse) {
      const sizeOfFile = UploadedFileSize(attachment.size);
      setAttachmentName('');
      dispatch(
        SaveOrderAttachment({
          orderId: newOrderId,
          key: fileUploadKey,
          size: sizeOfFile,
          uploadedDate: new Date()
        })
      );
    }
  }, [attachmentResponse]);

  useEffect(() => {
    if (orderAttachments.length) {
      const attachmentData = orderAttachments?.map((row) => {
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
          <Stack direction="row" spacing={1} alignItems="center">
            <img src={iconToShow} alt="no-file" />
            <span>{row.key.split('/')[1]}</span>
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
  }, [orderAttachments]);

  useEffect(() => {
    if (preSignedUrl !== '') {
      handleUploadAttachmentOnS3();
    }
  }, [preSignedUrl]);

  useEffect(() => {
    if (!otherSuccess && !otherLoading) {
      setAttachmentLoading(false);
    }
  }, [otherSuccess, otherLoading]);

  useEffect(() => {
    if (!attachmentLoading) {
      dispatch(SetOtherState({ field: 'preSignedUrl', value: '' }));
      setAttachmentResponse(false);
    }
  }, [attachmentLoading]);

  useEffect(() => {
    if (tabs?.length) {
      setTabs([
        {
          title: 'Warehouse Inst',
          component: (
            <Warehouse
              value={
                isEmpty(newOrderId)
                  ? instructions.warehouseInstruction
                  : newOrder.warehouseInstruction
              }
              handleChange={handleInstructions}
              tabValue={tabValue}
            />
          )
        },
        {
          title: 'Customer Memo',
          component: (
            <Warehouse
              value={
                isEmpty(newOrderId)
                  ? instructions.customerMemo
                  : newOrder.customerMemo
              }
              handleChange={handleInstructions}
              tabValue={tabValue}
            />
          )
        }
      ]);
    }
  }, [tabValue, instructions, newOrder]);

  useEffect(() => {
    const date1 = moment(deliveryDates.shippingDate, 'ddd, Do MMM YYYY');
    const date2 = moment(deliveryDates.beingDeliveredBy, 'ddd, Do MMM YYYY');

    const date3 = moment(deliveryDates.endDeliveredBy, 'ddd, Do MMM YYYY');

    const isDate1AfterDate2 = date1.isSameOrAfter(date2);
    const isDate1AfterDate3 = date1.isSameOrAfter(date3);

    const isDate2AfterDate3 = date2.isSameOrAfter(date3);

    const dateErrors = {};

    if (isDate1AfterDate2 || isDate1AfterDate3) {
      let text = 'Shipping date should be before';

      if (isDate1AfterDate2) text += ' Being Delivery By';

      if (isDate1AfterDate3) text += ' End Delivery By';

      if (isDate1AfterDate2 && isDate1AfterDate3) { text = 'Shipping date should be before Being Delivery By and End Delivery By'; }

      extend(dateErrors, {
        shippingDate: text
      });
    } else {
      extend(dateErrors, {
        shippingDate: ''
      });
    }
    if (isDate2AfterDate3) {
      extend(dateErrors, {
        beingDeliveredBy:
          'Being Delivery date should be before End Delivery Date'
      });
    } else {
      extend(dateErrors, {
        beingDeliveredBy: ''
      });
    }

    if (Object.keys(dateErrors).length !== 0) {
      setSaveOrderHelperText({
        ...saveOrderHelperText,
        ...dateErrors
      });
    }
  }, [deliveryDates]);

  useEffect(() => {
    if (!addNewOrderLoading) {
      setSaveChange(false);
    }
  }, [orderSuccess, addNewOrderLoading]);

  useEffect(() => {
    if (itemsDeleted || orderItemUpdated || itemsAdded) {
      dispatch(
        GetOrderPaymentDetail({
          orderId: newOrderId
        })
      );
    }
  }, [itemsDeleted, orderItemUpdated, itemsAdded]);

  const handleClearStates = () => {
    dispatch(SaveInventoryHistoryByOrderId({ orderId: newOrderId }));

    dispatch(SetClearNewOrderData());
    dispatch(SetOrderPaymentState({ field: 'orderPaymentDetail', value: {} }));
    dispatch(SetOrderPaymentState({ field: 'updatePaymentDetail', value: false }));
    setConfirmOrder(false);

    navigate('/orders');
  };

  const handleConfirmAndViewOrder = () => {
    setConfirmOrder(true);
  };

  useEffect(() => {
    if (!isEmpty(newOrder)) {
      const { deliveryDates: newOrderDates } = newOrder;

      if (!isEmpty(newOrderDates)) {
        const datesObject = {};
        if (newOrderDates.shippingDate) extend(datesObject, { shippingDate: moment(newOrderDates.shippingDate).format('ddd, Do MMM YYYY') });
        if (newOrderDates.beingDeliveredBy) extend(datesObject, { beingDeliveredBy: moment(newOrderDates.beingDeliveredBy).format('ddd, Do MMM YYYY') });
        if (newOrderDates.endDeliveredBy) extend(datesObject, { endDeliveredBy: moment(newOrderDates.endDeliveredBy).format('ddd, Do MMM YYYY') });

        setDeliveryDates(datesObject);
      }
    }

    return () => {
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
      }
    };
  }, []);

  return (
    <>
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
              navigate(-1);
            }}
          />
          <h2 className="m-0 pl-2">Add New Order</h2>
        </Stack>
        <Box display="flex" alignItems="center" gap={2}>
          <Box ml={2}>
            {newOrderId ? (
              <>
                <Box component="span" color="#979797" fontSize="11px">
                  Order Created:
                </Box>
                <Box component="span" color="#272B41" fontSize="!3px">
                  {newOrder && moment(newOrder.createdAt).format('LLL')}
                </Box>
              </>
            ) : null}
          </Box>
        </Box>
      </Box>
      <Divider sx={{ marginBottom: '28px' }} />
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <h3 className="m-0">
          Enter Customer’s Personal information For Billing
        </h3>
        {isEmpty(newOrderId) ? (
          <Button
            text="Save Changes"
            variant="contained"
            startIcon={<span className="icon-Save" />}
            onClick={handleSaveChanges}
          />
        ) : (
          <Button
            text="Confirm Order"
            variant="contained"
            startIcon={<span className="icon-Save" />}
            onClick={handleConfirmAndViewOrder}
          />
        )}
      </Box>
      <Box display="flex" gap={3} mt={2} mb={1.25}>
        <Grid container columnSpacing={3}>
          <Grid item md={3}>
            <Input
              autoComplete="off"
              label="Company Name"
              placeholder="Enter"
              width="100%"
              name="companyName"
              value={
                !newOrderId
                  ? orderCustomerDetail.companyName
                  : newOrderCustomerDetail?.companyName || ''
              }
              onChange={handleOrderCustomerPersonalInfo}
              helperText={saveOrderHelperText.companyName}
              disabled={newOrderId}
            />
          </Grid>
          <Grid item md={3}>
            <Input
              autoComplete="off"
              label="Customer Name"
              placeholder="Enter"
              width="100%"
              name="customerName"
              value={
                !newOrderId
                  ? orderCustomerDetail.customerName
                  : newOrderCustomerDetail?.customerName || ''
              }
              onChange={handleOrderCustomerPersonalInfo}
              helperText={saveOrderHelperText.customerName}
              disabled={newOrderId}
            />
          </Grid>
          <Grid item md={3}>
            <Input
              autoComplete="off"
              label="Email Address"
              placeholder="Enter"
              width="100%"
              name="email"
              value={
                !newOrderId
                  ? orderCustomerDetail.email
                  : newOrderCustomerDetail?.email || ''
              }
              onChange={handleOrderCustomerPersonalInfo}
              helperText={saveOrderHelperText.email}
              disabled={newOrderId}
            />
          </Grid>
          <Grid item md={1.5}>
            <Input
              autoComplete="off"
              label="Phone #"
              placeholder="Enter"
              width="100%"
              name="phoneNumber"
              value={
                !newOrderId
                  ? orderCustomerDetail.phoneNumber
                  : newOrderCustomerDetail?.phoneNumber || ''
              }
              onChange={handleOrderCustomerPersonalInfo}
              helperText={saveOrderHelperText.phoneNumber}
              disabled={newOrderId}
            />
          </Grid>
          <Grid item md={1.5}>
            <Input
              autoComplete="off"
              label="Fax #"
              placeholder="Enter"
              width="100%"
              name="fax"
              value={
                !newOrderId
                  ? orderCustomerDetail.fax
                  : newOrderCustomerDetail?.fax || ''
              }
              onChange={handleOrderCustomerPersonalInfo}
              helperText={saveOrderHelperText.fax}
              disabled={newOrderId}
            />
          </Grid>
        </Grid>
      </Box>
      <h3 className="m-0">
        Enter Customer’s Address(s) Information For Billing
        {' '}
      </h3>
      <Box display="flex" gap={3} mt={2}>
        <Grid container columnSpacing={3}>
          <Grid item md={4}>
            <Input
              autoComplete="off"
              label="Street Address"
              placeholder="Enter"
              width="100%"
              name="streetAddress"
              value={
                !newOrderId
                  ? billInfo.streetAddress
                  : newOrderCustomerDetail?.billInfo?.streetAddress || ''
              }
              onChange={handleOrderBillingInfo}
              helperText={saveOrderHelperText.billingStreetAddress}
              disabled={newOrderId}
            />
          </Grid>
          <Grid item md={3}>
            <Input
              autoComplete="off"
              label="City"
              placeholder="Enter"
              width="100%"
              name="city"
              value={
                !newOrderId
                  ? billInfo.city
                  : newOrderCustomerDetail?.billInfo?.city || ''
              }
              onChange={handleOrderBillingInfo}
              helperText={saveOrderHelperText.billingCity}
              disabled={newOrderId}
            />
          </Grid>
          <Grid item md={2}>
            <Input
              autoComplete="off"
              label="State/Province"
              placeholder="Enter"
              width="100%"
              name="state"
              value={
                !newOrderId
                  ? billInfo.state
                  : newOrderCustomerDetail?.billInfo?.state || ''
              }
              onChange={handleOrderBillingInfo}
              helperText={saveOrderHelperText.billingState}
              disabled={newOrderId}
            />
          </Grid>
          <Grid item md={1.5}>
            <Input
              autoComplete="off"
              label="Country"
              placeholder="Enter"
              width="100%"
              name="country"
              value={
                !newOrderId
                  ? billInfo.country
                  : newOrderCustomerDetail?.billInfo?.country || ''
              }
              onChange={handleOrderBillingInfo}
              disabled={newOrderId}
            />
          </Grid>
          <Grid item md={1.5}>
            <Input
              autoComplete="off"
              label="Zip Code"
              placeholder="Enter"
              width="100%"
              name="zipCode"
              value={
                !newOrderId
                  ? billInfo.zipCode
                  : newOrderCustomerDetail?.billInfo?.zipCode || ''
              }
              onChange={handleOrderBillingInfo}
              helperText={saveOrderHelperText.billingZipCode}
              disabled={newOrderId}
            />
          </Grid>
        </Grid>
      </Box>
      <Box>
        <Checkbox
          disabled={newOrderId}
          checked={isBillingShippingAddressingSame}
          onChange={handleCheckboxChange}
          className="shipping-label"
          label="Is Billing & Shipping Address Same"
          marginBottom="0px"
        />
      </Box>
      {isBillingShippingAddressingSame ? null : (
        <Box mt={1.25}>
          <h3 className="m-0">
            Enter Customer’s Address(s) information for Shipping
            {' '}
          </h3>
          <Box display="flex" gap={3} mt={2}>
            <Grid container columnSpacing={3}>
              <Grid item md={4}>
                <Input
                  autoComplete="off"
                  label="Street Address"
                  placeholder="Enter"
                  width="100%"
                  name="streetAddress"
                  value={
                    !newOrderId
                      ? shippingInfo.streetAddress
                      : newOrderCustomerDetail?.shippingInfo?.streetAddress
                      || ''
                  }
                  onChange={handleOrderShippingInfo}
                  helperText={saveOrderHelperText.shippingStreetAddress}
                  disabled={newOrderId}
                />
              </Grid>
              <Grid item md={3}>
                <Input
                  autoComplete="off"
                  label="City"
                  placeholder="Enter"
                  width="100%"
                  name="city"
                  value={
                    !newOrderId
                      ? shippingInfo.city
                      : newOrderCustomerDetail?.shippingInfo?.city || ''
                  }
                  onChange={handleOrderShippingInfo}
                  helperText={saveOrderHelperText.shippingCity}
                  disabled={newOrderId}
                />
              </Grid>
              <Grid item md={2}>
                <Input
                  autoComplete="off"
                  label="State/Province"
                  placeholder="Enter"
                  width="100%"
                  name="state"
                  value={
                    !newOrderId
                      ? shippingInfo.state
                      : newOrderCustomerDetail?.shippingInfo?.state || ''
                  }
                  onChange={handleOrderShippingInfo}
                  helperText={saveOrderHelperText.shippingState}
                  disabled={newOrderId}
                />
              </Grid>
              <Grid item md={1.5}>
                <Input
                  autoComplete="off"
                  label="Country"
                  placeholder="Enter"
                  width="100%"
                  name="country"
                  value={
                    !newOrderId
                      ? shippingInfo.country
                      : newOrderCustomerDetail?.shippingInfo?.country || ''
                  }
                  onChange={handleOrderShippingInfo}
                  // helperText={saveOrderHelperText.country}
                  disabled={newOrderId}
                />
              </Grid>
              <Grid item md={1.5}>
                <Input
                  autoComplete="off"
                  label="Zip Code"
                  placeholder="Enter"
                  width="100%"
                  name="zipCode"
                  value={
                    !newOrderId
                      ? shippingInfo.zipCode
                      : newOrderCustomerDetail?.shippingInfo?.zipCode || ''
                  }
                  onChange={handleOrderShippingInfo}
                  helperText={saveOrderHelperText.shippingZipCode}
                  disabled={newOrderId}
                />
              </Grid>
            </Grid>
          </Box>
        </Box>
      )}

      <Divider sx={{ marginTop: '15px', marginBottom: '24px' }} />
      <Grid container columnSpacing={3}>
        <Grid item md={3}>
          <Input
            autoComplete="off"
            label="Platform"
            placeholder="Select"
            menuItem={platform}
            value="Phone Order"
            width="100%"
            disabled
          />
        </Grid>
        <Grid item md={3}>
          <Input
            autoComplete="off"
            label="Order taken by"
            disabled
            placeholder="Order Taker"
            value={name}
            width="100%"
            marginBottom="0"
          />
        </Grid>
        <Grid item md={3}>
          <Select
            label="Update Order Status"
            placeholder="Select"
            width="100%"
            name="status"
            value={orderDetail.status}
            menuItem={ORDER_STATUS}
            handleChange={handleOrderDetail}
            disabled={newOrderId}
          />
        </Grid>
        <Grid item md={3}>
          <Select
            label="Shipping method"
            placeholder="Select"
            value={orderDetail.shippingMethod}
            width="100%"
            disabled={newOrderId}
            name="shippingMethod"
            handleChange={handleOrderDetail}
            menuItem={SHIPPING_METHOD}
          />
        </Grid>
      </Grid>
      <Divider sx={{ marginTop: '24px', marginBottom: '24px' }} />
      <Grid container columnSpacing={3}>
        <Grid item md={4}>
          <Box
            borderRadius={1}
            border="1px solid #D9D9D9"
            p={3}
            pb={2}
            minHeight="257px"
          >
            <Tabs
              tabs={tabs}
              value={tabValue}
              onTabChange={handleTabChange}
              customPadding="0px 51px 9px 51px"
            />
          </Box>
        </Grid>
        <Grid item md={4}>
          <Box
            sx={{
              opacity: !newOrderId ? 0.5 : 1,
              pointerEvents: !newOrderId ? 'none' : 'auto'
            }}
            borderRadius={1}
            border="1px solid #D9D9D9"
            p={3}
            minHeight="257px"
          >
            <h3>Payment Details</h3>
            <Divider sx={{ marginTop: '8px', marginBottom: '14px' }} />
            <Box display="flex" justifyContent="space-between" mb={1.5}>
              <Box component="span" color="#979797" fontSize="11px">
                Subtotal
              </Box>
              <Box component="span" color="#5A5F7D" fontSize="13px">
                $
                {Number(orderPaymentDetail?.subTotal || 0)?.toFixed(2)}
              </Box>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1.5}>
              <Box component="span" color="#979797" fontSize="11px">
                Tax
              </Box>
              <Box component="span" color="#5A5F7D" fontSize="13px">
                $
                {Number(orderPaymentDetail?.taxPrice || 0)?.toFixed(2)}
              </Box>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1.5}>
              <Box component="span" color="#979797" fontSize="11px">
                Shipping
              </Box>
              <Box component="span" color="#5A5F7D" fontSize="13px">
                $
                {Number(orderPaymentDetail?.shippingPrice || 0)?.toFixed(2)}
              </Box>
            </Box>
            <Divider sx={{ marginTop: '8px', marginBottom: '18px' }} />
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
                {Number(
                  (orderPaymentDetail?.subTotal
                    ? Number(orderPaymentDetail?.subTotal.toFixed(2))
                    : 0)
                  + (orderPaymentDetail?.taxPrice
                    ? Number(orderPaymentDetail?.taxPrice.toFixed(2))
                    : 0)
                  + (orderPaymentDetail?.shippingPrice
                    ? Number(orderPaymentDetail?.shippingPrice.toFixed(2))
                    : 0)
                )?.toFixed(2)}
              </Box>
            </Box>
            <Box mt={2.25}>
              <Button
                text="Payment"
                variant="contained"
                width="100%"
                onClick={() => setPayment(true)}
              />
            </Box>
          </Box>
        </Grid>
        <Grid item md={4}>
          <Box
            borderRadius={1}
            border="1px solid #D9D9D9"
            sx={{ padding: '25px 22px 20px 22px' }}
            minHeight="257px"
          >
            <h3>Delivery Dates</h3>
            <Divider sx={{ marginTop: '8px', marginBottom: '18px' }} />
            <Box mb={6}>
              <Box display="flex" justifyContent="space-between">
                <Box component="span" color="#979797" fontSize="11px">
                  Shipping Date
                </Box>
                <Box display="flex" alignItems="center" mt={0.875} mr={0.875}>
                  <Box
                    component="span"
                    color="#5A5F7D"
                    fontSize="13px"
                    mr={2.125}
                    mt={-1.875}
                  >
                    {deliveryDates.shippingDate}
                  </Box>
                  <DatePicker
                    value={deliveryDates.shippingDate}
                    onChange={(e) => handleDeliveryDate(e, 'shippingDate')}
                    disablePast
                    disabled={newOrderId}
                  />
                </Box>
              </Box>
              {!isEmpty(saveOrderHelperText.shippingDate) ? (
                <Box
                  component="span"
                  display="block"
                  marginTop="-5px"
                  sx={{ color: 'rgb(220 53 69)', fontSize: 10 }}
                >
                  {saveOrderHelperText.shippingDate}
                </Box>
              ) : null}
            </Box>
            <Box mb={6}>
              <Box display="flex" justifyContent="space-between">
                <Box component="span" color="#979797" fontSize="11px">
                  Being Delivery By
                </Box>
                <Box display="flex" alignItems="center" mt={0.875} mr={0.875}>
                  <Box
                    component="span"
                    color="#5A5F7D"
                    fontSize="13px"
                    mr={2.125}
                    mt={-1.875}
                  >
                    {deliveryDates.beingDeliveredBy}
                  </Box>
                  <DatePicker
                    value={deliveryDates.beingDeliveredBy}
                    onChange={(e) => handleDeliveryDate(e, 'beingDeliveredBy')}
                    disablePast
                    disabled={newOrderId}
                    disableHighlightToday
                    shouldDisableDate={(date) => {
                      if (moment(date.$d).format('ddd, Do MMM YYYY') === moment().format('ddd, Do MMM YYYY')) return true;
                      return false;
                    }}
                  />
                </Box>
              </Box>
              {!isEmpty(saveOrderHelperText.beingDeliveredBy) ? (
                <Box
                  component="span"
                  display="block"
                  marginTop="-5px"
                  sx={{ color: 'rgb(220 53 69)', fontSize: 10 }}
                >
                  {saveOrderHelperText.beingDeliveredBy}
                </Box>
              ) : null}
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Box component="span" color="#979797" fontSize="11px">
                End Delivery By
              </Box>
              <Box display="flex" alignItems="center" mt={0.875} mr={0.875}>
                <Box
                  component="span"
                  color="#5A5F7D"
                  fontSize="13px"
                  mr={2.125}
                  mt={-1.875}
                >
                  {deliveryDates.endDeliveredBy}
                </Box>
                <DatePicker
                  value={deliveryDates.endDeliveredBy}
                  onChange={(e) => handleDeliveryDate(e, 'endDeliveredBy')}
                  disablePast
                  disabled={newOrderId}
                  disableHighlightToday
                  shouldDisableDate={(date) => {
                    if (moment(date.$d).format('ddd, Do MMM YYYY') === moment().add(1, 'day').format('ddd, Do MMM YYYY')
                      || moment(date.$d).format('ddd, Do MMM YYYY') === moment().format('ddd, Do MMM YYYY')
                    ) return true;
                    return false;
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
      <Divider sx={{ marginY: '24px' }} />
      <Box
        mt={1}
        sx={{
          opacity: !newOrderId ? 0.5 : 1,
          pointerEvents: !newOrderId ? 'none' : 'auto'
        }}
      >
        <Box component="h3" mb={1.75}>
          Upload Order Related Document
        </Box>
        <Grid container columnSpacing={3}>
          <Grid item md={4}>
            <Upload
              loading={attachmentLoading}
              handleChangeAttachment={handleChangeAttachment}
              title="Drag or Click to Upload File"
              attachmentName={attachmentName}
              accept=".jpeg, .jpg, .png, .gif, .bmp, .tiff, .tif, .webp, .svg, .ico, .psd, .ai, .eps, .docm, .docx, .dot, .csv, .tsv, .xlx, .xlsm, .xlsb, .xltx, .pdf, .xltm, .xls, .xlt, .xml, .xlam, .xla, .xlw, .xlr, .txt, .slk, .dif, .xps, .rtf, .dotx, .dotm, .docb, .doc, .xlsx, .json"
              disabled={!editOrders || attachmentLoading}
            />
          </Grid>
          <Grid item md={8}>
            <Box mt={0.25} position="relative">
              <Table
                alignCenter
                tableHeader={fileDocumentHeader}
                maxheight="200px"
                bodyPadding="12px 14px"
              >
                {updateOrderAttachmentLoading ? (
                  <LoaderWrapper />
                ) : orderDocsData.length ? (
                  orderDocsData.map((row) => (
                    <TableRow
                      hover
                      key={row._id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
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
                  <Box textAlign="center" ml={17.375} mt={4.125}>
                    <img src={noData} alt="no-Dta" />
                  </Box>
                )}
              </Table>
              <Divider sx={{ backgroundColor: '#979797', margin: 0 }} />
            </Box>
          </Grid>
        </Grid>
      </Box>
      <Divider sx={{ marginTop: '16px', marginBottom: '25px' }} />
      <ItemOrdered />
      <ItemDelete
        show={deleteItem}
        lastTitle="Delete This File!"
        onClose={() => {
          setDeleteItem(false);
          setDeleteAttachmentId('');
        }}
        onDelete={() => {
          handleDeleteOrderAttachment();
          setDeleteItem(false);
          setDeleteAttachmentId('');
        }}
      />
      <SaveChanging
        loading={saveChange ? addNewOrderLoading : undefined}
        show={saveChange}
        onClose={() => setSaveChange(false)}
        onConfirm={() => handleSaveOrder()}
      />
      <Payment
        billingAddress={billInfo.streetAddress}
        open={payment}
        onClose={() => setPayment(false)}
      />

      <ConfirmOrder
        show={confirmOrder}
        onClose={() => setConfirmOrder(false)}
        onConfirm={() => handleClearStates()}
        loading={saveChange ? addNewOrderLoading : undefined}
        isOrderItems={orderItems?.length || 0}
      />
    </>
  );
};

export default OrderNo;
