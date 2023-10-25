import CryptoJS from 'crypto-js';
import moment from 'moment';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Stack, TableCell, TableRow, Divider, RadioGroup, Tooltip
} from '@mui/material';
import { startCase, isEmpty, camelCase } from 'lodash';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';
// components
import Drawer from '../../../../../components/drawer/index';
import Table from '../../../../../components/ag-grid-table/index';
import Upload from '../../../../../components/verticalUpload/index';
import Input from '../../../../../components/inputs/input/index';
import Button from '../../../../../components/button/index';
import RadioBox from '../../../../../components/radioBox/index';
import LoaderWrapper from '../../../../../components/loader';
import Pagination from '../../../../../components/pagination/index';
// redux
import {
  SetPaymentDetailState,
  SetPaymentDetailNotifyState,
  AddPaymentDetail,
  GetPaymentDetails
} from '../../../../../redux/slices/purchasing';

import {
  GetS3PreSignedUrl,
  SetOtherNotifyState,
  SetOtherState
} from '../../../../../redux/slices/other-slice';
// helpers
import {
  UploadDocumentOnS3
} from '../../../../../../utils/helpers';
// images
import IconPdf from '../../../../../static/images/icon-pdf.svg';
import IconCsv from '../../../../../static/images/icon-csv.svg';
import IconXls from '../../../../../static/images/icon-xls.svg';
import IconDoc from '../../../../../static/images/icon-doc.svg';
import IconFile from '../../../../../static/images/icon-file.svg';
import ArrowUp from '../../../../../static/images/arrow-up-short.svg';
import noData from '../../../../../static/images/no-data-table.svg';
// constant
import {
  addPaymentHeader, EXTENSIONS_LIST, PAYMENT_METHOD, REGEX_FOR_DECIMAL_NUMBERS, sortAddPaymentHeader
} from '../../../../../constants';

const PaymentDetails = (props) => {
  const { open, onClose, pOId } = props;

  const dispatch = useDispatch();

  const {
    paymentDetails,
    totalPaymentDetails,
    paymentDetailPageLimit,
    paymentDetailPageNumber,
    loading: paymentDetailLoading,
    success: paymentDetailSuccess,
    addPayment
  } = useSelector((state) => state.paymentDetail);

  const { user } = useSelector((state) => state.auth);
  const {
    success: otherSuccess,
    loading: otherLoading,
    preSignedUrl,
    fileUploadKey
  } = useSelector((state) => state.other);

  const [attachment, setAttachment] = useState();
  const [attachmentLoading, setAttachmentLoading] = useState(false);
  const [paymentValue, setPaymentValue] = useState('');
  const [attachmentResponse, setAttachmentResponse] = useState(false);
  const [attachmentName, setAttachmentName] = useState('');
  const [paymentDetailData, setPaymentDetailData] = useState([]);
  const [addPaymentDetail, setAddPaymentDetail] = useState({
    wireTransferDate: '',
    transactionNumber: '',
    wireAmount: '',
    wiredBankName: '',
    memo: ''
  });
  const [addPaymentDetailHelperText, setAddPaymentDetailHelperText] = useState({
    wireTransferDate: '',
    transactionNumber: '',
    wireAmount: '',
    wiredBankName: '',
    memo: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('wireTransfer');
  const [paymentMethodError, setPaymentMethodError] = useState('');
  const [sortValue, setSortValue] = useState({});

  const getPaymentDetailByPOId = () => {
    const skip = (paymentDetailPageNumber - 1) * paymentDetailPageLimit;
    const limit = paymentDetailPageLimit;

    dispatch(GetPaymentDetails({
      skip, limit, pOId, sortBy: sortValue
    }));
  };

  const createPosData = (
    _id,
    payment,
    amount,
    userName,
    date,
    transaction,
    cheque,
    card,
    paypal,
    fileName,
    action
  ) => ({
    _id,
    payment,
    amount,
    userName,
    date,
    transaction,
    cheque,
    card,
    paypal,
    fileName,
    action
  });

  const handleAddPaymentChange = (e) => {
    const { value, name } = e.target;

    setAddPaymentDetail((prevPaymentObj) => ({
      ...prevPaymentObj,
      [name]: value
    }));

    const errors = {};

    if (name === 'wireAmount') {
      if (Number(value) < 1) errors.wireAmount = 'WireAmount is required && should be greater than 0!';
      else errors.wireAmount = '';
    }

    if (!value && name !== 'memo') errors[name] = `${startCase(name)} is required!`;
    else if (name !== 'wireAmount' && name !== 'memo') {
      errors[name] = '';
    }

    setAddPaymentDetailHelperText((prevHelperText) => ({
      ...prevHelperText,
      ...errors
    }));
  };

  const saveHandleAddPayment = () => {
    const errors = {};

    if (isEmpty(paymentMethod)) {
      setPaymentMethodError('Select payment method');
    } else {
      setPaymentMethodError('');
    }

    Object.keys(addPaymentDetail).forEach((key) => {
      if (key !== 'memo' && !addPaymentDetail[key]) {
        errors[key] = `${startCase(key)} is required!`;
      } else {
        errors[key] = '';
      }
    });

    if (!isEmpty(addPaymentDetail.wireAmount) && Number(addPaymentDetail.wireAmount) < 1) {
      errors.wireAmount = 'WireAmount is required && should be greater than 0!';
    }

    setAddPaymentDetailHelperText((prevHelperText) => ({
      ...prevHelperText,
      ...errors
    }));

    if (Object.values(errors).every((errorValue) => errorValue === '') && paymentMethodError === '') {
      if (attachment) {
        const extension = attachment.name.split('.').pop();
        const fileName = attachment.name.split('.')[0];
        const formattedFileName = fileName.replace(/\s/g, '-');

        setAttachmentLoading(true);
        dispatch(GetS3PreSignedUrl({
          fileName: `${formattedFileName}-${moment().format('YYYY-MM-DD HH:mm:ss')}.${extension}`,
          fileType: attachment.type,
          fileExtension: extension,
          uploadBucket: 'paymentDetailDocs',
          id: pOId
        }));
      } else {
        dispatch(AddPaymentDetail({
          addPaymentDetails: {
            ...addPaymentDetail,
            purchaseOrderId: pOId,
            paymentMethod,
            wireAmount: Number(addPaymentDetail.wireAmount).toFixed(2),
            wireTransferDate: new Date(addPaymentDetail.wireTransferDate)
          }
        }));
      }
    }
  };

  const handleChangeAttachment = async (e) => {
    const { files } = e.target;

    if (files?.length) {
      const file = files[0];

      const extension = file.name.split('.').pop();

      if (!EXTENSIONS_LIST.includes(extension)) {
        dispatch(SetPaymentDetailNotifyState({
          message: 'Only accept doc with following extensions jpeg, .jpg, .png, .gif, .bmp, .tiff, .tif, .webp, .svg, .ico, .psd, .ai, .eps, .docm, .docx, .dot, .csv, .tsv, .xlx, .xlsm, .xlsb, .xltx, .pdf, .xltm, .xls, .xlt, .xml, .xlam, .xla, .xlw, .xlr, .txt, .slk, .dif, .xps, .rtf, .dotx, .dotm, .docb, .doc, .xlsx, .json',
          type: 'error'
        }));
        return;
      }
      setAttachment(file);
      setAttachmentName(file.name);
    }
    e.target.value = null;
  };

  const handleUploadAttachmentOnS3 = async () => {
    const response = await UploadDocumentOnS3({ preSignedUrl, file: attachment });
    if (response) {
      setAttachmentResponse(true);
    } else {
      dispatch(SetOtherNotifyState({ message: 'File Uploading failed on S3', type: 'error' }));
    }

    dispatch(SetOtherState({ field: 'preSignedUrl', value: '' }));
    setAttachmentLoading(false);
  };

  const handlePageLimit = (e) => {
    dispatch(SetPaymentDetailState({ field: 'paymentDetailPageLimit', value: e }));
    dispatch(SetPaymentDetailState({ field: 'paymentDetailPageNumber', value: 1 }));
  };

  const handlePageNumber = (e) => {
    dispatch(SetPaymentDetailState({ field: 'paymentDetailPageNumber', value: e }));
  };

  const downloadAttachment = async (key) => {
    const { userId } = user;
    const userIdJson = CryptoJS.AES.encrypt(String(userId), process.env.HASH).toString();
    const userIdData = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(userIdJson));
    window.open(`${process.env.API_URL}/non-secure-route/download-file?uploadBucket=paymentDetailDocs&key=${key}&userId=${userIdData}`);
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
    if (!otherSuccess && !otherLoading) {
      setAttachmentLoading(false);
    }
  }, [otherSuccess, otherLoading]);

  useEffect(() => {
    if (addPayment && paymentDetailSuccess && !paymentDetailLoading) {
      setPaymentMethod('wireTransfer');
      setPaymentMethodError('');
      setAddPaymentDetail({
        wireTransferDate: '',
        transactionNumber: '',
        wireAmount: '',
        wiredBankName: '',
        memo: ''
      });
      setAddPaymentDetailHelperText({
        wireTransferDate: '',
        transactionNumber: '',
        wireAmount: '',
        wiredBankName: '',
        memo: ''
      });
      setAttachmentResponse(false);
      dispatch(SetPaymentDetailState({ field: 'addPayment', value: false }));
    }
  }, [paymentDetailSuccess, paymentDetailLoading]);

  useEffect(() => {
    if (attachmentResponse) {
      setAttachmentName('');
      setAttachmentName(null);

      dispatch(AddPaymentDetail({
        addPaymentDetails: {
          ...addPaymentDetail,
          purchaseOrderId: pOId,
          paymentMethod,
          wireAmount: Number(addPaymentDetail.wireAmount).toFixed(2),
          wireTransferDate: new Date(addPaymentDetail.wireTransferDate),
          attachmentS3Key: fileUploadKey
        }
      }));
    }
  }, [attachmentResponse]);

  useEffect(() => {
    if (preSignedUrl !== '') {
      handleUploadAttachmentOnS3();
    }
  }, [preSignedUrl]);

  useEffect(() => {
    if (paymentDetails.length) {
      const paymentData = paymentDetails.map((row) => {
        const parts = row.attachmentS3Key?.split('/') || '';
        const filename = parts[1]?.split('-')[0] || '';
        const fileExtension = row?.attachmentS3Key?.split('.')?.pop();
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
        return (
          createPosData(
            row._id,
            PAYMENT_METHOD[row.paymentMethod],
            `$${row.wireAmount}`,
            row.userId?.name || '--',
            moment(row.timestamp).format('LLL'),
            row.transactionNumber,
            '--',
            '--',
            '--',
            filename
              ? (
                <Box display="flex" fontSize="13px" gap={1}>
                  <img
                    alt=""
                    src={iconToShow}
                  />
                  <Tooltip
                    arrow
                    title={filename}
                  >
                    <span className="filename-ellipses">
                      {filename}
                    </span>
                  </Tooltip>
                </Box>
              )
              : '--',
            row.attachmentS3Key && row.attachmentS3Key !== ''
              ? (
                <img
                  alt=""
                  src={ArrowUp}
                  className="pointer"
                  onClick={() => downloadAttachment(row.attachmentS3Key)}
                />
              )
              : null
          )
        );
      });

      setPaymentDetailData(paymentData);
    } else {
      setPaymentDetailData([]);
    }
  }, [paymentDetails]);

  useEffect(() => () => {
    setPaymentMethod('wireTransfer');
    setAddPaymentDetail({
      wireTransferDate: '',
      transactionNumber: '',
      wireAmount: '',
      wiredBankName: '',
      memo: ''
    });
    setAddPaymentDetailHelperText({
      wireTransferDate: '',
      transactionNumber: '',
      wireAmount: '',
      wiredBankName: '',
      memo: ''
    });
    setAttachment(null);
    setAttachmentName('');
    setAttachmentLoading(false);
    setAttachmentResponse(false);
  }, []);

  useEffect(() => {
    if (paymentDetailPageLimit && paymentDetailPageNumber) getPaymentDetailByPOId();
  }, [pOId, paymentDetailPageLimit, paymentDetailPageNumber, sortValue]);

  return (
    <Drawer open={open} width="1256px" close={onClose}>
      {paymentDetailLoading ? <LoaderWrapper /> : null}
      <Box display="flex" justifyContent="space-between">
        <Stack alignItems="center" direction="row" spacing={3}>
          <Box component="span" className="icon-left pointer" onClick={onClose} />
          <h2 className="m-0 pl-2">Payment Details</h2>
        </Stack>
        <Button
          disabled={attachmentLoading || paymentDetailLoading}
          text="Add Payment"
          startIcon={<span className="icon-icon_payment_card" />}
          variant="contained"
          padding="4px 11px 4px 15px"
          onClick={saveHandleAddPayment}
        />
      </Box>
      <Divider sx={{ marginTop: '24px', marginBottom: '24px' }} />
      <h3>Choose Payment Method</h3>
      <Stack direction="row" mt={14 / 8} spacing={3}>
        {paymentMethodError ? (
          <span style={{ color: 'red' }}>
            {' '}
            {paymentMethodError}
            {' '}
          </span>
        ) : ''}
        <RadioGroup
          aria-labelledby="demo-radio-buttons-group-label"
          name="radio-buttons-group"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          row
          sx={{ display: 'flex', gap: '24px' }}
        >
          {['wireTransfer', 'cheque', 'creditCard', 'paypal'].map((radio, index) => (
            <RadioBox
              key={index}
              label={radio.charAt(0).toUpperCase() + radio.slice(1)}
              padding="0 9px 0px 0"
              value={radio}
            />
          ))}
        </RadioGroup>
      </Stack>
      <Box display="flex" mt={15 / 8} gap={3}>
        <Input
          autoComplete="off"
          width="284px"
          type="date"
          placeholder=""
          label="Wire Transfer date"
          name="wireTransferDate"
          value={addPaymentDetail.wireTransferDate}
          helperText={addPaymentDetailHelperText.wireTransferDate}
          onChange={handleAddPaymentChange}
        />
        <Input
          autoComplete="off"
          width="284px"
          label="Transaction number"
          name="transactionNumber"
          value={addPaymentDetail.transactionNumber}
          helperText={addPaymentDetailHelperText.transactionNumber}
          onChange={handleAddPaymentChange}
        />
        <Input
          autoComplete="off"
          width="284px"
          label="Wire amount"
          name="wireAmount"
          value={addPaymentDetail.wireAmount}
          helperText={addPaymentDetailHelperText.wireAmount}
          onChange={(e) => {
            if (REGEX_FOR_DECIMAL_NUMBERS.test(e.target.value)) {
              handleAddPaymentChange(e);
            }
          }}
        />
        <Input
          autoComplete="off"
          width="284px"
          label="Wired from bank name"
          name="wiredBankName"
          value={addPaymentDetail.wiredBankName}
          onChange={handleAddPaymentChange}
          helperText={addPaymentDetailHelperText.wiredBankName}
        />
      </Box>
      <Box mt={0.125}>
        <Input
          autoComplete="off"
          width="100%"
          label="Memo"
          name="memo"
          value={addPaymentDetail.memo}
          onChange={handleAddPaymentChange}
          helperText={addPaymentDetailHelperText.memo}
        />
      </Box>
      <Box mt={10 / 8}>
        <Box component="h3" mb={3}>Upload Payment Related Document</Box>
        <Upload
          loading={attachmentLoading}
          handleChangeAttachment={handleChangeAttachment}
          attachmentName={attachmentName}
          accept=".jpeg, .jpg, .png, .gif, .bmp, .tiff, .tif, .webp, .svg, .ico, .psd, .ai, .eps, .docm, .docx, .dot, .csv, .tsv, .xlx, .xlsm, .xlsb, .xltx, .pdf, .xltm, .xls, .xlt, .xml, .xlam, .xla, .xlw, .xlr, .txt, .slk, .dif, .xps, .rtf, .dotx, .dotm, .docb, .doc, .xlsx, .json"
          disabled={!user.permissions.editPurchasing}
          title="Drag or Click to Upload File"
        />
      </Box>
      <Divider sx={{ marginTop: '20px', marginBottom: '25px' }} />
      <Box component="h3" mb={3}>Payment History Log</Box>
      <Box>
        <Table
          tableHeader={addPaymentHeader}
          height="598px"
          bodyPadding="12px 12px"
          sortableHeader={sortAddPaymentHeader}
          handleSort={handleSortChange}
          sortValue={sortValue}
        >
          {paymentDetailData?.length ? paymentDetailData?.map((row) => (
            <TableRow
              hover
              key={row._id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell>{row.payment}</TableCell>
              <TableCell>{row.amount}</TableCell>
              <TableCell>{row.userName}</TableCell>
              <TableCell>{row.date}</TableCell>
              <TableCell>{row.transaction}</TableCell>
              <TableCell>{row.cheque}</TableCell>
              <TableCell>{row.paypal}</TableCell>
              <TableCell>{row.card}</TableCell>
              <TableCell>{row.fileName}</TableCell>
              <TableCell align="right">{row.action}</TableCell>
            </TableRow>
          )) : !paymentDetailLoading && (
            <TableRow>
              <TableCell sx={{ borderBottom: '24px' }} colSpan={9} align="center">
                <Box textAlign="center" display="flex" alignItems="center" justifyContent="center" height="250px">
                  {/* <img className="nodata-table-img" src={noData} height="100%" style={{ maxWidth: '100%' }} alt="no-Data" /> */}
                </Box>
              </TableCell>
            </TableRow>
          )}

        </Table>

        <Pagination
          width="0px"
          componentName="purchasing"
          perPageRecord={paymentDetails?.length || 0}
          total={totalPaymentDetails}
          totalPages={Math.ceil(totalPaymentDetails / paymentDetailPageLimit)}
          offset={totalPaymentDetails}
          pageNumber={paymentDetailPageNumber}
          pageLimit={paymentDetailPageLimit}
          handlePageLimitChange={handlePageLimit}
          handlePageNumberChange={handlePageNumber}
          position="relative"
        />
      </Box>
    </Drawer>
  );
};

export default PaymentDetails;
