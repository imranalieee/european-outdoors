import { isEmpty, startCase } from 'lodash';
import moment from 'moment';
import React, { useState, useEffect } from 'react';
import {
  Stack, Box, Divider, Grid, TableCell, TableRow, Tooltip
} from '@mui/material';
import CryptoJS from 'crypto-js';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
// icons
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
// component
import Button from '../../../components/button/index';
import Input from '../../../components/inputs/input/index';
import Drawer from '../../../components/drawer/index';
import Upload from '../../../components/upload/index';
import Table from '../../../components/ag-grid-table/index';
import Pagination from '../../../components/pagination/index';
import LoaderWrapper from '../../../components/loader/index';
import ItemDelete from './modals/delete';

import {
  GetS3PreSignedUrl,
  GetSupplierDetails,
  SetSupplierNotifyState,
  SaveSupplierAttachment,
  GetSupplierAttachmentsBySupplierId,
  UpdateSupplierAttachmentById,
  SetSupplierState,
  UpdateSupplier
} from '../../../redux/slices/supplier-slice';
import {
  GetPurchaseOrderHitory,
  SetPurchaseOrderState
} from '../../../redux/slices/purchasing';
// helpers
import {
  UploadDocumentOnS3, UploadedFileSize,
  ValidateEmail, ValidatePhoneNumber
} from '../../../../utils/helpers';
// constant
import {
  EXTENSIONS_LIST,
  fileDocumentHeader,
  supplierRealtedHeader,
  PO_STATUS
} from '../../../constants';
// images
import DownArrow from '../../../static/images/arrow-up.svg';
import noData from '../../../static/images/no-data.svg';
import IconPdf from '../../../static/images/icon-pdf.svg';
import IconCsv from '../../../static/images/icon-csv.svg';
import IconXls from '../../../static/images/icon-xls.svg';
import IconDoc from '../../../static/images/icon-doc.svg';
import IconFile from '../../../static/images/icon-file.svg';

function createData(
  name,
  size,
  date,
  action
) {
  return {
    name,
    size,
    date,
    action
  };
}

function createDataSupplier(
  po,
  code,
  date,
  total,
  quantity,
  supplier,
  warehouse,
  printed,
  received,
  completed,
  action
) {
  return {
    po,
    code,
    date,
    total,
    quantity,
    supplier,
    warehouse,
    printed,
    received,
    completed,
    action
  };
}

const supplierData = [];
for (let i = 0; i <= 10; i += 1) {
  supplierData.push(
    createDataSupplier(
      '18747',
      'SBC',
      '28 Dec 2022 ',
      '$1450',
      <Box sx={{ textOverflow: 'ellipsis', maxWidth: 200 }} overflow="hidden">Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto.</Box>,
      <Box sx={{ textOverflow: 'ellipsis', maxWidth: 200 }} overflow="hidden">Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto.</Box>,
      <CheckCircleIcon sx={{ color: '#0FB600', width: 16 }} />,
      <CheckCircleOutlinedIcon sx={{ color: '#979797', width: 16 }} />,
      <CheckCircleOutlinedIcon sx={{ color: '#979797', width: 16 }} />,
      <RemoveRedEyeIcon
        sx={{ color: '#3C76FF', width: 16 }}
        className="pointer"
      />
    )
  );
}

const SupplierDetails = () => {
  const Navigate = useNavigate();
  const dispatch = useDispatch();
  const params = useParams();

  const {
    loading,
    preSignedUrl,
    fileUploadKey,
    supplierDetail,
    supplierAttachments = [],
    supplierUpdated,
    success
  } = useSelector((state) => state.supplier);

  const {
    purchaseOrderHistoryLoading,
    purchaseOrderHistory,
    totalPurchaseOrderHistory,
    purchaseOrderHistoryPageLimit,
    purchaseOrderHistoryPageNumber
  } = useSelector((state) => state.purchaseOrder);

  const { user } = useSelector((state) => state.auth);

  const [attachment, setAttachment] = useState();
  const [attachmentLoading, setAttachmentLoading] = useState(false);
  const [attachmentResponse, setAttachmentResponse] = useState(false);
  const [attachmentName, setAttachmentName] = useState('');
  const [deleteAttachmentId, setDeleteAttachmentId] = useState('');
  const [supplierDocsData, setSupplierDocsData] = useState([]);
  const [deleteItem, setDeleteItem] = useState(false);
  const [supplierDetailModal, SetSupplierDetailModal] = useState(false);
  const [supplierId, setSupplierId] = useState('');
  const [editSupplier, setEditSupplier] = useState(false);
  const [cancelSave, setCancelSave] = useState(false);
  const [purchaseOrder, setPurchaseOrder] = useState();
  const [editSupplierData, setEditSupplierData] = useState({
    email: '',
    supplierName: '',
    companyName: '',
    // code: '',
    account: '',
    phone: '',
    fax: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    paymentTerms: ''
  });
  const [editSupplierHelperText, setEditSupplierHelperText] = useState({
    email: '',
    supplierName: '',
    companyName: '',
    // code: '',
    account: '',
    phone: '',
    fax: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    paymentTerms: ''
  });

  const getSupplierDetail = (id) => {
    dispatch(GetSupplierDetails({ supplierId: id }));
  };

  const getPurchaseItemHitory = (id) => {
    const skip = (purchaseOrderHistoryPageNumber - 1) * purchaseOrderHistoryPageLimit;
    const limit = purchaseOrderHistoryPageLimit;
    dispatch(GetPurchaseOrderHitory({
      skip, limit, supplierId: id, poStatus: PO_STATUS.confirm
    }));
  };

  const getSupplierAttachments = (id) => {
    dispatch(GetSupplierAttachmentsBySupplierId({ supplierId: id }));
  };

  const handleUploadAttachmentOnS3 = async () => {
    const response = await UploadDocumentOnS3({ preSignedUrl, file: attachment });
    if (response) {
      setAttachmentResponse(true);
    } else {
      setAttachmentLoading(false);
      dispatch(SetSupplierNotifyState({ message: 'File Uploading failed on S3', type: 'error' }));
    }
  };

  const handleChangeAttachment = async (e) => {
    const { files } = e.target;

    if (files?.length) {
      const file = files[0];

      const extension = file.name.split('.').pop();

      if (!EXTENSIONS_LIST.includes(extension)) {
        dispatch(SetSupplierNotifyState({
          message: 'Only accept doc with following extensions jpeg, .jpg, .png, .gif, .bmp, .tiff, .tif, .webp, .svg, .ico, .psd, .ai, .eps, .docm, .docx, .dot, .csv, .tsv, .xlx, .xlsm, .xlsb, .xltx, .pdf, .xltm, .xls, .xlt, .xml, .xlam, .xla, .xlw, .xlr, .txt, .slk, .dif, .xps, .rtf, .dotx, .dotm, .docb, .doc, .xlsx, .json',
          type: 'error'
        }));
        return;
      }

      setAttachment(file);

      setAttachmentLoading(true);

      const fileName = file.name.split('.')[0];
      setAttachmentName(file.name);

      const formattedFileName = fileName.replace(/\s/g, '-');
      dispatch(GetS3PreSignedUrl({
        fileName: `${formattedFileName}-${moment().format('YYYY-MM-DD HH:mm:ss')}.${extension}`,
        fileType: file.type,
        fileExtension: extension,
        uploadBucket: 'supplierDocs',
        id: supplierId
      }));
    }
    e.target.value = null;
  };

  const downloadAttachment = async (key) => {
    const { userId } = user;
    const userIdJson = CryptoJS.AES.encrypt(String(userId), process.env.HASH).toString();
    const userIdData = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(userIdJson));
    window.open(`${process.env.API_URL}/non-secure-route/download-file?uploadBucket=supplierDocs&key=${key}&userId=${userIdData}`);
  };

  const handleDeleteSupplierAttachment = () => {
    if (!isEmpty(deleteAttachmentId)) {
      dispatch(
        UpdateSupplierAttachmentById({
          paramsToUpdate: { archived: true },
          supplierAttachmentId: String(deleteAttachmentId)
        })
      );
    }
  };

  const handleSupplierEdit = (e) => {
    const { value, name: key } = e.target;

    if (key === 'phone') {
      if (/[^+\-0-9]/.test(value)) {
        return;
      }
      setEditSupplierData({
        ...editSupplierData,
        [key]: value
      });
    } else {
      setEditSupplierData({
        ...editSupplierData,
        [key]: value
      });
    }

    const errors = {};
    if (key === 'email') {
      const emailError = ValidateEmail({ email: value });
      if (emailError !== '') {
        errors.email = emailError;
      } else {
        errors.email = '';
      }
    } else if (key === 'phone') {
      const phoneError = ValidatePhoneNumber(value);
      if (phoneError !== '') {
        errors.phone = phoneError;
      } else {
        errors.phone = '';
      }
    }
    if (!value) errors[key] = `${startCase(key)} is required!`;
    else if (key !== 'phone' && key !== 'email') {
      errors[key] = '';
    }

    setEditSupplierHelperText((prevHelperText) => ({
      ...prevHelperText,
      ...errors
    }));
  };

  const handleSaveEditSupplierChanges = () => {
    const errors = {};

    Object.keys(editSupplierData).forEach((key) => {
      if (!editSupplierData[key]) {
        errors[key] = `${startCase(key)} is required!`;
      } else {
        errors[key] = '';
      }
    });

    const emailError = ValidateEmail({ email: editSupplierData.email });
    if (emailError !== '') {
      errors.email = emailError;
    } else {
      errors.email = '';
    }

    const phoneError = ValidatePhoneNumber(editSupplierData.phone);
    if (phoneError !== '') {
      errors.phone = phoneError;
    } else {
      errors.phone = '';
    }

    setEditSupplierHelperText((prevHelperText) => ({
      ...prevHelperText,
      ...errors
    }));

    if (Object.values(errors).every((errorValue) => errorValue === '')) {
      const modifiedSupplierDetails = {};
      Object.keys(editSupplierData).forEach((key) => {
        if (editSupplierData[key] !== supplierDetail[key]) {
          modifiedSupplierDetails[key] = editSupplierData[key];
        }
      });

      if (Object.keys(modifiedSupplierDetails).length > 0) {
        dispatch(UpdateSupplier({
          supplierId,
          modifiedSupplierDetails
        }));
      } else {
        setEditSupplier(false);
        dispatch(
          SetSupplierNotifyState({
            message: 'Nothing updated !',
            type: 'info'
          })
        );
      }
    }
  };

  const handleCancelEditSupplier = () => {
    setCancelSave(!cancelSave);
    setEditSupplier(false);

    const errors = {};
    Object.keys(editSupplierHelperText).forEach((key) => {
      errors[key] = '';
    });
    const defaultValues = {};
    Object.keys(editSupplierData).forEach((key) => {
      defaultValues[key] = '';
    });

    setEditSupplierHelperText(errors);
    setEditSupplierData(defaultValues);
  };

  const handleEditToggle = () => {
    setEditSupplier(true);
    setEditSupplierData({
      email: supplierDetail.email || '',
      supplierName: supplierDetail.supplierName || '',
      // code: supplierDetail.code || '',
      account: supplierDetail.account || '',
      phone: supplierDetail.phone || '',
      fax: supplierDetail.fax || '',
      streetAddress: supplierDetail.streetAddress || '',
      city: supplierDetail.city || '',
      state: supplierDetail.state || '',
      zipCode: supplierDetail.zipCode || '',
      country: supplierDetail.country || '',
      paymentTerms: supplierDetail.paymentTerms || '',
      companyName: supplierDetail.companyName || ''
    });
  };

  const handlePageNumber = (e) => {
    dispatch(SetPurchaseOrderState({ field: 'purchaseOrderHistoryPageNumber', value: e }));
  };

  const handlePageLimit = (e) => {
    dispatch(SetPurchaseOrderState({ field: 'purchaseOrderHistoryPageNumber', value: 1 }));
    dispatch(SetPurchaseOrderState({ field: 'purchaseOrderHistoryPageLimit', value: e }));
  };

  useEffect(() => {
    if (supplierUpdated) {
      setEditSupplier(false);
      dispatch(SetSupplierState({ field: 'supplierUpdated', value: false }));
    }
  }, [supplierUpdated]);

  useEffect(() => {
    if (attachmentResponse) {
      setAttachmentLoading(false);
      const sizeOfFile = UploadedFileSize(attachment.size);
      setAttachmentName('');
      dispatch(
        SaveSupplierAttachment({
          supplierId: supplierDetail?._id,
          key: fileUploadKey,
          archived: false,
          size: sizeOfFile,
          uploadedDate: new Date()
        })
      );
    }
  }, [attachmentResponse]);

  useEffect(() => {
    if (preSignedUrl !== '') {
      handleUploadAttachmentOnS3();
    }
  }, [preSignedUrl]);

  useEffect(() => {
    if (!attachmentLoading) {
      dispatch(SetSupplierState({ field: 'preSignedUrl', value: '' }));
      setAttachmentResponse(false);
    }
  }, [attachmentLoading]);

  useEffect(() => {
    if (supplierAttachments.length) {
      const attachmentData = supplierAttachments?.map((row) => {
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
            <Tooltip
              arrow
              title={row.key.split('/')[1]}
            >
              <span className="filename-ellipses">
                {row.key.split('/')[1]}
              </span>
            </Tooltip>
          </Stack>,
          row.size,
          moment(row.uploadedDate).format('llll'),
          <Stack direction="row" spacing={1.5}>
            <img
              src={DownArrow}
              width="16"
              alt="no-arroow"
              className="pointer"
              onClick={() => downloadAttachment(row.key)}
            />
            <Box
              sx={{
                opacity: !(user?.permissions?.editSuppliers) ? 0.5 : 1,
                pointerEvents: !(user?.permissions?.editSuppliers) ? 'none' : 'auto'
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
      setSupplierDocsData(attachmentData);
    } else setSupplierDocsData([]);
  }, [supplierAttachments]);

  useEffect(() => {
    const { id } = params;
    setSupplierId(id);
    getSupplierDetail(id);
    getSupplierAttachments(id);

    return () => {
      dispatch(SetSupplierState({ field: 'preSignedUrl', value: '' }));
      if (window.location.pathname !== '/suppliers') {
        dispatch(SetSupplierState({ field: 'supplierPageLimit', value: 100 }));
        dispatch(SetSupplierState({ field: 'supplierPageNumber', value: 1 }));
        dispatch(SetPurchaseOrderState({ field: 'purchaseOrderHistoryPageNumber', value: 1 }));
        dispatch(SetPurchaseOrderState({ field: 'purchaseOrderHistoryPageLimit', value: 100 }));
        dispatch(SetSupplierState({
          field: 'supplierPageFilters',
          value: {
            searchByKeyWords: {
              keys: ['supplierName', 'companyName', 'code', 'email'],
              value: ''
            }
          }
        }));
      }
    };
  }, []);

  useEffect(() => {
    if (!success && !loading) {
      setAttachmentLoading(false);
    }
  }, [success, loading]);

  useEffect(() => {
    if (purchaseOrderHistory?.length) {
      const dd = purchaseOrderHistory?.map((item) => {
        let isPrinted = false;
        let isReceived = false;
        let isClosed = false;
        if (item?.poStatus === 'PRINTED') {
          isPrinted = true;
          isReceived = false;
          isClosed = false;
        } else if (item?.poStatus === 'RECEIVED') {
          isPrinted = true;
          isReceived = true;
          isClosed = false;
        } else if (item?.poStatus === 'CLOSED') {
          isPrinted = true;
          isReceived = true;
          isClosed = true;
        }
        return createDataSupplier(
          item?.poId,
          item?.supplier?.code,
          item?.createdAt ? moment(new Date(item?.createdAt)).format('DD MMM YYYY') : '--',
          `$${Number(item?.poTotalCost || 0).toFixed(2)}`,
          Number(item?.poTotalQuantity),
          <Box
            sx={{ textOverflow: 'ellipsis', maxWidth: 200 }}
            overflow="hidden"
          >
            {item?.supplierNote || '--'}
          </Box>,
          <Box
            sx={{ textOverflow: 'ellipsis', maxWidth: 200 }}
            overflow="hidden"
          >
            {item?.wareHouseInstrutions || '--'}
          </Box>,

          isPrinted
            ? <CheckCircleIcon sx={{ color: '#0FB600', width: 16 }} />
            : <CheckCircleOutlinedIcon sx={{ color: '#979797', width: 16 }} />,
          isReceived
            ? <CheckCircleIcon sx={{ color: '#0FB600', width: 16 }} />
            : <CheckCircleOutlinedIcon sx={{ color: '#979797', width: 16 }} />,
          isClosed
            ? <CheckCircleIcon sx={{ color: '#0FB600', width: 16 }} />
            : <CheckCircleOutlinedIcon sx={{ color: '#979797', width: 16 }} />,

          <RemoveRedEyeIcon
            sx={{ color: '#3C76FF', width: 16 }}
            className="pointer"
            onClick={() => {
              dispatch(SetPurchaseOrderState({ field: 'selectedSupplierPO', value: item }));
              Navigate(`/purchasing/confirm/${item.poId}`);
            }}
          />
        );
      });
      setPurchaseOrder(dd);
    } else {
      setPurchaseOrder([]);
    }
  }, [purchaseOrderHistory, totalPurchaseOrderHistory]);

  useEffect(() => {
    const { id } = params;
    getPurchaseItemHitory(id);
  }, [purchaseOrderHistoryPageNumber, purchaseOrderHistoryPageLimit]);

  return (
    <>
      <Box display="flex" justifyContent="space-between">
        <Stack alignItems="center" direction="row" spacing={1}>
          <Box component="span" className="icon-left pointer" onClick={() => Navigate('/suppliers')} />
          <Box component="h2" pt={0.2}>{supplierDetail?.code}</Box>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box display="flex">
            <Box component="span" color="#5A5F7D">Supplier Added Date: </Box>
            <Box component="span" color="#272B41" fontWeight="bold" ml={0.3}>{supplierDetail?.createdAt ? moment(supplierDetail?.createdAt).format('LLL') : null}</Box>
          </Box>
          {/* <Button
            startIcon={<AddCircleOutlineOutlinedIcon sx={{ fontSize: 14 }} />}
            text="Add New Supplier"
            onClick={() => SetSupplierDetailModal(true)}
          /> */}
        </Stack>
      </Box>
      <Divider sx={{ backgroundColor: '#979797', margin: '24px 0px' }} />
      <Box>
        {user?.permissions?.editSuppliers
          ? (
            <Box display="flex" justifyContent="space-between">
              <Box component="h3" mb={3.225}>Contact</Box>
              {editSupplier
                ? (
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      startIcon={<CancelOutlinedIcon sx={{ color: '#3C76FF' }} fontSize="16px" />}
                      text="Cancel"
                      onClick={handleCancelEditSupplier}
                    />
                    <Button
                      onClick={handleSaveEditSupplierChanges}
                      startIcon={<span className="icon-Save" />}
                      text="Save Changes"
                      variant="contained"
                    />
                  </Stack>
                ) : (
                  <Button
                    startIcon={<span className="icon-edit" />}
                    text="Edit"
                    onClick={handleEditToggle}
                  />
                )}
            </Box>
          )
          : null}
        <Grid container columnSpacing={3}>
          <Grid item md={3}>
            <Input
              autoComplete="off"
              label="Company Name"
              name="companyName"
              value={editSupplier ? editSupplierData.companyName : supplierDetail?.companyName || ''}
              width="100%"
              disabled={!editSupplier}
              onChange={handleSupplierEdit}
              helperText={editSupplierHelperText.companyName}
            />
          </Grid>
          <Grid item md={3}>
            <Grid container columnSpacing={3}>
              <Grid item md={6}>
                <Input
                  autoComplete="off"
                  label="Supplier Name"
                  name="supplierName"
                  value={editSupplier ? editSupplierData.supplierName : supplierDetail?.supplierName || ''}
                  width="100%"
                  disabled={!editSupplier}
                  onChange={handleSupplierEdit}
                  helperText={editSupplierHelperText.supplierName}
                />
              </Grid>
              <Grid item md={6}>
                <Input
                  autoComplete="off"
                  label="Account #"
                  name="account"
                  value={editSupplier ? editSupplierData.account : supplierDetail?.account || ''}
                  width="100%"
                  disabled={!editSupplier}
                  onChange={handleSupplierEdit}
                  helperText={editSupplierHelperText.account}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item md={3}>
            <Input
              autoComplete="off"
              label="Email Address"
              name="email"
              value={editSupplier ? editSupplierData.email : supplierDetail?.email || ''}
              width="100%"
              disabled={!editSupplier}
              onChange={handleSupplierEdit}
              helperText={editSupplierHelperText.email}
            />
          </Grid>
          <Grid item md={3}>
            <Grid container columnSpacing={3}>
              <Grid item md={6}>
                <Input
                  autoComplete="off"
                  label="Phone #"
                  name="phone"
                  value={editSupplier ? editSupplierData.phone : supplierDetail?.phone || ''}
                  disabled={!editSupplier}
                  onChange={handleSupplierEdit}
                  helperText={editSupplierHelperText.phone}
                />
              </Grid>
              <Grid item md={6}>
                <Input
                  autoComplete="off"
                  label="Fax #"
                  name="fax"
                  value={editSupplier ? editSupplierData.fax : supplierDetail?.fax || ''}
                  width="100%"
                  disabled={!editSupplier}
                  onChange={handleSupplierEdit}
                  helperText={editSupplierHelperText.fax}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
      <Box mt={1.1}>
        <Box component="h3" mb={2}>Location</Box>
        <Grid container columnSpacing={3}>
          <Grid item md={3}>
            <Input
              autoComplete="off"
              label="Street Address"
              name="streetAddress"
              value={editSupplier ? editSupplierData.streetAddress : supplierDetail?.streetAddress || ''}
              width="100%"
              marginLeft=""
              disabled={!editSupplier}
              onChange={handleSupplierEdit}
              helperText={editSupplierHelperText.streetAddress}
            />
          </Grid>
          <Grid item md={2}>
            <Input
              autoComplete="off"
              label="City"
              name="city"
              value={editSupplier ? editSupplierData.city : supplierDetail?.city || ''}
              width="100%"
              disabled={!editSupplier}
              onChange={handleSupplierEdit}
              helperText={editSupplierHelperText.city}
            />
          </Grid>
          <Grid item md={2}>
            <Input
              autoComplete="off"
              label="State/Province"
              name="state"
              value={editSupplier ? editSupplierData.state : supplierDetail?.state || ''}
              width="100%"
              disabled={!editSupplier}
              onChange={handleSupplierEdit}
              helperText={editSupplierHelperText.state}
            />
          </Grid>
          <Grid item md={1.5}>
            <Input
              autoComplete="off"
              label="Country"
              name="country"
              value={editSupplier ? editSupplierData.country : supplierDetail?.country || ''}
              width="100%"
              disabled={!editSupplier}
              onChange={handleSupplierEdit}
              helperText={editSupplierHelperText.country}
            />
          </Grid>
          <Grid item md={1.5}>
            <Input
              autoComplete="off"
              label="Zip Code"
              name="zipCode"
              value={editSupplier ? editSupplierData.zipCode : supplierDetail?.zipCode || ''}
              width="100%"
              disabled={!editSupplier}
              onChange={handleSupplierEdit}
              helperText={editSupplierHelperText.zipCode}
            />
          </Grid>
          <Grid item md={2}>
            <Input
              autoComplete="off"
              label="Payment Terms"
              name="paymentTerms"
              value={editSupplier ? editSupplierData.paymentTerms : supplierDetail?.paymentTerms || ''}
              width="100%"
              disabled={!editSupplier}
              onChange={handleSupplierEdit}
              helperText={editSupplierHelperText.paymentTerms}
            />
          </Grid>
        </Grid>
      </Box>
      <Divider sx={{ backgroundColor: '#979797', margin: '6px 0 26px' }} />
      <Box mt={1.1}>
        <Box component="h3" mb={1.75}>Upload Supplier Related Document</Box>
        <Grid container columnSpacing={3}>
          <Grid item md={4}>
            <Upload
              loading={attachmentLoading}
              handleChangeAttachment={handleChangeAttachment}
              title="Drag or Click to Upload File"
              attachmentName={attachmentName}
              accept=".jpeg, .jpg, .png, .gif, .bmp, .tiff, .tif, .webp, .svg, .ico, .psd, .ai, .eps, .docm, .docx, .dot, .csv, .tsv, .xlx, .xlsm, .xlsb, .xltx, .pdf, .xltm, .xls, .xlt, .xml, .xlam, .xla, .xlw, .xlr, .txt, .slk, .dif, .xps, .rtf, .dotx, .dotm, .docb, .doc, .xlsx, .json"
              disabled={!user.permissions.editSuppliers}
            />
          </Grid>
          <Grid item md={8}>
            <Box>
              {loading && !attachmentLoading ? <LoaderWrapper /> : null}
              <Table tableHeader={fileDocumentHeader} maxheight="200px">
                {supplierDocsData?.length ? supplierDocsData.map((row) => (
                  <TableRow
                    hover
                    key={row._id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row.name}
                    </TableCell>
                    <TableCell>{row.size}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell align="right">{row.action}</TableCell>
                  </TableRow>
                )) : (
                  <Box textAlign="center" ml={17.375} mt={4.125}>
                    {' '}
                    <img src={noData} alt="no-Dta" />
                  </Box>
                )}
              </Table>
              <Divider sx={{ backgroundColor: '#979797', margin: 0 }} />
            </Box>
          </Grid>
        </Grid>
      </Box>
      <Divider sx={{ backgroundColor: '#979797', marginTop: '16px', marginBottom: '24px' }} />
      <Box>
        <Table tableHeader={supplierRealtedHeader} height="714px" className="supplier-details-table" bodyPadding="8px 12px">
          {/* { loading && !(supplierAttachmentDelete) ? <LoaderWrapper /> : null} */}
          {purchaseOrderHistoryLoading ? <LoaderWrapper /> : null}
          {purchaseOrder?.map((row) => (
            <TableRow
              hover
              key={row.name}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.po}
              </TableCell>
              <TableCell>{row.code}</TableCell>
              <TableCell>{row.date}</TableCell>
              <TableCell>{row.total}</TableCell>
              <TableCell>{row.quantity}</TableCell>
              <TableCell>{row.supplier}</TableCell>
              <TableCell>{row.warehouse}</TableCell>
              <TableCell>{row.printed}</TableCell>
              <TableCell>{row.received}</TableCell>
              <TableCell>{row.completed}</TableCell>
              <TableCell align="right">{row.action}</TableCell>
            </TableRow>
          ))}
        </Table>
        <Pagination
          componentName="suppliers"
          perPageRecord={purchaseOrderHistory?.length || 0}
          total={totalPurchaseOrderHistory}
          totalPages={Math.ceil(totalPurchaseOrderHistory / purchaseOrderHistoryPageLimit)}
          offset={totalPurchaseOrderHistory}
          pageNumber={purchaseOrderHistoryPageNumber}
          pageLimit={purchaseOrderHistoryPageLimit}
          handlePageLimitChange={handlePageLimit}
          handlePageNumberChange={handlePageNumber}
        />
      </Box>
      <ItemDelete
        show={deleteItem}
        lastTitle="Delete This File!"
        onSave={() => {
          handleDeleteSupplierAttachment();
          setDeleteItem(false);
          setDeleteAttachmentId('');
        }}
        onClose={() => {
          setDeleteItem(false);
          setDeleteAttachmentId('');
        }}
      />
      {/* <Drawer open={supplierDetailModal} width="696px">
        <Stack alignItems="center" direction="row" spacing={3}>
          <Box compoent="span" className="icon-left pointer" onClick={() => SetSupplierDetailModal(false)} />
          <h2 className="m-0 pl-2">Enter Supplier Details</h2>
        </Stack>
        <Divider sx={{ backgroundColor: '#979797', margin: '25px 0px' }} />
        <Grid container columnSpacing={3}>
          <Grid item md={6}>

            <Input
              label="Company Name"
              name="companyName"
              placeholder="Enter Company Name"
              // value={supplierDetails.companyName}
              width="100%"
            />
          </Grid>
          <Grid item md={6}>
            <Input
              label="Supplier Name"
              name="supplierName"
              placeholder="Enter Supplier Name"
              // value={supplierDetails.supplierName}
              width="100%"
            />
          </Grid>
          <Grid item md={6}>
            <Grid container columnSpacing={3}>
              <Grid item md={6}>
                <Input
                  label="Supplier Code"
                  name="code"
                  placeholder="Enter Supplier Code"
                  // value={supplierDetails.code}
                  width="100%"
                />
              </Grid>
              <Grid item md={6}>
                <Input
                  label="Account #"
                  name="account"
                  placeholder="Enter Account #"
                  // value={supplierDetails.account}
                  width="100%"
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item md={6}>
            <Input
              label="Email Address"
              name="email"
              placeholder="Enter Email Address"
              // value={supplierDetails.email}
              width="100%"
            />
          </Grid>
          <Grid item md={6}>
            <Input
              label="Phone #"
              name="phone"
              placeholder="Enter Phone"
              // value={supplierDetails.phone}
            />
          </Grid>
          <Grid item md={6}>
            <Input
              label="Fax #"
              name="fax"
              placeholder="Enter Fax #"
              // value={supplierDetails.fax}
              width="100%"
            />
          </Grid>
          <Grid item md={6}>
            <Input
              label="Street Address"
              name="streetAddress"
              placeholder="Enter Street Address"
              // value={supplierDetails.streetAddress}
              width="100%"
            />
          </Grid>
          <Grid item md={6}>
            <Input
              label="City"
              name="city"
              placeholder="Enter City"
              // value={supplierDetails.city}
              width="100%"
            />
          </Grid>
          <Grid item md={6}>
            <Grid container columnSpacing={3}>
              <Grid item md={6}>
                <Input
                  label="State/Province"
                  name="state"
                  placeholder="Enter State/Province"
                  // value={supplierDetails.state}
                  width="100%"
                />
              </Grid>
              <Grid item md={6}>
                <Input
                  label="Zip Code"
                  name="zipCode"
                  placeholder="Enter Zip Code"
                  // value={supplierDetails.zipCode}
                  width="100%"
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item md={6}>
            <Input
              label="Country"
              name="country"
              placeholder="Enter Country"
              // value={supplierDetails.country}
              width="100%"
            />
          </Grid>

        </Grid>
        <Box textAlign="right" mt={0.8}>
          <Button
            text="Save"
            variant="contained"
            width="87px"
            startIcon={<span className="icon-Save" />}
          />
        </Box>
      </Drawer> */}
    </>
  );
};

export default SupplierDetails;
