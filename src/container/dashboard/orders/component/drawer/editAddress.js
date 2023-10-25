import React, { useState, useEffect } from 'react';
import {
  Box, Stack, Divider, Grid
} from '@mui/material';
import { isEmpty, startCase, isEqual } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';

import Drawer from '../../../../../components/drawer';
import Input from '../../../../../components/inputs/input/index';
import Button from '../../../../../components/button';
import Checkbox from '../../../../../components/checkbox';

import {
  ValidateEmail,
  ValidatePhoneNumber
} from '../../../../../../utils/helpers';

import { SetOrderNotifyState, UpdateOrderCustomerDetail } from '../../../../../redux/slices/order';
import { LoaderWrapper } from '../../../../../components/loader/style';

const EditAddress = (props) => {
  const { onClose, open } = props;

  const {
    newOrderId,
    newOrderCustomerDetail,
    updateOrderCustomerDetailLoading,
    success,
    customerOrderUpdated,
    newOrder
  } = useSelector((state) => state.order);

  const dispatch = useDispatch();

  const [orderCustomerDetail, setOrderCustomerDetail] = useState({
    companyName: '',
    customerName: '',
    email: '',
    phoneNumber: '',
    fax: ''
  });

  const [billInfo, setBillInfo] = useState({
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  const [saveOrderHelperText, setSaveOrderHelperText] = useState({
    companyName: '',
    customerName: '',
    email: '',
    phoneNumber: '',
    shippingDate: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const [defaultAddress, setDefaultAddress] = useState(false);

  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  const handleOrderCustomerPersonalInfo = (e) => {
    const { name, value } = e.target;

    if (name === 'phoneNumber') {
      if (/[^+\-0-9]/.test(value)) {
        return;
      }
    }

    setOrderCustomerDetail({
      ...orderCustomerDetail,
      [name]: value
    });

    const errors = {};
    if (name === 'email') {
      const emailError = ValidateEmail({ email: value });
      if (emailError !== '') {
        errors.email = emailError;
      } else {
        errors.email = '';
      }
    } else if (!isEmpty(value) && name === 'phoneNumber') {
      const phoneError = ValidatePhoneNumber(value);
      if (phoneError !== '') {
        errors.phoneNumber = phoneError;
      } else {
        errors.phoneNumber = '';
      }
    } else if (isEmpty(value) && name === 'phoneNumber') {
      errors.phoneNumber = '';
    }

    if (isEmpty(value) && ['companyName', 'customerName', 'email'].includes(name)) {
      errors[name] = `${startCase(name)} is required!`;
    } else if (name !== 'phoneNumber' && name !== 'email') {
      errors[name] = '';
    }

    setSaveOrderHelperText((prevHelperText) => ({
      ...prevHelperText,
      ...errors
    }));
  };

  const handleOrderBillingInfo = (e) => {
    const { name, value } = e.target;

    setBillInfo({
      ...billInfo,
      [name]: value
    });

    const errors = {};
    if (
      isEmpty(value)
      && ['zipCode', 'streetAddress', 'state', 'city'].includes(name)
    ) {
      errors[name] = `${startCase(name)} is required!`;
    } else if (
      !isEmpty(value)
      && ['zipCode', 'streetAddress', 'state', 'city'].includes(name)
    ) {
      errors[name] = '';
    }

    setSaveOrderHelperText((prevHelperText) => ({
      ...prevHelperText,
      ...errors
    }));
  };

  const handleSaveChanges = () => {
    const {
      companyName,
      customerName,
      email,
      fax,
      phoneNumber
    } = orderCustomerDetail;

    const {
      streetAddress: billingStreetAddress,
      city: billingCity,
      zipCode: billingZipCode,
      state: billingState
    } = billInfo;

    const errors = {
      ...saveOrderHelperText
    };

    if (isEmpty(companyName)) errors.companyName = 'Company Name is required!';
    if (isEmpty(customerName)) errors.customerName = 'Customer Name is required!';
    if (isEmpty(email)) errors.email = 'Email Name is required!';

    if (isEmpty(billingStreetAddress)) errors.streetAddress = 'Street Address is required!';
    if (isEmpty(billingCity)) { errors.city = 'City is required!'; }
    if (isEmpty(billingZipCode)) errors.zipCode = 'ZipCode Name is required!';
    if (isEmpty(billingState)) errors.state = 'State is required!';

    setSaveOrderHelperText({
      ...saveOrderHelperText,
      ...errors
    });

    if (Object.values(errors).every((errorValue) => errorValue === '')) {
      let needToUpdate = false;
      const {
        companyName: prevCompanyName,
        customerName: prevCustomerName,
        email: prevEmail,
        phoneNumber: prevPhoneNumber,
        fax: prevFx,
        billInfo: prevBillingInfo = {},
        defaultAddress: prevDefaultAddress
      } = newOrderCustomerDetail;

      if (companyName !== prevCompanyName
        || customerName !== prevCustomerName || email !== prevEmail
        || fax !== prevFx || phoneNumber !== prevPhoneNumber
        || (newOrder?.warehouseInstruction || '') !== deliveryInstructions
        || (prevDefaultAddress || false) !== defaultAddress
      ) {
        needToUpdate = true;
      }

      if (!isEqual(prevBillingInfo, billInfo)) {
        needToUpdate = true;
      }

      if (needToUpdate) {
        dispatch(UpdateOrderCustomerDetail({
          orderId: newOrderId,
          personalInformation: orderCustomerDetail,
          billingInformation: billInfo,
          deliveryInstructions,
          defaultAddress
        }));
      } else {
        dispatch(SetOrderNotifyState({ message: 'Nothing Updated', type: 'info' }));
      }
    }
  };

  const handleClearState = () => {
    setSaveOrderHelperText({
      companyName: '',
      customerName: '',
      email: '',
      phoneNumber: '',
      shippingDate: ''
    });
    setBillInfo({
      streetAddress: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    });
    setOrderCustomerDetail({
      companyName: '',
      customerName: '',
      email: '',
      phoneNumber: '',
      fax: ''
    });
    setDefaultAddress(false);
    setDeliveryInstructions('');
  };

  useEffect(() => {
    if (success && !updateOrderCustomerDetailLoading && customerOrderUpdated) {
      // close modal
      onClose();
      handleClearState();
    }
  }, [updateOrderCustomerDetailLoading, success]);

  useEffect(() => {
    if (!isEmpty(newOrderCustomerDetail) && open) {
      const {
        companyName = '',
        customerName = '',
        email = '',
        phoneNumber = '',
        fax = '',
        billInfo: billingInfo = {},
        defaultAddress: isDefaultAddress
      } = newOrderCustomerDetail;

      setOrderCustomerDetail({
        companyName,
        customerName,
        email,
        phoneNumber,
        fax
      });

      setBillInfo({
        streetAddress: billingInfo.streetAddress,
        city: billingInfo.city,
        state: billingInfo.state,
        zipCode: billingInfo.zipCode,
        country: billingInfo.country
      });

      setDefaultAddress(isDefaultAddress || false);
    }
  }, [newOrderCustomerDetail, open]);

  useEffect(() => {
    if (!isEmpty(newOrder)) {
      setDeliveryInstructions(newOrder.warehouseInstruction || '');
    }
  }, [newOrder]);

  return (
    <Drawer open={open} width="696px" close={() => { onClose(); handleClearState(); }}>
      {updateOrderCustomerDetailLoading ? <LoaderWrapper /> : null}
      <Box className="payment-details-content">
        <Box display="flex" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <Box
              component="span"
              className="icon-left pointer"
              onClick={() => { onClose(); handleClearState(); }}
            />
            <h2 className="m-0 pl-2">Enter A New Shipping Address</h2>
          </Box>
        </Box>
        <Divider sx={{ marginTop: '24px', marginBottom: '24px' }} />
        <Box component="h3" marginBottom={2.125}>
          Enter Customer’s Personal Information For Billing
        </Box>
        <Grid container rowSpacing={0} columnSpacing={3} mb={1.25}>
          <Grid item xs={6}>
            <Input
              autoComplete="off"
              width="100%"
              placeholder="Company Name"
              label="Company Name"
              name="companyName"
              value={orderCustomerDetail.companyName}
              onChange={handleOrderCustomerPersonalInfo}
              helperText={saveOrderHelperText.companyName}
            />
          </Grid>
          <Grid item xs={6}>
            <Input
              autoComplete="off"
              width="100%"
              label="Customer Name"
              placeholder="Customer Name"
              name="customerName"
              value={orderCustomerDetail.customerName}
              onChange={handleOrderCustomerPersonalInfo}
              helperText={saveOrderHelperText.customerName}
            />
          </Grid>
          <Grid item xs={6}>
            <Input
              autoComplete="off"
              width="100%"
              label="Email Address"
              placeholder="Email Address"
              name="email"
              value={orderCustomerDetail.email}
              onChange={handleOrderCustomerPersonalInfo}
              helperText={saveOrderHelperText.email}
            />
          </Grid>
          <Grid item xs={6}>
            <Grid container rowSpacing={0} columnSpacing={3}>
              <Grid item xs={6}>
                <Input
                  autoComplete="off"
                  width="100%"
                  label="Phone #"
                  placeholder="Phone #"
                  name="phoneNumber"
                  value={orderCustomerDetail.phoneNumber}
                  onChange={handleOrderCustomerPersonalInfo}
                  helperText={saveOrderHelperText.phoneNumber}
                />
              </Grid>
              <Grid item xs={6}>
                <Input
                  autoComplete="off"
                  width="100%"
                  label="Fax #"
                  name="fax"
                  placeholder="Fax #"
                  value={orderCustomerDetail.fax}
                  onChange={handleOrderCustomerPersonalInfo}
                  helperText={saveOrderHelperText.fax}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Box component="h3" marginBottom={2.125}>
          Enter Customer’s Address(s) Information For Billing
        </Box>
        <Grid container rowSpacing={0} columnSpacing={3} mb={1.25}>
          <Grid item xs={6}>
            <Input
              autoComplete="off"
              width="100%"
              placeholder="Street Address"
              label="Street Address"
              name="streetAddress"
              value={billInfo.streetAddress}
              onChange={handleOrderBillingInfo}
              helperText={saveOrderHelperText.streetAddress}
            />
          </Grid>
          <Grid item xs={6}>
            <Input
              autoComplete="off"
              width="100%"
              label="City"
              placeholder="City"
              name="city"
              value={billInfo.city}
              onChange={handleOrderBillingInfo}
              helperText={saveOrderHelperText.city}
            />
          </Grid>
          <Grid item xs={6}>
            <Grid container rowSpacing={0} columnSpacing={3}>
              <Grid item xs={6}>
                <Input
                  autoComplete="off"
                  width="100%"
                  label="State/Province"
                  name="state"
                  placeholder="State/Province"
                  marginBottom="6px"
                  value={billInfo.state}
                  onChange={handleOrderBillingInfo}
                  helperText={saveOrderHelperText.state}
                />
              </Grid>
              <Grid item xs={6}>
                <Input
                  autoComplete="off"
                  width="100%"
                  label="Zip Code"
                  name="zipCode"
                  placeholder="Zip Code"
                  marginBottom="6px"
                  value={billInfo.zipCode}
                  onChange={handleOrderBillingInfo}
                  helperText={saveOrderHelperText.zipCode}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={6}>
            <Input
              autoComplete="off"
              width="100%"
              label="Country"
              name="country"
              placeholder="Country"
              marginBottom="6px"
              value={billInfo.country}
              onChange={handleOrderBillingInfo}
              helperText={saveOrderHelperText.country}
            />
          </Grid>
        </Grid>
        <Box display="flex" alignItems="center">
          <Box color="#5A5F7D" mr="20px">
            Make this my default address
          </Box>
          <Checkbox
            label="Yes"
            marginBottom="0px"
            checked={defaultAddress}
            onClick={() => setDefaultAddress(true)}
          />
          <Box component="span" ml={0}>
            <Checkbox
              label="No"
              marginBottom="0px"
              checked={!defaultAddress}
              onClick={() => setDefaultAddress(false)}
            />
          </Box>
        </Box>
        <Box component="h3" marginBottom={2.125} marginTop="15px">
          Delivery Instructions
          <Box
            component="span"
            fontWeight="400"
            fontSize="11px"
            color="#979797"
            marginLeft="8px"
            sx={{ marginLeft: '10px', position: 'relative', top: '-3px' }}
          >
            (Optional)
          </Box>
        </Box>
        <Grid container rowSpacing={0} columnSpacing={3} mb={1.25}>
          <Grid item xs={12}>
            <Input
              autoComplete="off"
              width="100%"
              placeholder="Add preferences, notes, access codes and more"
              multiline
              rows={3.5}
              name="delivery-instructions"
              className="input-textarea input-textarea-custom"
              value={deliveryInstructions}
              onChange={(e) => setDeliveryInstructions(e.target.value)}
            />
          </Grid>
        </Grid>
        <Box mt={2} textAlign="right">
          <Button
            text="Save Changes"
            startIcon={<span className="icon-Save" />}
            className="transform-none"
            variant="contained"
            onClick={handleSaveChanges}
          />
        </Box>
      </Box>
    </Drawer>
  );
};

export default EditAddress;
