import React, { useState, useEffect, useRef } from 'react';
import ReactToPrint from 'react-to-print';
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
import {
  isEmpty, isEqual, uniq, difference, find, camelCase
} from 'lodash';
import CryptoJS from 'crypto-js';
import { useNavigate, useParams } from 'react-router-dom';
// icons
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalPrintshopOutlinedIcon from '@mui/icons-material/LocalPrintshopOutlined';
import LocalPostOfficeOutlinedIcon from '@mui/icons-material/LocalPostOfficeOutlined';
import Button from '../../../../components/button/index';
import Table from '../../../../components/ag-grid-table/index';
import Input from '../../../../components/inputs/input/index';
import LoaderWrapper from '../../../../components/loader/index';
import HoverImage from '../../../../components/imageTooltip';
import Pagination from '../../../../components/pagination/index';
import SearchInput from '../../../../components/searchInput/index';
import Upload from '../../../../components/upload/index';
import Radio from '../../../../components/radio';
import CheckBox from '../../../../components/checkbox/index';
import BarcodeFile from '../../orders/component/print/barcodeFile';
import DeleteModal from './modals/delete';
import AddPayment from './drawers/addPayment';
import AddItems from './drawers/addItemsDrawer';
import DownArrow from '../../../../static/images/arrow-up.svg';
// images
import Product from '../../../../static/images/no-product-image.svg';
import noData from '../../../../static/images/no-data.svg';
import noDataFound from '../../../../static/images/no-data-table.svg';
import ItemDelete from '../../orders/component/modals/delete';
import UploadIcon from '../../../../static/images/upload.svg';
// styles
import UploadWrapper from '../../../../components/upload/style';
// helpers
import {
  GetS3ImageUrl,
  UploadDocumentOnS3,
  UploadedFileSize
} from '../../../../../utils/helpers';
// redux
import {
  ConfirmPO,
  DeletePOById,
  DeletePOItems,
  SendPOEmail,
  GetPONumbers,
  GetPurchaseOrderById,
  GetItemsOfPurchaseOrder,
  SetPurchaseOrderState,
  GetPOAttachmentsByPOId,
  GetAggregatedDataOfNonConfirmPO,
  UpdatePurchaseOrder,
  UpdatePOItem,
  SetPurchaseOrderNotifyState,
  SavePOAttachment,
  UpdatePOQuantityAndCost,
  DownloadPurchaseOrderXlsxSheet,
  UpdatePOAttachmentById,
  SetPaymentDetailState,
  SetPoQueueItemState
} from '../../../../redux/slices/purchasing';

import {
  GetS3PreSignedUrl,
  SetOtherNotifyState,
  SetOtherState
} from '../../../../redux/slices/other-slice';
// constants
import {
  PO_STATUS,
  REGEX_FOR_NUMBERS,
  DISCOUNT_TYPE,
  EXTENSIONS_LIST,
  nonConfirmPoHeader,
  REGEX_FOR_DECIMAL_NUMBERS,
  fileDocumentHeader,
  itemsOfNonConfirmPOSort
} from '../../../../constants/index';
// images
import IconPdf from '../../../../static/images/icon-pdf.svg';
import IconCsv from '../../../../static/images/icon-csv.svg';
import IconXls from '../../../../static/images/icon-xls.svg';
import IconDoc from '../../../../static/images/icon-doc.svg';
import IconFile from '../../../../static/images/icon-file.svg';

const NonConfrimPo = (props) => {
  const tableRef = useRef();
  const dispatch = useDispatch();

  const params = useParams();
  const navigate = useNavigate();

  const { user: { permissions: { editPurchasing } } } = useSelector((state) => state.auth);
  const {
    poNumbers,
    purchaseOrder,
    purchaseOrderLoading,
    itemsOfPO,
    totalItemsOfPO,
    itemsOfPOLoading,
    itemsOfNonConfirmPOPageLimit,
    itemsOfNonConfirmPOPageNumber,
    aggregatedDataOfNOnConfirmPO,
    poUpdated,
    poDeleted,
    itemAddedToNonConfirmPO,
    poConfirmed,
    poAttachments = [],
    poAttachmentloading,
    poItemUpdatedLoading,
    poItemDeletedLoading,
    poItemDeleted,
    purchaseOrderUpdateLoading,
    savePoAttachmentLoading,
    updatePoAttachmentLoading,
    getPoAttachmentLoading,
    poItemUpdated,
    getAggregatedDataOfNonConfirmPOLoading
  } = useSelector((state) => state.purchaseOrder);

  const {
    preSignedUrl,
    fileUploadKey,
    success: otherSuccess,
    loading: otherLoading
  } = useSelector((state) => state.other);
  const { poQueueItemUpdated, poQueueItemDeleted } = useSelector(
    (state) => state.poQueueItem
  );

  const { user } = useSelector((state) => state.auth);

  const { closeComponent } = props;

  const ref = React.createRef();
  const [attachment, setAttachment] = useState();
  const [attachmentResponse, setAttachmentResponse] = useState(false);
  const [poDocsData, setPODocsData] = useState([]);
  const [attachmentLoading, setAttachmentLoading] = useState(false);
  const [attachmentName, setAttachmentName] = useState('');
  const [selected, setSelected] = useState({});
  const [editInput, setEditInput] = useState(false);
  const [addItem, setAddItem] = useState(false);
  const [deleteItems, setDeleteItems] = useState(false);
  const [deleteAttachment, setDeleteAttachment] = useState(false);
  const [addPayment, setAddPayment] = useState(false);
  const [edit, setEdit] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedValue, setSelectedValue] = useState('');
  const [editItemHelperText, setEditItemHelperText] = useState({
    poQuantity: '',
    unitCost: ''
  });
  const [shipping, setShipping] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [deleteMsg, setDeleteMsg] = useState('Delete The Item!');
  const [editPo, setEditPo] = useState('');
  const [poItemIds, setPOItemIds] = useState([]);
  const [headerCheckBox, setHeaderCheckBox] = useState(false);
  const [selectedPOItems, setSelectedPOItems] = useState([]);
  const [deletePOItems, setDeletePOItems] = useState([]);
  const [deleteAttachmentId, setDeleteAttachmentId] = useState([]);
  const [localPONumbers, setLocalPONumbers] = useState([]);
  const [localItemsOfPO, setLocalItemsOfPO] = useState([]);
  const [localPurchaseOrder, setLocalPurchaseOrder] = useState('');
  const [supplierDetails, setSupplierDetails] = useState({});
  const [searchVal, setSearchVal] = useState('');
  const [aggregatdData, setAggregatedData] = useState({
    count: 0,
    quantity: 0,
    unitCost: 0,
    total: 0,
    backOrderQuantity: 0,
    quantityCancelled: 0
  });
  const [isFixedRatio, setIsFixedRatio] = useState(false);

  const [withUpc, setWithUpc] = useState(false);
  const [sortValue, setSortValue] = useState({});

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

  const getPONumbers = () => {
    dispatch(
      GetPONumbers({
        poStatus: PO_STATUS.nonConfirm
      })
    );
  };

  const getPurchaseOrderById = ({ poId }) => {
    dispatch(GetPurchaseOrderById({ poId }));
  };

  const getAggregatedDataOfNonConfirmPO = ({ poId }) => {
    dispatch(GetAggregatedDataOfNonConfirmPO({ poId, poStatus: PO_STATUS.nonConfirm }));
  };

  const getItemsOfPurchaseOrder = ({ poStatus, purchaseOrderId }) => {
    const skip = (itemsOfNonConfirmPOPageNumber - 1) * itemsOfNonConfirmPOPageLimit;
    const limit = itemsOfNonConfirmPOPageLimit;
    dispatch(
      GetItemsOfPurchaseOrder({
        skip,
        limit,
        poStatus,
        purchaseOrderId,
        sortBy: sortValue
      })
    );
  };

  const handlePageNumber = (e) => {
    dispatch(
      SetPurchaseOrderState({
        field: 'itemsOfNonConfirmPOPageNumber',
        value: e
      })
    );
  };

  const handlePageLimit = (e) => {
    dispatch(
      SetPurchaseOrderState({
        field: 'itemsOfNonConfirmPOPageNumber',
        value: 1
      })
    );
    dispatch(
      SetPurchaseOrderState({
        field: 'itemsOfNonConfirmPOPageLimit',
        value: e
      })
    );
  };

  const handlePODetailsChange = (e) => {
    const { value: val, name: key } = e.target;
    setLocalPurchaseOrder({
      ...localPurchaseOrder,
      [key]: val
    });
  };
  const handleRadioChange = (event) => {
    setSelectedValue(event.target.value);
  };

  const handleOnchange = (e, _id) => {
    const { name: key, value } = e.target;

    const errors = editItemHelperText;

    if (key === 'poQuantity') {
      if (!value || +value === 0) {
        errors.poQuantity = ' ';
      } else {
        errors.poQuantity = '';
      }
    } else if (key === 'unitCost' && (!value || +value === 0)) {
      errors.unitCost = ' ';
    } else {
      errors.unitCost = '';
    }

    if (errors.poQuantity.length > 0 || errors.unitCost.length > 0) errors._id = _id;
    else errors._id = '';

    setEditItemHelperText((prevHelperText) => ({ ...prevHelperText, ...errors }));
  };

  const handleEditItem = () => {
    if (!isEmpty(editPo)) {
      const errors = {};
      Object.keys(editPo)?.forEach((key) => {
        if (
          (key === 'poQuantity' || key === 'unitCost')
          && editPo?.poQueueItem[key] === ''
        ) {
          errors[key] = ' ';
          errors._id = editPo?.poQueueItem._id;
        } else {
          errors[key] = '';
        }
      });
      setEditItemHelperText((prevHelperText) => ({
        ...prevHelperText,
        ...errors
      }));

      if (Object.values(errors).every((errorValue) => errorValue === '')) {
        const findItem = itemsOfPO?.find((item) => item?._id === editPo?._id);
        if (
          Number(findItem?.poQueueItem?.poQuantity)
          !== Number(editPo?.poQueueItem?.poQuantity)
          || Number(findItem?.poQueueItem?.unitCost)
          !== Number(editPo?.poQueueItem?.unitCost)
        ) {
          dispatch(
            UpdatePOItem({
              poQueueItemId: editPo?.poQueueItem?._id,
              updateParams: {
                poQuantity: editPo?.poQueueItem?.poQuantity,
                unitCost: Number(editPo?.poQueueItem?.unitCost)?.toFixed(2)
              }
            })
          );
        } else {
          dispatch(
            SetPurchaseOrderNotifyState({
              message: 'Nothing updated !',
              type: 'info'
            })
          );
        }
      }
    }
  };

  const handleDeletePOItem = () => {
    if (deletePOItems?.length) {
      dispatch(
        DeletePOItems({
          items: deletePOItems
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

  const handlePODetailSave = ({ editAction }) => {
    if (!isEmpty(localPurchaseOrder)) {
      const updatedParams = {
        shippingPrice: localPurchaseOrder?.shippingPrice
          ? Number(localPurchaseOrder.shippingPrice).toFixed(2)
          : 0,
        referrence: localPurchaseOrder?.referrence,
        wareHouseInstrutions: localPurchaseOrder?.wareHouseInstrutions,
        supplierNote: localPurchaseOrder?.supplierNote,
        discount: localPurchaseOrder?.discount
          ? Number(localPurchaseOrder.discount).toFixed(2)
          : 0,
        discountType: localPurchaseOrder?.discountType
      };

      const prevParams = {
        shippingPrice: purchaseOrder?.shippingPrice
          ? Number(purchaseOrder.shippingPrice).toFixed(2)
          : 0,
        referrence: purchaseOrder?.referrence,
        wareHouseInstrutions: purchaseOrder?.wareHouseInstrutions,
        supplierNote: purchaseOrder?.supplierNote,
        discount: purchaseOrder?.discount
          ? Number(purchaseOrder.discount).toFixed(2)
          : 0,
        discountType: purchaseOrder?.discountType
      };

      if (localPurchaseOrder?.expectedDeliveryDate) {
        updatedParams.expectedDeliveryDate = new Date(
          localPurchaseOrder?.expectedDeliveryDate
        );
        prevParams.expectedDeliveryDate = new Date(
          purchaseOrder?.expectedDeliveryDate
        );
      }
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
        if (!isEmpty(aggregatdData) && localPurchaseOrder?._id) {
          updatedParams.poTotalCost = aggregatdData?.quantity
            ? isFixedRatio
              ? `${((Number(aggregatdData?.total || 0)
                + Number(localPurchaseOrder?.shippingPrice || 0))
                - (Number(localPurchaseOrder?.discount || 0)))?.toFixed(2)
              }`
              : `${(((Number(aggregatdData?.total || 0)))
                + (Number((aggregatdData?.total)
                  * Number(localPurchaseOrder?.shippingPrice)) / 100)
                - (Number(aggregatdData?.total))
                * (localPurchaseOrder?.discount / 100))?.toFixed(2)
              }` : 0;
        }
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

  const handleHeaderCheckBoxClicked = (e) => {
    const allPOItemIds = localItemsOfPO?.map((item) => item?.poQueueItemId);
    if (e.target.checked) {
      setHeaderCheckBox(true);
      const allPOItems = selectedPOItems.concat(allPOItemIds);
      const uniqItems = uniq(allPOItems);
      setSelectedPOItems(uniqItems);
    } else {
      const filteredId = selectedPOItems.filter(
        (id) => !allPOItemIds.includes(id)
      );

      setHeaderCheckBox(false);
      const uniqItems = uniq(filteredId);
      setSelectedPOItems(uniqItems);
    }
  };

  const handleCheckBoxClick = (e, queueItemId) => {
    if (e.target.checked) {
      setSelectedPOItems([...selectedPOItems, queueItemId]);

      selectedPOItems.includes();
    } else {
      const queueItemIdsList = selectedPOItems.filter(
        (id) => id !== queueItemId
      );
      const uniqItems = uniq(queueItemIdsList);
      setSelectedPOItems([...uniqItems]);
    }
  };

  const handleConfirmPO = () => {
    if (localItemsOfPO.length) {
      const isZero = localItemsOfPO?.map((item) => {
        if (
          item?.poQueueItem?.poQuantity === ''
          || Number(item?.poQueueItem?.poQuantity) === 0
        ) {
          return true;
        }
        return false;
      });
      if (isZero?.includes(true)) {
        dispatch(
          SetPurchaseOrderNotifyState({
            message: 'Quantity must be greater than 0 of each Product. !',
            type: 'error'
          })
        );
      } else {
        dispatch(
          ConfirmPO({
            purchaseOrderId: localPurchaseOrder?._id
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

  const handleImageError = (event, image) => {
    event.target.src = image;
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

  const handleUploadAttachmentOnS3 = async () => {
    const response = await UploadDocumentOnS3({ preSignedUrl, file: attachment });
    if (response) {
      setAttachmentResponse(true);
    } else {
      setAttachmentLoading(false);
      dispatch(SetOtherNotifyState({ message: 'File Uploading failed on S3', type: 'error' }));
    }
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

  const downloadAttachment = async (key) => {
    const { userId } = user;
    const userIdJson = CryptoJS.AES.encrypt(String(userId), process.env.HASH).toString();
    const userIdData = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(userIdJson));
    window.open(`${process.env.API_URL}/non-secure-route/download-file?uploadBucket=poDocs&key=${key}&userId=${userIdData}`);
  };

  const handleEditRow = (row) => {
    if (editPurchasing) {
      if (!row?.poQueueItem?.poQuantity) {
        setEditItemHelperText({ ...editItemHelperText, poQuantity: ' ', _id: row?.poQueueItem?._id });
      }
      if (!row?.poQueueItem?.unitCost) {
        setEditItemHelperText({ ...editItemHelperText, unitCost: ' ', _id: row?.poQueueItem?._id });
      }
      if (!row?.poQueueItem?.unitCost && !row?.poQueueItem?.poQuantity) {
        setEditItemHelperText({
          ...editItemHelperText, poQuantity: ' ', unitCost: ' ', _id: row?.poQueueItem?._id
        });
      }
      const findEdited = localItemsOfPO?.map(
        (item) => item?.isEdit
      );
      const alreadyEdit = findEdited?.includes(true);
      if (row?.poQueueItem?._id === editPo?.poQueueItem?._id
        || isEmpty(editPo?._id)) {
        if (row.isEdit) {
          if (!editItemHelperText?._id) {
            row.isEdit = !row.isEdit;
            setIsEdit(!isEdit);
            handleEditItem();
          }
        } else if (!alreadyEdit) {
          row.isEdit = !row.isEdit;
          setIsEdit(!isEdit);
          setEditPo(row);
        }
      } else {
        const selectedItem = row?._id;
        setEditPo(row);

        const newArray = itemsOfPO?.map((obj) => ({
          ...obj,
          isEdit: obj._id === selectedItem
        }));

        const findItem = newArray?.find((obj) => obj?.isEdit);
        if (!isEmpty(findItem)) {
          if (!findItem?.poQueueItem?.poQuantity) {
            setEditItemHelperText({ poQuantity: ' ', _id: findItem?.poQueueItem?._id });
          }
          if (!findItem?.poQueueItem?.unitCost) {
            setEditItemHelperText({ unitCost: ' ', _id: findItem?.poQueueItem?._id });
          }
          if (!findItem?.poQueueItem?.unitCost
            && !findItem?.poQueueItem?.poQuantity) {
            setEditItemHelperText({
              poQuantity: ' ', unitCost: ' ', _id: findItem?.poQueueItem?._id
            });
          }
          if (findItem?.poQueueItem?.unitCost
            && findItem?.poQueueItem?.poQuantity) {
            setEditItemHelperText({
              poQuantity: '', unitCost: ''
            });
          }
        } else {
          setEditItemHelperText({
            poQuantity: '', unitCost: ''
          });
        }

        setLocalItemsOfPO(newArray);
      }
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
    if (poConfirmed) {
      navigate(`/purchasing/confirm/${selected.poId}`, { state: 'non-confirm' });
      dispatch(SetPurchaseOrderState({
        field: 'poConfirmed',
        value: false
      }));
    }
    if (poDeleted || !isEmpty(params?.poId)) {
      getPONumbers();
    }
    if (poDeleted) {
      dispatch(SetPurchaseOrderState({
        field: 'poDeleted',
        value: false
      }));
      if (poNumbers?.length >= 1) {
        setSelected(poNumbers[1]);
      } if (poNumbers?.length === 1 && poDeleted) {
        navigate('/purchasing/all-po');
      }

      dispatch(SetPurchaseOrderState({
        field: 'poDeleted',
        value: false
      }));

      setDeleteProduct(false);
    }
  }, [poDeleted, poConfirmed, params?.poId]);

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
    setEdit(false);
    setEditInput(false);
    setSelectedPOItems([]);
    setHeaderCheckBox(false);
    setEditItemHelperText({
      poQuantity: '',
      unitCost: ''
    });

    if (itemAddedToNonConfirmPO) {
      if (!isEmpty(selected)) {
        getItemsOfPurchaseOrder({
          purchaseOrderId: selected?._id,
          poStatus: PO_STATUS.nonConfirm
        });
      }
    }
  }, [itemAddedToNonConfirmPO]);

  useEffect(() => {
    if (poItemDeleted) {
      if (!isEmpty(selected)) {
        getItemsOfPurchaseOrder({
          purchaseOrderId: selected?._id,
          poStatus: PO_STATUS.nonConfirm
        });
      }

      getAggregatedDataOfNonConfirmPO({ poId: selected?._id });
      dispatch(SetPurchaseOrderState({ field: 'poItemDeleted', value: false }));
    }

    if (!poItemDeletedLoading) {
      setDeleteItems(false);
      setDeletePOItems([]);
      setSelectedPOItems([]);
    }
  }, [poItemDeleted, poItemDeletedLoading]);

  useEffect(() => {
    setEdit(false);
    setEditInput(false);
    setSelectedPOItems([]);
    setHeaderCheckBox(false);
    setEditItemHelperText({
      poQuantity: '',
      unitCost: ''
    });

    if (!isEmpty(selected)) {
      getItemsOfPurchaseOrder({
        purchaseOrderId: selected?._id,
        poStatus: PO_STATUS.nonConfirm
      });
      getAggregatedDataOfNonConfirmPO({ poId: selected?._id });
      getPurchaseOrderById({ poId: selected?._id });
    }
  }, [selected]);

  useEffect(() => {
    setEdit(false);
    setEditInput(false);
    setHeaderCheckBox(false);
    setEditItemHelperText({
      poQuantity: '',
      unitCost: ''
    });
    if (!isEmpty(selected)) {
      getItemsOfPurchaseOrder({
        purchaseOrderId: selected?._id,
        poStatus: PO_STATUS.nonConfirm
      });
    }
  }, [itemsOfNonConfirmPOPageLimit, itemsOfNonConfirmPOPageNumber, sortValue]);

  useEffect(() => {
    setEdit(false);
    setEditInput(false);
    setDeleteProduct(false);

    if (itemAddedToNonConfirmPO) {
      if (!isEmpty(selected)) {
        getAggregatedDataOfNonConfirmPO({ poId: selected?._id });
      }
    }
  }, [itemAddedToNonConfirmPO]);

  useEffect(() => {
    if (poItemUpdated) {
      getAggregatedDataOfNonConfirmPO({ poId: selected?._id });
      if (poItemUpdated) dispatch(SetPurchaseOrderState({ field: 'poItemUpdated', value: false }));
    }
  }, [poItemUpdated]);

  useEffect(() => {
    if (!isEmpty(purchaseOrder) && !isEmpty(purchaseOrder?.supplierId)) {
      setSupplierDetails(purchaseOrder?.supplierId);
    } else {
      setSupplierDetails('');
    }
    if (!isEmpty(purchaseOrder)) {
      setLocalPurchaseOrder(purchaseOrder);
      setShipping(Number(purchaseOrder?.shippingPrice));
      setDiscount(Number(purchaseOrder?.discount));
      if (purchaseOrder?.discountType) {
        if (purchaseOrder?.discountType === DISCOUNT_TYPE.percentage) {
          setIsFixedRatio(false);
        } else {
          setIsFixedRatio(true);
        }
      } else {
        setIsFixedRatio(true);
      }
    } else {
      setLocalPurchaseOrder('');
      setShipping(0);
      setDiscount(0);
    }
  }, [purchaseOrder]);

  useEffect(() => {
    if (poUpdated) {
      setEdit(false);
      setEditInput(false);
    }
  }, [poUpdated]);

  useEffect(() => {
    if (itemsOfPO?.length) {
      const addIsEdit = itemsOfPO?.map((item) => ({ ...item, isEdit: false }));
      setLocalItemsOfPO(addIsEdit);
      const poItemsIdList = itemsOfPO.map((row) => row.poQueueItemId);
      setPOItemIds(poItemsIdList);

      if (
        difference(poItemsIdList, selectedPOItems).length === 0
        && selectedPOItems?.length
      ) {
        setHeaderCheckBox(true);
      } else setHeaderCheckBox(false);
    } else {
      setLocalItemsOfPO([]);
      setPOItemIds([]);
      setSelectedPOItems([]);
      setHeaderCheckBox(false);
    }
  }, [itemsOfPO]);

  useEffect(() => {
    if (!otherSuccess && !otherLoading) {
      setAttachmentLoading(false);
    }
  }, [otherSuccess, otherLoading]);

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
    if (!isEmpty(selected)) {
      const filt = localPONumbers?.filter(
        (item) => item?._id !== selected?._id
      );
      const fin = localPONumbers?.find((item) => item?._id === selected?._id);
      const temp = [fin];
      const fina = temp.concat(filt);
      setLocalPONumbers(fina);
    }
  }, [selected]);

  useEffect(() => {
    if (
      difference(poItemIds, selectedPOItems).length === 0
      && selectedPOItems?.length
    ) {
      setHeaderCheckBox(true);
    } else setHeaderCheckBox(false);
  }, [selectedPOItems]);

  useEffect(() => () => {
    if (!window.location.pathname.includes('/purchasing')) {
      dispatch(
        SetPaymentDetailState({ field: 'paymentDetailPageLimit', value: 100 })
      );
      dispatch(
        SetPaymentDetailState({ field: 'paymentDetailPageNumber', value: 1 })
      );

      dispatch(
        SetPurchaseOrderState({
          field: 'confirmPOsFilter',
          value: {
            supplier: {
              id: '',
              value: '',
              label: ''
            }
          }
        })
      );

      dispatch(SetPurchaseOrderState({ field: 'itemsOfNonConfirmPOPageNumber', value: 1 }));
      dispatch(SetPurchaseOrderState({ field: 'itemsOfNonConfirmPOPageLimit', value: 100 }));

      dispatch(SetPoQueueItemState({ field: 'addItemsToPoQueuePageNumber', value: 1 }));
      dispatch(SetPoQueueItemState({ field: 'addItemsToPoQueuePageLimit', value: 100 }));
      dispatch(SetPoQueueItemState({
        field: 'addItemsToPoQueueFilters',
        value: {
          searchByKeyWords: {
            title: '',
            stockNumber: '',
            mfgPartNo: ''
          },
          supplierId: '',
          extendedFilters: []
        }
      }));
      dispatch(
        SetPurchaseOrderState({ field: 'viewConfirmPOPageLimit', value: 100 })
      );
      dispatch(
        SetPurchaseOrderState({ field: 'viewConfirmPOPageNumber', value: 1 })
      );
    }

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
        field: 'poAttachments',
        value: []
      })
    );
    dispatch(
      SetPurchaseOrderState({
        field: 'itemsOfPO',
        value: []
      })
    );
  }, []);

  useEffect(() => {
    setShipping(0);
    setDiscount(0);
  }, [poConfirmed, poDeleted, poNumbers]);

  useEffect(() => {
    setLocalPurchaseOrder({
      ...localPurchaseOrder,
      discountType: isFixedRatio
        ? DISCOUNT_TYPE.fixed
        : DISCOUNT_TYPE.percentage
    });
  }, [isFixedRatio]);

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
    }
  }, [purchaseOrder?._id]);

  useEffect(() => {
    if (!updatePoAttachmentLoading) {
      setDeleteAttachment(false);
      setDeleteAttachmentId('');
    }
  }, [updatePoAttachmentLoading]);

  return (
    <>
      <>
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
          <Stack alignItems="center" direction="row" spacing={3}>
            <Box
              component="span"
              className="icon-left pointer"
              onClick={() => navigate('/purchasing/all-po')}
            />
            <h2 className="m-0 pl-2">Non Confirm PO</h2>
          </Stack>
          <Box display="flex" gap={2} mt={-0.125}>
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
                !editPurchasing
                || edit
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
                || editInput
                || !editPurchasing
                || localItemsOfPO?.map((item) => item?.isEdit)?.includes(true)
                || !localPONumbers?.length
                || !localItemsOfPO?.length
              }
              text="Confirm PO"
              letterSpacing="0px"
              variant="contained"
              startIcon={<CheckCircleIcon sx={{ color: '#fFF' }} />}
              padding="4px 16px 4px 15px"
              onClick={handleConfirmPO}
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
              disabled={edit || editInput || !localPONumbers?.length || !editPurchasing}
              className="icon-button danger-button"
              startIcon={<Box component="span" className="icon-trash" />}
              onClick={() => setDeleteProduct(true)}
            />
          </Box>
        </Stack>
        <Grid container columnSpacing={3}>
          <Grid item md={1} mt="2px">
            <Box sx={{ maxHeight: '790px', overflow: 'auto' }}>
              {localPONumbers.map((item) => (
                <Box
                  className="pointer"
                  color={
                    selected?.poId === item?.poId ? '#3C76FF' : '#5A5F7D'
                  }
                  px="12px"
                  key={item?._id}
                  onClick={() => setSelected(item)}
                >
                  {item?.poId}
                  <Divider
                    sx={{
                      marginTop: '9px',
                      marginRight: '12px',
                      marginBottom: '12px'
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
                  mb={2}
                >
                  <Box component="h3" className="m-0">
                    <Box component="span" mr={0.625}>
                      {' '}
                      PO Details:
                    </Box>
                    {selected?.poId || '--'}
                  </Box>
                  {!edit && (
                    <Button
                      disabled={!localPONumbers?.length || !editPurchasing}
                      text="Edit"
                      padding="4px 16px 4px 16px"
                      letterSpacing="0px"
                      startIcon={<span className="icon-edit" />}
                      onClick={() => {
                        setEdit(true);
                      }}
                    />
                  )}
                  {edit && (
                    <Box display="flex" gap={2}>
                      <Button
                        text="Cancel"
                        startIcon={
                          <CancelOutlinedIcon sx={{ color: '#3C76FF' }} />
                        }
                        onClick={() => {
                          setLocalPurchaseOrder(purchaseOrder);
                          setEdit(false);
                          setShipping(purchaseOrder?.shippingPrice || 0);
                          setDiscount(purchaseOrder?.discount || 0);
                        }}
                        padding="4px 17px 4px 15px"
                        letterSpacing="0px"
                      />
                      <Button
                        text="Save Changes"
                        variant="contained"
                        startIcon={<span className="icon-Save" />}
                        onClick={() => {
                          handlePODetailSave({ editAction: 'poDetailEdit' });
                          // setShipping(localPurchaseOrder?.shippingPrice || 0);
                          // setDiscount(localPurchaseOrder?.discount || 0);
                        }}
                      />
                    </Box>
                  )}
                </Box>
                <Grid position="relative" container columns={8} columnSpacing={3}>
                  {(purchaseOrderLoading || purchaseOrderUpdateLoading) ? <LoaderWrapper /> : null}

                  <Grid item sm={2}>
                    <Input
                      autoComplete="off"
                      disabled
                      label="PO Order Date & Time"
                      width="100%"
                      marginBottom="16px"
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
                      marginBottom="16px"
                      onChange={(e) => handlePODetailsChange(e)}
                      value={
                        moment(new Date(localPurchaseOrder?.expectedDeliveryDate))
                          ?.toISOString()
                          ?.slice(0, 10) || '--'
                      }
                      disabled={!edit}
                      label="Expected Date"
                      type="date"
                      width="100%"
                      minValue={new Date().toISOString().split('T')[0]}
                    />
                  </Grid>
                </Grid>
                <Grid container columns={8} columnSpacing={3}>
                  <Grid item sm={4}>
                    <Input
                      autoComplete="off"
                      name="wareHouseInstrutions"
                      onChange={(e) => handlePODetailsChange(e)}
                      value={localPurchaseOrder?.wareHouseInstrutions || ''}
                      disabled={!edit}
                      label="Warehouse instruction"
                      width="100%"
                      marginBottom="0"
                      placeholder="Warehouse instruction"
                    />
                  </Grid>
                  <Grid item sm={4}>
                    <Input
                      autoComplete="off"
                      name="supplierNote"
                      onChange={(e) => handlePODetailsChange(e)}
                      value={localPurchaseOrder?.supplierNote || ''}
                      disabled={!edit}
                      label="Note to supplier"
                      width="100%"
                      marginBottom="0"
                      placeholder="Note to supplier"
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
                    <Box component="h3" mb="18px">
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
              </Grid>
              <Grid position="relative" item md={3}>
                <Box border="1px solid #D9D9D9" p={2}>
                  <Box display="flex" mb="5px" alignItems="center" justifyContent="space-between">
                    <Box component="h3" mb={0}>Discount Type</Box>
                    {getAggregatedDataOfNonConfirmPOLoading ? <LoaderWrapper /> : null}
                    <Button
                      disabled={edit || !editPurchasing}
                      className="icon-button"
                      letterSpacing="0px"
                      onClick={() => {
                        setEditInput(!editInput);
                        if (editInput) {
                          const totalPrice = aggregatdData?.quantity
                            ? aggregatdData?.total?.toFixed(2)
                            : 0;

                          const totalDiscount = aggregatdData?.quantity
                            ? isFixedRatio
                              ? Number(discount || 0)
                              : ((Number(aggregatdData?.total))
                                * (discount / 100)
                              )
                            : 0;
                          if (totalPrice < totalDiscount) {
                            dispatch(
                              SetPurchaseOrderNotifyState({
                                message: 'Discount should be less than total price !',
                                type: 'info'
                              })
                            );

                            setLocalPurchaseOrder({
                              ...localPurchaseOrder,
                              discount: purchaseOrder?.discount,
                              shippingPrice: purchaseOrder?.shippingPrice
                            });
                          } else {
                            handlePODetailSave({ editAction: 'discountUpdate' });
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
                      // value={isFixedRatio}
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
                      // value={!isFixedRatio}
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
                            // setDiscount(e.target.value);
                          } else {
                            e.target.value = '';
                          }
                        }}
                        value={!editInput ? isFixedRatio ? `$${localPurchaseOrder.discount || 0}` : `${localPurchaseOrder.discount || 0}%` : localPurchaseOrder.discount || ''}
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
                            // shanza
                            handlePODetailsChange(e);
                            // setShipping(e.target.value);
                          } else {
                            e.target.value = '';
                          }
                        }}
                        value={!editInput ? isFixedRatio ? `$${localPurchaseOrder.shippingPrice || 0}` : `${localPurchaseOrder.shippingPrice || 0}%` : localPurchaseOrder.shippingPrice || ''}
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
                      {aggregatdData?.quantity ? aggregatdData?.total?.toFixed(2) || 0 : 0}
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
                            * ((Number(purchaseOrder?.shippingPrice)) / 100))?.toFixed(2)}` : '$0'}

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
                          : `$${((Number(aggregatdData?.total))
                            * (purchaseOrder?.discount / 100)
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
                          ? (((Number(aggregatdData?.total || 0)
                            + Number(purchaseOrder?.shippingPrice || 0))
                            - (Number(purchaseOrder?.discount || 0))).toFixed(2)) > 0
                            ? `$${((Number(aggregatdData?.total || 0)
                              + Number(purchaseOrder?.shippingPrice || 0))
                              - (Number(purchaseOrder?.discount || 0))).toFixed(2)
                            }` : 0
                          : `$${(((Number(aggregatdData?.total || 0)))
                            + (Number((aggregatdData?.total)
                              * Number(purchaseOrder?.shippingPrice)) / 100)
                            - (Number(aggregatdData?.total))
                            * ((purchaseOrder?.discount) / 100))?.toFixed(2)
                          }`
                        : '$0'}
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
                      {(savePoAttachmentLoading || getPoAttachmentLoading)
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
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <h3 className="m-0">Added Items</h3>
          <Box display="flex" gap={16 / 8}>
            <Button
              disabled={
                localItemsOfPO?.map((item) => item?.isEdit)?.includes(true)
                || !editPurchasing
                || !localPONumbers?.length
              }
              text="Add Item"
              onClick={() => setAddItem(true)}
              padding="4px 15px 4px 15px"
              letterSpacing="0px"
              width="113px"
              startIcon={(
                <AddCircleOutlineOutlinedIcon
                  sx={{
                    color:
                      localItemsOfPO
                        ?.map((item) => item?.isEdit)
                        ?.includes(true) || !localPONumbers?.length || !editPurchasing
                        ? '#979797'
                        : '#3C76FF'
                  }}
                />
              )}
            />
            <Button
              text="Remove Selected"
              padding="4px 11px 4px 17px"
              width="166px"
              startIcon={<Box component="span" className="icon-trash" />}
              color={selectedPOItems?.length ? 'error' : 'primary'}
              onClick={() => {
                setDeleteMsg('Delete Selected Items!');
                setDeletePOItems(selectedPOItems);
                setDeleteItems(true);
              }}
              disabled={
                !selectedPOItems?.length
                || !editPurchasing
                || localItemsOfPO?.map((item) => item?.isEdit)?.includes(true)
              }
            />
          </Box>
        </Box>
        <Box mt={23 / 8} position="relative">
          <Table
            checkbox
            fixed
            tableHeader={nonConfirmPoHeader}
            height="520px"
            bodyPadding="8px 12px"
            isChecked={headerCheckBox}
            handleHeaderCheckBoxClicked={handleHeaderCheckBoxClicked}
            sortableHeader={itemsOfNonConfirmPOSort}
            handleSort={handleSortChange}
            sortValue={sortValue}
          >
            {(itemsOfPOLoading || poItemUpdatedLoading) ? <LoaderWrapper /> : null}
            {localItemsOfPO?.length ? localItemsOfPO?.map((row) => (
              <TableRow
                hover
                key={row?.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell
                  component="th"
                  scope="row"
                  style={{ minWidth: 250, width: '22%' }}
                >
                  <Box
                    component="span"
                    display="flex"
                    alignItems="center"
                    gap={1.5}
                  >
                    <CheckBox
                      marginBottom="0"
                      className="body-checkbox"
                      checked={selectedPOItems?.includes(
                        String(row?.poQueueItemId)
                      )}
                      onClick={(e) => handleCheckBoxClick(e, row?.poQueueItemId)}
                    />
                    <Stack direction="row" spacing={1}>
                      {row?.product?.images?.primaryImageUrl
                        ? (
                          <HoverImage
                            image={GetS3ImageUrl({
                              bucketName: 'productImage',
                              key: row?.product?.images?.primaryImageUrl
                            })}
                            onError={(e) => handleImageError(e, Product)}
                          >
                            <img
                              width={40}
                              height={40}
                              onError={(e) => handleImageError(e, Product)}
                              src={GetS3ImageUrl({
                                bucketName: 'productImage',
                                key: row?.product?.images
                                  ?.primaryImageUrl
                              })}
                              alt=""
                            />
                          </HoverImage>
                        ) : (
                          <img
                            width={40}
                            height={40}
                            onError={(e) => handleImageError(e, Product)}
                            src={Product}
                            alt=""
                          />
                        )}
                      <Box>
                        <Box
                          component="span"
                          className="product-name-clamp"
                          whiteSpace="normal"
                        >
                          {row?.product?.title?.length > 30
                            ? (
                              <Tooltip
                                placement="top-start"
                                arrow
                                title={row?.product?.title}
                              >
                                <span>
                                  {row?.product?.title || '--'}
                                </span>
                              </Tooltip>
                            )
                            : (
                              <span>
                                {row?.product?.title || '--'}
                              </span>
                            )}

                        </Box>
                        <Stack spacing={1} direction="row" fontSize="10px">
                          <Box component="span" color="#979797">
                            UPC:
                            <Box component="span" color="#5A5F7D" ml={0.3}>
                              {row?.product?.primaryUpc || '--'}
                            </Box>
                          </Box>
                          <Box component="span" color="#979797">
                            Stock Number:
                            <Box component="span" color="#5A5F7D" ml={0.3}>
                              {row?.product?.stockNumber || '--'}
                            </Box>
                          </Box>
                        </Stack>
                      </Box>
                    </Stack>
                  </Box>
                </TableCell>
                <TableCell>{row?.product?.mfgPartNo}</TableCell>

                <TableCell>
                  <Input
                    autoComplete="off"
                    isError
                    name="poQuantity"
                    disabled={!row?.isEdit}
                    value={!row?.isEdit
                      ? row?.poQueueItem?.poQuantity
                      : row?.poQueueItem?.poQuantity || ''}
                    width="72px"
                    marginBottom="0px"
                    onChange={(e) => {
                      if (REGEX_FOR_NUMBERS.test(e.target.value)) {
                        const { poQueueItem } = row;
                        const objCopy = { ...poQueueItem };
                        objCopy.poQuantity = e.target.value;
                        row.poQueueItem = objCopy;
                        setEditPo(row);
                        handleOnchange(e, row.poQueueItem?._id);
                      } else {
                        e.target.value = row.poQueueItem.poQuantity;
                      }
                    }}
                    helperText={
                      editItemHelperText?._id === row?.poQueueItem?._id
                      && editItemHelperText?.poQuantity.length > 0
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    autoComplete="off"
                    isError
                    name="unitCost"
                    disabled={!row?.isEdit}
                    value={!row?.isEdit
                      ? `$${Number(row?.poQueueItem?.unitCost || 0)?.toFixed(2)}`
                      : row?.poQueueItem?.unitCost || ''}
                    width="72px"
                    marginBottom="0px"
                    onChange={(e) => {
                      if (REGEX_FOR_DECIMAL_NUMBERS.test(e.target.value)) {
                        const { poQueueItem } = row;
                        const objCopy = { ...poQueueItem };
                        objCopy.unitCost = e.target.value;
                        row.poQueueItem = objCopy;
                        setEditPo(row);
                        handleOnchange(e, row.poQueueItem?._id);
                      } else {
                        e.target.value = row.poQueueItem.unitCost;
                      }
                    }}
                    helperText={
                      editItemHelperText?._id === row?.poQueueItem?._id
                      && editItemHelperText.unitCost.length > 0
                    }
                  />
                </TableCell>
                <TableCell>
                  $
                  {(Number(row?.poQueueItem?.poQuantity)
                    * Number(row?.poQueueItem?.unitCost) || 0)?.toFixed(2)}
                </TableCell>
                <TableCell>{row?.user?.name || '--'}</TableCell>
                <TableCell>
                  {moment(new Date(row?.poQueueItem?.timestamp)).format(
                    'MMM DD YYYY'
                  ) || '--'}
                </TableCell>
                <TableCell>
                  {row?.poQueueItem?.receivedQuantity || '--'}
                </TableCell>
                <TableCell>
                  {row?.poQueueItem?.backOrderQuantity || '--'}
                </TableCell>
                <TableCell>
                  {row?.poQueueItem?.quantityCancelled || '--'}
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={2}>
                    <Box
                      className={`icon-${row?.isEdit
                        ? 'Save color-primary'
                        : 'edit'
                        } pointer`}
                      onClick={() => {
                        handleEditRow(row);
                      }}
                    />
                    <Box
                      className={`icon-trash ${row?.isEdit ? 'disabled' : 'pointer'}`}
                      onClick={() => {
                        if (editPurchasing) {
                          if (
                            !localItemsOfPO
                              ?.map((item) => item?.isEdit)
                              ?.includes(true)
                          ) {
                            setDeleteMsg('Delete The Item!');
                            setDeletePOItems([row?.poQueueItem?._id]);
                            setDeleteItems(true);
                          }
                        }
                      }}
                    />
                  </Box>
                </TableCell>
              </TableRow>
            )) : (
              !itemsOfPOLoading && totalItemsOfPO === 0 && (
                <TableRow>
                  <TableCell sx={{ borderBottom: '24px' }} colSpan={12} align="center">
                    <Box textAlign="center" display="flex" alignItems="center" justifyContent="center" height="250px">
                      {/* <img className="nodata-table-img" src={noDataFound} height="100%" style={{ maxWidth: '100%' }} alt="no-Data" /> */}
                    </Box>
                  </TableCell>
                </TableRow>
              )
            )}
          </Table>
          <Pagination
            componentName="purchasing"
            perPageRecord={itemsOfPO?.length || 0}
            total={totalItemsOfPO}
            totalPages={Math.ceil(
              totalItemsOfPO / itemsOfNonConfirmPOPageLimit
            )}
            offset={totalItemsOfPO}
            pageNumber={itemsOfNonConfirmPOPageNumber}
            pageLimit={itemsOfNonConfirmPOPageLimit}
            handlePageLimitChange={handlePageLimit}
            handlePageNumberChange={handlePageNumber}
            position="relative"
            width="0px"
          />
        </Box>
        <DeleteModal
          show={deleteProduct}
          lastTitle="Delete This PO!"
          onClose={() => setDeleteProduct(false)}
          onDelete={handleDeletePO}
          loading={purchaseOrderLoading}
        />
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
      <DeleteModal
        show={deleteItems}
        lastTitle={deleteMsg}
        onClose={() => {
          setDeleteItems(false);
          setDeletePOItems([]);
        }}
        loading={poItemDeletedLoading}
        onDelete={() => {
          setDeleteItems(false);
          handleDeletePOItem();
        }}
      />
      {addItem
        ? (
          <AddItems
            open={addItem}
            onClose={() => setAddItem(false)}
            supplier={localPurchaseOrder?.supplierId}
            poId={localPurchaseOrder?._id}
          />
        ) : null}

      <ItemDelete
        show={deleteAttachment}
        lastTitle="Delete This File!"
        onClose={() => {
          setDeleteAttachment(false);
          setDeleteAttachmentId('');
        }}
        loading={updatePoAttachmentLoading}
        onDelete={() => {
          handleDeletePOAttachment();
          setDeleteAttachmentId('');
        }}
      />
    </>
  );
};

export default NonConfrimPo;
