import CryptoJS from 'crypto-js';
import moment from 'moment';
import React, { useState, useEffect } from 'react';
import {
  Stack, Box, TableRow, TableCell, Grid, Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { utils, read } from 'xlsx';
import {
  debounce, extend, isEmpty, camelCase
} from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
// icons
import { ReactSVG } from 'react-svg';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import { RemoveRedEye } from '@mui/icons-material';
import ReloadIcon from '../../../static/images/icon-reload.svg';

// components
import Button from '../../../components/button/index';
import SearchInput from '../../../components/searchInput/index';
import Pagination from '../../../components/pagination/index';
import Table from '../../../components/ag-grid-table/index';
import Input from '../../../components/inputs/input/index';
import AutoComplete from '../../../components/autoComplete';
import Modal from '../../../components/modal/index';
import Popover from '../../../components/popover/index';
import UploadFile from '../../../components/document-upload/index';
import Drawer from '../../../components/drawer/index';
import Select from '../../../components/select/index';
import InputSlider from '../../../components/range-slider/index';
import HoverImage from '../../../components/imageTooltip';
import ProductHeaderWrapper from './style';

// Popover

import {
  DownloadProducts,
  GetProducts,
  SetProductNotifyState,
  SetProductState,
  GetS3PreSignedUrl,
  GetAndSaveUploadedSheetInDb,
  SaveSelectedProductIds
} from '../../../redux/slices/product-slice';

import { GetPackItems, SetPackState } from '../../../redux/slices/pack-slice';

import { GetAllLocations } from '../../../redux/slices/location-slice';

import { GetSuppliers } from '../../../redux/slices/supplier-slice';

// Images
import Product from '../../../static/images/no-product-image.svg';
import noData from '../../../static/images/no-data-table.svg';

// constants
import { GetS3ImageUrl, UploadDocumentOnS3 } from '../../../../utils/helpers';
import {
  productMangerHeader,
  packSelectorMenu,
  sortableProductMangerHeader,
  packComponentHeader,
  REGEX_FOR_DECIMAL_NUMBERS
} from '../../../constants/index';
import LoaderWrapper from '../../../components/loader/index';

const headerFormat = [
  'primaryUpc',
  'secondaryUpc',
  'stockNumber',
  'mfgPart',
  'supplierCode',
  'costPrice',
  'salePrice',
  'title',
  'pack',
  'smu',
  'moq',
  'relationalProduct',
  'primaryImageUrl',
  'location',
  'updateStatus',
  'msrp',
  'qtyInStock'
];

const Index = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  let modalOpen = false;

  const {
    totalProducts,
    loading,
    products = [],
    jobTriggered,
    success,
    preSignedUrl,
    fileUploadKey,
    // minMaxProductCostAndSalePrices,
    productManagerPageNumber,
    productManagerPageLimit,
    productManagerAdvanceFilters,
    // minMaxCall,
    saveSelectedProductParams
  } = useSelector((state) => state.product);

  const {
    loading: packLoading,
    totalItemsInPack,
    packItems,
    packDetailsPageLimit,
    packDetailsPageNumber,
    packDetailProductId: packProductId
  } = useSelector((state) => state.pack);

  const {
    user: {
      userId,
      permissions: { editProducts }
    }
  } = useSelector((state) => state.auth);

  const { allLocations, loading: locationSliceLoading } = useSelector(
    (state) => state.location
  );

  const { suppliers, loading: supplierSliceLoading } = useSelector(
    (state) => state.supplier
  );

  const [bulkAction, setBulkAction] = useState('');
  const [uploadFile, setUploadFile] = useState(false);
  const [filter, setFilter] = useState(false);

  const [costPrice, setCostPrice] = useState({
    costPriceMinValue: '',
    costPriceMaxValue: ''
  });
  const [salePrice, setSalePrice] = useState({
    salePriceMinValue: '',
    salePriceMaxValue: ''
  });

  const [stock, setStock] = useState({
    stockMinValue: '',
    stockMaxValue: ''
  });
  const [onOrder, setOnOrder] = useState({
    onOrderMinValue: '',
    onOrderMaxValue: ''
  });

  const [backOrder, setBackOrder] = useState({
    backOrderMinValue: '',
    backOrderMaxValue: ''
  });
  const [reserved, setReserved] = useState({
    reservedMinValue: '',
    reservedMaxValue: ''
  });

  const [attachmentName, setAttachmentName] = useState('');
  const [attachment, setAttachment] = useState();
  const [attachmentLoading, setAttachmentLoading] = useState(false);
  const [validUploadProduct, setValidUploadProduct] = useState(false);

  const [advanceSearchByTitle, setAdvanceSearchByTitle] = useState('');
  const [advanceSearchByStockNumber, setAdvanceSearchByStockNumber] = useState('');
  const [advanceSearchByMfgNumber, setAdvanceSearchByMfgNumber] = useState('');
  const [advanceSearchByUpc, setAdvanceSearchByUpc] = useState('');
  const [filterEmpty, setFilterEmpty] = useState(true);
  const [innerFiltersEmpty, setInnerFiltersEmpty] = useState(true);

  const [allLocationsList, setAllLocationsList] = useState([
    { value: 'all', label: 'All' }
  ]);
  const [supplierCodeList, setSupplierCodeList] = useState([
    { value: 'all', label: 'All' }
  ]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [advanceFilters, setAdvanceFilters] = useState({
    searchByKeyWords: {
      title: '',
      stockNumber: '',
      mfgPartNo: '',
      upc: ''
    },
    supplierCode: 'all',
    location: 'all',
    isPacked: 'all',
    onOrderMinValue: '',
    onOrderMaxValue: '',
    reservedMinValue: '',
    reservedMaxValue: '',
    backOrderMinValue: '',
    backOrderMaxValue: '',
    stockMinValue: '',
    stockMaxValue: '',
    salePriceMinValue: '',
    salePriceMaxValue: '',
    costPriceMinValue: '',
    costPriceMaxValue: ''
  });

  const [error, setError] = useState({
    onOrderMinValue: '',
    onOrderMaxValue: '',
    reservedMinValue: '',
    reservedMaxValue: '',
    backOrderMinValue: '',
    backOrderMaxValue: '',
    stockMinValue: '',
    stockMaxValue: '',
    salePriceMinValue: '',
    salePriceMaxValue: '',
    costPriceMinValue: '',
    costPriceMaxValue: ''
  });
  const [sortValue, setSortValue] = useState({
    // cost: '',
    // sellPrice: '',
    // stock: '',
    // product: '',
    // mfgPartNo: ''
  });

  const [packDetailProductId, setPackDetailProductId] = useState(null);
  const [packDetailsData, setPackDetailsData] = useState([]);

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const handleClearAdvFilters = () => {
    setAdvanceFilters({
      searchByKeyWords: {
        title: '',
        stockNumber: '',
        mfgPartNo: '',
        upc: ''
      },
      supplierCode: 'all',
      location: 'all',
      isPacked: 'all',
      onOrderMinValue: '',
      onOrderMaxValue: '',
      reservedMinValue: '',
      reservedMaxValue: '',
      backOrderMinValue: '',
      backOrderMaxValue: '',
      stockMinValue: '',
      stockMaxValue: '',
      salePriceMinValue: '',
      salePriceMaxValue: '',
      costPriceMinValue: '',
      costPriceMaxValue: ''
    });

    dispatch(
      SetProductState({
        field: 'productManagerAdvanceFilters',
        value: {
          searchByKeyWords: {
            title: '',
            stockNumber: '',
            mfgPartNo: '',
            upc: ''
          },
          supplierCode: 'all',
          location: 'all',
          isPacked: 'all',
          onOrderMinValue: '',
          onOrderMaxValue: '',
          reservedMinValue: '',
          reservedMaxValue: '',
          backOrderMinValue: '',
          backOrderMaxValue: '',
          stockMinValue: '',
          stockMaxValue: '',
          salePriceMinValue: '',
          salePriceMaxValue: '',
          costPriceMinValue: '',
          costPriceMaxValue: ''
        }
      })
    );

    setCostPrice({
      costPriceMinValue: '',
      costPriceMaxValue: ''
    });
    setSalePrice({
      salePriceMinValue: '',
      salePriceMaxValue: ''
    });

    setStock({
      stockMinValue: '',
      stockMaxValue: ''
    });
    setBackOrder({
      backOrderMinValue: '',
      backOrderMaxValue: ''
    });
    setReserved({
      reservedMinValue: '',
      reservedMaxValue: ''
    });
    setOnOrder({
      onOrderMinValue: '',
      onOrderMaxValue: ''
    });

    setAdvanceSearchByTitle('');
    setAdvanceSearchByStockNumber('');
    setAdvanceSearchByMfgNumber('');
    setAdvanceSearchByUpc('');

    setError({
      onOrderMinValue: '',
      onOrderMaxValue: '',
      reservedMinValue: '',
      reservedMaxValue: '',
      backOrderMinValue: '',
      backOrderMaxValue: '',
      stockMinValue: '',
      stockMaxValue: '',
      salePriceMinValue: '',
      salePriceMaxValue: '',
      costPriceMinValue: '',
      costPriceMaxValue: ''
    });

    if (productManagerPageNumber !== 1) {
      dispatch(
        SetProductState({ field: 'productManagerPageNumber', value: 1 })
      );
    }
  };

  const handleSearch = debounce((values, key, filterType) => {
    dispatch(SetProductState({ field: 'productManagerPageNumber', value: 1 }));

    if (filterType === 'normalFilter') {
      dispatch(
        SetProductState({
          field: 'productManagerAdvanceFilters',
          value: {
            ...productManagerAdvanceFilters,
            searchByKeyWords: {
              ...productManagerAdvanceFilters.searchByKeyWords,
              [key]: values
            }
          }
        })
      );
    }
    if (filterType === 'advanceFilter') {
      setAdvanceFilters({
        ...advanceFilters,
        searchByKeyWords: {
          ...advanceFilters.searchByKeyWords,
          [key]: values
        }
      });
    }
  }, 500);

  const getProducts = () => {
    const skip = (productManagerPageNumber - 1) * productManagerPageLimit;
    const limit = productManagerPageLimit;

    dispatch(
      GetProducts({
        skip,
        limit,
        advanceFilters: productManagerAdvanceFilters,
        sortBy: sortValue
      })
    );
  };

  const getPackItems = () => {
    const skip = (packDetailsPageNumber - 1) * packDetailsPageLimit;
    const limit = packDetailsPageLimit;

    dispatch(
      GetPackItems({
        productId: packDetailProductId
      })
    );
  };

  const handlePackDetailsPageLimit = (e) => {
    dispatch(SetPackState({ field: 'packDetailsPageNumber', value: 1 }));
    dispatch(SetPackState({ field: 'packDetailsPageLimit', value: e }));
  };

  const handlePackDetailsPageNumber = (e) => {
    dispatch(SetPackState({ field: 'packDetailsPageNumber', value: e }));
  };

  const handlePageLimit = (e) => {
    dispatch(SetProductState({ field: 'productManagerPageNumber', value: 1 }));
    dispatch(SetProductState({ field: 'productManagerPageLimit', value: e }));
  };

  const getAllLocations = () => {
    dispatch(GetAllLocations({ fetchAll: true }));
  };

  const getSuppliers = () => {
    dispatch(GetSuppliers({ fetchAll: true }));
  };

  const handleViewPackItemsClick = (event, prodId) => {
    if (packProductId !== prodId) {
      dispatch(SetPackState({ field: 'packItems', value: [] }));
      dispatch(SetPackState({ field: 'packDetailProductId', value: prodId }));
      dispatch(SetPackState({ field: 'packDetailsPageNumber', value: 1 }));
    }
    setAnchorEl(event.currentTarget);

    setPackDetailProductId(prodId);
  };

  const handleClose = () => {
    setTimeout(() => {
      if (!modalOpen) {
        setAnchorEl(null);
      }
    }, 0);
  };

  // useEffect(() => {
  //   if (!isEmpty(anchorEl)) {
  //     setPackDetailProductId(null);
  //     setPackDetailsData([]);
  //     dispatch(SetPackState({ field: 'totalItemsInPack', value: 0 }));
  //     dispatch(SetPackState({ field: 'packItems', value: [] }));
  //   }
  // }, [anchorEl]);

  const createData = (
    _id,
    product,
    mfgPartNo,
    qtyInPack,
    quantityInStock,
    costPriceValue,
    addedBy,
    action
  ) => ({
    _id,
    product,
    mfgPartNo,
    qtyInPack,
    quantityInStock,
    costPrice: costPriceValue,
    addedBy,
    action
  });

  const handlePageNumber = (e) => {
    dispatch(SetProductState({ field: 'productManagerPageNumber', value: e }));
  };

  const handleImageError = (event, image) => {
    event.target.src = image;
  };

  const handlePackImageError = (event, image) => {
    event.target.src = image;
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

  const handleUploadAttachmentOnS3 = async () => {
    const response = await UploadDocumentOnS3({
      preSignedUrl,
      file: attachment
    });
    if (response) {
      dispatch(
        GetAndSaveUploadedSheetInDb({
          bulkAction,
          userId,
          fileUploadKey
        })
      );
    } else {
      setAttachmentLoading(false);
      dispatch(
        SetProductNotifyState({
          message: 'File uploading failed on S3',
          type: 'error'
        })
      );
    }
  };

  const handleChangePackAttachment = async (e) => {
    const { files } = e.target;

    if (files?.length) {
      const file = files[0];
      const fileName = file.name.split('.')[0];

      const extensionFile = file.name.split('.').pop();

      if (extensionFile !== 'csv' && extensionFile !== 'xlsx') {
        dispatch(
          SetProductNotifyState({
            message: 'Supported extension is csv && xlsx'
          })
        );
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

        const packData = utils.sheet_to_json(worksheet, {
          header: 0,
          defval: ''
        });

        if (packData && packData?.length) {
          let fileHeaders = Object.keys(packData[0]);

          fileHeaders = fileHeaders.map((value) => camelCase(value.toLowerCase().trim()));

          const headerFormatValidated = fileHeaders.includes('packStockNumber');

          if (headerFormatValidated) {
            setValidUploadProduct(true);
          } else {
            setAttachmentLoading(false);
            setAttachmentName('');
            setAttachment(null);
            dispatch(
              SetProductNotifyState({
                message: 'Error in sheet header format',
                type: 'error'
              })
            );
          }
        } else {
          dispatch(
            SetProductNotifyState({
              message: 'Sheet is empty',
              type: 'error'
            })
          );
        }
      };
    }
  };

  const handleChangeAttachment = async (e) => {
    const { files } = e.target;

    if (files?.length) {
      const file = files[0];
      const fileName = file.name.split('.')[0];

      const extensionFile = file.name.split('.').pop();

      if (extensionFile !== 'csv' && extensionFile !== 'xlsx') {
        dispatch(
          SetProductNotifyState({
            message: 'Supported extension is csv && xlsx'
          })
        );
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

        const productsData = utils.sheet_to_json(worksheet, {
          header: 0,
          defval: ''
        });

        if (productsData && productsData?.length) {
          const fileHeaders = Object.keys(productsData[0]);

          const headerFormatValidated = validateHeaders(
            fileHeaders,
            headerFormat
          );

          if (headerFormatValidated) {
            setValidUploadProduct(true);
          } else {
            setAttachmentLoading(false);
            dispatch(
              SetProductNotifyState({
                message: 'Error in sheet header format',
                type: 'error'
              })
            );
          }
        } else {
          dispatch(
            SetProductNotifyState({
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
        SetProductNotifyState({ message: 'Supported extension is csv && xlsx' })
      );
      return;
    }
    const formattedFileName = attachmentName.replace(/\s/g, '-');

    if (validUploadProduct) {
      setAttachmentLoading(true);

      dispatch(
        GetS3PreSignedUrl({
          fileName: `${formattedFileName}-${moment().format(
            'YYYY-MM-DD HH:mm:ss'
          )}.${extension}`,
          fileType: attachment.type,
          fileExtension: extension,
          uploadBucket: 'productDocs',
          id:
            bulkAction === 'itemUpload'
              ? 'uploadProducts'
              : bulkAction === 'packUpload'
                ? 'uploadPacks'
                : 'others'
        })
      );
    } else {
      setAttachmentLoading(false);
      setAttachmentName('');
      setAttachment(null);
      setValidUploadProduct(false);
      dispatch(
        SetProductNotifyState({
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

  const openFilters = () => {
    setFilter(true);
    getAllLocations();
    getSuppliers();

    const {
      costPriceMinValue,
      costPriceMaxValue,
      salePriceMinValue,
      salePriceMaxValue,
      stockMinValue,
      stockMaxValue,
      backOrderMinValue,
      backOrderMaxValue,
      reservedMinValue,
      reservedMaxValue,
      onOrderMinValue,
      onOrderMaxValue
    } = productManagerAdvanceFilters || {};

    setCostPrice({
      costPriceMinValue,
      costPriceMaxValue
    });
    setSalePrice({
      salePriceMinValue,
      salePriceMaxValue
    });
    setStock({
      stockMinValue,
      stockMaxValue
    });
    setReserved({
      reservedMinValue,
      reservedMaxValue
    });
    setOnOrder({
      onOrderMinValue,
      onOrderMaxValue
    });
    setBackOrder({
      backOrderMinValue,
      backOrderMaxValue
    });

    setError({
      onOrderMinValue: '',
      onOrderMaxValue: '',
      reservedMinValue: '',
      reservedMaxValue: '',
      backOrderMinValue: '',
      backOrderMaxValue: '',
      stockMinValue: '',
      stockMaxValue: '',
      salePriceMinValue: '',
      salePriceMaxValue: '',
      costPriceMinValue: '',
      costPriceMaxValue: ''
    });
    setAdvanceFilters(productManagerAdvanceFilters);
  };

  const handleChangeAdvanceFilters = (e) => {
    const { name, value: fieldValue } = e.target;
    if (name === 'costPriceMinValue' || name === 'costPriceMaxValue') {
      if (name === 'costPriceMinValue' && costPrice.costPriceMaxValue !== '' && !isEmpty(fieldValue) && Number(fieldValue) >= Number(costPrice.costPriceMaxValue)) {
        setError((prevState) => ({
          ...prevState,
          [name]: 'Min must be less than max'
        }));
      } else if (name === 'costPriceMaxValue' && costPrice.costPriceMinValue !== '' && !isEmpty(fieldValue) && Number(fieldValue) <= Number(costPrice.costPriceMinValue)) {
        setError((prevState) => ({
          ...prevState,
          [name]: 'Max must exceed min.'
        }));
      } else {
        setError((prevState) => ({
          ...prevState,
          [name]: ''
        }));
      }
      setCostPrice((prevState) => ({
        ...prevState,
        [name]: fieldValue
      }));
    } else if (name === 'salePriceMinValue' || name === 'salePriceMaxValue') {
      if (name === 'salePriceMinValue' && salePrice.salePriceMaxValue !== '' && !isEmpty(fieldValue) && Number(fieldValue) >= Number(salePrice.salePriceMaxValue)) {
        setError((prevState) => ({
          ...prevState,
          [name]: 'Min must be less than max'
        }));
      } else if (name === 'salePriceMaxValue' && salePrice.salePriceMinValue !== '' && !isEmpty(fieldValue) && Number(fieldValue) <= Number(salePrice.salePriceMinValue)) {
        setError((prevState) => ({
          ...prevState,
          [name]: 'Max must exceed min.'
        }));
      } else {
        setError((prevState) => ({
          ...prevState,
          salePriceMinValue: '',
          salePriceMaxValue: ''
        }));
      }
      setSalePrice((prevState) => ({
        ...prevState,
        [name]: fieldValue
      }));
    } else if (name === 'stockMinValue' || name === 'stockMaxValue') {
      if (name === 'stockMinValue' && stock.stockMaxValue !== '' && !isEmpty(fieldValue) && Number(fieldValue) >= Number(stock.stockMaxValue)) {
        setError((prevState) => ({
          ...prevState,
          [name]: 'Min must be less than max'
        }));
      } else if (name === 'stockMaxValue' && stock.stockMinValue !== '' && !isEmpty(fieldValue) && Number(fieldValue) <= Number(stock.stockMinValue)) {
        setError((prevState) => ({
          ...prevState,
          [name]: 'Max must exceed min.'
        }));
      } else {
        setError((prevState) => ({
          ...prevState,
          stockMaxValue: '',
          stockMinValue: ''
        }));
      }

      setStock((prevState) => ({
        ...prevState,
        [name]: fieldValue
      }));
    } else if (name === 'onOrderMinValue' || name === 'onOrderMaxValue') {
      if (name === 'onOrderMinValue' && onOrder.onOrderMaxValue !== '' && !isEmpty(fieldValue) && Number(fieldValue) >= Number(onOrder.onOrderMaxValue)) {
        setError((prevState) => ({
          ...prevState,
          [name]: 'Min must be less than max'
        }));
      } else if (name === 'onOrderMaxValue' && onOrder.onOrderMinValue !== '' && !isEmpty(fieldValue) && Number(fieldValue) <= Number(onOrder.onOrderMinValue)) {
        setError((prevState) => ({
          ...prevState,
          [name]: 'Max must exceed min.'
        }));
      } else {
        setError((prevState) => ({
          ...prevState,
          onOrderMinValue: '',
          onOrderMaxValue: ''
        }));
      }
      setOnOrder((prevState) => ({
        ...prevState,
        [name]: fieldValue
      }));
    } else if (name === 'reservedMinValue' || name === 'reservedMaxValue') {
      if (name === 'reservedMinValue' && reserved.reservedMaxValue !== '' && !isEmpty(fieldValue) && Number(fieldValue) >= Number(reserved.reservedMaxValue)) {
        setError((prevState) => ({
          ...prevState,
          [name]: 'Min must be less than max'
        }));
      } else if (name === 'reservedMaxValue' && reserved.reservedMinValue !== '' && !isEmpty(fieldValue) && Number(fieldValue) <= Number(reserved.reservedMinValue)) {
        setError((prevState) => ({
          ...prevState,
          [name]: 'Max must exceed min.'
        }));
      } else {
        setError((prevState) => ({
          ...prevState,
          reservedMinValue: '',
          reservedMaxValue: ''
        }));
      }
      setReserved((prevState) => ({
        ...prevState,
        [name]: fieldValue
      }));
    } else if (name === 'backOrderMinValue' || name === 'backOrderMaxValue') {
      if (name === 'backOrderMinValue' && backOrder.backOrderMaxValue !== '' && !isEmpty(fieldValue) && Number(fieldValue) >= Number(backOrder.backOrderMaxValue)) {
        setError((prevState) => ({
          ...prevState,
          [name]: 'Max must exceed min.'
        }));
      } else if (name === 'backOrderMaxValue' && backOrder.backOrderMinValue !== '' && !isEmpty(fieldValue) && Number(fieldValue) <= Number(backOrder.backOrderMinValue)) {
        setError((prevState) => ({
          ...prevState,
          [name]: 'Max must exceed min.'
        }));
      } else {
        setError((prevState) => ({
          ...prevState,
          backOrderMinValue: '',
          backOrderMaxValue: ''
        }));
      }
      setBackOrder((prevState) => ({
        ...prevState,
        [name]: fieldValue
      }));
    }
    setAdvanceFilters({
      ...advanceFilters,
      [name]: fieldValue
    });
  };

  const handleClickAdvanceSearch = () => {
    const {
      costPriceMinValue,
      costPriceMaxValue,
      salePriceMinValue,
      salePriceMaxValue,
      stockMinValue,
      stockMaxValue,
      backOrderMinValue,
      backOrderMaxValue,
      reservedMinValue,
      reservedMaxValue,
      onOrderMinValue,
      onOrderMaxValue
    } = advanceFilters;

    const errorObj = {};
    if (costPriceMinValue && costPriceMaxValue && Number(costPriceMinValue) > Number(costPriceMaxValue)) errorObj.costPriceMinValue = 'Min must be less than max';
    else errorObj.costPriceMinValue = '';
    if (salePriceMinValue && salePriceMaxValue && Number(salePriceMinValue) > Number(salePriceMaxValue)) errorObj.salePriceMinValue = 'Min must be less than max';
    else errorObj.salePriceMinValue = '';
    if (stockMinValue && stockMaxValue && Number(stockMinValue) > Number(stockMaxValue)) errorObj.stockMinValue = 'Min must be less than max';
    else errorObj.stockMinValue = '';
    if (backOrderMinValue && backOrderMaxValue && Number(backOrderMinValue) > Number(backOrderMaxValue)) errorObj.backOrderMinValue = 'Min must be less than max';
    else errorObj.backOrderMinValue = '';
    if (reservedMinValue && reservedMaxValue && Number(reservedMinValue) > Number(reservedMaxValue)) errorObj.reservedMinValue = 'Min must be less than max';
    else errorObj.reservedMinValue = '';
    if (onOrderMinValue && onOrderMaxValue && Number(onOrderMinValue) > Number(onOrderMaxValue)) errorObj.onOrderMinValue = 'Min must be less than max';
    else errorObj.onOrderMinValue = '';

    if (Object.values(errorObj).every((errorValue) => errorValue === '')) {
      dispatch(
        SetProductState({
          field: 'productManagerAdvanceFilters',
          value: advanceFilters
        })
      );
      if (productManagerPageNumber !== 1) {
        dispatch(
          SetProductState({ field: 'productManagerPageNumber', value: 1 })
        );
      }
      setFilter(false);
    } else {
      setError({
        ...error,
        ...errorObj
      });
    }
  };

  const handleExportProducts = () => {
    const productIds = products.map((prod) => prod._id);

    if (productIds.length) {
      dispatch(SaveSelectedProductIds({ selectIds: productIds }));
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

    // if (sortKey === 'sellPrice') sortKey = 'salePrice';
    setSortValue({
      [sortKey]: newSortValue
    });
  };

  const handleCloseAdvanceFilters = () => {
    setAdvanceSearchByStockNumber(
      productManagerAdvanceFilters?.searchByKeyWords?.stockNumber
    );
    setAdvanceSearchByTitle(
      productManagerAdvanceFilters?.searchByKeyWords?.title
    );
    setAdvanceSearchByMfgNumber(
      productManagerAdvanceFilters?.searchByKeyWords?.mfgPartNo
    );

    setAdvanceSearchByUpc(productManagerAdvanceFilters?.searchByKeyWords?.upc);
    setFilter(false);
  };

  const checkFiltersEmpty = (filtersData, key) => {
    const {
      searchByKeyWords: {
        title,
        stockNumber,
        mfgPartNo,
        upc
      },
      supplierCode,
      location,
      isPacked,
      onOrderMinValue,
      onOrderMaxValue,
      reservedMinValue,
      reservedMaxValue,
      backOrderMinValue,
      backOrderMaxValue,
      stockMinValue,
      stockMaxValue,
      salePriceMinValue,
      salePriceMaxValue,
      costPriceMinValue,
      costPriceMaxValue
    } = filtersData;

    if (isEmpty(title)
      && isEmpty(stockNumber)
      && isEmpty(mfgPartNo)
      && isEmpty(upc)
      && supplierCode === 'all'
      && location === 'all'
      && isPacked === 'all'
      && isEmpty(onOrderMinValue)
      && isEmpty(onOrderMaxValue)
      && isEmpty(reservedMinValue)
      && isEmpty(reservedMaxValue)
      && isEmpty(backOrderMinValue)
      && isEmpty(backOrderMaxValue)
      && isEmpty(stockMinValue)
      && isEmpty(stockMaxValue)
      && isEmpty(salePriceMinValue)
      && isEmpty(salePriceMaxValue)
      && isEmpty(costPriceMinValue)
      && isEmpty(costPriceMaxValue)
    ) {
      if (key === 'redux') setFilterEmpty(true);
      else if (key === 'local') setInnerFiltersEmpty(true);
      return;
    }
    if (key === 'redux') setFilterEmpty(false);
    else if (key === 'local') setInnerFiltersEmpty(false);
  };

  useEffect(() => {
    checkFiltersEmpty(productManagerAdvanceFilters, 'redux');
  }, [productManagerAdvanceFilters]);

  useEffect(() => {
    checkFiltersEmpty(advanceFilters, 'local');
  }, [advanceFilters]);

  useEffect(() => {
    if (saveSelectedProductParams) {
      const userIdJson = CryptoJS.AES.encrypt(
        String(userId),
        process.env.HASH
      ).toString();
      const userIdData = CryptoJS.enc.Base64.stringify(
        CryptoJS.enc.Utf8.parse(userIdJson)
      );
      dispatch(DownloadProducts({ userId: userIdData }));
    }
  }, [saveSelectedProductParams]);

  useEffect(() => {
    if (packItems.length) {
      const packItemsData = packItems.map((row) => createData(
        row._id,
        <Stack direction="row" spacing={1}>
          <Box sx={{ '&:hover': 'transform: scale(1.5)' }}>
            {row?.itemId?.images?.primaryImageUrl
              ? (
                <HoverImage
                  image={GetS3ImageUrl({
                    bucketName: 'productImage', key: row?.itemId?.images?.primaryImageUrl
                  })}
                  onError={(e) => handlePackImageError(e, Product)}
                >
                  <img
                    width={32}
                    height={32}
                    alt=""
                    onError={(e) => handlePackImageError(e, Product)}
                    src={GetS3ImageUrl({
                      bucketName: 'productImage', key: row?.itemId?.images?.primaryImageUrl
                    })}
                  />
                </HoverImage>
              ) : (
                <img
                  width={32}
                  height={32}
                  alt=""
                  onError={(e) => handlePackImageError(e, Product)}
                  src={Product}
                />
              )}
          </Box>
          <Box>
            <Box
              component="span"
              sx={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
              maxWidth="250px"
              display="block"
            >
              <Box className="product-name-clamp" component="span">
                {row.itemId?.title?.length > 30 ? (
                  <Tooltip
                    placement="top-start"
                    arrow
                    title={row.itemId?.title}
                  >
                    <span>
                      {row.itemId?.title?.length > 30
                        ? row.itemId?.title
                        : row.itemId?.title}
                    </span>
                  </Tooltip>
                ) : (
                  <span>
                    {row.itemId?.title?.length > 30
                      ? row.itemId?.title
                      : row.itemId?.title || '--'}
                  </span>
                )}
              </Box>
            </Box>
            <Stack spacing={1} direction="row" fontSize="10px">
              <Box component="span" color="#979797">
                UPC:
                <Box component="span" color="#5A5F7D" ml={0.3}>
                  {row.itemId?.primaryUpc || '--'}
                </Box>
              </Box>
              <Box component="span" color="#979797">
                Stock Number:
                <Box component="span" color="#5A5F7D" ml={0.3}>
                  {row.itemId?.stockNumber || '--'}
                </Box>
              </Box>
            </Stack>
          </Box>
        </Stack>,
        row?.itemId?.mfgPartNo || '--',
        row?.quantity || 0,
        row?.itemId?.quantityInStock || '--',
        row?.itemId?.costPrice ? `$${+(row.itemId.costPrice).toFixed(2)}` : '$0.00',
        row?.userId?.name ? row?.userId?.name : '--',
        <Box display="flex" gap={2}>
          <RemoveRedEye
            sx={{ color: '#3C76FF', width: 16 }}
            className="pointer"
            onClick={() => navigate(`/products/${row?.itemId._id}`)}
          />
        </Box>
      ));
      setPackDetailsData(packItemsData);
    } else {
      setPackDetailsData([]);
    }
  }, [packItems]);

  useEffect(() => {
    if (!isEmpty(packDetailProductId)) {
      getPackItems();
    }
  }, [packDetailProductId, packDetailsPageNumber, packDetailsPageLimit]);

  useEffect(() => {
    if (allLocations?.length) {
      const locationData = allLocations.map((loc) => ({
        value: loc._id,
        label: loc.location
      }));
      setAllLocationsList([{ value: 'all', label: 'All' }, ...locationData]);
    } else {
      setAllLocationsList([{ value: 'all', label: 'All' }]);
    }
  }, [allLocations]);

  useEffect(() => {
    if (suppliers?.length) {
      const supplierData = suppliers.map((loc) => ({
        value: loc._id,
        label: loc.code
      }));

      setSupplierCodeList([{ value: 'all', label: 'All' }, ...supplierData]);
    } else {
      setSupplierCodeList([{ value: 'all', label: 'All' }]);
    }
  }, [suppliers]);

  useEffect(() => {
    if (preSignedUrl !== '') {
      handleUploadAttachmentOnS3();
    }
  }, [preSignedUrl]);

  useEffect(() => {
    if (success && jobTriggered) {
      if (attachmentLoading) {
        setAttachmentLoading(false);
        setAttachmentName('');
        setUploadFile(false);
        setAttachment(null);
        setValidUploadProduct(false);

        dispatch(SetProductState({ field: 'jobTriggered', value: false }));
        dispatch(SetProductState({ field: 'preSignedUrl', value: '' }));
      }
    }
    if (!success && !loading) {
      dispatch(SetProductState({ field: 'jobTriggered', value: false }));
      dispatch(SetProductState({ field: 'preSignedUrl', value: '' }));
      setAttachmentLoading(false);
    }
  }, [success, loading]);

  useEffect(() => {
    if (productManagerPageNumber && productManagerPageLimit) {
      getProducts();
    }
  }, [
    productManagerPageNumber,
    productManagerPageLimit,
    productManagerAdvanceFilters,
    sortValue
  ]);

  useEffect(() => {
    setAdvanceSearchByStockNumber(
      productManagerAdvanceFilters?.searchByKeyWords?.stockNumber
    );
    setAdvanceSearchByTitle(
      productManagerAdvanceFilters?.searchByKeyWords?.title
    );
    setAdvanceSearchByMfgNumber(
      productManagerAdvanceFilters?.searchByKeyWords?.mfgPartNo
    );
    setAdvanceSearchByUpc(productManagerAdvanceFilters?.searchByKeyWords?.upc);

    return () => {
      if (
        !(
          window.location.pathname.startsWith('/products/')
          || window.location.pathname === '/add-product'
        )
      ) {
        dispatch(SetProductState({ field: 'selectedTabPane', value: 0 }));
        dispatch(
          SetProductState({
            field: 'productManagerAdvanceFilters',
            value: {
              searchByKeyWords: {
                title: '',
                stockNumber: '',
                mfgPartNo: '',
                upc: ''
              },
              supplierCode: 'all',
              location: 'all',
              isPacked: 'all',
              costPriceMinValue: '',
              costPriceMaxValue: '',
              salePriceMinValue: '',
              salePriceMaxValue: '',
              stockMinValue: '',
              stockMaxValue: '',
              backOrderMinValue: '',
              backOrderMaxValue: '',
              reservedMinValue: '',
              reservedMaxValue: '',
              onOrderMinValue: '',
              onOrderMaxValue: ''
            }
          })
        );
        dispatch(
          SetProductState({ field: 'productManagerPageNumber', value: 1 })
        );
        dispatch(
          SetProductState({ field: 'productManagerPageLimit', value: 100 })
        );
        dispatch(SetProductState({ field: 'packItemsPagination', value: 100 }));
        dispatch(SetPackState({ field: 'packDetailsPageLimit', value: 100 }));
        dispatch(SetPackState({ field: 'packDetailsPageNumber', value: 1 }));
        dispatch(SetProductState({ field: 'preSignedUrl', value: '' }));
        dispatch(SetProductState({ field: 'jobTriggered', value: false }));
      }
    };
  }, []);

  useEffect(() => () => {
    dispatch(SetPackState({ field: 'packDetailProductId', value: null }));
    dispatch(SetPackState({ field: 'totalItemsInPack', value: 0 }));
    dispatch(SetPackState({ field: 'packItems', value: [] }));
    dispatch(SetProductState({ field: 'products', value: [] }));
  }, []);

  return (
    <>
      <ProductHeaderWrapper>
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <h2>
          Products
        </h2>
        <Box display="flex" gap={2} flexWrap="wrap" justifyContent="end" className="ms-auto">
          <SearchInput
            autoComplete="off"
            value={advanceSearchByTitle}
            onChange={(e) => {
              setAdvanceSearchByTitle(e.target.value);
              handleSearch(e.target.value, 'title', 'normalFilter');
            }}
            placeholder="Search by Title"
            width="165px"
          />
          <SearchInput
            autoComplete="off"
            placeholder="Search by UPC"
            width="165px"
            value={advanceSearchByUpc}
            onChange={(e) => {
              setAdvanceSearchByUpc(e.target.value);
              handleSearch(e.target.value, 'upc', 'normalFilter');
            }}
          />
          <SearchInput
            autoComplete="off"
            value={advanceSearchByStockNumber}
            onChange={(e) => {
              setAdvanceSearchByStockNumber(e.target.value);
              handleSearch(e.target.value, 'stockNumber', 'normalFilter');
            }}
            placeholder="Search by Stock #"
            width="165px"
          />
          <SearchInput
            autoComplete="off"
            value={advanceSearchByMfgNumber}
            onChange={(e) => {
              setAdvanceSearchByMfgNumber(e.target.value);
              handleSearch(e.target.value, 'mfgPartNo', 'normalFilter');
            }}
            placeholder="Search by MFG Part #"
            width="192px"
          />
          <Button
            startIcon={<span className="icon-export-icon" />}
            className="icon-button"
            tooltip="Export Products"
            onClick={handleExportProducts}
          />
          <Button
            disabled={!editProducts}
            startIcon={<span className="icon-union" />}
            className="icon-button"
            tooltip="Upload Bulk Products"
            onClick={() => {
              setBulkAction('itemUpload');
              setUploadFile(true);
            }}
          />
          <Button
            disabled={!editProducts}
            startIcon={<span className="icon-upload" />}
            className="icon-button"
            tooltip="Upload Pack Details"
            onClick={() => {
              setBulkAction('packUpload');
              setUploadFile(true);
            }}
          />
          <Button
            startIcon={<span className="icon-funnel" />}
            className="icon-button"
            tooltip="Extended Filter's"
            onClick={openFilters}
          />
          <Button
            className="icon-button"
            tooltip="Clear Filters"
            startIcon={
              <ReactSVG className="icon-reload-custom" src={ReloadIcon} />
            }
            onClick={() => handleClearAdvFilters()}
            disabled={filterEmpty}
          />
          <Button
            disabled={!editProducts}
            startIcon={<AddCircleOutlineOutlinedIcon />}
            text="Add Product"
            variant="contained"
            onClick={() => navigate('/products/add-product')}
          />
        </Box>
      </Box>
      </ProductHeaderWrapper>
      <Popover
        className="approve-popover"
        id={id}
        open={open}
        anchorEl={anchorEl}
        onMouseEnter={() => {
          modalOpen = true;
        }}
        onMouseLeave={() => {
          modalOpen = false;
          handleClose();
        }}
        onClose={handleClose}
        title="Pack Details"
      >

        <Table
          className="approve-table"
          alignCenter
          tableHeader={packComponentHeader}
          bodyPadding="8px 11px"
        >
          {
            packLoading
              ? <LoaderWrapper />
              : packDetailsData?.length ? packDetailsData.map((row) => (
                <TableRow
                  hover
                  key={row._id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    <Box
                      component="span"
                      display="flex"
                      alignItems="center"
                      gap={1.5}
                    >
                      {row.product}
                    </Box>
                  </TableCell>
                  <TableCell>{row.mfgPartNo}</TableCell>
                  <TableCell>{row.qtyInPack}</TableCell>
                  <TableCell>{row.quantityInStock}</TableCell>
                  <TableCell>{row.costPrice}</TableCell>
                  <TableCell>{row.addedBy}</TableCell>
                  <TableCell align="right">{row.action}</TableCell>
                </TableRow>
              )) : (
                !packLoading && totalItemsInPack === 0 && (
                  <TableRow>
                    <TableCell sx={{ borderBottom: '24px' }} colSpan={5} align="center">
                      <Box textAlign="center" display="flex" alignItems="center" justifyContent="center" height="150px">
                        {/* <img className="nodata-table-img" src={noData} height="100%" style={{ maxWidth: '100%' }} alt="no-Data" /> */}
                      </Box>
                    </TableCell>
                  </TableRow>
                )
              )
          }
        </Table>
        {/* <Pagination
          componentName="products"
          position="relative"
          width="0"
          perPageRecord={packItems?.length || 0}
          total={totalItemsInPack}
          totalPages={Math.ceil(totalItemsInPack / packDetailsPageLimit)}
          offset={totalItemsInPack}
          pageNumber={packDetailsPageNumber}
          pageLimit={packDetailsPageLimit}
          handlePageLimitChange={handlePackDetailsPageLimit}
          handlePageNumberChange={handlePackDetailsPageNumber}
        /> */}
      </Popover>
      <Box mt={2.5}>
        {loading && !filter && !attachmentLoading ? <LoaderWrapper /> : null}
        <Table
          tableHeader={productMangerHeader}
          bodyPadding="8px 12px"
          height="160px"
          sortableHeader={sortableProductMangerHeader}
          handleSort={handleSortChange}
          sortValue={sortValue}
        >
          {products?.length ? products?.map((row) => (
            <TableRow
              hover
              key={row?._id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell
                component="th"
                scope="row"
                style={{ minWidth: 250, width: '22%' }}
              >
                <Stack direction="row" spacing={1}>
                  {row?.images?.primaryImageUrl
                    ? (
                      <HoverImage
                        image={
                          GetS3ImageUrl({
                            bucketName: 'productImage',
                            key: row?.images?.primaryImageUrl
                          })
                        }
                        onError={(e) => handleImageError(e, Product)}
                      >
                        <img
                          width={40}
                          height={40}
                          onError={(e) => handleImageError(e, Product)}
                          src={GetS3ImageUrl({
                            bucketName: 'productImage',
                            key: row?.images?.primaryImageUrl
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
                  {/* <Box className="hover-image" /> */}
                  <Box>
                    <Box className="product-name-clamp" component="span">
                      {row?.title?.length > 30 ? (
                        <Tooltip placement="top-start" arrow title={row?.title}>
                          <span>{row?.title}</span>
                        </Tooltip>
                      ) : (
                        <span>{row?.title || '--'}</span>
                      )}
                    </Box>
                    <Stack spacing={1} direction="row" fontSize="10px">
                      <Box component="span" color="#979797">
                        UPC:
                        <Box component="span" color="#5A5F7D" ml={0.3}>
                          {row?.primaryUpc || '--'}
                        </Box>
                      </Box>
                      <Box component="span" color="#979797">
                        Stock Number:
                        <Box component="span" color="#5A5F7D" ml={0.3}>
                          <span>{row?.stockNumber || '--'}</span>
                        </Box>
                      </Box>
                    </Stack>
                  </Box>
                </Stack>
              </TableCell>
              <TableCell>{row?.mfgPartNo || '--'}</TableCell>
              <TableCell>{row?.supplier?.code || '--'}</TableCell>
              <TableCell>
                {row?.costPrice !== undefined && row?.costPrice !== null
                  ? `$${row.costPrice?.toFixed(2)}`
                  : '--'}
              </TableCell>
              <TableCell>
                {row?.salePrice !== undefined && row?.salePrice !== null
                  ? `$${row.salePrice?.toFixed(2)}`
                  : '--'}
              </TableCell>
              <TableCell>
                {row.quantityInStock || '--'}
              </TableCell>
              <TableCell>
                {row.backOrderQuantity || '--'}
              </TableCell>
              <TableCell>
                {row.reservedQuantity || '--'}
              </TableCell>
              <TableCell>
                {row.onOrderQuantity || '--'}
              </TableCell>
              <TableCell>{row?.location || '--'}</TableCell>
              <TableCell>
                {row?.isPacked ? (
                  <CheckCircleIcon
                    aria-describedby={id}
                    onMouseEnter={(e) => handleViewPackItemsClick(e, row._id)}
                    onMouseLeave={handleClose}
                    sx={{
                      color: '#0FB600',
                      width: 16
                    }}
                  />
                ) : (
                  <CheckCircleOutlinedIcon
                    sx={{ color: '#979797', fontSize: 16 }}
                  />
                )}
              </TableCell>
              <TableCell align="right">
                <Box
                  component="span"
                  className="icon-left-arrow pointer"
                  onClick={() => navigate(`/products/${row?._id}`)}
                />
              </TableCell>
            </TableRow>
          )) : (
            !loading && (
              <TableRow>
                <TableCell sx={{ borderBottom: '24px' }} colSpan={12} align="center">
                  <Box textAlign="center" display="flex" alignItems="center" justifyContent="center" height="calc(100vh - 237px)">
                    {/* <img className="nodata-table-img" src={noData} height="100%" style={{ maxWidth: '100%' }} alt="no-Data" /> */}
                  </Box>
                </TableCell>
              </TableRow>
            )
          )}
        </Table>
        <Pagination
          perPageRecord={products?.length || 0}
          componentName="products"
          total={totalProducts}
          totalPages={Math.ceil(totalProducts / productManagerPageLimit)}
          offset={totalProducts}
          pageNumber={productManagerPageNumber}
          pageLimit={productManagerPageLimit}
          handlePageLimitChange={handlePageLimit}
          handlePageNumberChange={handlePageNumber}
        />
      </Box>
      <Modal
        show={uploadFile}
        width={696}
        onClose={handleUploadProductsSheetClose}
      >
        <Box sx={{ position: 'relative', padding: '24px', minWidth: '696px' }}>
          <CancelOutlinedIcon
            className="pointer"
            onClick={handleUploadProductsSheetClose}
            sx={{
              opacity: attachmentLoading ? 0.5 : 1,
              pointerEvents: attachmentLoading ? 'none' : 'auto',
              color: '#979797',
              fontSize: 17,
              position: 'absolute',
              right: '24px',
              top: '23px'
            }}
          />
          <h2>{bulkAction === 'packUpload' ? <h2>Upload Bulk Pack Items </h2> : <h2> Upload Bulk Products </h2>}</h2>
          <Box mt={6}>
            <UploadFile
              loading={attachmentLoading}
              handleChangeAttachment={(e) => (bulkAction === 'itemUpload'
                ? handleChangeAttachment(e)
                : bulkAction === 'packUpload'
                  ? handleChangePackAttachment(e)
                  : console.log('Not Action'))}
              attachmentName={attachmentName}
              accept=".xlsx, .csv"
              title="Drag & drop files or"
              supportedFormat="Support Format CSV or Xlsx File"
            />
            <Box display="flex" justifyContent="flex-end">
              <Button
                text="Save"
                variant="contained"
                width="87px"
                startIcon={<span className="icon-Save" />}
                onClick={handleSaveAttachment}
                disabled={attachmentLoading || !attachment}
              />
            </Box>
          </Box>
        </Box>
      </Modal>
      <Drawer open={filter} width="1031px" close={handleCloseAdvanceFilters}>
        <Stack
          alignItems="center"
          justifyContent="space-between"
          direction="row"
          spacing={3}
        >
          <Box display="flex" alignItems="center">
            <Box
              component="span"
              className="icon-left pointer"
              onClick={handleCloseAdvanceFilters}
            />
            <h2 className="m-0 pl-2">Filter</h2>
          </Box>
          <Box textAlign="right">
            <Button
              text="Clear Filter’s"
              startIcon={<CancelOutlinedIcon />}
              color="error"
              onClick={handleClearAdvFilters}
              disabled={innerFiltersEmpty}
            />
          </Box>
        </Stack>
        <Box mt={3}>
          {loading || locationSliceLoading || supplierSliceLoading ? (
            <LoaderWrapper />
          ) : null}
          <Grid container columnSpacing={3}>
            <Grid item md={4}>
              <SearchInput
                autoComplete="off"
                width="100%"
                placeholder="Search by Title"
                label="Title"
                sx={{ marginBottom: '24px' }}
                value={advanceSearchByTitle}
                onChange={(e) => {
                  setAdvanceSearchByTitle(e.target.value);
                  handleSearch(e.target.value, 'title', 'advanceFilter');
                }}
              />
            </Grid>
            <Grid item md={4}>
              <SearchInput
                autoComplete="off"
                width="100%"
                placeholder="Search by UPC"
                sx={{ marginBottom: '24px' }}
                label="UPC"
                value={advanceSearchByUpc}
                onChange={(e) => {
                  setAdvanceSearchByUpc(e.target.value);
                  handleSearch(e.target.value, 'upc', 'advanceFilter');
                }}
              />
            </Grid>
            <Grid item md={4}>
              <SearchInput
                autoComplete="off"
                placeholder="Search by Stock #"
                sx={{ marginBottom: '24px' }}
                label="Stock #"
                width="100%"
                value={advanceSearchByStockNumber}
                onChange={(e) => {
                  setAdvanceSearchByStockNumber(e.target.value);
                  handleSearch(e.target.value, 'stockNumber', 'advanceFilter');
                }}
              />
            </Grid>
            <Grid item md={4}>
              <SearchInput
                autoComplete="off"
                placeholder="Search by MFG Part #"
                label="MFG part #"
                width="100%"
                sx={{ marginBottom: '24px' }}
                value={advanceSearchByMfgNumber}
                onChange={(e) => {
                  setAdvanceSearchByMfgNumber(e.target.value);
                  handleSearch(e.target.value, 'mfgPartNo', 'advanceFilter');
                }}
              />
            </Grid>
            <Grid item md={4}>
              <Box mb={3}>
                <Select
                  menuItem={supplierCodeList}
                  label="Supplier"
                  name="supplierCode"
                  value={advanceFilters.supplierCode}
                  placeholder="Supplier"
                  handleChange={handleChangeAdvanceFilters}
                />
              </Box>
            </Grid>
            <Grid item md={4}>
              <AutoComplete
                name="location"
                options={allLocationsList}
                label="Location"
                value={allLocationsList?.find((item) => item?.value === advanceFilters.location)}
                placeholder="Search"
                onChange={(e, item) => {
                  setAdvanceFilters({
                    ...advanceFilters,
                    location: item?.value
                  });
                }}
              />

            </Grid>
            <Grid item md={4}>
              <Select
                name="isPacked"
                menuItem={packSelectorMenu}
                label="Pack/non Pack"
                value={advanceFilters.isPacked}
                placeholder="Select Pack Type"
                handleChange={handleChangeAdvanceFilters}
              />
            </Grid>
            <Grid item md={4}>
              <Box display="flex" alignItems="center" gap="4px">
                <Input
                  autoComplete="off"
                  label="Cost"
                  background="#fff"
                  placeholder="Min"
                  range
                  name="costPriceMinValue"
                  value={costPrice.costPriceMinValue}
                  onChange={(e) => {
                    if (REGEX_FOR_DECIMAL_NUMBERS.test(e.target.value)) {
                      handleChangeAdvanceFilters(e);
                    }
                  }}
                  helperText={error.costPriceMinValue}
                />
                -
                <Input
                  autoComplete="off"
                  background="#fff"
                  label="&nbsp;"
                  placeholder="Max"
                  range
                  name="costPriceMaxValue"
                  value={costPrice.costPriceMaxValue}
                  onChange={(e) => {
                    if (REGEX_FOR_DECIMAL_NUMBERS.test(e.target.value)) {
                      handleChangeAdvanceFilters(e);
                    }
                  }}
                  helperText={error.costPriceMaxValue}
                />
              </Box>
            </Grid>
            <Grid item md={4}>
              <Box display="flex" alignItems="center" gap="4px">
                <Input
                  autoComplete="off"
                  background="#fff"
                  label="Sale Price"
                  placeholder="Min"
                  range
                  name="salePriceMinValue"
                  value={salePrice.salePriceMinValue}
                  onChange={(e) => {
                    if (REGEX_FOR_DECIMAL_NUMBERS.test(e.target.value)) {
                      handleChangeAdvanceFilters(e);
                    }
                  }}
                  helperText={error.salePriceMinValue}
                />
                -
                <Input
                  autoComplete="off"
                  background="#fff"
                  label="&nbsp;"
                  placeholder="Max"
                  range
                  name="salePriceMaxValue"
                  value={salePrice.salePriceMaxValue}
                  onChange={(e) => {
                    if (REGEX_FOR_DECIMAL_NUMBERS.test(e.target.value)) {
                      handleChangeAdvanceFilters(e);
                    }
                  }}
                  helperText={error.salePriceMaxValue}
                />
              </Box>
            </Grid>
            <Grid item md={4}>
              <Box display="flex" alignItems="center" gap="4px">
                <Input
                  autoComplete="off"
                  background="#fff"
                  label="Stock"
                  placeholder="Min"
                  name="stockMinValue"
                  value={stock.stockMinValue}
                  onChange={(e) => {
                    if (REGEX_FOR_DECIMAL_NUMBERS.test(e.target.value)) {
                      handleChangeAdvanceFilters(e);
                    }
                  }}
                  helperText={error.stockMinValue}
                />
                -
                <Input
                  autoComplete="off"
                  background="#fff"
                  label="&nbsp;"
                  placeholder="Max"
                  name="stockMaxValue"
                  value={stock.stockMaxValue}
                  onChange={(e) => {
                    if (REGEX_FOR_DECIMAL_NUMBERS.test(e.target.value)) {
                      handleChangeAdvanceFilters(e);
                    }
                  }}
                  helperText={error.stockMaxValue}
                />
              </Box>
            </Grid>
            <Grid item md={4}>
              <Box display="flex" alignItems="center" gap="4px">
                <Input
                  autoComplete="off"
                  background="#fff"
                  label="Back Order"
                  placeholder="Min"
                  name="backOrderMinValue"
                  value={backOrder.backOrderMinValue}
                  onChange={(e) => {
                    if (REGEX_FOR_DECIMAL_NUMBERS.test(e.target.value)) {
                      handleChangeAdvanceFilters(e);
                    }
                  }}
                  helperText={error.backOrderMinValue}
                />
                -
                <Input
                  autoComplete="off"
                  background="#fff"
                  label="&nbsp;"
                  placeholder="Max"
                  name="backOrderMaxValue"
                  value={backOrder.backOrderMaxValue}
                  helperText={error.backOrderMaxValue}
                  onChange={(e) => {
                    if (REGEX_FOR_DECIMAL_NUMBERS.test(e.target.value)) {
                      handleChangeAdvanceFilters(e);
                    }
                  }}
                />
              </Box>
            </Grid>
            <Grid item md={4}>
              <Box display="flex" alignItems="center" gap="4px">
                <Input
                  autoComplete="off"
                  background="#fff"
                  label="Reserved"
                  placeholder="Min"
                  name="reservedMinValue"
                  value={reserved.reservedMinValue}
                  helperText={error.reservedMinValue}
                  onChange={(e) => {
                    if (REGEX_FOR_DECIMAL_NUMBERS.test(e.target.value)) {
                      handleChangeAdvanceFilters(e);
                    }
                  }}
                />
                -
                <Input
                  autoComplete="off"
                  background="#fff"
                  label="&nbsp;"
                  placeholder="Max"
                  name="reservedMaxValue"
                  value={reserved.reservedMaxValue}
                  helperText={error.reservedMaxValue}
                  onChange={(e) => {
                    if (REGEX_FOR_DECIMAL_NUMBERS.test(e.target.value)) {
                      handleChangeAdvanceFilters(e);
                    }
                  }}
                />
              </Box>
            </Grid>
            <Grid item md={4}>
              <Box display="flex" alignItems="center" gap="4px">
                <Input
                  autoComplete="off"
                  background="#fff"
                  label="On Order"
                  placeholder="Min"
                  name="onOrderMinValue"
                  value={onOrder.onOrderMinValue}
                  helperText={error.onOrderMinValue}
                  onChange={(e) => {
                    if (REGEX_FOR_DECIMAL_NUMBERS.test(e.target.value)) {
                      handleChangeAdvanceFilters(e);
                    }
                  }}
                />
                -
                <Input
                  autoComplete="off"
                  background="#fff"
                  label="&nbsp;"
                  placeholder="Max"
                  name="onOrderMaxValue"
                  value={onOrder.onOrderMaxValue}
                  helperText={error.onOrderMaxValue}
                  onChange={(e) => {
                    if (REGEX_FOR_DECIMAL_NUMBERS.test(e.target.value)) {
                      handleChangeAdvanceFilters(e);
                    }
                  }}
                />
              </Box>
            </Grid>
          </Grid>
          {/* <Box>
            <Grid container columnSpacing={3}>
              <Grid item md={4}>
                <InputSlider
                  label="Cost"
                  name="costPrice"
                  marginBottom="42px"
                  value={costPrice}
                  onChange={handleChangeAdvanceFilters}
                  min={minMaxProductCostAndSalePrices?.minCostPrice || 0}
                  max={minMaxProductCostAndSalePrices?.maxCostPrice || 0}
                  marks={[
                    minMaxProductCostAndSalePrices?.minCostPrice || 0,
                    minMaxProductCostAndSalePrices?.maxCostPrice || 0
                  ]}
                  defaultValue={costPrice}
                />
              </Grid>
              <Grid item md={4}>
                <InputSlider
                  label="Sale Price"
                  name="salePrice"
                  marginBottom="42px"
                  value={salePrice}
                  onChange={handleChangeAdvanceFilters}
                  min={minMaxProductCostAndSalePrices?.minSalesPrice || 0}
                  max={minMaxProductCostAndSalePrices?.maxSalesPrice || 0}
                  marks={[
                    minMaxProductCostAndSalePrices?.minSalesPrice || 0,
                    minMaxProductCostAndSalePrices?.maxSalesPrice || 0
                  ]}
                  defaultValue={salePrice}
                />
              </Grid>
              <Grid item md={4}>
                <InputSlider
                  label="Stock"
                  name="stock"
                  marginBottom="42px"
                  value={stock}
                  onChange={handleChangeAdvanceFilters}
                  min={minMaxProductCostAndSalePrices?.minStock || 0}
                  max={minMaxProductCostAndSalePrices?.maxStock || 0}
                  marks={[
                    minMaxProductCostAndSalePrices?.minStock || 0,
                    minMaxProductCostAndSalePrices?.maxStock || 0
                  ]}
                  defaultValue={stock}
                />
              </Grid>
              <Grid item md={4}>
                <InputSlider
                  label="Back Order"
                  name="backOrder"
                  marginBottom="42px"
                  value={backOrder}
                  onChange={handleChangeAdvanceFilters}
                  min={minMaxProductCostAndSalePrices?.minBackOrder || 0}
                  max={minMaxProductCostAndSalePrices?.maxBackOrder || 0}
                  marks={[
                    minMaxProductCostAndSalePrices?.minBackOrder || 0,
                    minMaxProductCostAndSalePrices?.maxBackOrder || 0
                  ]}
                  defaultValue={backOrder}
                />
              </Grid>
              <Grid item md={4}>
                <InputSlider
                  label="Reserved"
                  name="reserved"
                  marginBottom="42px"
                  value={reserved}
                  onChange={handleChangeAdvanceFilters}
                  min={minMaxProductCostAndSalePrices?.minReserved || 0}
                  max={minMaxProductCostAndSalePrices?.maxReserved || 0}
                  marks={[
                    minMaxProductCostAndSalePrices?.minReserved || 0,
                    minMaxProductCostAndSalePrices?.maxReserved || 0
                  ]}
                  defaultValue={reserved}
                />
              </Grid>
              <Grid item md={4}>
                <InputSlider
                  label="On Order"
                  name="onOrder"
                  marginBottom="66px"
                  value={onOrder}
                  onChange={handleChangeAdvanceFilters}
                  min={minMaxProductCostAndSalePrices?.minOnOrder || 0}
                  max={minMaxProductCostAndSalePrices?.maxOnOrder || 0}
                  marks={[
                    minMaxProductCostAndSalePrices?.minOnOrder || 0,
                    minMaxProductCostAndSalePrices?.maxOnOrder || 0
                  ]}
                  defaultValue={onOrder}
                />
              </Grid>
            </Grid>
          </Box> */}
          <Box textAlign="right">
            <Button
              text="Search"
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleClickAdvanceSearch}
            />
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default Index;
