import React, { useState, useEffect, useRef } from 'react';
import moment from 'moment';
import {
  Stack,
  Box,
  Grid,
  Divider,
  TableCell,
  TableRow,
  Tooltip
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import ReactToPrint from 'react-to-print';
import {
  isEmpty, isEqual, uniq, find, startCase
} from 'lodash';
import CryptoJS from 'crypto-js';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
// icons
import LocalPrintshopOutlinedIcon from '@mui/icons-material/LocalPrintshopOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import LocalPostOfficeOutlinedIcon from '@mui/icons-material/LocalPostOfficeOutlined';
import LoaderWrapper from '../../../../components/loader/index';
import Upload from '../../../../components/upload/index';
import Button from '../../../../components/button/index';
import Table from '../../../../components/ag-grid-table/index';
import Input from '../../../../components/inputs/input/index';
import Switch from '../../../../components/switch/index';
import SearchInput from '../../../../components/searchInput/index';
import DeleteModal from './modals/delete';
import Modal from '../../../../components/modal/index';
import HoverImage from '../../../../components/imageTooltip';
import BarcodeFile from '../../orders/component/print/barcodeFile';
import noData from '../../../../static/images/no-data.svg';
import Pdf from '../../../../static/images/pdf.svg';
import DownArrow from '../../../../static/images/arrow-up.svg';
import Radio from '../../../../components/radio';
import AddPayment from './drawers/addPayment';
import ItemDelete from '../../orders/component/modals/delete';
// images
import Product from '../../../../static/images/no-product-image.svg';
// styles
import UploadWrapper from '../../../../components/upload/style';
// constants
import {
  PO_STATUS,
  REGEX_FOR_NUMBERS,
  DISCOUNT_TYPE,
  EXTENSIONS_LIST,
  REGEX_FOR_DECIMAL_NUMBERS,
  fileDocumentHeader
} from '../../../../constants/index';
// images
import IconPdf from '../../../../static/images/icon-pdf.svg';
import IconCsv from '../../../../static/images/icon-csv.svg';
import IconXls from '../../../../static/images/icon-xls.svg';
import IconDoc from '../../../../static/images/icon-doc.svg';
import IconFile from '../../../../static/images/icon-file.svg';
import UploadIcon from '../../../../static/images/upload.svg';
// helpers
import {
  UploadDocumentOnS3,
  UploadedFileSize
} from '../../../../../utils/helpers';
// redux
import {
  AddPOSlip,
  AddPOSlipItem,
  ConfirmPOSlip,
  DeletePOById,
  SendPOEmail,
  GetPOSlipItemsBySlipId,
  GetPONumbers,
  GetPurchaseOrderById,
  GetPOSlipById,
  GetItemsOfPurchaseOrder,
  GetAllItemsOfPurchaseOrder,
  GetItemsOfSlip,
  SetPurchaseOrderState,
  GetPOAttachmentsByPOId,
  GetAggregatedDataOfNonConfirmPO,
  GetPOSlipNumbers,
  UpdatePurchaseOrder,
  UpdatePOQueueItem,
  SetPurchaseOrderNotifyState,
  SavePOAttachment,
  DownloadPurchaseOrderXlsxSheet,
  UpdatePOAttachmentById,
  UpdatePOSlip,
  UpdatePOFollowUp,
  UpdatePOWithoutNotification,
  SetPoQueueItemState
} from '../../../../redux/slices/purchasing';
import {
  GetS3PreSignedUrl,
  SetOtherNotifyState,
  SetOtherState
} from '../../../../redux/slices/other-slice';
import ItemsOfPO from './itemsOfReceivePo';

const ConfrimPo = (props) => {
  const dispatch = useDispatch();
  const tableRef = useRef();
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { user: { permissions: { editPurchasing } } } = useSelector((state) => state.auth);
  const {
    addedSlip,
    AddSlipLoading,
    poNumbers,
    purchaseOrder,
    purchaseOrderLoading,
    itemsOfPO,
    allItemsOfPO,
    totalItemsOfPO,
    itemsOfPOLoading,
    itemsOfNonConfirmPOPageLimit,
    itemsOfNonConfirmPOPageNumber,
    itemsOfSlipPageLimit,
    itemsOfSlipPageNumber,
    aggregatedDataOfNOnConfirmPO,
    poUpdated,
    poDeleted,
    itemAddedToNonConfirmPO,
    poAttachments = [],
    poAttachmentloading,
    poSlipNumbers,
    slipNumberLoading,
    poSlipItems,
    poSlip,
    slipUpdated,
    itemsOfSlip,
    addedSlipItem,
    totalItemsOfSlip,
    itemsOfSlipLoading,
    slipUpdateLoading,
    AddSlipItemLoading,
    poNumberLoading,
    getAggregatedDataOfNonConfirmPOLoading,
    confirmPOSlipLoading
  } = useSelector((state) => state.purchaseOrder);
  const {
    preSignedUrl,
    fileUploadKey,
    success: otherSuccess,
    loading: otherLoading
  } = useSelector((state) => state.other);
  const { poQueueItemUpdated } = useSelector(
    (state) => state.poQueueItem
  );
  const { user } = useSelector((state) => state.auth);
  const [selected, setSelected] = useState({});
  const [selectedSlip, setSelectedSlip] = useState({});
  const [addPayment, setAddPayment] = useState(false);
  const [addSlip, setAddSlip] = useState(false);
  const [editInput, setEditInput] = useState(false);
  const [edit, setEdit] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [localPurchaseOrder, setLocalPurchaseOrder] = useState('');
  const [localPOSlip, setLocalPOSlip] = useState('');
  const [supplierDetails, setSupplierDetails] = useState({});
  const [deleteProduct, setDeleteProduct] = useState(false);
  const [localPONumbers, setLocalPONumbers] = useState([]);
  const [localSlipNumbers, setLocalSlipNumbers] = useState([]);
  const [isFixedRatio, setIsFixedRatio] = useState(false);
  const [shipping, setShipping] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [localItemsOfPO, setLocalItemsOfPO] = useState([]);
  const [attachmentLoading, setAttachmentLoading] = useState(false);
  const [attachment, setAttachment] = useState();
  const [attachmentResponse, setAttachmentResponse] = useState(false);
  const [attachmentName, setAttachmentName] = useState('');
  const [poDocsData, setPODocsData] = useState([]);
  const [deleteAttachmentId, setDeleteAttachmentId] = useState([]);
  const [deleteAttachment, setDeleteAttachment] = useState(false);
  const [isPOPrinted, setIsPOPrinted] = useState(false);
  const [isPOReceived, setIsPOReceived] = useState(false);
  const [isPOConfirmed, setIsPOConfirmed] = useState(false);
  const [followUp, setFollowUp] = useState(false);
  const [upc, setUpc] = useState('');
  const [receivedDate, setReceivedDate] = useState('');
  const [isSlipSelected, setIsSlipSelected] = useState(false);
  const [aggregatdData, setAggregatedData] = useState({
    count: 0,
    quantity: 0,
    unitCost: 0,
    total: 0,
    backOrderQuantity: 0,
    quantityCancelled: 0
  });
  const [addSlipOfPO, setAddSlipOfPO] = useState({
    slipNo: ''
  });
  const [addSlipHelperText, setAddSlipHelperText] = useState({
    slipNo: ''
  });
  const [updateSlipOfPO, setUpdateSlipOfPO] = useState({
    memo: ''
  });
  const [updateSlipHelperText, setUpdateSlipHelperText] = useState({
    memo: ''
  });
  const [withUpc, setWithUpc] = useState(false);
  const [localItemsOfSlip, setLocalItemsOfSlip] = useState([]);
  const [isPrinted, setIsPrinted] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(false);

  function createAttachmentData(
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

  function createData(
    product,
    partNo,
    supplier,
    cost,
    price,
    total,
    stock,
    action
  ) {
    return {
      product,
      partNo,
      supplier,
      cost,
      price,
      total,
      stock,
      action
    };
  }
  const data = [];
  for (let i = 0; i <= 10; i += 1) {
    data.push(
      createData(
        <Stack direction="row" spacing={1}>
          <HoverImage image={Product}>
            <img width={40} height={40} src={Product} alt="" />
          </HoverImage>
          <Box>
            <Box
              component="span"
              whiteSpace="normal"
              className="product-name-clamp"
            >
              Rapido Boutique Collection Flipper Open Heel Adjustable Fin -
              LILAC S/M - Lialac No.349
            </Box>
            <Stack spacing={1} direction="row" fontSize="10px">
              <Box component="span" color="#979797">
                UPC:
                <Box component="span" color="#5A5F7D" ml={0.3}>
                  194773048809
                </Box>
              </Box>
              <Box component="span" color="#979797">
                Stock Number:
                <Box component="span" color="#5A5F7D" ml={0.3}>
                  RQFA68-PR-S/M
                </Box>
              </Box>
            </Stack>
          </Box>
        </Stack>,
        'FA68-ATL-FA683492',
        '500 ',
        '0',
        '0',
        '20',
        <Input width="87px" value="8" marginBottom="0px" />,
        <Box display="flex" gap={2}>
          <Box
            className={`icon-${editInput ? 'Save color-primary' : 'edit'
            } pointer`}
            onClick={() => setEditInput(!editInput)}
          />
          <Box className="icon-print pointer " />
        </Box>
      )
    );
  }

  function fileUploadData(
    fileName,
    size,
    date,
    action
  ) {
    return {
      fileName,
      size,
      date,
      action
    };
  }
  const dataFile = [];
  for (let i = 0; i <= 3; i += 1) {
    data.push(
      fileUploadData(
        <Stack direction="row" spacing={1} alignItems="center">
          <img src={Pdf} alt="no-file" />
          <Tooltip
            arrow
            title="FileName.PDF"
          >
            <span className="filename-ellipses">
              FileName.PDF
            </span>
          </Tooltip>
        </Stack>,
        '256 MB',
        'Mon Aug 29 2022 15:58',
        <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
          <img
            src={DownArrow}
            width="16"
            alt="no-arroow"
            className="pointer"
          />
          <Box
            component="span"
            className="icon-trash pointer"
            onClick={() => setDeleteAttachment(true)}
          />
        </Stack>
      )
    );
  }

  const getPONumbers = () => {
    dispatch(
      GetPONumbers({
        poStatus: PO_STATUS.confirm
      })
    );
  };

  const getPurchaseOrderById = ({ poId }) => {
    dispatch(GetPurchaseOrderById({ poId }));
  };

  const getPOSlipById = ({ slipId }) => {
    if (!isEmpty(slipId)) {
      dispatch(GetPOSlipById({ slipId }));
    }
  };

  const getPOSlipItemsBySlipId = ({ slipId }) => {
    dispatch(GetPOSlipItemsBySlipId({ slipId }));
  };

  const getAggregatedDataOfNonConfirmPO = ({ poId }) => {
    dispatch(GetAggregatedDataOfNonConfirmPO({ poId, poStatus: PO_STATUS.confirm }));
  };

  const getItemsOfPurchaseOrder = ({ poStatus, purchaseOrderId }) => {
    const skip = (itemsOfNonConfirmPOPageNumber - 1) * itemsOfNonConfirmPOPageLimit;
    const limit = itemsOfNonConfirmPOPageLimit;
    dispatch(
      GetItemsOfPurchaseOrder({
        skip,
        limit,
        poStatus,
        purchaseOrderId
      })
    );
  };

  const getAllItemsOfPurchaseOrder = ({ poStatus, purchaseOrderId }) => {
    dispatch(
      GetAllItemsOfPurchaseOrder({
        poStatus,
        purchaseOrderId
      })
    );
  };

  const getItemsOfSlip = ({ poStatus, purchaseOrderId, productIds }) => {
    const skip = (itemsOfSlipPageNumber - 1) * itemsOfSlipPageLimit;
    const limit = itemsOfSlipPageLimit;
    dispatch(
      GetItemsOfSlip({
        skip,
        limit,
        poStatus,
        purchaseOrderId,
        productIds
      })
    );
  };

  const handleUploadAttachmentOnS3 = async () => {
    const response = await UploadDocumentOnS3({ preSignedUrl, file: attachment });
    if (response) {
      setAttachmentResponse(true);
    } else {
      setAttachmentLoading(false);
      dispatch(SetOtherNotifyState({ message: 'File Uploading failed on S3', type: 'error' }));
    }
  };

  const handleChangeAttachment = async (e) => {
    const { files } = e.target;
    if (files?.length) {
      const file = files[0];
      const extension = file.name.split('.').pop();
      if (!EXTENSIONS_LIST.includes(extension)) {
        dispatch(SetOtherNotifyState({
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
        uploadBucket: 'poDocs',
        id: purchaseOrder?._id
      }));
    }
    e.target.value = null;
  };

  const downloadAttachment = async (key) => {
    const { userId } = user;
    const userIdJson = CryptoJS.AES.encrypt(String(userId), process.env.HASH).toString();
    const userIdData = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(userIdJson));
    window.open(`${process.env.API_URL}/non-secure-route/download-file?uploadBucket=poDocs&key=${key}&userId=${userIdData}`);
  };

  const handleDeletePOAttachment = () => {
    if (!isEmpty(deleteAttachmentId)) {
      dispatch(
        UpdatePOAttachmentById({
          paramsToUpdate: { archived: true },
          poAttachmentId: String(deleteAttachmentId)
        })
      );
    }
  };

  const getPOAttachments = (id) => {
    dispatch(GetPOAttachmentsByPOId({ poId: id }));
  };

  const getPOSlipNumbers = (id) => {
    dispatch(GetPOSlipNumbers({ poId: id }));
  };

  const handleFollowUpChange = (e) => {
    const { name: key } = e.target;
    if (key === 'followUp') {
      const updateFollowUp = localPurchaseOrder?.[key]
        ? localPurchaseOrder?.[key] === false : true;

      setLocalPurchaseOrder({
        ...localPurchaseOrder,
        [key]: updateFollowUp
      });
      dispatch(
        UpdatePOFollowUp({
          purchaseOrderId: localPurchaseOrder?._id,
          updateParams: { followUp: updateFollowUp }
        })
      );
    }
  };

  const handleDeletePO = () => {
    if (!isEmpty(selected)) {
      dispatch(
        DeletePOById({
          poId: selected?._id
        })
      );
    }
  };

  const handlePODetailsChange = (e) => {
    const { value: val, name: key } = e.target;
    setLocalPurchaseOrder({
      ...localPurchaseOrder,
      [key]: val
    });
  };

  const handlePODetailSave = ({ editAction }) => {
    if (!isEmpty(localPurchaseOrder)) {
      const updatedParams = {
        shippingPrice: localPurchaseOrder?.shippingPrice
          ? Number(localPurchaseOrder.shippingPrice)?.toFixed(2) : 0,
        discount: localPurchaseOrder?.discount
          ? Number(localPurchaseOrder.discount)?.toFixed(2) : 0,
        discountType: localPurchaseOrder?.discountType
      };
      const prevParams = {
        shippingPrice: purchaseOrder?.shippingPrice
          ? Number(purchaseOrder?.shippingPrice).toFixed(2) : 0,
        discount: purchaseOrder?.discount
          ? Number(purchaseOrder?.discount).toFixed(2) : 0,
        discountType: purchaseOrder?.discountType
      };
      if (isEqual(updatedParams, prevParams)) {
        setEdit(false);
        setEditInput(false);
        dispatch(
          SetPurchaseOrderNotifyState({
            message: 'Nothing updated !',
            type: 'info'
          })
        );
      } else {
        updatedParams.poTotalCost = aggregatdData?.quantity
          ? isFixedRatio
            ? `${((Number(aggregatdData?.total || 0)
              + Number(localPurchaseOrder?.shippingPrice || 0))
              - (Number(localPurchaseOrder?.discount || 0)))?.toFixed(2)
            }`
            : `${(((Number(aggregatdData?.total || 0)))
              + (Number((aggregatdData?.total || 0)
                * Number(localPurchaseOrder?.shippingPrice || 0)) / 100)
              - (Number(aggregatdData?.total || 0))
              * (Number(localPurchaseOrder?.discount || 0) / 100))?.toFixed(2)
            }` : 0;
        dispatch(
          UpdatePurchaseOrder({
            purchaseOrderId: localPurchaseOrder?._id,
            updateParams: updatedParams,
            editAction
          })
        );
      }
    }
  };

  const handleDownloadPOXlsxSheet = () => {
    const { userId } = user;
    const userIdJson = CryptoJS.AES.encrypt(
      String(userId),
      process.env.HASH
    ).toString();
    const userIdData = CryptoJS.enc.Base64.stringify(
      CryptoJS.enc.Utf8.parse(userIdJson)
    );
    dispatch(
      DownloadPurchaseOrderXlsxSheet({
        userId: userIdData,
        pOId: purchaseOrder?._id,
        withUPC: withUpc
      })
    );
  };

  const handleSendEmail = () => {
    dispatch(SendPOEmail({ pOId: purchaseOrder?._id }));
  };

  const handleAddSlipChange = (e) => {
    const { value, name } = e.target;
    setAddSlipOfPO((prevSlipObj) => ({
      ...prevSlipObj,
      [name]: value
    }));

    const errors = {};

    if (isEmpty(value) && name === 'slipNo') errors[name] = `${startCase(name)} is required!`;
    else if (!isEmpty(value) && name === 'slipNo') {
      errors[name] = '';
    }
    setAddSlipHelperText((prevHelperText) => ({
      ...prevHelperText,
      ...errors
    }));
  };

  const handlePOSlipSave = () => {
    if (addSlipOfPO?.slipNo === '') {
      setAddSlipHelperText({ slipNo: 'Slip No is required!' });
    } else if (isEmpty(addSlipHelperText?.slipNo && addSlipOfPO?.slipNo !== '')) {
      dispatch(
        AddPOSlip({
          addSlip: {
            slipNo: addSlipOfPO?.slipNo,
            poId: purchaseOrder?._id
          }
        })
      );
    }
  };

  const handleUpdateSlipChange = (e) => {
    const { value, name } = e.target;
    setUpdateSlipOfPO((prevSlipObj) => ({
      ...prevSlipObj,
      [name]: value
    }));

    setLocalPOSlip({
      ...localPOSlip,
      memo: value
    });

    const errors = {};

    if (isEmpty(value) && name === 'memo') errors[name] = `${startCase(name)} is required!`;
    else if (!isEmpty(value) && name === 'memo') {
      errors[name] = '';
    }
    setUpdateSlipHelperText((prevHelperText) => ({
      ...prevHelperText,
      ...errors
    }));
  };

  const handlePOSlipUpdate = () => {
    if (localPOSlip?.memo === '') {
      setUpdateSlipHelperText({ memo: 'Memo is required!' });
    } else if (isEmpty(updateSlipHelperText?.memo && updateSlipOfPO?.memo !== '')) {
      if (isEqual(localPOSlip?.memo, poSlip?.memo)) {
        setEdit(false);
        dispatch(
          SetPurchaseOrderNotifyState({
            message: 'Nothing updated !',
            type: 'info'
          })
        );
      } else {
        dispatch(
          UpdatePOSlip({
            slipId: localPOSlip?._id,
            updateParams: { memo: localPOSlip?.memo || '' }
          })
        );
      }
    }
  };

  const handleAddSlipItem = () => {
    if (!isEmpty(upc) && isEmpty(selectedSlip)) {
      dispatch(
        SetPurchaseOrderNotifyState({
          message: 'Please select slip Number!',
          type: 'info'
        })
      );
    }
    if (!isEmpty(upc) && !isEmpty(selectedSlip)) {
      const findProduct = allItemsOfPO?.find((item) => item?.product?.primaryUpc === upc);
      if (findProduct) {
        dispatch(
          SetPurchaseOrderState({
            field: 'itemsOfSlipLoading',
            value: true
          })
        );
        dispatch(
          AddPOSlipItem({
            addSlipItem: {
              slipId: selectedSlip?._id,
              productId: findProduct?.product?._id,
              receivedQuantity: 1
            }
          })
        );

        dispatch(UpdatePOQueueItem({
          poQueueItemId: findProduct?.poQueueItem?._id,
          updateParams: {
            receivedQuantity: 1
          },
          poId: params.poId
        }));
      } else {
        dispatch(
          SetPurchaseOrderNotifyState({
            message: 'Product not found in this PO!',
            type: 'info'
          })
        );
      }
    }
  };

  useEffect(() => {
    if (poNumbers?.length) {
      setLocalPONumbers(poNumbers);
      const { poId: selectedPoId } = params;
      if (!isEmpty(selectedPoId)) {
        const findPO = poNumbers?.find((item) => item?.poId === selectedPoId);
        if (!isEmpty(findPO)) {
          setSelected(findPO);
        }
      }
    } else {
      setSelected({});
      setLocalPONumbers([]);
      setAggregatedData({
        count: 0,
        quantity: 0,
        unitCost: 0,
        total: 0,
        backOrderQuantity: 0,
        quantityCancelled: 0
      });
      setSupplierDetails({});
      setLocalPurchaseOrder('');
      setLocalItemsOfPO([]);
    }
  }, [poNumbers]);

  useEffect(() => {
    if (!otherSuccess && !otherLoading) {
      setAttachmentLoading(false);
    }
  }, [otherSuccess, otherLoading]);

  useEffect(() => {
    if (!isEmpty(searchVal)) {
      const allPoNumbers = localPONumbers?.map((item) => item?.poId);
      const partialSearchForPO = allPoNumbers?.filter((obj) => obj?.includes(searchVal));
      if (partialSearchForPO?.length) {
        const findPO = find(localPONumbers, { poId: partialSearchForPO[0] });
        setSelected(findPO);
      }
    }
  }, [searchVal]);

  useEffect(() => {
    setUpc('');
    setSelectedSlip({});
    if (!isEmpty(selected)) {
      const filterElement = localPONumbers?.filter(
        (item) => item?._id !== selected?._id
      );
      const findElement = localPONumbers?.find((item) => item?._id === selected?._id);
      const temp = [findElement];
      const concatElement = temp.concat(filterElement);
      setLocalPONumbers(concatElement);
    }
  }, [selected]);

  useEffect(() => {
    setEdit(false);
    setEditInput(false);
    setDeleteProduct(false);
    if (!isEmpty(selected) || poUpdated) {
      getAggregatedDataOfNonConfirmPO({ poId: selected?._id });
      getPurchaseOrderById({ poId: selected?._id });
      dispatch(SetPurchaseOrderState({
        field: 'poUpdated',
        value: false
      }));
    }
  }, [poUpdated, selected]);

  useEffect(() => {
    if (!isEmpty(purchaseOrder) && !isEmpty(purchaseOrder?.supplierId)) {
      setSupplierDetails(purchaseOrder?.supplierId);
    } else {
      setSupplierDetails('');
    }
    if (!isEmpty(purchaseOrder)) {
      setIsPOPrinted(false);
      setIsPOReceived(false);
      setIsPOConfirmed(false);
      setLocalPurchaseOrder(purchaseOrder);
      setShipping(purchaseOrder?.shippingPrice);
      setDiscount(purchaseOrder?.discount);
      setFollowUp(purchaseOrder?.followUp || false);
      if (purchaseOrder?.discountType) {
        if (purchaseOrder?.discountType === DISCOUNT_TYPE.percentage) {
          setIsFixedRatio(false);
        } else {
          setIsFixedRatio(true);
        }
      } else {
        setIsFixedRatio(true);
      }
      if (purchaseOrder?.poStatus === PO_STATUS.printed) {
        setIsPOConfirmed(true);
        setIsPOPrinted(true);
      } else if (purchaseOrder?.poStatus === PO_STATUS.confirm) {
        setIsPOConfirmed(true);
      } else if (purchaseOrder?.poStatus === PO_STATUS.received) {
        setIsPOConfirmed(true);
        setIsPOReceived(true);
        setIsPOPrinted(true);
      } else if (purchaseOrder?.poStatus === PO_STATUS.closed) {
        setIsPOPrinted(true);
        setIsPOReceived(true);
        setIsPOConfirmed(true);
      }
    } else {
      setLocalPurchaseOrder('');
      setShipping(0);
      setDiscount(0);
      setIsPOPrinted(false);
      setIsPOReceived(false);
      setIsPOConfirmed(false);
    }
  }, [purchaseOrder]);

  useEffect(() => {
    setLocalPurchaseOrder({
      ...localPurchaseOrder,
      discountType: isFixedRatio
        ? DISCOUNT_TYPE.fixed
        : DISCOUNT_TYPE.percentage
    });
  }, [isFixedRatio]);

  useEffect(() => {
    setEdit(false);
    setEditInput(false);
    if (!isEmpty(selected)) {
      getItemsOfPurchaseOrder({
        purchaseOrderId: selected?._id,
        poStatus: PO_STATUS.confirm
      });
      getAllItemsOfPurchaseOrder({
        purchaseOrderId: selected?._id,
        poStatus: PO_STATUS.confirm
      });
    }
  }, [
    selected,
    poQueueItemUpdated,
    itemAddedToNonConfirmPO
  ]);

  useEffect(() => {
    setEdit(false);
    setEditInput(false);
    if (!isEmpty(selected)) {
      getItemsOfPurchaseOrder({
        purchaseOrderId: selected?._id,
        poStatus: PO_STATUS.confirm
      });
    }
  }, [itemsOfNonConfirmPOPageLimit, itemsOfNonConfirmPOPageNumber]);

  useEffect(() => {
    if (!isEmpty(selected)) {
      if (
        totalItemsOfPO < itemsOfNonConfirmPOPageLimit * itemsOfNonConfirmPOPageNumber
      ) {
        if (itemsOfNonConfirmPOPageNumber > 1) {
          dispatch(
            SetPurchaseOrderState({
              field: 'itemsOfNonConfirmPOPageNumber',
              value: itemsOfNonConfirmPOPageNumber - 1
            })
          );
        }
      }
      getItemsOfPurchaseOrder({
        purchaseOrderId: selected?._id,
        poStatus: PO_STATUS.confirm
      });
      getAllItemsOfPurchaseOrder({
        purchaseOrderId: selected?._id,
        poStatus: PO_STATUS.confirm
      });
    }
  }, [totalItemsOfPO]);

  useEffect(() => {
    if (itemsOfPO?.length) {
      const addIsEdit = itemsOfPO?.map((item) => ({ ...item, isEdit: false }));
      setLocalItemsOfPO(addIsEdit);
    } else {
      setLocalItemsOfPO([]);
    }
  }, [itemsOfPO]);

  useEffect(() => {
    if (!isEmpty(selectedSlip) && String(selectedSlip._id) === String(poSlip._id)) {
      setSelectedSlip({
        ...selectedSlip,
        slipStatus: poSlip.slipStatus
      });
    }
  }, [poSlip]);

  useEffect(() => {
    if (attachmentResponse && !addPayment) {
      setAttachmentLoading(false);
      const sizeOfFile = UploadedFileSize(attachment.size);
      setAttachmentName('');
      dispatch(
        SavePOAttachment({
          poId: purchaseOrder?._id,
          key: fileUploadKey,
          archived: false,
          size: sizeOfFile,
          uploadedDate: new Date()
        })
      );
    }
  }, [attachmentResponse]);

  useEffect(() => {
    if (preSignedUrl !== '' && !addPayment) {
      handleUploadAttachmentOnS3();
    }
  }, [preSignedUrl]);

  useEffect(() => {
    if (!attachmentLoading && !addPayment) {
      dispatch(SetOtherState({ field: 'preSignedUrl', value: '' }));
      setAttachmentResponse(false);
    }
  }, [attachmentLoading]);

  useEffect(() => {
    if (poAttachments.length) {
      const attachmentData = poAttachments?.map((row) => {
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
        return createAttachmentData(
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
            <span className="filename-ellipses">{row.key.split('/')[1]}</span>
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
              // sx={{
              //   opacity: !(user?.permissions?.editSuppliers) ? 0.5 : 1,
              //   pointerEvents: !(user?.permissions?.editSuppliers) ? 'none' : 'auto'
              // }}
              component="span"
              className="icon-trash pointer"
              onClick={() => {
                setDeleteAttachmentId(row._id);
                setDeleteAttachment(true);
              }}
            />
          </Stack>
        );
      });
      setPODocsData(attachmentData);
    } else setPODocsData([]);
  }, [poAttachments]);

  useEffect(() => {
    if (!isEmpty(purchaseOrder?._id)) {
      getPOAttachments(purchaseOrder?._id);
      getPOSlipNumbers(purchaseOrder?._id);
    }
  }, [purchaseOrder?._id]);

  useEffect(() => {
    if (!isEmpty(aggregatedDataOfNOnConfirmPO)) {
      setAggregatedData({
        ...aggregatdData,
        count: aggregatedDataOfNOnConfirmPO?.count,
        quantity: aggregatedDataOfNOnConfirmPO?.quantity,
        unitCost: aggregatedDataOfNOnConfirmPO?.unitCost,
        total: aggregatedDataOfNOnConfirmPO?.total,
        backOrderQuantity: aggregatedDataOfNOnConfirmPO?.backOrderQuantity,
        quantityCancelled: aggregatedDataOfNOnConfirmPO?.quantityCancelled
      });
    } else {
      setAggregatedData({
        ...aggregatdData,
        count: 0,
        quantity: 0,
        unitCost: 0,
        total: 0,
        backOrderQuantity: 0,
        quantityCancelled: 0
      });
    }
  }, [aggregatedDataOfNOnConfirmPO]);

  useEffect(() => {
    setLocalPOSlip('');
    if (poSlipNumbers?.length) {
      setLocalSlipNumbers(poSlipNumbers);
    } else {
      setSelectedSlip({});
      setLocalSlipNumbers([]);
    }
  }, [poSlipNumbers]);

  useEffect(() => {
    if (!isEmpty(selectedSlip)) {
      dispatch(
        SetPurchaseOrderState({
          field: 'itemsOfNonConfirmPOPageNumber',
          value: 1
        })
      );
      const filterElements = localSlipNumbers?.filter(
        (item) => item?._id !== selectedSlip?._id
      );
      const findElement = localSlipNumbers?.find((item) => item?._id === selectedSlip?._id);
      const temp = [findElement];
      const allElements = temp.concat(filterElements);
      setLocalSlipNumbers(allElements);
    }
  }, [selectedSlip]);

  useEffect(() => {
    if ((!isEmpty(selectedSlip)
      && (poQueueItemUpdated))
      || (!isEmpty(selectedSlip)
        && (isFirstLoad)) || (!isEmpty(selectedSlip) && isSlipSelected)) {
      getPOSlipById({ slipId: selectedSlip?._id });
      getPOSlipItemsBySlipId({ slipId: selectedSlip?._id });
      setIsFirstLoad(false);
    }
    dispatch(
      SetPoQueueItemState({
        field: 'poQueueItemUpdated',
        value: false
      })
    );
    setIsSlipSelected(false);
  }, [
    poQueueItemUpdated,
    selectedSlip,
    addedSlipItem]);

  useEffect(() => {
    setLocalPOSlip('');
    setAddSlipHelperText({ slipNo: '' });
    setAddSlip(false);
    setAddSlipOfPO({ slipNo: '' });
  }, [addedSlip]);

  useEffect(() => {
    getPOSlipById({ slipId: selectedSlip?._id });
    setUpdateSlipHelperText({ memo: '' });
    setEdit(false);
    setUpdateSlipOfPO({ memo: '' });
  }, [slipUpdated]);

  useEffect(() => {
    if (!isEmpty(poSlip)) {
      setLocalPOSlip(poSlip);
    }
  }, [poSlip]);

  useEffect(() => {
    if (poSlipItems?.length) {
      const productIds = poSlipItems?.map((item) => item?.productId);
      const uniqueProductIds = uniq(productIds);
      getItemsOfSlip({
        purchaseOrderId: selected?._id,
        poStatus: PO_STATUS.confirm,
        productIds: uniqueProductIds
      });
      if (!isEmpty(selectedSlip)) {
        const findSlipItem = poSlipItems?.find((obj) => obj?.slipId === selectedSlip?._id);
        if (!isEmpty(findSlipItem)) {
          setReceivedDate(findSlipItem?.createdAt);
        }
      }
    } else {
      dispatch(
        SetPurchaseOrderState({
          field: 'itemsOfSlip',
          value: []
        })
      );
      dispatch(
        SetPurchaseOrderState({
          field: 'totalItemsOfSlip',
          value: 0
        })
      );
      setReceivedDate('');
    }
  }, [poSlipItems]);

  useEffect(() => {
    if (itemsOfSlip?.length) {
      setLocalItemsOfSlip(itemsOfSlip);
    } else {
      setLocalItemsOfSlip([]);
    }
  }, [itemsOfSlip]);

  useEffect(() => {
    if (poDeleted) {
      if (poNumbers?.length >= 1) {
        setSelected(poNumbers[1]);
      } if (poNumbers?.length === 1 && poDeleted) {
        navigate('/purchasing/all-po');
      }
      setDeleteProduct(false);
      dispatch(SetPurchaseOrderState({
        field: 'poDeleted',
        value: false
      }));
    }
    getPONumbers();
  }, [poDeleted]);

  useEffect(() => {
    if (isPrinted) {
      if (localPurchaseOrder?.poStatus !== PO_STATUS.received
        && localPurchaseOrder?.poStatus !== PO_STATUS.printed) {
        dispatch(
          UpdatePOWithoutNotification({
            purchaseOrderId: localPurchaseOrder?._id,
            updateParams: { poStatus: PO_STATUS.printed }
          })
        );
      } else if (localPurchaseOrder?.poStatus === PO_STATUS.received) {
        dispatch(
          UpdatePOWithoutNotification({
            purchaseOrderId: localPurchaseOrder?._id,
            updateParams: { poStatus: 'updatePrintDate' }
          })
        );
      }
      setIsPrinted(false);
    }
  }, [isPrinted]);

  useEffect(() => {
    if (location.state === 'non-confirm') {
      getPONumbers();
    }
    setIsFirstLoad(true);
    dispatch(SetPurchaseOrderState({ field: 'selectedSupplierPO', value: {} }));
    return (() => {
      dispatch(
        SetPurchaseOrderState({
          field: 'purchaseOrder',
          value: {}
        })
      );
      dispatch(
        SetPurchaseOrderState({
          field: 'aggregatedDataOfNOnConfirmPO',
          value: {}
        })
      );
      dispatch(
        SetPurchaseOrderState({
          field: 'poSlipNumbers',
          value: []
        })
      );
      dispatch(
        SetPurchaseOrderState({
          field: 'itemsOfSlip',
          value: []
        })
      );
      dispatch(
        SetPurchaseOrderState({
          field: 'itemsOfPO',
          value: []
        })
      );
      dispatch(
        SetPurchaseOrderState({
          field: 'poAttachments',
          value: []
        })
      );
      dispatch(
        SetPurchaseOrderState({
          field: 'poNumbers',
          value: []
        })
      );
    });
  }, []);

  return (
    <>
      <>
        {purchaseOrderLoading ? <LoaderWrapper /> : null}
        <Stack
          justifyContent="space-between"
          direction="row"
          pt={3}
          pb={3}
          marginTop="-24px"
          sx={{
            position: 'sticky',
            top: '78.5px',
            zIndex: '1',
            backgroundColor: '#ffffff'
          }}
        >
          <Stack alignItems="center" direction="row" spacing={3} mt={-0.5}>
            <Box
              component="span"
              className="icon-left pointer"
              onClick={() => {
                if (location.state && location.state === 'non-confirm') {
                  navigate('/purchasing/all-po');
                } else {
                  navigate(-1);
                }
              }}
            />
            <h2 className="m-0 pl-2">Receive PO</h2>
          </Stack>
          <Box display="flex" gap={16 / 8} mt={-0.125}>
            <SearchInput
              autoComplete="off"
              onChange={(e) => {
                setSearchVal(e.target.value);
              }}
              value={searchVal}
              width="180px"
              placeholder="Search by PO #"
            />
            <Button
              text="Add Payment"
              padding="4px 15px 4px 15px"
              letterSpacing="0px"
              disabled={
                edit
                || !editPurchasing
                || editInput
                || localItemsOfPO?.map((item) => item?.isEdit)?.includes(true)
                || !localPONumbers?.length
                || !localItemsOfPO?.length
              }
              startIcon={(
                <AddCircleOutlineOutlinedIcon
                  sx={{
                    color:
                      edit
                        || !editPurchasing
                        || editInput
                        || localItemsOfPO
                          ?.map((item) => item?.isEdit)
                          ?.includes(true)
                        || !localPONumbers?.length
                        || !localItemsOfPO?.length
                        ? ''
                        : '#3C76FF'
                  }}
                />
              )}
              onClick={() => {
                setAddPayment(true);
              }}
            />
            <Button
              disabled={
                edit
                || !editPurchasing
                || editInput
                || localItemsOfPO?.map((item) => item?.isEdit)?.includes(true)
                || !localPONumbers?.length
                || !localItemsOfPO?.length
              }
              startIcon={<span className="icon-download" />}
              className="icon-button"
              onClick={handleDownloadPOXlsxSheet}
            />
            <ReactToPrint
              trigger={() => (
                <Button
                  disabled={!selected?.poId || edit || editInput || !editPurchasing}
                  className="icon-button"
                  startIcon={<LocalPrintshopOutlinedIcon />}
                />
              )}
              content={() => tableRef.current}
              onAfterPrint={() => {
                setIsPrinted(true);
              }}
            />
            <BarcodeFile
              ref={tableRef}
              value={selected?.poId}
            />

            <Button
              disabled={
                edit
                || !editPurchasing
                || editInput
                || localItemsOfPO?.map((item) => item?.isEdit)?.includes(true)
                || !localPONumbers?.length
                || !localItemsOfPO?.length
              }
              className="icon-button"
              startIcon={<LocalPostOfficeOutlinedIcon />}
              onClick={handleSendEmail}
            />
            <Button
              disabled={
                editInput
                || !editPurchasing
                || !localPONumbers?.length
                || allItemsOfPO
                  ?.reduce((accumulator, object) => accumulator
                    + Number(object?.poQueueItem?.receivedQuantity || 0), 0)
              }
              className="icon-button danger-button"
              startIcon={<Box component="span" className="icon-trash" />}
              onClick={() => setDeleteProduct(true)}

            />
          </Box>
        </Stack>

        <Grid container columnSpacing={3}>
          <Grid item md={1}>
            <Box sx={{ maxHeight: '790px', overflow: 'auto' }} position="relative">

              {poNumberLoading ? <LoaderWrapper /> : null}
              {localPONumbers?.map((item) => (
                <Box
                  key={item?._id}
                  paddingLeft="13px"
                  paddingRight="13px"
                >
                  <Box display="flex" gap={53 / 8}>
                    <Box>
                      <Box compoent="span" fontSize="11px" color="#979797">
                        PO No.
                      </Box>
                      <Box
                        className="pointer"
                        compoent="span"
                        fontSize="13px"
                        pt={0.625}
                        display="block"
                        color={
                          selected?.poId === item?.poId ? '#3C76FF' : '#5A5F7D'
                        }
                        component="span"
                        onClick={() => setSelected(item)}
                      >
                        {item?.poId}
                      </Box>
                    </Box>
                  </Box>
                  <Divider
                    sx={{
                      marginTop: '8px',
                      marginRight: '24px',
                      marginBottom: '16px'
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Grid>

          <Grid item md={11} borderLeft="1px solid #D9D9D9">
            <Grid container columns={11} columnSpacing={3}>
              <Grid item md={8}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mt="2px"
                  mb={2.25}
                >
                  <Box component="h3" className="m-0">
                    <Box component="span" mr={0.625}>
                      PO Details:
                    </Box>
                    {selected?.poId || '--'}
                  </Box>
                  <Box display="flex" gap={17 / 8} mt={-0.125}>
                    <Box display="flex">
                      {isPOConfirmed
                        ? (
                          <Box
                            display="flex"
                            alignItems="center"
                            className="step-active"
                          >
                            <Box display="flex" alignItems="center">
                              <Box
                                component="span"
                                mr={10 / 8}
                                className="icon-checkCircle"
                                fontSize={16}
                              >
                                <span className="path1" />
                                <span className="path2" />
                              </Box>
                              <Box
                                component="span"
                                fontWeight="600"
                                color="#272B41"
                              >
                                Confirmed
                              </Box>
                            </Box>
                            <Divider
                              sx={{
                                width: '24px',
                                marginRight: '16px',
                                marginLeft: '16px'
                              }}
                            />
                          </Box>
                        ) : (
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
                                mr={-1}
                              >
                                Confirmed
                              </Box>
                            </Box>
                            <Divider
                              sx={{
                                width: '24px',
                                marginRight: '16px',
                                marginLeft: '16px'
                              }}
                            />
                          </Box>
                        )}
                      {isPOPrinted ? (
                        <Box
                          display="flex"
                          alignItems="center"
                          className="step-active"
                        >
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
                            <Box
                              component="span"
                              fontWeight="600"
                              color="#272B41"
                            >
                              Printed
                            </Box>
                          </Box>
                          <Divider
                            sx={{
                              width: '24px',
                              marginRight: '16px',
                              marginLeft: '16px'
                            }}
                          />
                        </Box>
                      ) : (
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
                              mr={-1}
                            >
                              Printed
                            </Box>
                          </Box>
                          <Divider
                            sx={{
                              width: '24px',
                              marginRight: '16px',
                              marginLeft: '16px'
                            }}
                          />
                        </Box>
                      )}
                      {isPOReceived ? (
                        <Box
                          display="flex"
                          alignItems="center"
                          className="step-active"
                        >
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
                            <Box
                              component="span"
                              fontWeight="600"
                              color="#272B41"
                            >
                              Received
                            </Box>
                          </Box>
                        </Box>
                      ) : (
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
                              mr={-1}
                            >
                              Received
                            </Box>
                          </Box>
                        </Box>
                      )}
                    </Box>
                    <Box mt={0.25}>
                      <Switch
                        name="followUp"
                        width="89px"
                        offText="Follow Up"
                        rightSpacing="28px"
                        leftSpacing="29px"
                        padding="4px 0"
                        onText="Follow Up"
                        translate="translateX(62px)"
                        checked={followUp}
                        onChange={(e) => {
                          if (editPurchasing) {
                            setFollowUp(!followUp);
                            handleFollowUpChange(e);
                          }
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
                <Grid container columns={8} columnSpacing={3}>
                  <Grid item sm={2}>
                    <Input
                      autoComplete="off"
                      disabled
                      label="PO Order Date & Time"
                      width="100%"
                      marginBottom="18px"
                      value={
                        localPurchaseOrder?.createdAt
                          ? moment(
                            new Date(localPurchaseOrder?.createdAt)
                          ).format('DD MMM YYYY • hh:mm')
                          : ''
                      }
                    />
                  </Grid>
                  <Grid item sm={2}>
                    <Input
                      autoComplete="off"
                      name="expectedDeliveryDate"
                      label="Expected Date"
                      type="date"
                      width="100%"
                      minValue={new Date().toISOString().split('T')[0]}
                      marginBottom="18px"
                      disabled
                      value={
                        moment(new Date(localPurchaseOrder?.expectedDeliveryDate))
                          ?.toISOString()
                          ?.slice(0, 10) || '--'
                      }
                    />
                  </Grid>
                </Grid>
                <Grid container columns={8} columnSpacing={3}>
                  <Grid item sm={4}>
                    <Input
                      autoComplete="off"
                      name="wareHouseInstrutions"
                      label="Warehouse instruction"
                      width="100%"
                      marginBottom="0"
                      disabled
                      value={localPurchaseOrder?.wareHouseInstrutions || ''}
                    />
                  </Grid>
                  <Grid item sm={4}>
                    <Input
                      autoComplete="off"
                      name="supplierNote"
                      label="Note to supplier"
                      width="100%"
                      marginBottom="0"
                      disabled
                      value={localPurchaseOrder?.supplierNote || ''}
                    />
                  </Grid>
                </Grid>
                {/* PO Details ends here */}
                <Divider sx={{ marginTop: '24px', marginBottom: '25px' }} />
                {/* Supplier Details start here */}
                <Grid container columns={8} columnSpacing={3}>
                  <Grid item md={6}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={2.25}
                    >
                      <Box component="h3" className="m-0">
                        <Box component="span" mr={0.625}>
                          Supplier Detail's
                        </Box>
                      </Box>
                    </Box>
                    <Grid container columnSpacing={3}>
                      <Grid item md={4}>
                        <Stack>
                          <Box
                            component="span"
                            fontSize="11px"
                            color="#979797"
                          >
                            Supplier code
                          </Box>
                          <Box
                            fontSize="13px"
                            pt={0.5}
                            color="#272B41"
                            component="span"
                            mb="16px"
                          >
                            {supplierDetails?.code || '--'}
                          </Box>
                        </Stack>
                      </Grid>
                      <Grid item md={4}>
                        <Stack>
                          <Box
                            component="span"
                            fontSize="11px"
                            color="#979797"
                          >
                            Tel:
                          </Box>
                          <Box
                            fontSize="13px"
                            pt={0.5}
                            color="#272B41"
                            component="span"
                            mb="16px"
                          >
                            {supplierDetails?.phone || '--'}
                          </Box>
                        </Stack>
                      </Grid>
                      <Grid item md={4}>
                        <Stack>
                          <Box
                            component="span"
                            fontSize="11px"
                            color="#979797"
                          >
                            Address
                          </Box>
                          <Box
                            fontSize="13px"
                            pt={0.5}
                            pr="5px"
                            color="#272B41"
                            component="span"
                          >
                            {supplierDetails?.streetAddress || '--'}
                          </Box>
                        </Stack>
                      </Grid>
                      <Grid item md={4}>
                        <Stack>
                          <Box
                            component="span"
                            fontSize="11px"
                            color="#979797"
                          >
                            Supplier Name
                          </Box>
                          <Box
                            fontSize="13px"
                            pt={0.5}
                            color="#272B41"
                            component="span"
                          >
                            {supplierDetails?.supplierName || '--'}
                          </Box>
                        </Stack>
                      </Grid>
                      <Grid item md={4}>
                        <Stack>
                          <Box
                            component="span"
                            fontSize="11px"
                            color="#979797"
                          >
                            Email
                          </Box>
                          <Box pt={0.5}>
                            {supplierDetails?.email
                              ? (
                                <a
                                  fontSize="13px"
                                  color="#3C76FF"
                                  href={`mailto:${supplierDetails?.email}`}
                                >
                                  {supplierDetails?.email}
                                </a>
                              )
                              : '--'}
                          </Box>
                        </Stack>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item md={2} borderLeft="1px solid #D9D9D9">
                    <Box component="h3" mb={2}>
                      <Box component="span">
                        Created By User:
                        {' '}
                        {localPurchaseOrder?.createdBy?.name || '--'}
                      </Box>
                    </Box>
                    <Stack mb={2}>
                      <Box component="span" fontSize="11px" color="#979797">
                        Last Modified by User:
                        {' '}
                        {localPurchaseOrder?.updatedBy?.name || '--'}
                      </Box>
                      <Box
                        fontSize="12px"
                        pt={0.5}
                        color="#272B41"
                        component="span"
                      >
                        {localPurchaseOrder?.updatedAt
                          ? moment(new Date(localPurchaseOrder?.updatedAt)).format(
                            'dddd, DD MMM YYYY • hh:mm A'
                          ) : '--'}
                      </Box>
                    </Stack>
                    <Stack pb="22px">
                      <Box component="span" fontSize="11px" color="#979797">
                        Printed by User:
                        {localPurchaseOrder?.printedBy?.name || '--'}
                      </Box>
                      <Box
                        fontSize="12px"
                        pt={0.5}
                        color="#272B41"
                        component="span"
                      >
                        {localPurchaseOrder?.printedAt
                          ? moment(new Date(localPurchaseOrder?.printedAt)).format(
                            'dddd, DD MMM YYYY • hh:mm A'
                          ) : '--'}
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
                {/* Supplier Details ends here */}
                <Divider sx={{ marginTop: '24px', marginBottom: '26px' }} />
                {/* Slip No start here */}
                <Grid container columnSpacing={3} columns={8}>
                  <Grid item md={1}>
                    <Box sx={{ maxHeight: '147px', overflow: 'auto' }} position="relative">
                      {slipNumberLoading ? <LoaderWrapper /> : null}
                      {localSlipNumbers?.length ? localSlipNumbers?.map((item) => (
                        <Box key={item?._id} paddingLeft="0" paddingRight="13px">
                          <Box display="flex" gap={53 / 8}>
                            <Box
                              className="pointer"
                              onClick={() => {
                                setUpc('');
                                setIsSlipSelected(true);
                                if (item?._id !== selectedSlip?._id) {
                                  setSelectedSlip(item);
                                } else {
                                  setSelectedSlip(null);
                                }
                              }}
                            >
                              <Box compoent="span" fontSize="11px" color="#979797">
                                Slip No.
                              </Box>
                              <Box
                                compoent="span"
                                fontSize="13px"
                                pt="5px"
                                display="block"
                                component="span"
                                color={
                                  selectedSlip?.slipNo === item?.slipNo
                                    ? '#3C76FF' : '#5A5F7D'
                                }
                              >
                                {item?.slipNo}
                              </Box>
                            </Box>
                          </Box>
                          <Divider
                            sx={{
                              marginTop: '8px',
                              marginRight: '24px',
                              marginBottom: '16px'
                            }}
                          />
                        </Box>
                      )) : (
                        <Box paddingLeft="0" paddingRight="13px">
                          <Box display="flex" gap={53 / 8}>
                            <Box
                              className="pointer"
                            >
                              <Box compoent="span" fontSize="11px" color="#979797">
                                Slip No.
                              </Box>
                              <Box
                                compoent="span"
                                fontSize="13px"
                                pt="5px"
                                display="block"
                                component="span"
                                color="#5A5F7D"
                              >
                                --
                              </Box>
                            </Box>
                          </Box>
                          <Divider
                            sx={{
                              marginTop: '8px',
                              marginRight: '24px',
                              marginBottom: '16px'
                            }}
                          />
                        </Box>
                      )}
                    </Box>
                  </Grid>
                  <Grid item md={7} borderLeft="1px solid #D9D9D9">
                    {confirmPOSlipLoading ? <LoaderWrapper /> : null}
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      mb="18px"
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Box component="h3" className="m-0">
                          <Box component="span" mr={0.625}>
                            {' '}
                            Slip No:
                          </Box>
                          {localPOSlip?.slipNo || '--'}
                        </Box>
                      </Box>
                      <Box display="flex" alignItems="center" gap={2}>
                        {!edit && (
                          <Button
                            text="Edit"
                            padding="4px 16px 4px 16px"
                            letterSpacing="0px"
                            startIcon={<span className="icon-edit" />}
                            onClick={() => {
                              setEdit(true);
                            }}
                            disabled={isEmpty(selectedSlip) || !editPurchasing || (localPOSlip?.slipStatus === 'confirm')}
                          />
                        )}
                        {edit && (
                          <Box display="flex" gap={2}>
                            <Button
                              text="Cancel"
                              startIcon={
                                <CancelOutlinedIcon sx={{ color: '#3C76FF' }} />
                              }
                              padding="4px 17px 4px 15px"
                              letterSpacing="0px"
                              onClick={() => {
                                setUpdateSlipHelperText({ memo: '' });
                                setEdit(false);
                                setUpdateSlipOfPO({ memo: '' });
                              }}
                            />
                            <Button
                              text="Save Changes"
                              letterSpacing="0px"
                              padding="4px 16px 4px 14px"
                              variant="contained"
                              startIcon={<span className="icon-Save" />}
                              onClick={handlePOSlipUpdate}
                            />
                          </Box>
                        )}
                        <Button
                          disabled={!editPurchasing}
                          text="Add Slip"
                          letterSpacing="0px"
                          padding="4px 16px 4px 14px"
                          variant="contained"
                          startIcon={<AddCircleOutlineIcon />}
                          onClick={() => {
                            setAddSlip(true);
                          }}
                        />
                        <Button
                          disabled={isEmpty(selectedSlip) || !editPurchasing || (localPOSlip?.slipStatus === 'confirm')}
                          text="Confirm Slip"
                          letterSpacing="0px"
                          padding="4px 16px 4px 14px"
                          variant="contained"
                          // startIcon={<AddCircleOutlineIcon />}
                          onClick={() => {
                            dispatch(ConfirmPOSlip({ slipId: selectedSlip?._id }));
                          }}
                        />
                      </Box>
                    </Box>
                    <Grid container columns={7} columnSpacing={3} rowSpacing={2} position="relative">
                      {slipUpdateLoading ? <LoaderWrapper /> : null}
                      <Grid item md={2}>
                        <Stack>
                          <Box
                            component="span"
                            fontSize="11px"
                            color="#979797"
                          >
                            Added by User.
                            {localPOSlip?.createdBy?.name || '--'}
                          </Box>
                          <Box
                            fontSize="12px"
                            pt="5px"
                            color="#272B41"
                            component="span"
                          >
                            {localPOSlip?.createdAt
                              ? moment(new Date(localPOSlip?.createdAt)).format(
                                'DD MMM YYYY • hh:mm A'
                              ) : '--'}
                          </Box>
                        </Stack>
                      </Grid>
                      <Grid item md={2}>
                        <Stack>
                          <Box
                            component="span"
                            fontSize="11px"
                            color="#979797"
                          >
                            Last Modified by User.
                            {localPOSlip?.updatedBy?.name || '--'}
                          </Box>
                          <Box
                            fontSize="12px"
                            pt="5px"
                            color="#272B41"
                            component="span"
                          >
                            {localPOSlip?.updatedAt && localPOSlip?.updatedBy
                              ? moment(new Date(localPOSlip?.updatedAt)).format(
                                'DD MMM YYYY • hh:mm A'
                              ) : '--'}
                          </Box>
                        </Stack>
                      </Grid>
                      <Grid item md={2}>
                        <Stack>
                          <Box
                            component="span"
                            fontSize="11px"
                            color="#979797"
                          >
                            Received Date & Time
                          </Box>
                          <Box
                            fontSize="12px"
                            pt="5px"
                            color="#272B41"
                            component="span"
                          >
                            {
                              !isEmpty(receivedDate)
                                ? moment(new Date(receivedDate)).format('DD MMM YYYY • hh:mm A') : '--'
                            }
                          </Box>
                        </Stack>
                      </Grid>
                      <Grid item md={7}>
                        <Input
                          autoComplete="off"
                          name="memo"
                          label="Memo"
                          value={localPOSlip?.memo || ''}
                          width="100%"
                          marginBottom="0"
                          disabled={!edit}
                          onChange={handleUpdateSlipChange}
                          helperText={updateSlipHelperText.memo}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                {/* Slip No ends here */}
              </Grid>
              <Grid item md={3}>
                <Box border="1px solid #D9D9D9" p={2} position="relative">

                  {getAggregatedDataOfNonConfirmPOLoading ? <LoaderWrapper /> : null}
                  <Box display="flex" mb="5px" alignItems="center" justifyContent="space-between">
                    <Box component="h3" mb={0}>Discount Type</Box>
                    <Button
                      disabled={edit || !editPurchasing}
                      className="icon-button"
                      letterSpacing="0px"
                      onClick={() => {
                        setEditInput(!editInput);

                        if (editInput) {
                          const totalPrice = aggregatdData?.quantity
                            ? Number(aggregatdData?.total || 0)?.toFixed(2)
                            : 0;

                          const totalDiscount = aggregatdData?.quantity
                            ? isFixedRatio
                              ? Number(discount || 0)
                              : ((Number(aggregatdData?.total || 0))
                                * (discount / 100)
                              )
                            : 0;
                          if (totalPrice < totalDiscount) {
                            setShipping(purchaseOrder?.shippingPrice);
                            setDiscount(purchaseOrder?.discount);
                            dispatch(
                              SetPurchaseOrderNotifyState({
                                message: 'Discount should be less than total price !',
                                type: 'info'
                              })
                            );
                            setLocalPurchaseOrder({
                              ...localPurchaseOrder,
                              discount: purchaseOrder?.discount
                            });
                          } else {
                            handlePODetailSave({ editAction: 'discountUpdate' });
                            setShipping(localPurchaseOrder?.shippingPrice || 0);
                            setDiscount(localPurchaseOrder?.discount || 0);
                          }
                        }
                      }}
                      startIcon={(
                        <span className={`icon-${editInput ? 'Save color-primary' : 'edit'} pointer`} />
                      )}
                    />
                  </Box>
                  <Box
                    display="flex"
                    gap="3px"
                    mb="5px"
                  >

                    <Radio
                      checked={localPurchaseOrder?.discountType
                        ? localPurchaseOrder?.discountType === DISCOUNT_TYPE.fixed
                        : true}
                      onChange={() => {
                        setIsFixedRatio(!isFixedRatio);
                      }}
                      label="Fixed Amount"
                      disabled={!editInput}
                    />
                    <Radio
                      checked={localPurchaseOrder?.discountType
                        ? localPurchaseOrder?.discountType === DISCOUNT_TYPE.percentage
                        : false}
                      onChange={() => {
                        setIsFixedRatio(!isFixedRatio);
                      }}
                      label="Percent"
                      disabled={!editInput}
                    />
                  </Box>
                  <Grid container spacing="17px">
                    <Grid item md={6}>
                      <Input
                        autoComplete="off"
                        label="Discount Percentage"
                        marginBottom="0"
                        minValue={0}
                        name="discount"
                        onChange={(e) => {
                          if (REGEX_FOR_DECIMAL_NUMBERS.test(e.target.value)) {
                            handlePODetailsChange(e);
                            setDiscount(e.target.value);
                          } else {
                            e.target.value = '';
                          }
                        }}
                        value={!editInput ? isFixedRatio ? `$${discount}` : `${discount}%` : discount || ''}
                        disabled={!editInput}
                      />
                    </Grid>
                    <Grid item md={6}>
                      <Input
                        autoComplete="off"
                        label="Shipping"
                        marginBottom="0"
                        name="shippingPrice"
                        disabled={!editInput}
                        onChange={(e) => {
                          if (REGEX_FOR_DECIMAL_NUMBERS.test(e.target.value)) {
                            handlePODetailsChange(e);
                            setShipping(e.target.value);
                          } else {
                            e.target.value = '';
                          }
                        }}
                        value={!editInput ? isFixedRatio ? `$${shipping}` : `${shipping}%` : shipping || ''}
                      />
                    </Grid>
                  </Grid>
                  <Divider sx={{ marginTop: '16px', marginBottom: '15px' }} />
                  <Box display="flex" justifyContent="space-between" mb={1.5}>
                    <Box component="span" color="#979797" fontSize="11px">
                      Total Item’s:
                    </Box>
                    <Box component="span" color="#5A5F7D" fontSize="13px">
                      {aggregatdData?.count || 0}
                    </Box>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1.5}>
                    <Box component="span" color="#979797" fontSize="11px">
                      Total Qty:
                    </Box>
                    <Box component="span" color="#5A5F7D" fontSize="13px">
                      {aggregatdData?.quantity || 0}
                    </Box>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1.5}>
                    <Box component="span" color="#979797" fontSize="11px">
                      Total  Item’s Price:
                    </Box>
                    <Box component="span" color="#5A5F7D" fontSize="13px">
                      $
                      {aggregatdData?.quantity ? +(aggregatdData?.total || 0)?.toFixed(2) || 0 : 0}
                    </Box>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1.5}>
                    <Box component="span" color="#979797" fontSize="11px">
                      Shipping Cost:
                    </Box>
                    <Box component="span" color="#5A5F7D" fontSize="13px">
                      {aggregatdData?.quantity
                        ? isFixedRatio
                          ? `$${Number(purchaseOrder?.shippingPrice || 0)?.toFixed(2)}`
                          : `$${Number((aggregatdData?.total)
                            * ((Number(purchaseOrder?.shippingPrice || 0)) / 100))?.toFixed(2)}` : '$0'}

                    </Box>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1.5}>
                    <Box component="span" color="#979797" fontSize="11px">
                      Total Discount:
                    </Box>
                    <Box component="span" color="#5A5F7D" fontSize="13px">
                      {aggregatdData?.quantity
                        ? isFixedRatio
                          ? `$${(Number(purchaseOrder?.discount || 0))?.toFixed(2)}`
                          : `$${((Number(aggregatdData?.total || 0))
                            * (Number(purchaseOrder?.discount || 0) / 100)
                          )?.toFixed(2)
                          }` : '$0'}
                    </Box>
                  </Box>
                  <Divider sx={{ marginTop: '8px', marginBottom: '7px' }} />
                  <Box display="flex" justifyContent="space-between">
                    <Box component="span" color="#979797" fontSize="11px">
                      Grand Total:
                    </Box>
                    <Box component="span" color="#272B41" fontSize="13px" fontWeight="600">
                      {aggregatdData?.quantity
                        ? isFixedRatio
                          ? `$${((Number(aggregatdData?.total || 0)
                            + Number(purchaseOrder?.shippingPrice || 0))
                            - (Number(purchaseOrder?.discount || 0)))?.toFixed(2)
                          }`
                          : `$${(((Number(aggregatdData?.total || 0)))
                            + (Number((aggregatdData?.total || 0)
                              * Number(purchaseOrder?.shippingPrice || 0)) / 100)
                            - (Number(aggregatdData?.total))
                            * (Number(purchaseOrder?.discount || 0) / 100))?.toFixed(2)
                          }` : '$0'}

                    </Box>
                  </Box>
                </Box>
                <Box border="1px solid #D9D9D9" p={2} pb="42px" mt={3} position="relative">
                  {AddSlipItemLoading ? <LoaderWrapper /> : null}
                  <Box mb="0">
                    <Box component="h3" mb={0}>Receiving Summary</Box>
                  </Box>
                  <Divider sx={{ marginTop: '12px', marginBottom: '19px' }} />
                  <Box display="flex" justifyContent="space-between" mb="14px">
                    <Box component="span" color="#979797" fontSize="11px">
                      Total Unit’s Received
                    </Box>
                    <Box component="span" color="#272B41" fontSize="13px" fontWeight={600}>
                      {
                        !isEmpty(selectedSlip)
                          ? itemsOfSlip
                            ?.reduce((accumulator, object) => accumulator
                              + Number(object?.poQueueItem?.receivedQuantity || 0), 0)
                          : localItemsOfPO
                            ?.reduce((accumulator, object) => accumulator
                              + Number(object?.poQueueItem?.receivedQuantity || 0), 0)
                      }
                    </Box>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb="20px">
                    <Box component="span" color="#979797" fontSize="11px">
                      Total Unit’s Outstanding
                    </Box>
                    <Box component="span" color="#272B41" fontSize="13px" fontWeight={600}>
                      {Math.max(0, (aggregatdData?.quantity - localItemsOfPO
                        ?.reduce((accumulator, object) => {
                          if (object?.poQueueItem?.poQuantity
                            <= object?.poQueueItem?.receivedQuantity) {
                            accumulator += Number(object?.poQueueItem?.poQuantity);
                          } else {
                            accumulator += Number(object?.poQueueItem?.receivedQuantity);
                          }
                          return accumulator;
                        }, 0)))}
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Grid>
            <Divider sx={{ marginTop: '24px', marginBottom: '25px' }} />
            {/* Upload document starts here */}
            <Box mt={1}>
              <Box component="h3" mb={1.75}>Upload Order Related Document</Box>
              <Grid container columnSpacing={3} columns={11}>
                <Grid item md={3}>
                  {!addPayment ? (
                    <Upload
                      loading={attachmentLoading}
                      handleChangeAttachment={handleChangeAttachment}
                      className="po-upload"
                      title="Drag or Click to Upload CSV File"
                      attachmentName={attachmentName}
                      accept=".jpeg, .jpg, .png, .gif, .bmp, .tiff, .tif, .webp, .svg, .ico, .psd, .ai, .eps, .docm, .docx, .dot, .csv, .tsv, .xlx, .xlsm, .xlsb, .xltx, .pdf, .xltm, .xls, .xlt, .xml, .xlam, .xla, .xlw, .xlr, .txt, .slk, .dif, .xps, .rtf, .dotx, .dotm, .docb, .doc, .xlsx, .json"
                      disabled={!editPurchasing}
                    />
                  ) : (
                    <UploadWrapper className="po-upload">
                      <div className="upload-file pointer">
                        <div className="d-flex align-items-center flex-column upload">
                          <span><img src={UploadIcon} alt="upload icon" /></span>
                          <span>
                            Drag or Click to Upload CSV File
                          </span>
                          {attachmentName
                            || (
                              <Button
                                startIcon={<span className="icon-choose-file" />}
                                text="Choose File"
                              />
                            )}
                        </div>
                      </div>
                    </UploadWrapper>
                  )}
                </Grid>
                <Grid item md={8}>
                  <Box mt={0.25} position="relative" zIndex="0">
                    <Table alignCenter tableHeader={fileDocumentHeader} maxheight="155px" bodyPadding="12px 14px">
                      {poAttachmentloading
                        ? <LoaderWrapper />
                        : poDocsData?.length ? poDocsData.map((row) => (
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
            {/* Upload document ends here */}
          </Grid>
        </Grid>

        {/* Scan section starts here */}
        <Divider sx={{ marginTop: '22px', marginBottom: '24px' }} />
        <Box display="flex" justifyContent="center" gap={3}>
          {
            localPOSlip?.slipStatus === 'confirm' ? null : (
              <>
                <SearchInput
                  autoComplete="off"
                  className="recieving-scan"
                  fontSize="16px"
                  large
                  placeholder="Scan Or Enter a UPC To Continue"
                  height="40px"
                  sx={{ width: '796px' }}
                  width="796px"
                  value={upc}
                  onChange={(e) => {
                    setUpc(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (editPurchasing) {
                      if (e.keyCode === 13) {
                        handleAddSlipItem();
                      }
                      setUpc(e.target.value);
                    }
                  }}
                  id="SearchbyScanning"
                />
                <Box
                  sx={{ border: '1px solid #3C76FF' }}
                  padding={2.25}
                  borderRadius={1}
                  className="pointer"
                  disabled={isEmpty(selectedSlip && isEmpty(upc)) || !editPurchasing}
                  onClick={() => {
                    if (editPurchasing) {
                      handleAddSlipItem();
                    }
                  }}
                >
                  <span
                    className="icon-scanner"
                  />
                </Box>
              </>
            )
         }
        </Box>
        {/* Scan section ends here */}

        {!isEmpty(selectedSlip)
          ? (
            <ItemsOfPO
              poId={params?.poId}
              itemsOfPO={localItemsOfSlip}
              totalItemsOfPO={totalItemsOfSlip}
              loading={itemsOfSlipLoading}
              selectedItem={selected}
              isSlip
              selectedSlip={selectedSlip}
              slipItems={poSlipItems}
              uniqueProductIds={poSlipItems?.length
                && uniq(poSlipItems?.map((item) => item?.productId))}
            />
          )
          : (
            <ItemsOfPO
              poId={params?.poId}
              itemsOfPO={localItemsOfPO}
              totalItemsOfPO={totalItemsOfPO}
              loading={itemsOfPOLoading}
              selectedItem={selected}
            />
          )}
        <DeleteModal
          loading={purchaseOrderLoading}
          show={deleteProduct}
          lastTitle="Delete This PO!"
          onClose={() => setDeleteProduct(false)}
          onDelete={() => {
            handleDeletePO();
          }}
        />
        <Modal show={addSlip} width={471} onClose={() => setAddSlip(false)}>
          <Box
            sx={{ position: 'relative', padding: '24px', minWidth: '471px' }}
            position="relative"
          >
            {AddSlipLoading ? <LoaderWrapper /> : null}
            <CancelOutlinedIcon
              className="pointer"
              onClick={() => {
                setAddSlip(false);
                setAddSlipHelperText({ slipNo: '' });
                setAddSlipOfPO({ slipNo: '' });
              }}
              sx={{
                color: '#979797',
                fontSize: 17,
                position: 'absolute',
                right: '24px',
                top: '23px'
              }}
            />
            <h2>Add Slip </h2>
            <Box mt={3}>
              <Input
                autoComplete="off"
                name="slipNo"
                label="Slip No."
                placeholder="Enter"
                width="100%"
                marginBottom="32px"
                onChange={(e) => {
                  if (REGEX_FOR_NUMBERS.test(e.target.value)) {
                    handleAddSlipChange(e);
                  } else {
                    e.target.value = addSlipOfPO?.slipNo;
                  }
                }}
                helperText={addSlipHelperText.slipNo}
              />
              <Box display="flex" justifyContent="flex-end">
                <Button
                  text="Save"
                  variant="contained"
                  width="87px"
                  startIcon={<span className="icon-Save" />}
                  onClick={() => {
                    handlePOSlipSave();
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Modal>
      </>
      {
        addPayment ? (
          <AddPayment
            pOId={localPurchaseOrder?._id}
            open={addPayment}
            onClose={() => setAddPayment(false)}
          />
        ) : null
      }
      <ItemDelete
        show={deleteAttachment}
        lastTitle="Delete This File!"
        onClose={() => {
          setDeleteAttachment(false);
          setDeleteAttachmentId('');
        }}
        onDelete={() => {
          setDeleteAttachment(false);
          handleDeletePOAttachment();
          setDeleteAttachmentId('');
        }}
      />
    </>
  );
};

export default ConfrimPo;
