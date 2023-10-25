import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Stack, Box, TableCell, TableRow, Divider, Grid, Tooltip
} from '@mui/material';
import { debounce, startCase } from 'lodash';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
// icons
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
// components
import SearchInput from '../../../components/searchInput/index';
import Button from '../../../components/button/index';
import Table from '../../../components/ag-grid-table/index';
import Pagination from '../../../components/pagination/index';
import Input from '../../../components/inputs/input/index';
import Drawer from '../../../components/drawer/index';
import Checkbox from '../../../components/checkbox/index';
import LoaderWrapper from '../../../components/loader/index';
import noData from '../../../static/images/no-data-table.svg';

import {
  GetSuppliers,
  SetSupplierState,
  DownloadSuppliers,
  SaveSelectedSupplier,
  AddSupplier
} from '../../../redux/slices/supplier-slice';

import {
  SetPurchaseOrderState
} from '../../../redux/slices/purchasing';

import { ValidateEmail, ValidatePhoneNumber } from '../../../../utils/helpers';

// constants
import {
  supplierHeader
} from '../../../constants/index';
import ProductHeaderWrapper from '../products/style';

const createData = (
  _id,
  companyName,
  supplierName,
  supplierCode,
  account,
  email,
  phone,
  address,
  fax,
  city,
  state,
  zipCode,
  country,
  action
) => ({
  _id,
  companyName,
  supplierName,
  supplierCode,
  account,
  email,
  phone,
  address,
  fax,
  city,
  state,
  zipCode,
  country,
  action
});

const Index = () => {
  const Navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    success, saveSelectedSupplierParams, loading, totalSuppliers, suppliers = [],
    supplierPageFilters,
    supplierPageNumber,
    supplierPageLimit
  } = useSelector((state) => state.supplier);
  const {
    user: { permissions: { editSuppliers = false } = {} },
    user
  } = useSelector((state) => state.auth);

  const [supplierDetail, SetSupplierDetail] = useState(false);
  const [data, setData] = useState([]);
  const [searchByKeyWordsValue, setSearchByKeyWordsValue] = useState('');
  const [selectedSupplierIds, setSelectedSupplierIds] = useState([]);

  const [newSupplier, setNewSupplier] = useState({
    email: '',
    companyName: '',
    supplierName: '',
    code: '',
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
  const [newSupplierHelperText, setNewSupplierHelperText] = useState({
    email: '',
    companyName: '',
    supplierName: '',
    code: '',
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

  const getSuppliers = () => {
    const skip = (supplierPageNumber - 1) * supplierPageLimit;
    const limit = supplierPageLimit;

    dispatch(GetSuppliers({ skip, limit, filters: supplierPageFilters }));
  };

  const handlePageLimit = (e) => {
    dispatch(SetSupplierState({ field: 'supplierPageLimit', value: e }));
    dispatch(SetSupplierState({ field: 'supplierPageNumber', value: 1 }));
  };

  const handlePageNumber = (e) => {
    dispatch(SetSupplierState({ field: 'supplierPageNumber', value: e }));
  };

  const handleSearch = debounce((value, key) => {
    dispatch(SetSupplierState({ field: 'supplierPageNumber', value: 1 }));
    dispatch(SetSupplierState({
      field: 'supplierPageFilters',
      value: {
        searchByKeyWords: {
          ...supplierPageFilters.searchByKeyWords,
          [key]: value
        }
      }
    }));
  }, 500);

  const handleCheckBoxClick = (e, supplierId) => {
    if (e.target.checked) {
      setSelectedSupplierIds([
        ...selectedSupplierIds,
        supplierId
      ]);
    } else {
      const supplierIdsList = selectedSupplierIds.filter((id) => id !== supplierId);
      setSelectedSupplierIds(supplierIdsList);
    }
  };

  const handleHeaderCheckBoxClicked = (e) => {
    if (e.target.checked) {
      const allSupplierIds = suppliers.map((supplier) => (supplier._id));
      setSelectedSupplierIds(allSupplierIds);
    } else {
      setSelectedSupplierIds([]);
    }
  };

  const handleDownloadClickEvent = () => {
    let selectIds = [];
    if (selectedSupplierIds.length) {
      selectIds = selectedSupplierIds;
    } else {
      selectIds = suppliers.map((supplier) => (supplier._id));
    }
    dispatch(SaveSelectedSupplier({ selectIds }));
  };

  const handleAddSupplier = (e) => {
    const { value, name: key } = e.target;

    if (key === 'phone') {
      if (/[^+\-0-9]/.test(value)) {
        return;
      }
      setNewSupplier({
        ...newSupplier,
        [key]: value
      });
    } else {
      setNewSupplier({
        ...newSupplier,
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

    setNewSupplierHelperText((prevHelperText) => ({
      ...prevHelperText,
      ...errors
    }));
  };

  const handleSaveNewSupplier = () => {
    const errors = {};

    Object.keys(newSupplier).forEach((key) => {
      if (!newSupplier[key]) {
        errors[key] = `${startCase(key)} is required!`;
      } else {
        errors[key] = '';
      }
    });

    const emailError = ValidateEmail({ email: newSupplier.email });
    if (emailError !== '') {
      errors.email = emailError;
    } else {
      errors.email = '';
    }

    const phoneError = ValidatePhoneNumber(newSupplier.phone);
    if (phoneError !== '') {
      errors.phone = phoneError;
    } else {
      errors.phone = '';
    }

    setNewSupplierHelperText((prevHelperText) => ({
      ...prevHelperText,
      ...errors
    }));

    if (Object.values(errors).every((errorValue) => errorValue === '')) {
      dispatch(AddSupplier({
        ...newSupplier
      }));
    }
  };

  const handleSaveNewSupplierModalClose = () => {
    const initialNewSupplierState = {};
    const initialNewSupplierHelperText = {};
    Object.keys(newSupplier).forEach((key) => {
      initialNewSupplierState[key] = '';
    });
    Object.keys(newSupplierHelperText).forEach((key) => {
      initialNewSupplierHelperText[key] = '';
    });
    setNewSupplier(initialNewSupplierState);
    setNewSupplierHelperText(initialNewSupplierHelperText);
    SetSupplierDetail(false);
  };

  useEffect(() => {
    if (saveSelectedSupplierParams) {
      const { userId } = user;
      const userIdJson = CryptoJS.AES.encrypt(String(userId), process.env.HASH).toString();
      const userIdData = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(userIdJson));
      dispatch(DownloadSuppliers({ userId: userIdData }));
    }
  }, [saveSelectedSupplierParams]);

  useEffect(() => {
    const supplierData = suppliers?.map((supplier) => {
      const {
        _id,
        companyName,
        supplierName,
        email,
        code,
        account,
        phone,
        fax,
        streetAddress,
        city,
        state,
        zipCode,
        country
      } = supplier;
      return (
        createData(
          _id,
          <Box
            component="span"
            className="column-ellipses-clamp"
          >
            {companyName?.length > 20
              ? (
                <Tooltip
                  placement="top-start"
                  arrow
                  title={companyName}
                >
                  <span>
                    {companyName}
                  </span>
                </Tooltip>
              )
              : (
                <span>
                  {companyName || '--'}
                </span>
              )}
          </Box>,
          <Box
            component="span"
          >
            {supplierName?.length > 20
              ? (
                <Tooltip
                  placement="top-start"
                  arrow
                  title={supplierName}
                >
                  <Box
                    className="column-ellipses-clamp"
                  >
                    {supplierName}
                  </Box>
                </Tooltip>
              )
              : (
                <span>
                  {supplierName || '--'}
                </span>
              )}

          </Box>,
          code,
          account,
          email,
          phone,
          fax,
          <Box
            component="span"
            className="product-name-clamp"
          >
            {streetAddress?.length > 20
              ? (
                <Tooltip
                  placement="top-start"
                  arrow
                  title={streetAddress}
                >
                  <Box className="column-ellipses-clamp">
                    {streetAddress}
                  </Box>
                </Tooltip>
              )
              : (
                <span>
                  {streetAddress || '--'}
                </span>
              )}
          </Box>,
          city,
          state,
          zipCode,
          country,
          <Box
            component="span"
            className="icon-left-arrow pointer"
            onClick={() => Navigate(`/suppliers/${_id}`)}
          />
        )
      );
    });
    if (supplierData.length) {
      setData(supplierData);
    } else {
      setData([]);
    }
  }, [suppliers]);

  useEffect(() => {
    if (supplierPageLimit && supplierPageNumber) getSuppliers();
  }, [supplierPageNumber, supplierPageLimit, supplierPageFilters]);

  useEffect(() => {
    if (success) {
      handleSaveNewSupplierModalClose();
    }
  }, [success]);

  useEffect(() => {
    setSearchByKeyWordsValue(supplierPageFilters?.searchByKeyWords?.value || '');
    return () => {
      if (!window.location.pathname.startsWith('/suppliers/')) {
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

  return (
    <>
      <ProductHeaderWrapper>
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <h2>Suppliers</h2>
        <Box display="flex" gap={2} flexWrap="wrap" justifyContent="end" className="ms-auto">
          <SearchInput
            autoComplete="off"
            placeholder="Search by Name, Code & Email"
            onChange={(e) => { setSearchByKeyWordsValue(e.target.value); handleSearch(e.target.value, 'value'); }}
            value={searchByKeyWordsValue}
            width="245px"
          />
          {
            selectedSupplierIds.length
              ? <Button startIcon={<span className="icon-download" />} className="icon-button" onClick={() => handleDownloadClickEvent()} />
              : null
          }
          <Button
            disabled={!editSuppliers}
            startIcon={<AddCircleOutlineOutlinedIcon sx={{ fontSize: 14 }} />}
            text="Add New Supplier"
            onClick={() => SetSupplierDetail(true)}
          />
        </Box>
      </Box>
      </ProductHeaderWrapper>
      <Box mt={2.375}>
        <Table fixed tableHeader={supplierHeader} height="173px" checkbox isChecked={selectedSupplierIds?.length === suppliers.length} handleHeaderCheckBoxClicked={handleHeaderCheckBoxClicked}>
          {loading && !supplierDetail
            ? <LoaderWrapper />
            : data.length ? data?.map((row) => (
              <TableRow
                hover
                key={row._id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  <Box component="span" display="flex" alignItems="center" gap={1.5}>
                    <Checkbox
                      marginBottom="0"
                      className="body-checkbox"
                      checked={selectedSupplierIds.includes(String(row._id))}
                      onClick={(e) => handleCheckBoxClick(e, row._id)}
                    />
                    {row.companyName || '--'}
                  </Box>
                </TableCell>
                <TableCell>{row.supplierName || '--'}</TableCell>
                <TableCell>{row.supplierCode || '--'}</TableCell>
                <TableCell>{row.account || '--'}</TableCell>
                <TableCell>{row.email || '--'}</TableCell>
                <TableCell>{row.phone || '--'}</TableCell>
                <TableCell>{row.address || '--'}</TableCell>
                <TableCell>{row.fax || '--'}</TableCell>
                <TableCell>{row.zipCode || '--'}</TableCell>
                <TableCell>{row.country || '--'}</TableCell>
                <TableCell align="right">{row.action}</TableCell>
              </TableRow>
            )) : !loading && totalSuppliers === 0 && (
              <TableRow>
                <TableCell sx={{ borderBottom: '24px' }} colSpan={11} align="center">
                  <Box textAlign="center" display="flex" alignItems="center" justifyContent="center" height="calc(100vh - 260px)">
                    {/* <img className="nodata-table-img" src={noData} height="100%" style={{ maxWidth: '100%' }} alt="no-Data" /> */}
                  </Box>
                </TableCell>
              </TableRow>
            )}
        </Table>
        <Pagination
          componentName="suppliers"
          perPageRecord={suppliers?.length || 0}
          total={totalSuppliers}
          totalPages={Math.ceil(totalSuppliers / supplierPageLimit)}
          offset={totalSuppliers}
          pageNumber={supplierPageNumber}
          pageLimit={supplierPageLimit}
          handlePageLimitChange={handlePageLimit}
          handlePageNumberChange={handlePageNumber}
        />
      </Box>
      <Drawer open={supplierDetail} width="696px" close={handleSaveNewSupplierModalClose}>
        <Stack alignItems="center" direction="row" spacing={3}>
          <Box component="span" className="icon-left pointer" onClick={handleSaveNewSupplierModalClose} />
          <h2 className="m-0 pl-2">Enter Supplier Details</h2>
        </Stack>
        <Divider sx={{ backgroundColor: '#979797', margin: '25px 0px' }} />
        <Grid container columnSpacing={3}>
          {loading ? <LoaderWrapper /> : null}
          <Grid item md={6}>
            <Input
              autoComplete="off"
              label="Company Name"
              name="companyName"
              value={newSupplier.companyName}
              width="100%"
              onChange={handleAddSupplier}
              helperText={newSupplierHelperText.companyName}
            />
          </Grid>
          <Grid item md={6}>
            <Input
              autoComplete="off"
              label="Supplier Name"
              name="supplierName"
              value={newSupplier.supplierName}
              width="100%"
              onChange={handleAddSupplier}
              helperText={newSupplierHelperText.supplierName}
            />
          </Grid>
          <Grid item md={6}>
            <Grid container columnSpacing={3}>
              <Grid item md={6}>
                <Input
                  autoComplete="off"
                  label="Supplier Code"
                  name="code"
                  value={newSupplier.code}
                  width="100%"
                  onChange={handleAddSupplier}
                  helperText={newSupplierHelperText.code}
                />
              </Grid>
              <Grid item md={6}>
                <Input
                  autoComplete="off"
                  label="Account #"
                  name="account"
                  value={newSupplier.account}
                  width="100%"
                  onChange={handleAddSupplier}
                  helperText={newSupplierHelperText.account}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item md={6}>
            <Input
              autoComplete="off"
              label="Email Address"
              name="email"
              value={newSupplier.email}
              width="100%"
              onChange={handleAddSupplier}
              helperText={newSupplierHelperText.email}
            />
          </Grid>
          <Grid item md={6}>
            <Input
              autoComplete="off"
              label="Phone #"
              name="phone"
              value={newSupplier.phone}
              width="100%"
              onChange={handleAddSupplier}
              helperText={newSupplierHelperText.phone}
              marginBottom="17px"
            />
          </Grid>
          <Grid item md={6}>
            <Input
              autoComplete="off"
              label="Fax #"
              name="fax"
              value={newSupplier.fax}
              width="100%"
              onChange={handleAddSupplier}
              helperText={newSupplierHelperText.fax}
            />
          </Grid>
          <Grid item md={9}>
            <Input
              autoComplete="off"
              label="Street Address"
              name="streetAddress"
              value={newSupplier.streetAddress}
              width="100%"
              onChange={handleAddSupplier}
              helperText={newSupplierHelperText.streetAddress}
              marginBottom="17px"
            />
          </Grid>
          <Grid item md={3}>
            <Input
              autoComplete="off"
              label="City"
              name="city"
              value={newSupplier.city}
              width="100%"
              onChange={handleAddSupplier}
              helperText={newSupplierHelperText.city}
            />
          </Grid>
          <Grid item md={3}>
            <Input
              autoComplete="off"
              label="State/Province"
              name="state"
              value={newSupplier.state}
              width="100%"
              onChange={handleAddSupplier}
              helperText={newSupplierHelperText.state}
            />
          </Grid>
          <Grid item md={3}>
            <Input
              autoComplete="off"
              label="Country"
              name="country"
              value={newSupplier.country}
              width="100%"
              onChange={handleAddSupplier}
              helperText={newSupplierHelperText.country}
            />
          </Grid>
          <Grid item md={3}>
            <Input
              autoComplete="off"
              label="Zip Code"
              name="zipCode"
              value={newSupplier.zipCode}
              width="100%"
              onChange={handleAddSupplier}
              helperText={newSupplierHelperText.zipCode}
            />
          </Grid>
          <Grid item md={3}>
            <Input
              autoComplete="off"
              label="Payment Terms"
              name="paymentTerms"
              value={newSupplier.paymentTerms}
              width="100%"
              onChange={handleAddSupplier}
              helperText={newSupplierHelperText.paymentTerms}
            />
          </Grid>
        </Grid>
        <Box textAlign="right" mt={2.125}>
          <Button
            text="Save"
            variant="contained"
            width="87px"
            startIcon={<span className="icon-Save" />}
            onClick={handleSaveNewSupplier}
          />
        </Box>
      </Drawer>
    </>
  );
};

export default Index;
