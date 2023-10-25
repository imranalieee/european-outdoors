import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { startCase } from 'lodash';
import ReactToPrint from 'react-to-print';

import { jsPDF as JsPDF } from 'jspdf';
import {
  Box, Stack, TableCell, TableRow, Divider, Grid
} from '@mui/material';

import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
// component
import Button from '../../../../components/button/index';
import Table from '../../../../components/ag-grid-table/index';
import Pagination from '../../../../components/pagination/index';
import Drawer from '../../../../components/drawer/index';
import Select from '../../../../components/select/index';
import Input from '../../../../components/inputs/input/index';
import Switch from '../../../../components/switch/index';
import LoaderWrapper from '../../../../components/loader/index';
import ItemDelete from './modals/delete';

import {
  locationHeader, REGEX_FOR_NUMBERS
} from '../../../../constants/index';

import {
  AddNewLocation,
  GetLocationsQuantityByProductId,
  UpdateLocation,
  DeleteLocation,
  AddQuantityLocation,
  SetLocationNotifyState,
  TransferProductQuantity
} from '../../../../redux/slices/location-slice';

import { GenerateBarCode } from '../../../../../utils/helpers';
import BarcodeFile from '../../orders/component/print/barcodeFile';

const Location = ({ productId }) => {
  const dispatch = useDispatch();
  const tableRef = useRef();

  const {
    locations = [],
    locationAdded,
    locationUpdated,
    locationDeleted,
    quantityTransfered,
    quantityAdded,
    locationAddedLoading,
    locationUpdatedLoading,
    locationDeletedLoading,
    quantityAddedLoading,
    quantityTransferedLoading,
    loading,
    totalLocations,
    locationNotAdded
  } = useSelector((state) => state.location);
  const { user } = useSelector((state) => state.auth);
  const [edit, setEdit] = useState(false);
  const [deleteItem, setDeleteItem] = useState(false);
  const [editQuantity, setEditQuantity] = useState(false);
  const [locationsData, setLocationsData] = useState([]);
  const [locationName, setLocationName] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState();
  const [pageNumber, setPageNumber] = useState(1);
  const [pageLimit, setPageLimit] = useState(100);

  const selectStore = [
    {
      id: '6465e114e4cb72c1fa0017e1',
      value: '6465e114e4cb72c1fa0017e1',
      label: 'Default Warehouse'
    }
  ];

  const [newLocation, setNewLocation] = useState({
    isDefault: false,
    warehouse: selectStore[0].id,
    productId,
    quantity: '',
    location: ''
  });
  const [newLocationHelperText, setNewLocationHelperText] = useState({
    warehouse: '',
    quantity: '',
    productId: '',
    location: ''
  });

  const [transferQuantity, setTransferQuantity] = useState({
    toWarehouse: selectStore[0].id,
    transferQuantity: '',
    toLocation: ''
  });

  const [transferQuantityHelperText, setTransferQuantityHelperText] = useState({
    toWarehouse: '',
    transferQuantity: '',
    toLocation: ''
  });

  const [addQuantity, setAddQuantity] = useState({
    warehouse: selectStore[0].id,
    productId,
    quantity: '',
    location: ''
  });

  const [addQuantityHelperText, setAddQuantityHelperText] = useState({
    warehouse: '',
    quantity: '',
    location: ''
  });
  const [transferDrawer, setTransferDrawer] = useState(false);

  const handleAddLocationChange = (e) => {
    if (selectedLocation) {
      const { value, name: key } = e.target;
      const errors = {};
      if (key === 'isDefault') {
        const updat = selectedLocation?.[key]
          ? selectedLocation?.[key] === false : true;
        setSelectedLocation({
          ...selectedLocation,
          [key]: updat
        });
      } else {
        setSelectedLocation({
          ...selectedLocation,
          [key]: value
        });
      }

      if (key && !value) errors[key] = `${startCase(key)} is required!`;
      else {
        errors[key] = '';
      }
      setNewLocationHelperText((prevHelperText) => ({
        ...prevHelperText,
        ...errors
      }));
    } else {
      const { value, name: key } = e.target;
      const errors = {};
      if (key === 'isDefault') {
        const updat = newLocation?.[key]
          ? newLocation?.[key] === false : true;
        setNewLocation({
          ...newLocation,
          [key]: updat
        });
      } else {
        setNewLocation({
          ...newLocation,
          [key]: value
        });
      }

      if ((key === 'warehouse'
        || key === 'location'
        || key === 'quantity'
        || key === 'quantityInTransfer'
        || key === 'createdBy') && !value) errors[key] = `${startCase(key)} is required!`;
      else {
        errors[key] = '';
      }
      setNewLocationHelperText((prevHelperText) => ({
        ...prevHelperText,
        ...errors
      }));
    }
  };

  const handleSaveNewLocation = () => {
    const errors = {};
    if (selectedLocation) {
      Object.keys(selectedLocation).forEach((key) => {
        if (!selectedLocation[key] && (
          key === 'warehouse'
          || key === 'location'
          || key === 'quantity')) {
          errors[key] = `${startCase(key)} is required!`;
        } else {
          errors[key] = '';
        }
      });
      setNewLocationHelperText((prevHelperText) => ({
        ...prevHelperText,
        ...errors
      }));
      if (Object.values(errors).every((errorValue) => errorValue === '')) {
        if (selectedLocation?.location
          ? locationName
          === selectedLocation?.location
          : locationName === selectedLocation?.locationId?.location) {
          setEdit(false);
          dispatch(SetLocationNotifyState({ message: 'Nothing updated !', type: 'info' }));
        } else {
          dispatch(UpdateLocation({
            locationId: selectedLocation?.locationId?._id,
            updateParams: { location: selectedLocation?.location }
          }));
        }
      }
    } else {
      Object.keys(newLocation).forEach((key) => {
        if (!newLocation[key] && (key !== 'isDefault')) {
          errors[key] = `${startCase(key)} is required!`;
        } else {
          errors[key] = '';
        }
      });
      setNewLocationHelperText((prevHelperText) => ({
        ...prevHelperText,
        ...errors
      }));
      if (Object.values(errors).every((errorValue) => errorValue === '')) {
        dispatch(AddNewLocation({
          ...newLocation,
          createdBy: user?.name
        }));
      }
    }
  };

  const handleTransferQuantityChange = (e) => {
    const { value, name: key } = e.target;
    const errors = {};

    setTransferQuantity({
      ...transferQuantity,
      [key]: value
    });

    if (key && !value) errors[key] = `${startCase(key)} is required!`;
    else if (key === 'transferQuantity' && Number(value) === 0) errors[key] = 'Value must be greater than 0!';
    else if (key === 'transferQuantity' && Number(value) > Number(selectedLocation?.quantity)) errors[key] = 'Value must be less than available quantity!';
    else {
      errors[key] = '';
    }
    setTransferQuantityHelperText((prevHelperText) => ({
      ...prevHelperText,
      ...errors
    }));
  };

  const handleSaveTransferQuantity = () => {
    const errors = {};
    Object.keys(transferQuantity).forEach((key) => {
      if (!transferQuantity[key] && (
        key === 'toWarehouse'
        || key === 'toLocation'
        || key === 'transferQuantity')) {
        errors[key] = `${startCase(key)} is required!`;
      } else if (key === 'transferQuantity' && Number(transferQuantity[key]) === 0) errors[key] = 'Value must be greater than 0!';
      else if (key === 'transferQuantity' && Number(transferQuantity[key]) > Number(selectedLocation?.quantity)) errors[key] = 'Value must be less than available quantity!';
      else {
        errors[key] = '';
      }
    });
    setTransferQuantityHelperText((prevHelperText) => ({
      ...prevHelperText,
      ...errors
    }));
    if (Object.values(errors).every((errorValue) => errorValue === '')) {
      dispatch(TransferProductQuantity({
        locationId: selectedLocation?._id,
        transferParams: {
          transferFrom: selectedLocation,
          transferTo:
          {
            location: transferQuantity?.toLocation,
            warehouse: transferQuantity?.toWarehouse,
            quantity: transferQuantity?.transferQuantity
          }
        }
      }));
      setTransferDrawer(false);
    }
  };

  const handlePageLimit = (e) => {
    setPageLimit(e);
    setPageNumber(1);
  };

  const handlePageNumber = (e) => {
    setPageNumber(e);
  };

  const handleAddQuantityChange = (e) => {
    const { value, name: key } = e.target;
    const errors = {};

    setAddQuantity({
      ...addQuantity,
      [key]: value
    });

    if (key && !value) errors[key] = `${startCase(key)} is required!`;
    else {
      errors[key] = '';
    }
    setAddQuantityHelperText((prevHelperText) => ({
      ...prevHelperText,
      ...errors
    }));
  };

  const handleSaveAddQuantity = () => {
    const errors = {};

    Object.keys(addQuantity).forEach((key) => {
      if (!addQuantity[key] && (
        key === 'warehouse'
        || key === 'location'
        || key === 'quantity')) {
        errors[key] = `${startCase(key)} is required!`;
      } else {
        errors[key] = '';
      }
    });
    setAddQuantityHelperText((prevHelperText) => ({
      ...prevHelperText,
      ...errors
    }));
    if (Object.values(errors).every((errorValue) => errorValue === '')) {
      dispatch(AddQuantityLocation({
        ...addQuantity
      }));
    }
  };

  const handleDeleteLocation = (location) => {
    dispatch(DeleteLocation({ locationId: location?.locationId?._id }));
  };

  const getLocations = () => {
    const skip = (pageNumber - 1) * pageLimit;
    const limit = pageLimit;
    dispatch(GetLocationsQuantityByProductId({ skip, limit, productId }));
  };

  const inputNumberHandle = (e, regex) => {
    if (regex.test(e.target.value)) {
      handleAddLocationChange(e);
    } else {
      e.target.value = '';
    }
  };

  useEffect(() => {
    getLocations();
  }, []);

  useEffect(() => {
    if (locations?.length) {
      setLocationsData(locations);
    } else {
      setLocationsData([]);
    }
  }, [locations]);

  useEffect(() => {
    setTransferQuantity({
      toWarehouse: selectStore[0].id,
      transferQuantity: '',
      toLocation: ''
    });
    setNewLocation({
      isDefault: false,
      warehouse: selectStore[0].id,
      productId,
      quantity: '',
      location: ''
    });
    setAddQuantity({
      warehouse: selectStore[0].id,
      productId,
      quantity: '',
      location: ''
    });
    setEdit(false);
    setEditQuantity(false);
    setTransferDrawer(false);
    getLocations();
  }, [locationAdded,
    locationUpdated,
    locationDeleted,
    quantityAdded,
    quantityTransfered,
    locationNotAdded]);

  useEffect(() => {
    getLocations();
  }, [pageNumber, pageLimit]);

  useEffect(() => {
    if (totalLocations > 0 && !locations.length) {
      setPageNumber(1);
    }
  }, [totalLocations, locations]);

  function isUpperCase(str) {
    return str === str.toUpperCase();
  }

  const handleLocationModalClose = () => {
    setNewLocation({
      isDefault: false,
      warehouse: selectStore[0].id,
      productId,
      quantity: '',
      location: ''
    });
    setEdit(false);
    setNewLocationHelperText(null);
  };

  const handleEditQuantityModalClose = () => {
    setAddQuantity({
      warehouse: selectStore[0].id,
      productId,
      quantity: '',
      location: ''
    });
    setEditQuantity(false);
    setAddQuantityHelperText(null);
  };

  const handleTransferModalClose = () => {
    setSelectedLocation(null);
    setTransferDrawer(false);
    setTransferQuantity({
      toWarehouse: selectStore[0].id,
      transferQuantity: '',
      toLocation: ''
    });
    setTransferQuantityHelperText({
      toWarehouse: '',
      transferQuantity: '',
      toLocation: ''
    });
  };

  return (
    <div>
      <Box display="flex" justifyContent="space-between" mb={1.5} alignItems="center">
        <h3 className="m-0">Locations</h3>
        <Box>
          <Button
            startIcon={<AddCircleOutlineOutlinedIcon fontSize="16px" sx={{ color: '#3C76FF' }} />}
            text="Add New Location"
            onClick={() => {
              setSelectedLocation(null);
              setEdit(true);
            }}
          />
          <Button
            style={{ marginLeft: 10 }}
            startIcon={<AddCircleOutlineOutlinedIcon fontSize="16px" sx={{ color: '#3C76FF' }} />}
            text="Add Quantity"
            onClick={() => {
              // setSelectedLocation(null);
              setEditQuantity(true);
            }}
          />
        </Box>
      </Box>
      <Box mt={3.125} position="relative">
        <Table tableHeader={locationHeader} height="500px">
          {locationAddedLoading
            || locationUpdatedLoading
            || locationDeletedLoading
            || quantityAddedLoading
            || quantityTransferedLoading
            || loading ? <LoaderWrapper />
            : locationsData?.length ? locationsData?.map((row) => (
              <TableRow
                hover
                key={row?.name}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {selectStore[0]?.label}
                </TableCell>
                <TableCell>{row?.locationId?.location}</TableCell>
                <TableCell>{row?.quantity - row?.quantityInTransfer}</TableCell>
                <TableCell>{row?.quantityInTransfer}</TableCell>
                <TableCell align="right">
                  <Stack spacing={2} direction="row" justifyContent="flex-end">
                    <Box
                      className="icon-transfar-circle pointer"
                      component="span"
                      fontSize="16px"
                      onClick={() => {
                        setSelectedLocation(row);
                        setTransferDrawer(true);
                      }}
                    />
                    <Box
                      className="icon-edit pointer"
                      component="span"
                      onClick={() => {
                        setSelectedLocation(row);
                        setEdit(true);
                        setLocationName(row?.locationId?.location);
                      }}
                    />
                  </Stack>
                </TableCell>

              </TableRow>
            )) : !loading && totalLocations === 0 && (
              <TableRow>
                <TableCell sx={{ borderBottom: '24px' }} colSpan={5} align="center">
                  <Box textAlign="center" display="flex" alignItems="center" justifyContent="center" height="250px">
                    {/* <img className="nodata-table-img" src={noData} height="100%" style={{ maxWidth: '100%' }} alt="no-Data" /> */}
                  </Box>
                </TableCell>
              </TableRow>

            )}
        </Table>
        <Pagination
          componentName="products"
          perPageRecord={locations?.length || 0}
          width="0%"
          total={totalLocations}
          totalPages={Math.ceil(totalLocations / pageLimit)}
          offset={totalLocations}
          pageNumber={pageNumber}
          pageLimit={pageLimit}
          handlePageLimitChange={handlePageLimit}
          handlePageNumberChange={handlePageNumber}
          position="realtive"
        />
      </Box>
      <Drawer open={edit} width="696px" close={handleLocationModalClose}>
        <Stack direction="row" justifyContent="space-between">
          <Stack alignItems="center" direction="row" spacing={3}>
            <Box
              component="span"
              className="icon-left pointer"
              onClick={handleLocationModalClose}
            />
            <h2 className="m-0 pl-2">Enter Location Details</h2>
          </Stack>
          <Box>
            <Switch
              name="isDefault"
              margin="-1px"
              thumdWidth="20px"
              largeSwitch
              thumdHeight="20px"
              width="131px"
              height="37px"
              offText="Default Location"
              onText="Default Location"
              onChange={(e) => handleAddLocationChange(e)}
              checked={selectedLocation?.locationId?.isDefault
                ? selectedLocation?.locationId?.isDefault
                : newLocation?.isDefault
                  ? newLocation?.isDefault
                  : false}
            />
          </Box>
        </Stack>
        <Divider sx={{ margin: '22px 0' }} />
        <Box>
          <Grid container columnSpacing={3}>
            <Grid item md={6}>
              <Select
                disabled={selectedLocation?.locationId?.warehouseId}
                value={selectStore[0].id}
                name="warehouse"
                status={newLocationHelperText?.warehouse}
                handleChange={(e) => handleAddLocationChange(e)}
                label="Warehouse"
                width="100%"
                placeholder="Select Warehouse"
                marginBottom="17px"
                menuItem={selectStore}
              />
            </Grid>
            <Grid item md={6}>
              <Input
                autoComplete="off"
                defaultValue={selectedLocation?.locationId?.location || ''}
                name="location"
                helperText={newLocationHelperText?.location}
                onChange={(e) => handleAddLocationChange(e)}
                label="Location"
                width="100%"
                placeholder="Location"
                marginBottom="17px"
              />
            </Grid>
            <Grid item md={6}>
              <Input
                autoComplete="off"
                disabled={selectedLocation?.quantity}
                defaultValue={selectedLocation?.quantity || ''}
                name="quantity"
                helperText={newLocationHelperText?.quantity}
                onChange={(e) => inputNumberHandle(e, REGEX_FOR_NUMBERS)}
                label="Location Quantity"
                width="100%"
                placeholder="Location Quantity"
                marginBottom="17px"
              />
            </Grid>
            {selectedLocation && (
              <Grid item md={6}>
                <Input
                  autoComplete="off"
                  disabled
                  defaultValue={selectedLocation?.quantityInTransfer || 0}
                  name="quantityInTransfer"
                  helperText={newLocationHelperText?.quantityInTransfer}
                  onChange={(e) => inputNumberHandle(e, REGEX_FOR_NUMBERS)}
                  label="Qty in Transfer"
                  width="100%"
                  placeholder="Qty in Transfer"
                  marginBottom="17px"
                />
              </Grid>
            )}
            <Grid item md={6}>
              <Input
                autoComplete="off"
                defaultValue={selectedLocation?.userId?.name
                  ? selectedLocation?.userId?.name
                  : user?.name
                    ? user?.name
                    : ''}
                name="createdBy"
                disabled
                label="Created by"
                plceholder="Created by"
                width="100%"
                marginBottom="17px"
                placeholder="Created by"
              />
            </Grid>
            <Grid item md={6}>
              <Input
                autoComplete="off"
                disabled
                name="date"
                onChange={(e) => handleAddLocationChange(e)}
                type="date"
                value={selectedLocation?.updatedAt
                  ? new Date(selectedLocation?.updatedAt).toISOString().split('T')[0]
                  : new Date().toISOString().split('T')[0]}
                label="Date Created"
                placeholder="Date"
                width="100%"
              />
            </Grid>
          </Grid>
          <Stack
            direction="row"
            justifyContent="flex-end"
            spacing={2}
            mt={0.875}
          >
            <Button
              startIcon={<span className="icon-trash" />}
              text="Delete"
              color="error"
              disabled={!selectedLocation}
              onClick={() => setDeleteItem(true)}
            />
            <ReactToPrint
              trigger={() => (
                <Button
                  startIcon={<span className="icon-print" />}
                  text="Print Label"
                  disabled={!selectedLocation?.locationId?.location}
                />
              )}
              content={() => tableRef.current}
            />
            <Button
              startIcon={<span className="icon-Save" />}
              text="Save"
              onClick={handleSaveNewLocation}
            />

          </Stack>
        </Box>
        <BarcodeFile ref={tableRef} value={selectedLocation?.locationId?.location} />
      </Drawer>
      <Drawer open={editQuantity} width="696px" close={handleEditQuantityModalClose}>
        <Stack direction="row" justifyContent="space-between">
          <Stack alignItems="center" direction="row" spacing={3}>
            <Box
              component="span"
              className="icon-left pointer"
              onClick={handleEditQuantityModalClose}
            />
            <h2 className="m-0 pl-2">Add Quantity</h2>
          </Stack>
        </Stack>
        <Divider sx={{ margin: '22px 0' }} />
        <Box>
          <Grid container columnSpacing={3}>
            <Grid item md={6}>
              <Select
                // value={selectedLocation?.warehouse
                //   ? selectedLocation?.warehouse
                //   : newLocation?.warehouse
                //     ? newLocation?.warehouse
                //     : ''}
                name="warehouse"
                value={selectStore[0].id}
                status={addQuantityHelperText?.warehouse}
                handleChange={(e) => handleAddQuantityChange(e)}
                label="Warehouse"
                width="100%"
                placeholder="Select Warehouse"
                marginBottom="17px"
                menuItem={selectStore}
              />
            </Grid>
            <Grid item md={6}>
              <Input
                autoComplete="off"
                // defaultValue={selectedLocation?.location || ''}
                name="location"
                helperText={addQuantityHelperText?.location}
                onChange={(e) => handleAddQuantityChange(e)}
                label="Location"
                width="100%"
                placeholder="Location"
                marginBottom="17px"
              />
            </Grid>
            <Grid item md={6}>
              <Input
                autoComplete="off"
                // defaultValue={selectedLocation?.quantity || ''}
                name="quantity"
                helperText={addQuantityHelperText?.quantity}
                onChange={(e) => {
                  if (REGEX_FOR_NUMBERS.test(e.target.value)) {
                    handleAddQuantityChange(e);
                  } else {
                    e.target.value = '';
                  }
                }}
                label="Added Quantity"
                width="100%"
                placeholder="Added Quantity"
                marginBottom="17px"
              />
            </Grid>
          </Grid>
          <Stack
            direction="row"
            justifyContent="flex-end"
            spacing={2}
            mt={0.875}
          >
            <Button
              startIcon={<span className="icon-Save" />}
              text="Save"
              onClick={handleSaveAddQuantity}
            />

          </Stack>
        </Box>
      </Drawer>
      <Drawer open={transferDrawer} width="696px" close={handleTransferModalClose}>
        <Stack direction="row" justifyContent="space-between">
          <Stack alignItems="center" direction="row" spacing={3}>
            <Box
              component="span"
              className="icon-left pointer"
              onClick={handleTransferModalClose}
            />
            <h2 className="m-0 pl-2">Enter Transfer Location</h2>
          </Stack>
        </Stack>
        <Divider sx={{ margin: '25px 0' }} />
        <Box>
          <Grid container columnSpacing={3}>
            <Grid item md={6}>
              <Select
                handleChange={(e) => handleTransferQuantityChange(e)}
                status={transferQuantityHelperText.toWarehouse}
                name="toWarehouse"
                label="To Warehouse"
                value={selectStore[0].id}
                width="100%"
                placeholder="To Warehouse"
                marginBottom="17px"
                menuItem={selectStore}
              />
            </Grid>
            <Grid item md={6}>
              <Input
                autoComplete="off"
                onChange={(e) => handleTransferQuantityChange(e)}
                helperText={transferQuantityHelperText.toLocation}
                name="toLocation"
                label="To Location"
                width="100%"
                placeholder="Tol Location"
                marginBottom="17px"
              />
            </Grid>
            <Grid item md={6}>
              <Input
                autoComplete="off"
                onChange={(e) => {
                  if (REGEX_FOR_NUMBERS.test(e.target.value)) {
                    handleTransferQuantityChange(e);
                  } else {
                    e.target.value = '';
                  }
                }}
                helperText={transferQuantityHelperText.transferQuantity}
                name="transferQuantity"
                label="Quantity"
                width="100%"
                placeholder="Quantity"
                marginBottom="17px"
              />
            </Grid>
          </Grid>
          <Stack
            direction="row"
            justifyContent="flex-end"
            spacing={2}
            mt={0.875}
          >

            <Button
              startIcon={<span className="icon-data-transfer-1" />}
              text="Transfer"
              variant="contained"
              onClick={handleSaveTransferQuantity}
            />

          </Stack>
        </Box>
      </Drawer>
      <ItemDelete show={deleteItem} lastTitle="Delete This Location!" onConfirm={() => { handleDeleteLocation(selectedLocation); setDeleteItem(false); }} onClose={() => setDeleteItem(false)} />
    </div>
  );
};

export default Location;
