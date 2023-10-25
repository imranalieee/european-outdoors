import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Stack, TableCell, TableRow, Divider, Grid, Tooltip
} from '@mui/material';
import ReactToPrint from 'react-to-print';

import { useDispatch, useSelector } from 'react-redux';
import { startCase, extend, isEmpty, camelCase } from 'lodash';
import moment from 'moment';
import { jsPDF as JsPDF } from 'jspdf';

import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
// component
import AutoComplete from '../../../../components/autoComplete';
import Button from '../../../../components/button/index';
import Table from '../../../../components/ag-grid-table/index';
import Pagination from '../../../../components/pagination/index';
import Drawer from '../../../../components/drawer/index';
import Select from '../../../../components/select/index';
import Input from '../../../../components/inputs/input/index';
import CheckBox from '../../../../components/checkbox/index';
import LoaderWrapper from '../../../../components/loader/index';
import ItemDelete from './modals/delete';
import BarcodeFile from '../../orders/component/print/barcodeFile';

// images
import noData from '../../../../static/images/no-data-table.svg';

import {
  SetProductState,
  AddNewMarketplaceInventoryController,
  UpdateMarketplaceInventoryController,
  GetMarketplaceInventoryController,
  SetProductNotifyState,
  DeleteMarketplaceInventoryController
} from '../../../../redux/slices/product-slice';

import { GetStores, SetStoreState, GetInventorySkuListByStoreId } from '../../../../redux/slices/store-slice';

import { GenerateBarCode, validateUPC } from '../../../../../utils/helpers';
import {
  marketPlaceHeader,
  productMarketplaceControllerSort
} from '../../../../constants/index';

const Inventory = ({ productId }) => {
  const dispatch = useDispatch();
  const tableRef = useRef();

  const {
    success,
    marketLoading,
    marketPlaceLoading,
    totalMarketplaceInventoryControllers,
    marketplaceInventoryControllersList,
    marketplaceInventoryControllerDeleted,
    marketplaceInventoryControllerUpdated,
    marketplaceInventoryControllerDeletedLoading
  } = useSelector((state) => state.product);
  const { user: { userId } } = useSelector((state) => state.auth);

  const {
    stores,
    loading,
    inventorySkuList,
    isListReceived
  } = useSelector((state) => state.store);

  const [data, setData] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageLimit, setPageLimit] = useState(100);
  const [deleteItem, setDeleteItem] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editMarketplaceInventoryController,
    setEditMarketplaceInventoryController] = useState(false);
  const [addMarketplaceInventoryController,
    setAddMarketplaceInventoryController] = useState(false);
  const [editInventoryControllerData, setEditInventoryControllerData] = useState({
    marketplace: '',
    title: '',
    sku: '',
    upc: '',
    asin: ''
  });
  const [selectedInventoryController, setSelectedInventoryController] = useState({
    _id: '',
    marketplace: '',
    title: '',
    sku: '',
    upc: '',
    asin: '',
    inventoryController: false
  });

  const [controlInventory, setControlInventory] = useState({
    key: 'no',
    value: false
  });

  const [newMarketplaceInventoryControllerHelperText,
    setNewMarketplaceInventoryControllerHelperText] = useState({
    marketplace: '',
    sku: ''
  });

  const [newMarketplaceInventoryController, setNewMarketplaceInventoryController] = useState({
    marketplace: '',
    title: '',
    sku: '',
    upc: ''
  });

  const [selectedMarketplace, setSelectedMarketplace] = useState({
    id: '',
    name: ''
  });
  const [skuList, setSkuList] = useState([]);
  const [selectedSku, setSelectedSku] = useState({ value: '', label: '' });

  const [sortValue, setSortValue] = useState({});

  const createData = (
    _id,
    title,
    marketplace,
    sku,
    Upc,
    asin,
    update,
    action
  ) => ({
    _id,
    title,
    marketplace,
    sku,
    Upc,
    asin,
    update,
    action
  });

  const handleEditMarketplaceInventoryController = (e) => {
    setIsLoading(true);
    dispatch(SetStoreState({ field: 'isListReceived', value: false }));
    const { value, name: key } = e.target;

    if (key === 'controlInventoryYes' || key === 'controlInventoryNo') {
      const { checked } = e.target;

      if (key === 'controlInventoryNo') {
        setControlInventory({
          key: 'no',
          value: checked
        });
      } else {
        setControlInventory({
          key: 'yes',
          value: checked
        });
      }
    } else if (key === 'marketplace') {
      const { label } = stores.find((storeObj) => storeObj.value === value);

      setSelectedSku({ value: '', label: '' });
      setSelectedMarketplace({
        id: value,
        name: label
      });

      if (selectedInventoryController.marketplace === value) {
        setSkuList([{
          value: selectedInventoryController.sku, label: selectedInventoryController.sku
        }]);
        setSelectedSku({
          value: selectedInventoryController.sku,
          label: selectedInventoryController.sku
        });
        setEditInventoryControllerData({
          ...editInventoryControllerData,
          [key]: value,
          sku: selectedInventoryController.sku,
          upc: selectedInventoryController.upc,
          title: selectedInventoryController.title,
          asin: selectedInventoryController.asin
        });
      } else {
        setSkuList([]);
        setSelectedSku({ value: '', label: '' });
        setEditInventoryControllerData({
          ...editInventoryControllerData,
          [key]: value,
          sku: '',
          title: '',
          upc: '',
          asin: ''
        });
      }
    } else {
      setEditInventoryControllerData({
        ...editInventoryControllerData,
        [key]: value
      });
    }

    const errors = {};

    if (key === 'marketplace' || key === 'sku') {
      errors.sku = '';
      errors.upc = '';
    }

    if (key !== 'controlInventoryNo' && key !== 'title' && key !== 'controlInventoryYes') {
      if (!value) errors[key] = `${startCase(key)} is required!`;
      else if (value) {
        errors[key] = '';
      }
    }

    if (key === 'upc') {
      if (value && (value.length < 11 || value.length > 12)) {
        errors.upc = 'Please enter a valid UPC (11 or 12 digits only)';
      } else if (value && !validateUPC(value)) {
        errors[key] = 'Please enter a valid UPC (11 or 12 digits only)';
      } else {
        errors.upc = '';
      }
    }

    setNewMarketplaceInventoryControllerHelperText((prevHelperText) => ({
      ...prevHelperText,
      ...errors
    }));
  };

  const handleAddMarketplaceInventoryController = (e) => {
    setIsLoading(true);
    dispatch(SetStoreState({ field: 'isListReceived', value: false }));
    const { value, name: key } = e.target;

    if (key === 'controlInventoryYes' || key === 'controlInventoryNo') {
      const { checked } = e.target;

      if (key === 'controlInventoryNo') {
        setControlInventory({
          key: 'no',
          value: checked
        });
      } else {
        setControlInventory({
          key: 'yes',
          value: checked
        });
      }
    } else if (key === 'marketplace') {
      const { label } = stores.find((storeObj) => storeObj.value === value);

      setSelectedSku({ value: '', label: '' });
      setSelectedMarketplace({
        id: value,
        name: label
      });
      setSkuList([]);
      setNewMarketplaceInventoryController({
        ...newMarketplaceInventoryController,
        [key]: value,
        sku: '',
        upc: '',
        title: '',
        asin: ''
      });
    } else {
      setNewMarketplaceInventoryController({
        ...newMarketplaceInventoryController,
        [key]: value
      });
    }

    const errors = {};

    if (key === 'marketplace' || key === 'sku') {
      errors.sku = '';
      errors.upc = '';
    }

    if (key !== 'controlInventoryNo' && key !== 'controlInventoryYes' && key !== 'title') {
      if (!value) errors[key] = `${startCase(key)} is required!`;
      else if (value) {
        errors[key] = '';
      }
    }

    if (key === 'upc') {
      if (value && (value.length < 11 || value.length > 12)) {
        errors.upc = 'Please enter a valid UPC (11 or 12 digits only)';
      } else if (value && !validateUPC(value)) {
        errors[key] = 'Please enter a valid UPC (11 or 12 digits only)';
      } else {
        errors.upc = '';
      }
    }

    setNewMarketplaceInventoryControllerHelperText((prevHelperText) => ({
      ...prevHelperText,
      ...errors
    }));
  };

  const handleMappingDropDownChange = ({ selectDropDown, key }) => {
    const { label = '', value = '' } = selectDropDown || {};

    const mode = addMarketplaceInventoryController ? 'add' : 'edit';

    setSelectedSku({
      label,
      value
    });

    if (label === '') {
      setNewMarketplaceInventoryControllerHelperText((prevHelperText) => ({
        ...prevHelperText,
        [key]: `${startCase(key)} is required!`
      }));
    } else {
      setNewMarketplaceInventoryControllerHelperText((prevHelperText) => ({
        ...prevHelperText,
        [key]: ''
      }));
    }

    setNewMarketplaceInventoryControllerHelperText({
      marketplace: '',
      sku: ''
    });

    if (mode === 'add') {
      const inventoryObj = inventorySkuList?.find((obj) => (obj.sellerSku) === (value));

      if (!isEmpty(inventoryObj)) {
        const { upc, title, asin } = inventoryObj;
        setNewMarketplaceInventoryController({
          ...newMarketplaceInventoryController,
          [key]: label,
          upc,
          title,
          asin
        });
      } else {
        setNewMarketplaceInventoryController({
          ...newMarketplaceInventoryController,
          [key]: label,
          upc: '',
          title: '',
          asin: ''
        });
      }
    } else if (mode === 'edit') {
      const inventoryObj = inventorySkuList?.find((obj) => (obj.sellerSku) === (value));

      if (value === selectedInventoryController.sku) {
        setEditInventoryControllerData({
          ...editInventoryControllerData,
          [key]: label,
          upc: selectedInventoryController.upc,
          title: selectedInventoryController.title,
          asin: selectedInventoryController.asin
        });
      } else if (!isEmpty(inventoryObj)) {
        const { upc, title, asin } = inventoryObj;
        setEditInventoryControllerData({
          ...editInventoryControllerData,
          [key]: label,
          upc,
          title,
          asin
        });
      } else {
        setEditInventoryControllerData({
          ...editInventoryControllerData,
          [key]: label,
          upc: '',
          title: '',
          asin: ''
        });
      }
    }
  };

  const handlePageNumber = (e) => {
    setPageNumber(e);
  };

  const handlePageLimit = (e) => {
    setPageLimit(e);
    setPageNumber(1);
    dispatch(SetProductState({ field: 'selectedPaginationOfInventoryController', value: e }));
  };

  const handleDrawerClose = () => {
    setSelectedMarketplace({
      id: '',
      name: ''
    });
    setSkuList([]);
    setSelectedSku({
      label: '',
      value: ''
    });

    setEditMarketplaceInventoryController(false);
    setAddMarketplaceInventoryController(false);
    setNewMarketplaceInventoryController({
      marketplace: '',
      title: '',
      sku: '',
      upc: ''
    });
    setNewMarketplaceInventoryControllerHelperText({
      marketplace: '',
      title: '',
      sku: '',
      upc: ''
    });

    setControlInventory({
      key: 'no',
      value: false
    });
  };

  const handleSaveChanges = () => {
    // handleDrawerClose();
    const errors = {};

    const {
      sku,
      marketplace
    } = newMarketplaceInventoryController;

    if (isEmpty(sku)) errors.sku = 'Sku is required!';
    if (isEmpty(marketplace)) errors.marketplace = 'Marketplace is required!';

    if (newMarketplaceInventoryController.upc
      && (newMarketplaceInventoryController?.upc.length < 11
        || newMarketplaceInventoryController?.upc.length > 12)) {
      errors.upc = 'Please enter a valid UPC (11 or 12 digits only)';
    } else if (newMarketplaceInventoryController.upc
      && !validateUPC(newMarketplaceInventoryController.upc)) {
      errors.upc = 'Please enter a valid UPC (11 or 12 digits only)';
    }

    setNewMarketplaceInventoryControllerHelperText((prevHelperText) => ({
      ...prevHelperText,
      ...errors
    }));

    if (Object.values(errors).every((errorValue) => errorValue === '')) {
      dispatch(AddNewMarketplaceInventoryController({
        ...newMarketplaceInventoryController,
        controlInventory: controlInventory.key === 'yes' ? controlInventory.value : !controlInventory.value,
        userId,
        productId
      }));
    }
  };

  const handleEditMode = (inventoryController) => {
    const { label, value } = stores.find(
      (storeObj) => storeObj.value === inventoryController.marketplace
    );
    setSelectedMarketplace({
      id: value,
      name: label
    });
    setEditMarketplaceInventoryController(true);
    setEditInventoryControllerData({
      marketplace: inventoryController.marketplace,
      title: inventoryController.title,
      sku: inventoryController.sku,
      upc: inventoryController.upc
    });
    setSkuList([{ value: inventoryController.sku, label: inventoryController.sku }, ...skuList]);
    setSelectedSku({
      value: inventoryController.sku,
      label: inventoryController.sku
    });

    setSelectedInventoryController({
      _id: inventoryController._id,
      marketplace: inventoryController.marketplace,
      title: inventoryController.title,
      sku: inventoryController.sku,
      upc: inventoryController.upc,
      inventoryController: inventoryController.controlInventory
    });
    setControlInventory({
      key: 'yes',
      value: inventoryController?.controlInventory
    });
  };

  const handleEditSave = () => {
    // handleDrawerClose();
    const errors = {};

    const {
      sku,
      marketplace
    } = editInventoryControllerData;

    if (isEmpty(sku)) errors.sku = 'Sku is required!';
    if (isEmpty(marketplace)) errors.marketplace = 'Marketplace is required!';

    if (editInventoryControllerData.upc
      && (editInventoryControllerData?.upc.length < 11
        || editInventoryControllerData?.upc.length > 12)) {
      errors.upc = 'Please enter a valid UPC (11 or 12 digits only)';
    } else if (editInventoryControllerData.upc
      && !validateUPC(editInventoryControllerData.upc)) errors.upc = 'Please enter a valid UPC (11 or 12 digits only)';

    setNewMarketplaceInventoryControllerHelperText((prevHelperText) => ({
      ...prevHelperText,
      ...errors
    }));

    if (Object.values(errors).every((errorValue) => errorValue === '')) {
      const modifiedInventoryControllerDetails = {};

      Object.keys(editInventoryControllerData).forEach((key) => {
        if (editInventoryControllerData[key] !== selectedInventoryController[key]) {
          modifiedInventoryControllerDetails[key] = editInventoryControllerData[key];
        }
      });

      let boolEdit = false;
      let inventoryControllerValue;

      if (controlInventory.key === 'yes') {
        inventoryControllerValue = controlInventory.value;
      } else if (controlInventory.key === 'no') {
        inventoryControllerValue = !controlInventory.value;
      }

      if (selectedInventoryController.inventoryController === inventoryControllerValue) {
        boolEdit = false;
      } else {
        boolEdit = true;
      }

      if (Object.keys(modifiedInventoryControllerDetails).length > 0 || boolEdit) {
        const updateParams = modifiedInventoryControllerDetails;

        if (boolEdit) {
          extend(updateParams, { controlInventory: inventoryControllerValue });
        }

        dispatch(UpdateMarketplaceInventoryController({
          updateParams,
          userId,
          id: selectedInventoryController._id
        }));
      } else {
        dispatch(SetProductNotifyState({ message: 'Nothing updated !', type: 'info' }));
      }
    }
  };

  const getMarketplaceInventoryController = () => {
    const skip = (pageNumber - 1) * pageLimit;
    const limit = pageLimit;
    dispatch(GetMarketplaceInventoryController({
      productId,
      skip,
      limit,
      sortBy: sortValue
    }));
  };

  const handleDelete = () => {
    const { _id } = selectedInventoryController;

    if (_id) dispatch(DeleteMarketplaceInventoryController({ id: _id }));
    else dispatch(SetProductNotifyState({ message: 'Marketplace id is required!', type: 'error' }));
    setDeleteItem(false);
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
    if (selectedMarketplace.id !== '') {
      dispatch(GetInventorySkuListByStoreId({ storeId: selectedMarketplace.id }));
    }
  }, [selectedMarketplace]);

  useEffect(() => {
    if (inventorySkuList.length) {
      const skuListData = inventorySkuList.map((inventory) => ({
        value: inventory.sellerSku,
        label: inventory.sellerSku
      }));
      setSkuList([...skuList, ...skuListData]);
    } else {
      setSkuList([...skuList]);
    }
  }, [inventorySkuList]);

  useEffect(() => {
    if (marketplaceInventoryControllersList.length) {
      const inventoryControllersData = marketplaceInventoryControllersList.map((
        inventoryController
      ) => {
        const { updatedAt, _id } = inventoryController;
        const lastUpdatedAt = updatedAt ? moment(updatedAt).format('LLL') : null;
        const { marketplace } = inventoryController;
        const store = stores.find((storeObj) => String(storeObj.value) === String(marketplace));
        const marketplaceName = store ? store.label : '--';

        return (
          createData(
            String(_id),
            <Box sx={{ whiteSpace: 'nowrap', overflow: 'hidden' }} textOverflow="ellipsis" maxWidth="359px">
              {inventoryController?.title?.length > 30 ? (
                <Tooltip placement="top-start" arrow title={inventoryController.title}>
                  <span>{inventoryController?.title}</span>
                </Tooltip>
              ) : (
                <span>{inventoryController.title || '--'}</span>
              )}
            </Box>,
            marketplaceName,
            inventoryController?.sku?.length > 30 ? (
              <Tooltip placement="top-start" arrow title={inventoryController?.sku}>
                <span>{inventoryController?.sku}</span>
              </Tooltip>
            ) : (
              <span>{inventoryController?.sku || '--'}</span>
            ),
            inventoryController.upc,
            inventoryController.asin,
            lastUpdatedAt,
            <Box
              className="icon-edit pointer"
              component="span"
              onClick={() => {
                handleEditMode(inventoryController);
              }}
            />
          )
        );
      });

      setData(inventoryControllersData);
    } else {
      setData([]);
    }
  }, [marketplaceInventoryControllersList]);

  useEffect(() => {
    if (marketplaceInventoryControllerUpdated) {
      handleDrawerClose();
      dispatch(SetProductState({ field: 'marketplaceInventoryControllerUpdated', value: false }));
    }
    if (marketplaceInventoryControllerDeleted) {
      handleDrawerClose();
      if (marketplaceInventoryControllersList.length === 1) {
        if (pageNumber !== 1) setPageNumber(1);
        else getMarketplaceInventoryController();
      } else getMarketplaceInventoryController();
      dispatch(SetProductState({ field: 'marketplaceInventoryControllerDeleted', value: false }));
    }

    if (success) {
      handleDrawerClose();
    }
  }, [success, marketplaceInventoryControllerUpdated, marketplaceInventoryControllerDeleted]);

  useEffect(() => {
    if (stores.length) {
      setNewMarketplaceInventoryController({
        ...newMarketplaceInventoryController,
        marketplace: stores[0].value
      });
    }
  }, [stores]);

  useEffect(() => {
    if (productId && stores.length) {
      getMarketplaceInventoryController();
    }
  }, [productId, pageLimit, pageNumber, stores, sortValue]);

  useEffect(() => {
    dispatch(GetStores());
    return () => {
      dispatch(SetProductState({ field: 'marketplaceInventoryControllersList', value: [] }));
      dispatch(SetProductState({ field: 'totalMarketplaceInventoryControllers', value: 0 }));
      dispatch(SetStoreState({ field: 'stores', value: [] }));
      dispatch(SetStoreState({
        field: 'inventorySkuList',
        value: []
      }));
    };
  }, []);

  const handleAddMarketplace = () => {
    setAddMarketplaceInventoryController(true);
    setNewMarketplaceInventoryController({
      ...newMarketplaceInventoryController,
      marketplace: stores?.length ? stores[0].value : ''
    });

    setSelectedMarketplace({
      id: stores[0].value,
      name: stores[0].label
    });
  };

  useEffect(() => {
    if (isListReceived) {
      setIsLoading(false);
    }
  }, [isListReceived]);

  useEffect(() => {
    if (!marketLoading && success) {
      handleDrawerClose();
    }
  }, [marketLoading]);

  return (
    <div>
      <Box display="flex" justifyContent="space-between" mb={1.5} alignItems="center">
        <h3 className="m-0">Marketplace Inventory Controller</h3>
        <Button
          startIcon={<AddCircleOutlineOutlinedIcon sx={{ color: '#3C76FF' }} />}
          text="Add New Marketplace Inventory Controller"
          letterSpacing="0"
          padding="4px 14px 4px 15px"
          onClick={() => handleAddMarketplace()}
        />
      </Box>
      <Box mt={3.125} position="relative">
        <Table
          fixed 
          tableHeader={marketPlaceHeader} 
          height="500px"
          sortableHeader={productMarketplaceControllerSort}
          handleSort={handleSortChange}
          sortValue={sortValue}
        >
          {loading || marketPlaceLoading
            ? <LoaderWrapper />
            : data?.length ? data.map((row) => (
              <TableRow
                hover
                key={row._id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.title || '--'}
                </TableCell>
                <TableCell>{row.marketplace || '--'}</TableCell>
                <TableCell>{row.sku || '--'}</TableCell>
                <TableCell>{row.Upc || '--'}</TableCell>
                <TableCell>{row.asin || '--'}</TableCell>
                <TableCell>{row.update}</TableCell>
                <TableCell>{row.action}</TableCell>
              </TableRow>
            )) : (
              !marketPlaceLoading && totalMarketplaceInventoryControllers === 0 && (
                <TableRow>
                  <TableCell sx={{ borderBottom: '24px' }} colSpan={6} align="center">
                    <Box textAlign="center" display="flex" alignItems="center" justifyContent="center" height="250px">
                      {/* <img className="nodata-table-img" src={noData} height="100%" style={{ maxWidth: '100%' }} alt="no-Data" /> */}
                    </Box>
                  </TableCell>
                </TableRow>
              )
            )}
        </Table>
        <Pagination
          componentName="products"
          perPageRecord={marketplaceInventoryControllersList?.length || 0}
          total={totalMarketplaceInventoryControllers}
          totalPages={Math.ceil(totalMarketplaceInventoryControllers / pageLimit)}
          offset={totalMarketplaceInventoryControllers}
          pageNumber={pageNumber}
          pageLimit={pageLimit}
          handlePageLimitChange={handlePageLimit}
          handlePageNumberChange={handlePageNumber}
          position="relative"
          width="0"
        />
      </Box>
      <Drawer open={addMarketplaceInventoryController || editMarketplaceInventoryController} width="696px" close={handleDrawerClose}>
        <Stack direction="row" justifyContent="space-between">
          <Stack alignItems="center" direction="row" spacing={3}>
            <Box
              component="span"
              className="icon-left pointer"
              onClick={handleDrawerClose}
            />
            {
              addMarketplaceInventoryController
                ? <h2 className="m-0 pl-2">Add Marketplace Listing Details</h2>
                : <h2 className="m-0 pl-2">Edit Marketplace Listing Details</h2>
            }
          </Stack>
          {!addMarketplaceInventoryController
            ? (
              <ReactToPrint
                trigger={() => (
                  <Button
                    disabled={!((selectedInventoryController?.upc?.length === 11
                      || selectedInventoryController?.upc?.length === 12)
                         && validateUPC(selectedInventoryController?.upc))}
                    startIcon={<span className="icon-print" />}
                    text="Print Barcode Label"
                  />
                )}
                content={() => tableRef.current}
              />
            ) : null}
          {(selectedInventoryController?.upc?.length === 11
                || selectedInventoryController?.upc?.length === 12)
                   && validateUPC(selectedInventoryController?.upc)
            ? (
              <BarcodeFile
                component="marketplaceInventory"
                ref={tableRef}
                value={selectedInventoryController?.upc}
                title={selectedInventoryController?.title}
              />
            )
            : null}

        </Stack>
        <Divider sx={{ margin: '24px 0' }} />
        <Box position="relative">
          { marketLoading ? <LoaderWrapper /> : null }
          <Grid container columnSpacing={3}>
            <Grid item md={6} mb={2}>
              <Select
                label="Select Marketplace"
                name="marketplace"
                width="100%"
                placeholder="Select Marketplace"
                marginBottom="17px"
                menuItem={stores || []}
                helperText={newMarketplaceInventoryControllerHelperText.marketplace}
                value={
                  addMarketplaceInventoryController
                    ? newMarketplaceInventoryController.marketplace
                    : String(editInventoryControllerData.marketplace)
                }
                handleChange={addMarketplaceInventoryController
                  ? handleAddMarketplaceInventoryController
                  : handleEditMarketplaceInventoryController}
              />
            </Grid>
            <Grid item md={6} mb={2}>
              <AutoComplete
                id="2323"
                name="sku"
                options={isLoading ? [] : skuList}
                loading={isLoading}
                label="Marketplace SKU"
                value={
                  selectedSku
                }
                placeholder="Search"
                onChange={(e, item) => handleMappingDropDownChange({
                  selectDropDown: item,
                  key: 'sku'
                })}
              />
              {newMarketplaceInventoryControllerHelperText.sku
                ? <span style={{ color: 'rgb(220 53 69)', fontSize: 10 }}>{newMarketplaceInventoryControllerHelperText.sku}</span>
                : null}
            </Grid>

            <Grid item md={6}>
              <Input
                autoComplete="off"
                label="Title"
                name="title"
                width="100%"
                placeholder="Title"
                marginBottom="17px"
                helperText={newMarketplaceInventoryControllerHelperText.title}
                value={
                  addMarketplaceInventoryController
                    ? newMarketplaceInventoryController.title
                    : editInventoryControllerData.title
                }
                onChange={addMarketplaceInventoryController
                  ? handleAddMarketplaceInventoryController
                  : handleEditMarketplaceInventoryController}
              />
            </Grid>

            <Grid item md={6}>
              <Input
                autoComplete="off"
                label="Marketplace UPC"
                name="upc"
                width="100%"
                marginBottom="17px"
                placeholder="UPC"
                helperText={newMarketplaceInventoryControllerHelperText.upc}
                value={
                  addMarketplaceInventoryController
                    ? newMarketplaceInventoryController.upc
                    : editInventoryControllerData.upc
                }
                onChange={addMarketplaceInventoryController
                  ? handleAddMarketplaceInventoryController
                  : handleEditMarketplaceInventoryController}
              />
            </Grid>
            {/* <Grid item md={12}>
              <Input
                label="Marketplace Item Details"
                name="itemDetails"
                multiline
                maxRows={2}
                height="56px"
                width="100%"
                marginBottom="6px"
                placeholder="Marketplace item Details"
                helperText={newMarketplaceInventoryControllerHelperText.itemDetails}
                value={
                  addMarketplaceInventoryController
                    ? newMarketplaceInventoryController.itemDetails
                    : ''
                }
                onChange={handleAddMarketplaceInventoryController}
              />
            </Grid> */}
            <Grid item md={12}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box component="span" fontSize="13px" color="#979797">Control Inventory</Box>
                <Stack spacing={1} direction="row">
                  <Box component="span" mt={0.5}>
                    {' '}
                    <CheckBox
                      name="controlInventoryYes"
                      label="Yes"
                      marginBottom="2px"
                      checked={controlInventory.key === 'yes' ? controlInventory.value : !controlInventory.value}
                      onChange={addMarketplaceInventoryController
                        ? handleAddMarketplaceInventoryController
                        : handleEditMarketplaceInventoryController}
                    />
                  </Box>
                  <Box component="span" pt={0.5}>
                    {' '}
                    <CheckBox
                      name="controlInventoryNo"
                      label="No"
                      marginBottom="2px"
                      checked={controlInventory.key === 'no' ? controlInventory.value : !controlInventory.value}
                      onChange={addMarketplaceInventoryController
                        ? handleAddMarketplaceInventoryController
                        : handleEditMarketplaceInventoryController}
                    />
                  </Box>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
          <Stack direction="row" justifyContent="flex-end" spacing={2} mt={1.25}>
            {
              !addMarketplaceInventoryController && editMarketplaceInventoryController
                ? (
                  <Button
                    startIcon={<span className="icon-trash" />}
                    text="Delete"
                    color="error"
                    onClick={() => setDeleteItem(true)}
                  />
                )
                : null
            }

            <Button
              startIcon={<span className="icon-Save" />}
              text="Save Changes"
              variant="contained"
              onClick={addMarketplaceInventoryController ? handleSaveChanges : handleEditSave}
            />

          </Stack>
        </Box>
      </Drawer>
      <ItemDelete
        loading={marketplaceInventoryControllerDeletedLoading}
        show={deleteItem}
        lastTitle="Delete This Marketplace!"
        onConfirm={handleDelete}
        onClose={() => setDeleteItem(false)}
      />

    </div>
  );
};

export default Inventory;
