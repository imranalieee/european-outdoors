import moment from 'moment';
import React, { useState, useEffect } from 'react';
import {
  Stack, Box, Divider, Grid
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { startCase, isEqual, isEmpty } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
// icons
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
// component
import Button from '../../../../components/button/index';
import CheckBox from '../../../../components/checkbox/index';
import Images from './images';
import Input from '../../../../components/inputs/input/index';
import Inventory from './inventory';
import Location from './location';
import MarketPlaceInventory from './marketPlaceInventory';
import Orders from './orders';
import PackDetailsDrawer from './drawer/packDetails';
import PackComponent from './packComponent';
import PoHistory from './poHistory';
import RelationalProduct from './drawer/relationalProducts';
import Reserved from './reservedQty';
import SearchInput from '../../../../components/searchInput/index';
import Select from '../../../../components/select/index';
import Switch from '../../../../components/switch/index';
import Tabs from '../../../../components/tabs/index';
import Vendors from './vendor';
// redux
import {
  GetProductDetails,
  UpdateProduct,
  SetProductState,
  SetProductNotifyState
} from '../../../../redux/slices/product-slice';
import { GetSuppliers } from '../../../../redux/slices/supplier-slice';
import { SetPackState } from '../../../../redux/slices/pack-slice';
import {
  SetOtherState
} from '../../../../redux/slices/other-slice';
// constants
import { validateUPC } from '../../../../../utils/helpers';
import { REGEX_FOR_NUMBERS, REGEX_FOR_DECIMAL_NUMBERS, amazonCondition } from '../../../../constants/index';
import LoaderWrapper from '../../../../components/loader/index';

const ViewProduct = () => {
  const navigate = useNavigate();
  const params = useParams();
  const dispatch = useDispatch();

  const {
    loading,
    productDetail,
    selectedTabPane
  } = useSelector((state) => state.product);

  const {
    stockJobProgress
  } = useSelector((state) => state.other);

  const {
    user: {
      permissions: { editProducts, viewSuppliers }
    }
  } = useSelector((state) => state.auth);

  const { suppliers = [] } = useSelector((state) => state.supplier);
  const [edit, setEdit] = useState(false);
  const [productLocalData, setProductLocalData] = useState([]);
  const [relationalProductId, setRelationalProductId] = useState('');
  const [newProductHelperText, setNewProductHelperText] = useState({
    stockNumber: '',
    mfgPartNo: '',
    primaryUpcError: '',
    secondaryUpcError: ''
  });
  const [box, setBox] = useState({
    length: null,
    width: null,
    height: null,
    weight: null
  });
  const [specialMakeUp, setSpecialMakeUp] = useState(false);
  const [discontinued, setDiscontinued] = useState(false);
  const [venderCentral, setVenderCentral] = useState(false);
  const [supplierCode, setSupplierCode] = useState('');
  const [quantityInStock, setQuantityInStock] = useState(null);
  const [endOfLife, setEndOfLife] = useState(false);
  const [cancelSave, setCancelSave] = useState(false);
  const [productId, setProductId] = useState(null);

  const [packDetailModal, setPackDetailModal] = useState(false);
  const [relationalProductModal, setRelationalProductModal] = useState(false);

  const [tabValue, setTabValue] = useState();

  const [tabs, setTabs] = useState([
    {
      title: 'Image',
      component: <Images productId={params?.id || ''} />
    },
    {
      title: 'Supplier',
      component: <Vendors props={productLocalData?.supplier} />
    },
    {
      title: 'Orders',
      component: <Orders productId={params?.id || ''} />
    },
    {
      title: 'PO History',
      component: <PoHistory props={productLocalData?.supplier} />
    },
    {
      title: 'Pack Component',
      component: <PackComponent />
    },
    {
      title: 'Inventory I/O',
      component: <Inventory productId={params?.id || ''} />
    },
    {
      title: 'Reserved Qty',
      component: <Reserved productId={params?.id || ''} />
    },
    {
      title: 'Locations',
      component: <Location productId={params?.id || ''} />
    },
    {
      title: 'Marketplace Inventory Controller',
      component: <MarketPlaceInventory productId={params?.id || ''} />
    }
  ]);

  const getProductDetail = (id) => {
    dispatch(GetProductDetails({ productId: id }));
  };

  const getSuppliers = () => {
    dispatch(GetSuppliers({ fetchAll: true }));
  };

  const supplierItems = suppliers.map((item) => ({
    id: item._id,
    value: item._id,
    label: item.code
  }));

  const handleProductChange = (e) => {
    const { value: val, name: key } = e.target;
    const errors = {};

    if (key === 'primaryUpc') {
      if (val) {
        const validUpc = validateUPC(val);
        if (!validUpc) errors.primaryUpcError = 'Please enter a valid UPC (11 or 12 digits only)';
        else errors.primaryUpcError = '';
      } else errors.primaryUpcError = '';
    }

    if (key === 'secondaryUpc') {
      if (val) {
        const validUpc = validateUPC(val);
        if (!validUpc) errors.secondaryUpcError = 'Please enter a valid UPC (11 or 12 digits only)';
        else errors.secondaryUpcError = '';
      } else errors.secondaryUpcError = '';
    }

    if (key === 'specialMakeup'
      || key === 'discontinued'
      || key === 'venderCentral'
      || key === 'endOfLife') {
      const updat = productLocalData?.[key]
        ? productLocalData?.[key] === false : true;

      setProductLocalData({
        ...productLocalData,
        [key]: updat
      });
    } else if (key === 'length'
      || key === 'width'
      || key === 'height'
      || key === 'weight') {
      setBox({
        ...box,
        [key]: val
      });
    } else if ((key === 'stockNumber'
      || key === 'mfgPartNo')) {
      setProductLocalData({
        ...productLocalData,
        [key]: val
      });
      if (!val) { errors[key] = `${startCase(key)} is required!`; } else {
        errors[key] = '';
      }
    } else {
      errors[key] = '';
      setProductLocalData({
        ...productLocalData,
        [key]: val
      });
    }

    setNewProductHelperText((prevHelperText) => ({
      ...prevHelperText,
      ...errors
    }));
  };

  const handleSaveEditProduct = () => {
    const errors = {};
    Object.keys(productLocalData).forEach((key) => {
      if ((key === 'stockNumber' || key === 'mfgPartNo') && !productLocalData[key]) {
        errors[key] = `${startCase(key)} is required!`;
      } else if (key === 'costPrice'
        || key === 'salePrice'
        || key === 'mapPrice'
        || key === 'msrpPrice') {
        if (productLocalData[key] && !REGEX_FOR_DECIMAL_NUMBERS.test(productLocalData[key])) {
          errors[key] = ' ';
        }
      } else if (key === 'minimumOq') {
        if (productLocalData[key] && !REGEX_FOR_NUMBERS.test(productLocalData[key])) {
          errors[key] = ' ';
        }
      } else if (productLocalData[key] && key === 'primaryUpc') {
        const validUpc = validateUPC(productLocalData[key]);
        if (!validUpc) errors.primaryUpcError = 'Please enter a valid UPC (11 or 12 digits only)';
        else errors.primaryUpcError = '';
      } else if (productLocalData[key] && key === 'secondaryUpc') {
        const validUpc = validateUPC(productLocalData[key]);
        if (!validUpc) errors.secondaryUpcError = 'Please enter a valid UPC (11 or 12 digits only)';
        else errors.secondaryUpcError = '';
      } else {
        errors[key] = '';
      }
    });

    setNewProductHelperText((prevHelperText) => ({
      ...prevHelperText,
      ...errors
    }));

    if (Object.values(errors).every((errorValue) => errorValue === '')) {
      const prevObject = { ...productDetail };

      productLocalData.onOrderQuantity = Number(productLocalData?.onOrderQuantity || 0);
      productLocalData.backOrderQuantity = Number(productLocalData?.backOrderQuantity || 0);
      productLocalData.quantityInStock = Number(productLocalData?.quantityInStock || 0);
      productLocalData.minimumOq = Number(productLocalData?.minimumOq || 0);
      productLocalData.costPrice = Number(productLocalData?.costPrice || 0);
      productLocalData.salePrice = Number(productLocalData?.salePrice || 0);
      productLocalData.mapPrice = Number(productLocalData?.mapPrice || 0);
      productLocalData.msrpPrice = Number(productLocalData?.msrpPrice || 0);
      const supp = productLocalData?.supplier?._id;
      if (isEmpty(supp)) {
        prevObject.supplier = prevObject?.supplier?._id;
      }

      if (!isEqual(productLocalData?.quantityInStock, prevObject?.quantityInStock)) {
        dispatch(SetProductState({
          field: 'loadTabData',
          value: false
        }));
        dispatch(SetOtherState({
          field: 'stockJobProgress',
          value: 0
        }));
      }

      if (isEqual(prevObject, productLocalData)) {
        dispatch(
          SetProductNotifyState({
            message: 'Nothing updated !',
            type: 'info'
          })
        );
      } else {
        dispatch(UpdateProduct({
          productId: productLocalData?._id, updateParams: productLocalData
        }));
      }

      setEdit(!edit);
    }
  };

  const inputNumberHandle = (e, regex) => {
    if (regex.test(e.target.value)) {
      handleProductChange(e);
    } else {
      e.target.value = '';
    }
  };

  const handleTabValue = (newValue) => {
    dispatch(SetProductState({ field: 'selectedTabPane', value: newValue }));
    setTabValue(newValue);
  };

  const handleNotification = () => {
    if (stockJobProgress === 100) {
      const { id } = params;
      dispatch(SetProductState({
        field: 'loadTabData',
        value: true
      }));
      getProductDetail(id);
      dispatch(SetOtherState({
        field: 'stockJobProgress',
        value: undefined
      }));
    }
  };

  useEffect(() => {
    if (!isEmpty(productDetail)) {
      const filteredTabs = productDetail.isPacked ? tabs.filter((item) => item.title !== 'Supplier' && item.title !== 'PO History')
        : tabs.filter((item) => item.title !== 'Pack Component');

      setTabs(filteredTabs);
      setNewProductHelperText({});
      setProductLocalData({ ...productDetail });
      setSpecialMakeUp(productDetail?.specialMakeup || false);
      setDiscontinued(productDetail?.discontinued || false);
      setQuantityInStock(productDetail?.quantityInStock || null);
      setVenderCentral(productDetail?.venderCentral || false);
      setRelationalProductId(productDetail?.relationalProduct?.stockNumber || '');
      setEndOfLife(productDetail?.endOfLife || false);
      setBox({
        ...box,
        length: productDetail?.boxDimensions?.length || null,
        width: productDetail?.boxDimensions?.width || null,
        height: productDetail?.boxDimensions?.height || null,
        weight: productDetail?.boxDimensions?.weight || null

      });
    }
    setProductLocalData({
      ...productDetail,
      shippingNote: productDetail?.shippingNote || '',
      secondaryUpc: productDetail?.secondaryUpc || '',
      primaryUpc: productDetail?.primaryUpc || '',
      amazonCondition: productDetail?.amazonCondition || ''
    });
  }, [productDetail, cancelSave]);

  useEffect(() => {
    if (productDetail?.supplier?._id) {
      setSupplierCode(productDetail?.supplier?._id);
    }
  }, [productDetail?.supplier?._id]);

  useEffect(() => {
    setProductLocalData({
      ...productLocalData,
      boxDimensions: box
    });
  }, [box]);

  useEffect(() => {
    setQuantityInStock(productLocalData?.quantityInStock);
  }, [productLocalData?.quantityInStock]);

  useEffect(() => {
    // Update the tabs state when the productId changes
    if (productId) {
      const updatedTabs = tabs.map((tab) => {
        if (tab.title === 'Image') {
          return {
            ...tab,
            component: <Images productId={productId} />
          };
        }
        if (tab.title === 'Marketplace Inventory Controller') {
          return {
            ...tab,
            component: <MarketPlaceInventory productId={productId} />
          };
        }
        if (tab.title === 'Locations') {
          return {
            title: 'Locations',
            component: <Location productId={productId} />
          };
        }
        if (tab.title === 'Orders') {
          return {
            title: 'Orders',
            component: <Orders productId={productId} />
          };
        }
        if (tab.title === 'Inventory I/O') {
          return {
            title: 'Inventory I/O',
            component: <Inventory productId={productId} />
          };
        }
        // Handle other tabs if necessary
        return tab;
      });

      setTabs(updatedTabs);
    }
  }, [productId]);

  useEffect(() => {
    if (!isEmpty(productLocalData?.supplier)) {
      const updatedTabs = tabs.map((tab) => {
        if (tab.title === 'Supplier') {
          return {
            ...tab,
            component: <Vendors props={productLocalData?.supplier} />
          };
        } if (tab.title === 'PO History') {
          return {
            ...tab,
            component: <PoHistory props={productLocalData?.supplier} />
          };
        }
        // Handle other tabs if necessary
        return tab;
      });

      setTabs(updatedTabs);
    }
  }, [productLocalData]);

  useEffect(() => {
    setTabValue(selectedTabPane);
  }, [selectedTabPane]);

  useEffect(() => () => {
    if (!(window.location.pathname.startsWith('/products/')
      || window.location.pathname.startsWith('/products'))) {
      dispatch(SetProductState({ field: 'selectedTabPane', value: 0 }));
    }
  }, []);

  useEffect(() => {
    const { id } = params;
    getProductDetail(id);

    if (viewSuppliers) getSuppliers();
    setProductId(id);

    return () => {
      dispatch(SetProductState({ field: 'productDetail', value: {} }));
      dispatch(SetPackState({ field: 'packDetail', value: [] }));
      if (window.location.pathname !== '/products') {
        dispatch(SetProductState({
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
        }));
        dispatch(SetProductState({ field: 'productManagerPageNumber', value: 1 }));
        dispatch(SetProductState({ field: 'productManagerPageLimit', value: 100 }));
        dispatch(SetProductState({ field: 'packItemsPagination', value: 100 }));
        dispatch(SetPackState({ field: 'packDetailsPageLimit', value: 100 }));
        dispatch(SetPackState({ field: 'packDetailsPageNumber', value: 1 }));
      }
    };
  }, []);

  useEffect(() => {
    handleNotification();
  }, [stockJobProgress]);

  return (
    <>
      {loading ? <LoaderWrapper /> : null}
      <Box
        display="flex"
        justifyContent="space-between"
        pt={3}
        pb={3}
        marginTop="-24px"
        mb={3}
        sx={{
          position: 'sticky',
          top: '47.5px',
          zIndex: '999',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid rgb(151, 151, 151, 0.25)'
        }}
      >
        <Stack alignItems="center" direction="row" spacing={3}>
          <Box component="span" className="icon-left pointer" onClick={() => navigate(-1)} />
          <h2 className="m-0 pl-2">
            {' '}
            {`Product No.${productLocalData?.stockNumber || '--'}`}
          </h2>
        </Stack>
      </Box>
      <Grid container justifyContent="space-between" alignItems="center" columnSpacing={1}>
        <Grid md={3} item>
          <SearchInput
            autoComplete="off"
            value={relationalProductId}
            placeholder="Relational Product"
            label="Relational Product"
            width="100%"
            onClick={() => setRelationalProductModal(true)}
          />
        </Grid>
        <Grid md={3} item>
          <Box textAlign="right" mt={1}>
            {edit
              ? (
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button
                    startIcon={<CancelOutlinedIcon sx={{ color: '#3C76FF' }} fontSize="16px" />}
                    text="Cancel"
                    onClick={() => {
                      setCancelSave(!cancelSave);
                      setEdit(false);
                    }}
                  />
                  <Button
                    onClick={handleSaveEditProduct}
                    startIcon={<span className="icon-Save" />}
                    text="Save Changes"
                    variant="contained"
                  />
                </Stack>
              ) : (
                <Button
                  disabled={!editProducts}
                  startIcon={<span className="icon-edit" />}
                  text="Edit"
                  onClick={() => setEdit(true)}
                />
              )}

          </Box>
        </Grid>
      </Grid>
      <Divider sx={{ margin: '24px 0 18px 0' }} />
      <Stack alignItems="center" flexWrap="wrap" gap={2} justifyContent="space-between" direction="row">
        <h3 className="m-0">Product Information</h3>
        <Stack direction="row" flexWrap="wrap">
          {productLocalData?.isPacked
            && (
              <Box component="span" display="flex" alignItems="center">
                <Switch
                  checked
                />
                <Box
                  component="span"
                  ml={1}
                  className="pack  active pointer"
                  disabled
                  onClick={() => {
                    setPackDetailModal(true);
                  }}
                  sx={{ marginRight: '14px' }}
                >
                  <Box component="span" mr={0.5} className="icon-products" />
                  Pack Details
                </Box>
              </Box>
            )}
          <Divider
            orientation="vertical"
            flexItem
            sx={{ height: '20px', margin: '0 21px 0px 15px', marginTop: '4px' }}
          />
          <Stack direction="row" spacing={1} sx={{ marginTop: '-2px' }}>
            <CheckBox
              name="specialMakeup"
              disabled={!edit}
              label="SMU"
              marginBottom="0px"
              checked={specialMakeUp}
              onChange={(e) => {
                setSpecialMakeUp(!specialMakeUp);
                handleProductChange(e);
              }}
            />
            <CheckBox
              checked={discontinued}
              name="discontinued"
              disabled={!edit}
              label="Discontinued"
              marginBottom="0px"
              onChange={(e) => {
                setDiscontinued(!discontinued);
                handleProductChange(e);
              }}
            />
            <CheckBox
              name="venderCentral"
              disabled={!edit}
              label="Vender Central"
              marginBottom="0px"
              checked={venderCentral}
              onChange={(e) => {
                setVenderCentral(!venderCentral);
                handleProductChange(e);
              }}
            />

          </Stack>
          <Divider
            orientation="vertical"
            flexItem
            sx={{ height: '20px', margin: '0 10px 0px 16px', marginTop: '4px' }}
          />
          <Switch
            name="endOfLife"
            disabled={!edit}
            checked={endOfLife}
            onChange={(e) => {
              setEndOfLife(!endOfLife);
              handleProductChange(e);
            }}
            offText="End of Life"
            onText="End of Life"
            width={96}
            danger
            thumbColor="#E61F00"
          />
        </Stack>
      </Stack>
      <Grid container columnSpacing={3} sx={{ marginTop: '10px' }}>
        <Grid md={3} item>
          <Input
            autoComplete="off"
            disabled
            name="stockNumber"
            onChange={(e) => handleProductChange(e)}
            value={productLocalData?.stockNumber}
            label="Stock Number"
            placeholder="Stock Number"
            width="100%"
            marginBottom="17px"
            helperText={newProductHelperText.stockNumber}
          />
        </Grid>
        <Grid md={9} item>
          <Input
            autoComplete="off"
            disabled={!edit}
            name="title"
            onChange={(e) => handleProductChange(e)}
            value={productLocalData?.title}
            label="Title"
            width="100%"
            placeholder="Product Title"
          />
        </Grid>
        <Grid md={3} item>
          <Input
            autoComplete="off"
            disabled={!edit}
            name="mfgPartNo"
            onChange={(e) => handleProductChange(e)}
            value={productLocalData?.mfgPartNo}
            label="MFG Part No."
            placeholder="MFG Part No."
            width="100%"
            marginBottom="17px"
            helperText={newProductHelperText.mfgPartNo}
          />
        </Grid>
        <Grid md={3} item>
          <Input
            autoComplete="off"
            disabled={!edit}
            name="primaryUpc"
            onChange={(e) => handleProductChange(e)}
            value={productLocalData?.primaryUpc}
            label="Primary UPC"
            placeholder="Primary UPC"
            width="100%"
            marginBottom="16px"
            helperText={newProductHelperText.primaryUpcError}
          />
        </Grid>
        <Grid md={3} item>
          <Input
            autoComplete="off"
            disabled={!edit}
            name="secondaryUpc"
            onChange={(e) => handleProductChange(e)}
            value={productLocalData?.secondaryUpc}
            label="Secondary UPC"
            placeholder="Secondary UPC"
            width="100%"
            marginBottom="16px"
            helperText={newProductHelperText.secondaryUpcError}
          />
        </Grid>
        {!productLocalData?.isPacked && (
          <Grid md={3} item>
            <Select
              value={supplierCode}
              disabled={!edit}
              handleChange={(e) => {
                setSupplierCode(e.target.value);
                handleProductChange(e);
              }}
              name="supplier"
              label="Supplier Code"
              width="100%"
              placeholder="Supplier Code"
              menuItem={supplierItems}
            />
          </Grid>
        )}
      </Grid>
      <Divider sx={{ margin: '8px 0 24px 0' }} />
      <Grid container columnSpacing={3} rowSpacing={3} sx={{ marginTop: '10px' }}>
        <Grid md={6} xs={12} item>
          <Box sx={{ border: '1px solid #D9D9D9' }} p={3} borderRadius={1} pb={0.5}>
            <Box display="flex" justifyContent="space-between" className="pointer">
              <h3>Inventory</h3>
            </Box>
            <Divider sx={{ marginBottom: '24px' }} />
            <Grid container flexWrap="nowrap">
              <Grid md={6}>
                <Box display="flex" justifyContent="space-between" height="44px">
                  <Box component="span" color="#979797">
                    MFG Stock
                  </Box>
                  <Box component="span" color="#272B41" sx={{ padding: '0px 12px' }}>
                    --
                  </Box>
                </Box>
                <Box display="flex" justifyContent="space-between" height="44px">
                  <Box component="span" color="#979797">
                    Qty. in Stock
                  </Box>
                  {!edit || productLocalData.isPacked ? (
                    <Box component="span" color="#272B41" sx={{ padding: '0px 12px' }}>
                      {quantityInStock || '--'}
                    </Box>
                  ) : (
                    <Input
                      autoComplete="off"
                      name="quantityInStock"
                      onChange={(e) => inputNumberHandle(e, REGEX_FOR_NUMBERS)}
                      value={quantityInStock || ''}
                      defaultValue={1}
                      width="72px"
                      marginBottom="0px"
                      align="right"
                      type="text"
                      helperText={newProductHelperText.quantityInStock}
                    />
                  )}
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Box component="span" color="#979797">
                    Qty. on BO
                  </Box>
                  <Box component="span" color="#272B41" sx={{ padding: '0px 12px' }}>
                    {productLocalData.backOrderQuantity || '--'}
                  </Box>
                </Box>
              </Grid>
              <Divider
                orientation="vertical"
                variant="middle"
                flexItem
                sx={{ marginRight: '24px', marginLeft: '18px', height: '113px' }}
              />
              <Grid md={6}>
                <Box display="flex" justifyContent="space-between" mb={3.5}>
                  <Box component="span" color="#979797">
                    Qty. Reserved
                  </Box>
                  <Box component="span" color="#272B41">
                    {productLocalData.backOrderQuantity || '--'}
                  </Box>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={3.5}>
                  <Box component="span" color="#979797">
                    Qty. on Order
                  </Box>
                  <Box component="span" color="#272B41">
                    {productLocalData.onOrderQuantity || '--'}
                  </Box>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={3.5}>
                  <Box component="span" color="#979797">
                    MOQ.
                  </Box>
                  {!edit || productLocalData.isPacked ? (
                    <Box component="span" color="#272B41">
                      {productLocalData?.minimumOq || '--'}
                    </Box>
                  ) : (
                    <Input
                      autoComplete="off"
                      name="minimumOq"
                      onChange={(e) => inputNumberHandle(e, REGEX_FOR_NUMBERS)}
                      value={productLocalData?.minimumOq || ''}
                      defaultValue={0}
                      width="72px"
                      marginBottom="0px"
                      align="right"
                      type="text"
                      helperText={newProductHelperText.minimumOq}
                    />
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>

        </Grid>
        <Grid md={6} xs={12} item>
          <Box sx={{ border: '1px solid #D9D9D9' }} py={3} px={2.5} borderRadius={1} pb={1.75}>
            <Box display="flex" justifyContent="space-between" className="pointer">
              <h3>Pricing</h3>
            </Box>
            <Divider sx={{ marginBottom: '24px' }} />
            <Grid container flexWrap="nowrap">
              <Grid md={6}>
                <Box display="flex" justifyContent="space-between" height="44px">
                  <Box component="span" color="#979797">
                    Cost Price
                  </Box>
                  {!edit || productLocalData.isPacked ? (
                    <Box component="span" color="#272B41" sx={{ padding: '0px 12px' }}>
                      {`$${Number(productLocalData?.costPrice || 0)?.toFixed(2)}`}
                    </Box>
                  ) : (
                    <Input
                      autoComplete="off"
                      name="costPrice"
                      onChange={(e) => {
                        inputNumberHandle(e, REGEX_FOR_DECIMAL_NUMBERS);
                      }}
                      value={productLocalData?.costPrice || ''}
                      defaultValue={0}
                      width="80px"
                      marginBottom="0px"
                      align="right"
                      type="text"
                      helperText={newProductHelperText.costPrice}
                    />
                  )}
                </Box>
                <Box display="flex" justifyContent="space-between" height="44px">
                  <Box component="span" color="#979797">
                    Sell Price
                  </Box>
                  {!edit || productLocalData.isPacked ? (
                    <Box component="span" color="#272B41" sx={{ padding: '0px 12px' }}>
                      {`$${Number(productLocalData?.salePrice || 0)?.toFixed(2)}`}
                    </Box>
                  ) : (
                    <Input
                      autoComplete="off"
                      name="salePrice"
                      onChange={(e) => inputNumberHandle(e, REGEX_FOR_DECIMAL_NUMBERS)}
                      value={productLocalData?.salePrice || ''}
                      defaultValue={0}
                      width="80px"
                      marginBottom="0px"
                      type="text"
                      minValue={0}
                      align="right"
                      helperText={newProductHelperText.salePrice}
                    />
                  )}
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Box component="span" color="#979797">
                    MAP
                  </Box>
                  {!edit || productLocalData.isPacked ? (
                    <Box component="span" color="#272B41" sx={{ padding: '0px 12px' }}>
                      {`$${Number(productLocalData?.mapPrice || 0)?.toFixed(2)}` || '$0.00'}
                    </Box>
                  ) : (
                    <Input
                      autoComplete="off"
                      name="mapPrice"
                      onChange={(e) => inputNumberHandle(e, REGEX_FOR_DECIMAL_NUMBERS)}
                      value={productLocalData?.mapPrice || ''}
                      defaultValue={0}
                      width="80px"
                      type="text"
                      minValue={0}
                      marginBottom="0px"
                      align="right"
                      helperText={newProductHelperText.mapPrice}
                    />
                  )}
                </Box>
              </Grid>
              <Divider
                orientation="vertical"
                variant="middle"
                flexItem
                sx={{ marginX: '24px', marginY: '0px', height: '120px' }}
              />
              <Grid md={6}>
                <Box display="flex" justifyContent="space-between" height="44px">
                  <Box component="span" color="#979797">
                    Last Update
                  </Box>
                  <Box component="span" color="#272B41">
                    {productLocalData?.updatedAt
                      ? moment(productLocalData?.updatedAt).format('LLL')
                      : null}
                  </Box>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1.5}>
                  <Box component="span" color="#979797">
                    MSRP
                    {' '}
                    <InfoOutlinedIcon sx={{ fontSize: 16, color: '#3C76FF' }} />
                  </Box>
                  {!edit || productLocalData.isPacked ? (
                    <Box component="span" color="#272B41">
                      {`$${Number(productLocalData?.msrpPrice || 0)?.toFixed(2)}` || '$0.00'}
                    </Box>
                  ) : (
                    <Input
                      autoComplete="off"
                      name="msrpPrice"
                      onChange={(e) => inputNumberHandle(e, REGEX_FOR_DECIMAL_NUMBERS)}
                      value={productLocalData?.msrpPrice || ''}
                      defaultValue={0}
                      width="80px"
                      marginBottom="0px"
                      type="text"
                      minValue={0}
                      align="right"
                      helperText={newProductHelperText.msrpPrice}
                    />
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
      <Divider sx={{ margin: '24px 0 24px 0' }} />
      <Grid container columnSpacing={3} rowSpacing={3}>
        <Grid item md={3} xs={12}>
          <Box py={3} pr={3} pl={2.875} sx={{ border: '1px solid #D9D9D9;' }} borderRadius={1}>
            <h3>Amazon Condition</h3>
            <Divider sx={{ marginTop: '8px', marginBottom: '12px' }} />
            <Select
              disabled={!edit}
              name="amazonCondition"
              value={productLocalData?.amazonCondition || ''}
              label="Label"
              handleChange={(e) => handleProductChange(e)}
              menuItem={amazonCondition}
              placeholder="Condition"
            />
          </Box>
        </Grid>
        <Grid item md={4} xs={12}>
          <Box py={3} px={2.75} sx={{ border: '1px solid #D9D9D9;' }} borderRadius={1}>
            <h3>Shipping Note</h3>
            <Divider sx={{ marginTop: '9px', marginBottom: '9px' }} />
            <Input
              autoComplete="off"
              name="shippingNote"
              disabled={!edit}
              value={productLocalData?.shippingNote}
              onChange={(e) => handleProductChange(e)}
              height="50%"
              placeholder="Shipping Note"
              multiline
              maxRows={1}
              width="100%"
              marginBottom="0"
            />
          </Box>
        </Grid>
        <Grid item md={5} xs={12}>
          <Box p={3} pb={1.25} sx={{ border: '1px solid #D9D9D9;' }} borderRadius={1}>
            <Box display="flex" justifyContent="space-between" className="pointer">
              <h3>Box Dimensions</h3>
            </Box>
            <Divider sx={{ marginTop: '0px', marginBottom: '13px' }} />
            <Stack direction="row" justifyContent="space-between">
              <Box display="flex" flexDirection="column" pb={1.5}>
                <label>Length (Inches)</label>
                {!edit
                  ? (
                    <Box component="span" color="#272B41" sx={{ padding: '8px 12px' }}>
                      {box?.length || '--'}

                    </Box>
                  )
                  : (
                    <Input
                      autoComplete="off"
                      name="length"
                      onChange={(e) => inputNumberHandle(e, REGEX_FOR_DECIMAL_NUMBERS)}
                      type="text"
                      value={box?.length || ''}
                      defaultValue={0}
                      width="90px"
                      marginBottom="0"
                    />
                  )}
              </Box>
              <Box display="flex" flexDirection="column" pb={1.5}>
                <label>Width (Inches)</label>
                {!edit
                  ? (
                    <Box component="span" color="#272B41" sx={{ padding: '8px 12px' }}>
                      {box?.width || '--'}

                    </Box>
                  )
                  : (
                    <Input
                      autoComplete="off"
                      name="width"
                      type="text"
                      onChange={(e) => inputNumberHandle(e, REGEX_FOR_DECIMAL_NUMBERS)}
                      value={box?.width || ''}
                      defaultValue={0}
                      width="90px"
                      marginBottom="0"
                    />
                  )}
              </Box>
              <Box display="flex" flexDirection="column" pb={1.5}>
                <label>Height (Inches)</label>
                {!edit
                  ? (
                    <Box component="span" color="#272B41" sx={{ padding: '8px 12px' }}>
                      {box?.height || '--'}
                    </Box>
                  ) : (
                    <Input
                      autoComplete="off"
                      name="height"
                      type="text"
                      onChange={(e) => inputNumberHandle(e, REGEX_FOR_DECIMAL_NUMBERS)}
                      value={box?.height || ''}
                      defaultValue={0}
                      width="90px"
                      marginBottom="0"
                    />
                  )}
              </Box>
              <Box display="flex" flexDirection="column" pb={1.5}>
                <label>Weight (Lbs)</label>
                {!edit
                  ? (
                    <Box component="span" color="#272B41" sx={{ padding: '8px 12px' }}>
                      {box?.weight || '--'}
                    </Box>
                  ) : (
                    <Input
                      autoComplete="off"
                      name="weight"
                      onChange={(e) => inputNumberHandle(e, REGEX_FOR_DECIMAL_NUMBERS)}
                      type="text"
                      value={box?.weight || ''}
                      align="right"
                      defaultValue={0}
                      width="90px"
                      marginBottom="0"
                    />
                  )}
              </Box>
            </Stack>
          </Box>
        </Grid>
      </Grid>
      {/* {progress !== undefined
        && (
          <Alert severity="info" marginBottom="26px" className="alert-progress">
            <Box component="p" fontWeight={600} fontSize="11px" lineHeight="14px" mb={1}>
              Stock is Continue to being assign to the Order,
              available to the backordered. Please wait........
            </Box>
            <ProgressBar value={progress} />
          </Alert>
        )} */}
      <Divider sx={{ marginTop: '24px', marginBottom: '24px' }} />
      <Tabs
        tabs={tabs}
        value={tabValue}
        onTabChange={(newValue) => handleTabValue(newValue)}
        className="shipments-tabs"
      />
      {packDetailModal
        ? (
          <PackDetailsDrawer
            productId={params?.id}
            onOpen={packDetailModal}
            onClose={() => setPackDetailModal(false)}
          />
        )
        : null}
      {relationalProductModal
        ? (
          <RelationalProduct
            productId={params?.id}
            isOpen={relationalProductModal}
            onClose={() => setRelationalProductModal(false)}
            relationalProduct={productDetail?.relationalProduct}
          />
        )
        : null}
    </>
  );
};

export default ViewProduct;
