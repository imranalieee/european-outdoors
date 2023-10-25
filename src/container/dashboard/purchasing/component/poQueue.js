import React, { useState, useEffect } from 'react';
import moment from 'moment';
import {
  Box, Stack, TableCell, TableRow, Tooltip
} from '@mui/material';
import {
  debounce, isEmpty, uniq, difference, camelCase
} from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import { utils, read } from 'xlsx';
// icons
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
// component
import CheckBox from '../../../../components/checkbox/index';
import LoaderWrapper from '../../../../components/loader/index';
import SearchInput from '../../../../components/searchInput/index';
import Button from '../../../../components/button/index';
import Table from '../../../../components/ag-grid-table/index';
import Pagination from '../../../../components/pagination/index';
import AutoComplete from '../../../../components/autoComplete';
import MultipleSelect from '../../../../components/multipleCheckbox/index';
import Input from '../../../../components/inputs/input/index';
import HoverImage from '../../../../components/imageTooltip';
import UploadModal from './modals/upload';
import DeleteModal from './modals/delete';
// redux
import {
  CreatePurchaseOrder,
  GetPoQueueItems,
  GetAggregatedDataOfPOQueue,
  SetPoQueueItemState,
  DeletePOQueueItems,
  SetPurchaseOrderState,
  DownloadPOQueueItems,
  SaveSelectedPOQueueItemsId,
  UpdatePOQueueItem,
  GetAndSaveUploadedSheetInDb,
  SetPoQueueItemNotifyState,
  SetPurchaseOrderNotifyState,
  SetPaymentDetailState
} from '../../../../redux/slices/purchasing';
import {
  GetSuppliers
} from '../../../../redux/slices/supplier-slice';
import {
  GetS3PreSignedUrl,
  SetOtherState
} from '../../../../redux/slices/other-slice';

// helpers
import { UploadDocumentOnS3, GetS3ImageUrl } from '../../../../../utils/helpers';
// images
import Product from '../../../../static/images/no-product-image.svg';
import noData from '../../../../static/images/no-data-table.svg';

import {
  poQueueHeader, REGEX_FOR_NUMBERS, REGEX_FOR_DECIMAL_NUMBERS, poQueueHeaderSort
} from '../../../../constants/index';
import ProductHeaderWrapper from '../../products/style';
import PurchasingWrapper from '../style';

const headerFormat = [
  'primaryUpc',
  'stockNumber',
  'mfgPart',
  'title',
  'supplierCode',
  'costPrice',
  'qty',
  'smu',
  'updateStatus'
];

const PoQueue = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    poQueueItemLoading,
    loading: pOQueueItemLoading,
    success: poQueueSuccess,
    addItemsToPoQueueFilters,
    addItemsToPoQueuePageLimit,
    addItemsToPoQueuePageNumber,
    poQueueItems,
    totalPoQueueItems,
    poQueueItemDeleted,
    aggregatedDataOfPOQueue,
    poQueueItemUpdated,
    jobTriggered,
    updatePOQueueItemLoading,
    deletePOQueueItemsLoading
  } = useSelector((state) => state.poQueueItem);

  const {
    poCreated,
    saveSelectedQueueItemsParams,
    queueItemsDownloaded,
    newlyAddedPoId
  } = useSelector((state) => state.purchaseOrder);

  const {
    user
  } = useSelector((state) => state.auth);

  const { suppliers = [] } = useSelector((state) => state.supplier);

  const { user: { permissions: { editPurchasing }, userId } } = useSelector((state) => state.auth);

  const {
    preSignedUrl,
    fileUploadKey,
    success: otherSuccess,
    loading: otherLoading
  } = useSelector((state) => state.other);

  const [selectedQueueItems, setSelectedQueueItems] = useState([]);
  const [queueItemIds, setQueueItemIds] = useState([]);
  const [deleteQueueItems, setDeleteQueueItems] = useState([]);
  const [Selected, setSelected] = useState({
    poQty: 0,
    totalUnitCost: 0,
    totalLineCost: 0,
    stocks: 0,
    fba: 0,
    onOrder: 0,
    backOrderQuantity: 0,
    reservedQuantity: 0
  });
  const [editPoQueueItem, setEditPoQueueItem] = useState('');
  const [headerCheckBox, setHeaderCheckBox] = useState(false);
  const [searchByTitle, setSearchByTitle] = useState('');
  const [searchByStockNumber, setSearchByStockNumber] = useState('');
  const [searchByMfgNumber, setSearchByMfgNumber] = useState('');
  const [deleteMsg, setDeleteMsg] = useState('Delete The Item!');
  const [isEdit, setIsEdit] = useState(false);
  const [editItemHelperText, setEditItemHelperText] = useState({
    poQuantity: '',
    unitCost: ''
  });
  const [searchBySupplier, setSearchBySupplier] = useState({
    id: '',
    value: '',
    label: ''
  });
  const [deleteProduct, setDeleteProduct] = useState(false);

  const [uploadFile, setUploadFile] = useState(false);
  const [attachmentName, setAttachmentName] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [attachmentLoading, setAttachmentLoading] = useState(false);
  const [validPOQueue, setValidPOQueue] = useState(false);
  const [editedItemId, setEditedItemId] = useState(false);

  const [sortValue, setSortValue] = useState({});

  function createData(
    product,
    partNo,
    supplier,
    cost,
    price,
    total,
    stock,
    fba,
    onOrder,
    reserved,
    order,
    user,
    date,
    fbaItem,
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
      fba,
      onOrder,
      reserved,
      order,
      user,
      date,
      fbaItem,
      action
    };
  }
  const data = [];

  for (let i = 0; i <= 10; i += 1) {
    data.push(
      createData(
        <Stack direction="row" spacing={1}>
          <HoverImage image={Product}>
            <img
              width={40}
              height={40}
              src={Product}
              alt=""
            />
          </HoverImage>
          <Box>
            <Box
              component="span"
              sx={{
                textOverfow: 'auto',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
              maxWidth="250px"
              display="block"
            >
              Rapido Boutique Collection Flipper Open Heel Adjustable
              Fin - LILAC S/M - Lialac No.349
            </Box>
            <Stack spacing={1} direction="row" fontSize="10px">
              <Box component="span" color="#979797">
                UPC:
                <Box component="span" color="#5A5F7D" ml={0.3}>194773048809</Box>
              </Box>
              <Box component="span" color="#979797">
                Stock Number:
                <Box component="span" color="#5A5F7D" ml={0.3}>RQFA68-PR-S/M</Box>
              </Box>
            </Stack>
          </Box>
        </Stack>,
        'FA68-ATL-FA683492',
        'ATL-Q',
        <Input width="49px" value="0000" marginBottom="0px" />,
        <Input width="68px" value="$580.00" marginBottom="0px" />,
        <Input width="68px" value="$580.00" marginBottom="0px" />,
        '0',
        '3',
        '65',
        '74',
        '144',
        'Amanda',
        'Aug 29 2022 15:58',
        <Box>
          <CheckCircleIcon
            sx={{ color: '#0FB600', width: 16 }}
          />
          {/* <CheckCircleOutlinedIcon sx={{ color: '#979797', width: 16 }} /> */}
        </Box>,
        <Box display="flex" gap={2}>
          <Box
            className="icon-edit pointer "
          />
          <Box
            className="icon-trash pointer "
            onClick={() => setDeleteProduct(true)}
          />
        </Box>
      )
    );
  }
  const names = [
    'Orders',
    'FBA',
    'SMU',
    'View All'
  ];

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

  const getPoQueueItems = () => {
    const skip = (addItemsToPoQueuePageNumber - 1) * addItemsToPoQueuePageLimit;
    const limit = addItemsToPoQueuePageLimit;

    dispatch(GetPoQueueItems({
      skip,
      limit,
      filters: addItemsToPoQueueFilters,
      sortBy: sortValue
    }));
  };

  const getAggregatedDataOfPOQueue = () => {
    dispatch(GetAggregatedDataOfPOQueue());
  };

  const getSuppliers = () => {
    dispatch(GetSuppliers({ fetchAll: true }));
  };

  const handlePageNumber = (e) => {
    dispatch(SetPoQueueItemState({
      field: 'addItemsToPoQueuePageNumber', value: e
    }));
  };

  const handlePageLimit = (e) => {
    dispatch(SetPoQueueItemState({
      field: 'addItemsToPoQueuePageNumber', value: 1
    }));
    dispatch(SetPoQueueItemState({
      field: 'addItemsToPoQueuePageLimit', value: e
    }));
  };

  const handleSearch = debounce((e) => {
    const { value, name: key } = e.target;
    dispatch(SetPoQueueItemState({
      field: 'addItemsToPoQueuePageNumber', value: 1
    }));
    dispatch(SetPoQueueItemState({
      field: 'addItemsToPoQueueFilters',
      value: {
        ...addItemsToPoQueueFilters,
        searchByKeyWords: {
          ...addItemsToPoQueueFilters.searchByKeyWords,
          [key]: value
        }
      }
    }));
  }, 500);

  const handleSearchSupplier = debounce((supplierId) => {
    dispatch(SetPoQueueItemState({
      field: 'addItemsToPoQueuePageNumber', value: 1
    }));
    dispatch(SetPoQueueItemState({
      field: 'addItemsToPoQueueFilters',
      value: {
        ...addItemsToPoQueueFilters,
        supplierId
      }
    }));
  }, 500);

  const handleExtendedFilter = (e) => {
    dispatch(SetPoQueueItemState({
      field: 'addItemsToPoQueueFilters',
      value: {
        ...addItemsToPoQueueFilters,
        extendedFilters: e.target.value
      }
    }));
  };

  const handleUploadAttachmentOnS3 = async () => {
    const response = await UploadDocumentOnS3({ preSignedUrl, file: attachment });
    if (response) {
      dispatch(
        GetAndSaveUploadedSheetInDb({
          userId,
          fileUploadKey
        })
      );
    } else {
      setAttachmentLoading(false);
      dispatch(SetPoQueueItemNotifyState({ message: 'File uploading failed on S3', type: 'error' }));
    }
  };

  const validateHeaders = (target, pattern) => {
    let isHeadersOk = true;
    target = target.map((value) => camelCase(value.toLowerCase().trim()));
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
        dispatch(SetPoQueueItemState({ message: 'Supported extension is csv && xlsx' }));
        return;
      }

      setAttachment(file);
      setAttachmentName(fileName);

      const reader = new FileReader();
      reader.readAsArrayBuffer(e.target.files[0]);
      reader.onload = async (event) => {
        const fileData = event.target.result;
        const workbook = read(fileData, { type: 'array', cellDates: true });
        const sheetName = workbook.SheetNames[0];

        const worksheet = workbook.Sheets[sheetName];

        const poQueueData = utils.sheet_to_json(worksheet, { header: 0, defval: '' });

        if (poQueueData && poQueueData?.length) {
          const fileHeaders = Object.keys(poQueueData[0]);

          const headerFormatValidated = validateHeaders(
            fileHeaders,
            headerFormat
          );

          if (headerFormatValidated) {
            setValidPOQueue(true);
          } else {
            setAttachmentLoading(false);
            dispatch(
              SetPoQueueItemNotifyState({
                message: 'Error in sheet header format',
                type: 'error'
              })
            );
          }
        } else {
          dispatch(
            SetPoQueueItemNotifyState({
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
      dispatch(SetPoQueueItemState({ message: 'Supported extension is csv && xlsx' }));
      return;
    }
    const formattedFileName = attachmentName.replace(/\s/g, '-');

    if (validPOQueue) {
      setAttachmentLoading(true);
      dispatch(GetS3PreSignedUrl({
        fileName: `${formattedFileName}-${moment().format('YYYY-MM-DD HH:mm:ss')}.${extension}`,
        fileType: attachment.type,
        fileExtension: extension,
        uploadBucket: 'pOQueueDocs'
      }));
    } else {
      dispatch(
        SetPoQueueItemNotifyState({
          message: 'Upload Attachment is not valid',
          type: 'error'
        })
      );
    }
  };

  const handleUploadProductsSheetClose = () => {
    setUploadFile(false);
    setAttachment(null);
    setAttachmentName('');
    setAttachmentLoading(false);
  };

  const supplierItems = suppliers.map((item) => ({
    id: item._id,
    value: item._id,
    label: item.code
  }));
  const handleHeaderCheckBoxClicked = (e) => {
    const allQueueItemIds = poQueueItems?.map((item) => (item._id));
    if (e.target.checked) {
      setHeaderCheckBox(true);
      const allQueueItems = selectedQueueItems.concat(allQueueItemIds);
      const uniqItems = uniq(allQueueItems);
      setSelectedQueueItems(uniqItems);
    } else {
      const filteredId = selectedQueueItems.filter(
        (id) => !allQueueItemIds.includes(id)
      );

      setHeaderCheckBox(false);
      const uniqItems = uniq(filteredId);
      setSelectedQueueItems(uniqItems);
    }
  };

  const handleCheckBoxClick = (e, queueItemId) => {
    if (e.target.checked) {
      setSelectedQueueItems([
        ...selectedQueueItems,
        queueItemId
      ]);

      selectedQueueItems.includes();
    } else {
      const queueItemIdsList = selectedQueueItems.filter((id) => id !== queueItemId);
      const uniqItems = uniq(queueItemIdsList);
      setSelectedQueueItems([...uniqItems]);
    }
  };

  const handleCreatePo = () => {
    const itemsData = [];
    selectedQueueItems?.forEach((item) => {
      const findQueue = poQueueItems?.find((row) => row?._id === item);
      if (findQueue) {
        itemsData?.push({
          productId: findQueue?.product?._id,
          poQuantity: findQueue?.poQuantity,
          unitCost: Number(findQueue?.unitCost).toFixed(2)
        });
      }
    });
    if (itemsData.length) {
      const isZero = itemsData?.map((item) => {
        if (item?.poQuantity === ''
          || Number(item?.poQuantity) === 0) {
          return true;
        }
        return false;
      });
      if (isZero?.includes(true)) {
        dispatch(SetPoQueueItemNotifyState({
          message: 'Quantity must be greater than 0 of each Product. !', type: 'error'
        }));
      } else {
        dispatch(CreatePurchaseOrder({ items: itemsData }));
      }
    }
  };

  const handleDownloadClickEvent = () => {
    if (selectedQueueItems.length) {
      dispatch(SaveSelectedPOQueueItemsId({ selectIds: selectedQueueItems }));
    }
  };

  const handleEditItem = () => {
    if (!isEmpty(editPoQueueItem)) {
      const errors = {};
      Object.keys(editPoQueueItem)?.forEach((key) => {
        if ((key === 'poQuantity' || key === 'unitCost') && editPoQueueItem[key] === '') {
          errors[key] = ' ';
          errors._id = editPoQueueItem._id;
        } else {
          errors[key] = '';
        }
      });
      setEditItemHelperText((prevHelperText) => ({
        ...prevHelperText,
        ...errors
      }));

      if (Object.values(errors).every((errorValue) => errorValue === '')) {
        const findItem = poQueueItems?.find((item) => item?._id === editPoQueueItem?._id);
        const { poQuantity, unitCost } = findItem;
        if (Number(poQuantity) !== Number(editPoQueueItem?.poQuantity)
          || Number(unitCost) !== Number(editPoQueueItem?.unitCost)) {
          dispatch(UpdatePOQueueItem({
            poQueueItemId: editPoQueueItem?._id,
            updateParams: {
              poQuantity: editPoQueueItem?.poQuantity,
              unitCost: Number(editPoQueueItem?.unitCost).toFixed(2)
            }
          }));
        } else {
          setEditedItemId('');
          setEditPoQueueItem({});
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

  const handleDeletePOQueueItem = () => {
    if (deleteQueueItems?.length) {
      dispatch(DeletePOQueueItems({
        items: deleteQueueItems
      }));
    }
  };

  const handleOnchange = (e, _id) => {
    const { name: key, value } = e.target;

    const errors = { ...editItemHelperText };

    if (key === 'poQuantity') {
      if (!value || Number(value) === 0) {
        errors.poQuantity = ' ';
      } else {
        errors.poQuantity = '';
      }
    } else if (key === 'unitCost' && (!value || Number(value) === 0)) {
      errors.unitCost = ' ';
    } else {
      errors.unitCost = '';
    }

    if (errors.poQuantity.length > 0 || errors.unitCost.length > 0) errors._id = _id;
    else errors._id = '';

    setEditItemHelperText((prevHelperText) => ({ ...prevHelperText, ...errors }));
  };

  const handleImageError = (event, image) => {
    event.target.src = image;
  };

  const handleEditRow = (row) => {
    if (editPurchasing) {
      if (!row?.poQuantity) {
        setEditItemHelperText({ ...editItemHelperText, poQuantity: ' ', _id: row?._id });
      }
      if (!row?.unitCost) {
        setEditItemHelperText({ ...editItemHelperText, unitCost: ' ', _id: row?._id });
      }
      if (!row?.unitCost && !row?.poQuantity) {
        setEditItemHelperText({
          poQuantity: ' ', unitCost: ' ', _id: row?._id
        });
      }
      if (row?._id === editPoQueueItem?._id || isEmpty(editPoQueueItem?._id)) {
        if (editedItemId) {
          if (!editItemHelperText?._id) {
            setIsEdit(!isEdit);
            handleEditItem();
          }
        } else if (isEmpty(editedItemId)) {
          setIsEdit(!isEdit);
        }
      }
    }
  };

  useEffect(() => {
    if (poCreated) {
      if (!isEmpty(newlyAddedPoId)) {
        navigate(`/purchasing/non-confirm/${newlyAddedPoId}`);
      }
      dispatch(SetPurchaseOrderState({
        field: 'poCreated',
        value: false
      }));
      dispatch(SetPurchaseOrderState({
        field: 'newlyAddedPoId',
        value: ''
      }));
    }
  }, [poCreated]);

  useEffect(() => {
    if (poQueueItemDeleted) {
      setSelectedQueueItems([]);
      getPoQueueItems();
      getAggregatedDataOfPOQueue();
      dispatch(SetPoQueueItemState({ field: 'poQueueItemDeleted', value: false }));
    }
    if (!deletePOQueueItemsLoading) {
      setDeleteProduct(false);
    }
  }, [poQueueItemDeleted]);

  useEffect(() => {
    if (poQueueItemUpdated) {
      getAggregatedDataOfPOQueue();
      setEditedItemId('');
      setEditPoQueueItem({});
      dispatch(SetPoQueueItemState({ field: 'poQueueItemUpdated', value: false }));
    }
  }, [poQueueItemUpdated]);

  useEffect(() => {
    getPoQueueItems();
    setEditItemHelperText({
      poQuantity: '',
      unitCost: ''
    });
    getAggregatedDataOfPOQueue();
  }, [addItemsToPoQueueFilters,
    addItemsToPoQueuePageNumber,
    addItemsToPoQueuePageLimit, sortValue]);

  useEffect(() => {
    if (poQueueItems?.length) {
      const queueItemsIdList = poQueueItems.map((row) => (row._id));
      setQueueItemIds(queueItemsIdList);

      if (difference(queueItemsIdList, selectedQueueItems).length === 0
        && selectedQueueItems?.length) {
        setHeaderCheckBox(true);
      } else setHeaderCheckBox(false);
    } else {
      setQueueItemIds([]);
      setSelectedQueueItems([]);
      setHeaderCheckBox(false);
    }
  }, [poQueueItems]);

  useEffect(() => {
    getSuppliers();
    setSearchByTitle(addItemsToPoQueueFilters?.searchByKeyWords?.title || '');
    setSearchByStockNumber(addItemsToPoQueueFilters?.searchByKeyWords?.stockNumber || '');
    setSearchByMfgNumber(addItemsToPoQueueFilters?.searchByKeyWords?.mfgPartNo || '');
    setSearchBySupplier(addItemsToPoQueueFilters?.supplierId || '');
  }, []);

  useEffect(() => {
    if (poQueueSuccess && jobTriggered) {
      if (attachmentLoading) {
        setAttachmentLoading(false);
        setAttachmentName('');
        setUploadFile(false);
        setAttachment(null);

        dispatch(SetPoQueueItemState({ field: 'jobTriggered', value: false }));
        dispatch(SetOtherState({ field: 'preSignedUrl', value: '' }));
      }
    }
    if (!poQueueSuccess && !pOQueueItemLoading) {
      setAttachmentLoading(false);
    }
  }, [poQueueSuccess, pOQueueItemLoading]);

  useEffect(() => {
    if (!otherSuccess && !otherLoading) {
      setAttachmentLoading(false);
    }
  }, [otherSuccess, otherLoading]);

  useEffect(() => {
    if (preSignedUrl !== '') {
      handleUploadAttachmentOnS3();
    }
  }, [preSignedUrl]);

  useEffect(() => {
    if (!isEmpty(aggregatedDataOfPOQueue)) {
      setSelected({
        ...Selected,
        poQty: aggregatedDataOfPOQueue?.poQuantity,
        totalUnitCost: aggregatedDataOfPOQueue?.totalCost,
        totalLineCost: aggregatedDataOfPOQueue?.lineTotal,
        stocks: aggregatedDataOfPOQueue?.stocks,
        fba: aggregatedDataOfPOQueue?.fba,
        onOrder: aggregatedDataOfPOQueue?.onOrder,
        backOrderQuantity: aggregatedDataOfPOQueue?.backOrderQuantity,
        reservedQuantity: aggregatedDataOfPOQueue?.reservedQuantity,
        onOrderQuantity: aggregatedDataOfPOQueue?.onOrderQuantity
      });
    } else {
      setSelected({
        ...Selected,
        poQty: 0,
        totalUnitCost: 0,
        totalLineCost: 0,
        stocks: 0,
        fba: 0,
        onOrder: 0,
        onOrderQuantity: 0,
        reservedQuantity: 0
      });
    }
  }, [aggregatedDataOfPOQueue]);

  useEffect(() => {
    if (saveSelectedQueueItemsParams) {
      const { userId } = user;
      const userIdJson = CryptoJS.AES.encrypt(String(userId), process.env.HASH).toString();
      const userIdData = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(userIdJson));
      dispatch(DownloadPOQueueItems({ userId: userIdData }));
      dispatch(SetPurchaseOrderState({ field: 'saveSelectedQueueItemsParams', value: false }));
    }
  }, [saveSelectedQueueItemsParams]);

  useEffect(() => {
    if (queueItemsDownloaded) {
      setSelectedQueueItems([]);
      setHeaderCheckBox(false);
      dispatch(SetPurchaseOrderState({ field: 'queueItemsDownloaded', value: false }));
    }
  }, [queueItemsDownloaded]);

  useEffect(() => {
    const limit = addItemsToPoQueuePageLimit;
    if (totalPoQueueItems === addItemsToPoQueuePageLimit) {
      dispatch(GetPoQueueItems({
        skip: 0,
        limit,
        filters: addItemsToPoQueueFilters,
        sortBy: sortValue
      }));
    }
  }, [totalPoQueueItems]);

  useEffect(() => {
    if (difference(queueItemIds, selectedQueueItems).length === 0
      && selectedQueueItems?.length) {
      setHeaderCheckBox(true);
    } else setHeaderCheckBox(false);
  }, [selectedQueueItems]);

  useEffect(() => () => {
    dispatch(SetPoQueueItemState({ field: 'poQueueItems', value: [] }));
    if (!window.location.pathname.includes('/purchasing')) {
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
      dispatch(
        SetPurchaseOrderState({ field: 'viewConfirmPOPageLimit', value: 100 })
      );
      dispatch(
        SetPurchaseOrderState({ field: 'viewConfirmPOPageNumber', value: 1 })
      );
      dispatch(
        SetPaymentDetailState({ field: 'paymentDetailPageLimit', value: 100 })
      );
      dispatch(
        SetPaymentDetailState({ field: 'paymentDetailPageNumber', value: 1 })
      );
    }
  }, []);

  return (
    <>
      <ProductHeaderWrapper>
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
      <h2 className="m-0">PO Queue</h2>
        <Box display="flex" gap={2} flexWrap="wrap" justifyContent="end" className="ms-auto">
          <MultipleSelect
            values={names}
            value={addItemsToPoQueueFilters.extendedFilters}
            vertical
            placeholder="Select"
            width={110}
            label="Extended Filter:"
            onChange={handleExtendedFilter}
            checkedList={addItemsToPoQueueFilters.extendedFilters}
          />
          <AutoComplete
            name="supplier"
            onChange={(e, val) => {
              setSearchBySupplier(val);
              handleSearchSupplier(val);
            }}
            value={addItemsToPoQueueFilters.supplierId || supplierItems[0]?._id}
            width="160px"
            placeholder="Supplier"
            label="Search:"
            vertical
            options={supplierItems}
          />
          <SearchInput
            autoComplete="off"
            name="title"
            value={searchByTitle}
            onChange={(e) => {
              setSearchByTitle(e.target.value);
              handleSearch(e);
            }}
            width="160px"
            placeholder="Search by Title"
          />
          <SearchInput
            autoComplete="off"
            name="stockNumber"
            width="162px"
            placeholder="Search by Stock #"
            value={searchByStockNumber}
            onChange={(e) => {
              setSearchByStockNumber(e.target.value);
              handleSearch(e);
            }}
          />
          <SearchInput
            autoComplete="off"
            name="mfgPartNo"
            width="187px"
            placeholder="Search by MFG Stock #"
            value={searchByMfgNumber}
            onChange={(e) => {
              setSearchByMfgNumber(e.target.value);
              handleSearch(e);
            }}
          />
          <Button
            disabled={!editPurchasing}
            startIcon={<span className="icon-import" />}
            text="Import"
            onClick={() => setUploadFile(true)}
          />
        </Box>
      </Box>
      </ProductHeaderWrapper>
      <PurchasingWrapper>
      <Stack
        className='queue-items-wrapper'
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ marginTop: '19px' }}
      >
        <h3 className="m-0">
          Selected Items:
          {selectedQueueItems?.length}

        </h3>
        <Box display="flex" gap={2.25}>
          <Stack direction="row" spacing={5}>
            <Stack>
              <Box
                component="span"
                color="#5A5F7D"
                fontSize="11px"
              >
                PO Qty

              </Box>
              <Box
                component="span"
                color="#272B41"
                fontSize="13px"
                fontWeight="600"
                pt={0.375}
              >
                {Selected?.poQty || '--'}

              </Box>
            </Stack>
            <Stack>
              <Box
                component="span"
                color="#5A5F7D"
                fontSize="11px"
              >
                Line Total

              </Box>
              <Box
                component="span"
                color="#272B41"
                fontSize="13px"
                pt={0.375}
              >
                $
                {Number(Selected?.totalLineCost || 0)?.toFixed(2)}
              </Box>
            </Stack>
            <Stack>
              <Box
                component="span"
                color="#5A5F7D"
                fontSize="11px"
              >
                Stocks

              </Box>
              <Box
                component="span"
                color="#272B41"
                fontSize="13px"
                pt={0.375}
              >
                {Selected?.stocks || '--'}

              </Box>
            </Stack>
            <Stack>
              <Box
                component="span"
                color="#5A5F7D"
                fontSize="11px"
              >
                FBA

              </Box>
              <Box
                component="span"
                color="#272B41"
                fontSize="13px"
                pt={0.375}
              >
                {Selected?.fba || '--'}

              </Box>
            </Stack>
            <Stack>
              <Box
                component="span"
                color="#5A5F7D"
                fontSize="11px"
              >
                Back Order

              </Box>
              <Box
                component="span"
                color="#272B41"
                fontSize="13px"
                pt={0.375}
              >
                {Selected?.backOrderQuantity || '--'}

              </Box>
            </Stack>
            <Stack>
              <Box
                component="span"
                color="#5A5F7D"
                fontSize="11px"
              >
                Reserved

              </Box>
              <Box
                component="span"
                color="#272B41"
                fontSize="13px"
                pt={0.375}
              >
                {Selected?.reservedQuantity || '--'}

              </Box>
            </Stack>
            <Stack>
              <Box
                component="span"
                color="#5A5F7D"
                fontSize="11px"
              >
                On Order

              </Box>
              <Box
                component="span"
                color="#272B41"
                fontSize="13px"
              >
                {Selected?.onOrderQuantity || '--'}

              </Box>
            </Stack>
          </Stack>
          <Button
            disabled={!selectedQueueItems?.length
              || !isEmpty(editedItemId)}
            startIcon={<span className="icon-download" />}
            className="icon-button"
            onClick={handleDownloadClickEvent}
          />
          <Button
            disabled={!selectedQueueItems?.length
              || !searchBySupplier
              || !isEmpty(editedItemId)}
            variant="contained"
            text="Create PO"
            onClick={() => {
              handleCreatePo();
              setSelectedQueueItems([]);
              setHeaderCheckBox(false);
            }}
            startIcon={(
              <AddCircleOutlineOutlinedIcon
                color="#3C76FF"
                fontSize="16px"
              />
            )}

          />
          <Button
            startIcon={<span className="icon-trash" />}
            padding="4px 11px 4px 14px"
            text="Remove Selected"
            color={selectedQueueItems?.length ? 'error' : 'primary'}
            onClick={() => {
              setDeleteMsg('Delete Selected Items!');
              setDeleteQueueItems(selectedQueueItems);
              setDeleteProduct(true);
            }}
            disabled={!selectedQueueItems?.length
              || !isEmpty(editedItemId)}
          />
        </Box>
      </Stack>
      </PurchasingWrapper>
      <Box mt={3}>
        <Table
          checkbox
          fixed
          tableHeader={poQueueHeader}
          height="257px"
          bodyPadding="8px 12px"
          isChecked={headerCheckBox}
          handleHeaderCheckBoxClicked={handleHeaderCheckBoxClicked}
          sortableHeader={poQueueHeaderSort}
          handleSort={handleSortChange}
          sortValue={sortValue}
        >
          {poQueueItemLoading || updatePOQueueItemLoading ? <LoaderWrapper /> : null}
          {poQueueItems?.length ? poQueueItems?.map((row) => {
            const findSupplier = suppliers?.find((item) => item?._id === row?.supplierId);
            return (
              <TableRow
                hover
                key={row.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row" style={{ minWidth: 250, width: '22%' }}>
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
                      checked={selectedQueueItems?.includes(String(row._id))}
                      onClick={(e) => handleCheckBoxClick(e, row?._id)}
                    />
                    <Stack direction="row" spacing={1}>
                      {row?.product?.images?.primaryImageUrl ? (
                        <HoverImage
                          image={GetS3ImageUrl({
                            bucketName: 'productImage', key: row?.product?.images?.primaryImageUrl
                          })}
                          onError={(e) => handleImageError(e, Product)}
                        >
                          <img
                            width={40}
                            height={40}
                            onError={(e) => handleImageError(e, Product)}
                            src={GetS3ImageUrl({
                              bucketName: 'productImage', key: row?.product?.images?.primaryImageUrl
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
                        <Stack
                          spacing={1}
                          direction="row"
                          fontSize="10px"
                        >
                          <Box
                            component="span"
                            color="#979797"
                          >
                            UPC:
                            <Box
                              component="span"
                              color="#5A5F7D"
                              ml={0.3}
                            >
                              {row?.product?.primaryUpc || '--'}

                            </Box>
                          </Box>
                          <Box
                            component="span"
                            color="#979797"
                          >
                            Stock Number:
                            <Box
                              component="span"
                              color="#5A5F7D"
                              ml={0.3}
                            >
                              {row?.product?.stockNumber || '--'}

                            </Box>
                          </Box>
                        </Stack>
                      </Box>
                    </Stack>
                  </Box>
                </TableCell>
                <TableCell>{row?.product?.mfgPartNo || '--'}</TableCell>
                <TableCell>{findSupplier?.code || '--'}</TableCell>
                <TableCell>

                  <Input
                    autoComplete="off"
                    isError
                    name="poQuantity"
                    width="72px"
                    disabled={row?._id !== editedItemId}
                    onChange={(e) => {
                      if (REGEX_FOR_NUMBERS.test(e.target.value)) {
                        setEditPoQueueItem({ ...editPoQueueItem, poQuantity: e.target.value });
                        handleOnchange(e, row._id);
                      } else {
                        e.target.value = editPoQueueItem.poQuantity;
                      }
                    }}
                    value={row?._id !== editedItemId ? row?.poQuantity : editPoQueueItem?.poQuantity || ''}
                    marginBottom="0px"
                    helperText={editItemHelperText?._id === row?._id
                      && editItemHelperText?.poQuantity?.length > 0}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    autoComplete="off"
                    isError
                    name="unitCost"
                    width="72px"
                    disabled={row?._id !== editedItemId}
                    onChange={(e) => {
                      if (REGEX_FOR_DECIMAL_NUMBERS.test(e.target.value)) {
                        setEditPoQueueItem({ ...editPoQueueItem, unitCost: e.target.value });
                        handleOnchange(e, row._id);
                      } else {
                        e.target.value = editPoQueueItem.unitCost;
                      }
                    }}
                    value={row?._id !== editedItemId ? `$${Number(row?.unitCost || 0)?.toFixed(2)}` : editPoQueueItem?.unitCost || ''}
                    marginBottom="0px"
                    helperText={editItemHelperText?._id === row?._id
                      && editItemHelperText.unitCost?.length > 0}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    autoComplete="off"
                    width="80px"
                    disabled
                    value={`$${(Number(row?.unitCost) * Number(row?.poQuantity))?.toFixed(2)}`}
                    marginBottom="0px"
                  />
                </TableCell>
                <TableCell>{row?.product?.quantityInStock || '--'}</TableCell>
                <TableCell>{row?.fbaQuantity || '--'}</TableCell>
                <TableCell>{row?.backOrderQuantity || '--'}</TableCell>
                <TableCell>{row?.reservedQuantity || '--'}</TableCell>
                <TableCell>{row?.onOrderQuantity || '--'}</TableCell>
                <TableCell>{row?.user?.name || '--'}</TableCell>
                <TableCell>
                  {moment(new Date(row?.timestamp)).format('MMM DD YYYY, hh:mm') || '--'}

                </TableCell>
                <TableCell>
                  <Box>
                    {row?.isFba
                      ? <CheckCircleIcon sx={{ color: '#0FB600', width: 16, height: 'auto' }} />
                      : <CheckCircleOutlinedIcon sx={{ color: '#979797', width: 16, height: 'auto' }} />}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Box display="flex" gap={2}>
                    <Box
                      className={`icon-${editedItemId === row?._id ? 'Save color-primary' : 'edit'} pointer`}
                      onClick={() => {
                        if (editedItemId !== row?._id) {
                          setEditItemHelperText({ poQuantity: '', unitCost: '' });
                          setEditedItemId(row?._id);
                          setEditPoQueueItem(row);
                        }
                        handleEditRow(row);
                      }}
                    />
                    <Box
                      className={`icon-trash ${editedItemId === row?._id ? 'disabled' : 'pointer'}`}
                      onClick={() => {
                        if (editPurchasing && !row.isEdit) {
                          setDeleteMsg('Delete The Item!');
                          setDeleteQueueItems([
                            row?._id
                          ]);
                          setDeleteProduct(true);
                        }
                      }}
                    />
                  </Box>
                </TableCell>
              </TableRow>
            );
          }) : (
            !poQueueItemLoading
            && totalPoQueueItems === 0 && (
              <TableRow>
                <TableCell sx={{ borderBottom: '24px' }} colSpan={16} align="center">
                  <Box textAlign="center" display="flex" alignItems="center" justifyContent="center" height="calc(100vh - 315px)">
                    {/* <img className="nodata-table-img" src={noData} height="100%" style={{ maxWidth: '100%' }} alt="no-Data" /> */}
                  </Box>
                </TableCell>
              </TableRow>
            )
          )}

        </Table>
        <Pagination
          componentName="purchasing"
          perPageRecord={poQueueItems?.length || 0}
          total={totalPoQueueItems}
          totalPages={Math.ceil(totalPoQueueItems / addItemsToPoQueuePageLimit)}
          offset={totalPoQueueItems}
          pageNumber={addItemsToPoQueuePageNumber}
          pageLimit={addItemsToPoQueuePageLimit}
          handlePageLimitChange={handlePageLimit}
          handlePageNumberChange={handlePageNumber}
        />
      </Box>

      <UploadModal
        show={uploadFile}
        onClose={handleUploadProductsSheetClose}
        attachment={attachment}
        attachmentLoading={attachmentLoading}
        handleChangeAttachment={handleChangeAttachment}
        attachmentName={attachmentName}
        accept=".xlsx, .csv"
        title="Drag & drop files or"
        supportedFormat="Support Format CSV File"
        handleSaveAttachment={handleSaveAttachment}
      />

      <DeleteModal
        lastTitle={deleteMsg}
        show={deleteProduct}
        loading={deletePOQueueItemsLoading}
        onClose={() => {
          setDeleteProduct(false);
          setDeleteQueueItems([]);
        }}
        onDelete={() => {
          handleDeletePOQueueItem();
        }}
      />
    </>
  );
};

export default PoQueue;
