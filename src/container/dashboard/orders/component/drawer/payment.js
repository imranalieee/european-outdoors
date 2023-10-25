import React, { useState, useEffect } from 'react';
import {
  Box, Stack, Divider, Grid
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { isEmpty, isEqual, extend } from 'lodash';
import moment from 'moment';

import EditAddress from './editAddress';
import Drawer from '../../../../../components/drawer';
import Input from '../../../../../components/inputs/input/index';
import Button from '../../../../../components/button';
import LoaderWrapper from '../../../../../components/loader';
// redux
import {
  GetOrderPaymentDetail,
  AddAndUpdateOrderPaymentDetail,
  SetOrderPaymentNotifyState,
  SetOrderState
} from '../../../../../redux/slices/order';

import { REGEX_FOR_NUMBERS, REGEX_FOR_DECIMAL_NUMBERS } from '../../../../../constants';

const Payment = (props) => {
  const { onClose: closePayment, open } = props;

  const dispatch = useDispatch();

  const {
    newOrderId,
    totalOrderItems,
    newOrderCustomerDetail,
    customerOrderUpdated
  } = useSelector((state) => state.order);

  const {
    orderPaymentDetail,
    success,
    updatePaymentDetail,
    addAndEditPaymentLoading
  } = useSelector((state) => state.orderPayment);

  const [creditCardDetails, setCreditCardDetails] = useState({
    firstName: '',
    lastName: '',
    cardNumber: '',
    expireDate: '',
    securityCode: ''
  });

  const [paymentDetail, setPaymentDetail] = useState({
    shippingPrice: '',
    discountPrice: '',
    taxPrice: ''
  });

  const [address, setAddress] = useState(false);
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [dateError, setDateError] = useState('');
  const [discountErrorMessage, setDiscountErrorMessage] = useState('');

  const [subTotal, setSubTotal] = useState(0);
  const {
    user: {
      permissions: {
        editOrders = false
      } = {}
    }
  } = useSelector((state) => state.auth);

  const handleCreditCardDetailsChange = (e) => {
    const { name, value } = e.target;

    if (!isEmpty(value) && name === 'securityCode' && value.length >= 5) return;

    setCreditCardDetails({
      ...creditCardDetails,
      [name]: value
    });

    if (name === 'expireDate') {
      const isValidDate = moment(value).isBefore(moment().format('YYYY-MM-DD'));

      if (isValidDate) {
        setDateError('Expire date should after the current date');
      } else {
        setDateError('');
      }
    }

    if (isEmpty(value) && name === 'firstName') setFirstNameError('First Name is required!');
    else if (!isEmpty(value) && name === 'firstName') setFirstNameError('');

    if (!value && name === 'lastName') setLastNameError('Last Name is required!');
    else if (!isEmpty(value) && name === 'lastName') setLastNameError('');
  };

  const handleSave = () => {
    let isError = false;

    if (isEmpty(creditCardDetails.firstName)) {
      isError = true;
      setFirstNameError('First Name is required!');
    }
    if (isEmpty(creditCardDetails.lastName)) {
      isError = true;
      setLastNameError('Last Name is required!');
    }
    if (!isEmpty(dateError)) {
      isError = true;
    }
    if (!isEmpty(discountErrorMessage)) {
      dispatch(SetOrderPaymentNotifyState({ message: 'Discount price should be else then the subTotal', type: 'info' }));
      isError = true;
    }

    if (!isError) {
      const creditCardDetailsCopy = creditCardDetails;
      let isExpireDate = true;
      if (isEmpty(creditCardDetailsCopy.expireDate)) {
        isExpireDate = false;
        delete creditCardDetailsCopy.expireDate;
      }

      const paymentDetails = {
        shippingPrice: Number(paymentDetail.shippingPrice).toFixed(2),
        taxPrice: Number(paymentDetail.taxPrice).toFixed(2),
        discountPrice: Number(paymentDetail.discountPrice).toFixed(2)
      };

      const prevCreditCardDetails = {
        firstName: orderPaymentDetail.firstName || '',
        lastName: orderPaymentDetail.lastName || '',
        cardNumber: orderPaymentDetail.cardNumber || '',
        securityCode: orderPaymentDetail.securityCode || ''
      };

      if (isExpireDate) {
        extend(prevCreditCardDetails, {
          expireDate: orderPaymentDetail.expireDate && orderPaymentDetail.expireDate !== ''
            ? moment(orderPaymentDetail.expireDate).format('YYYY-MM-DD')
            : ''
        });
      }

      let needToUpdate = false;
      if (!isEqual(prevCreditCardDetails, creditCardDetailsCopy)) {
        needToUpdate = true;
      }

      const prevPaymentDetails = {
        shippingPrice: Number(orderPaymentDetail.shippingPrice || '').toFixed(2),
        taxPrice: Number(orderPaymentDetail.taxPrice || '').toFixed(2),
        discountPrice: Number(orderPaymentDetail.discountPrice || '').toFixed(2)
      };

      if (!isEqual(paymentDetails, prevPaymentDetails)) {
        needToUpdate = true;
      }

      if (needToUpdate) {
        dispatch(AddAndUpdateOrderPaymentDetail({
          orderId: newOrderId,
          creditCardDetails: creditCardDetailsCopy,
          paymentDetails
        }));
      } else {
        dispatch(SetOrderPaymentNotifyState({ message: 'Nothing Updated', type: 'info' }));
      }
    }
  };

  const handlePaymentDetail = (e) => {
    const { name, value } = e.target;
    if (name === 'discountPrice') {
      if (Number(value) > subTotal) {
        setDiscountErrorMessage('Discount price should be else then the subTotal');
      } else setDiscountErrorMessage('');
    }
    setPaymentDetail({
      ...paymentDetail,
      [name]: value
    });
  };

  const handleClearState = () => {
    setCreditCardDetails({
      firstName: '',
      lastName: '',
      cardNumber: '',
      expireDate: '',
      securityCode: ''
    });

    setPaymentDetail({
      shippingPrice: '',
      discountPrice: '',
      taxPrice: ''
    });

    setLastNameError('');
    setFirstNameError('');
    setDateError('');
  };

  useEffect(() => {
    if (updatePaymentDetail && success && !addAndEditPaymentLoading) {
      // close modal
      closePayment();
      handleClearState();
    }
  }, [success, addAndEditPaymentLoading, updatePaymentDetail]);

  useEffect(() => {
    if (!isEmpty(orderPaymentDetail) && open) {
      const {
        firstName = '',
        lastName = '',
        cardNumber = '',
        shippingPrice = '',
        taxPrice = '',
        discountPrice = '',
        securityCode = '',
        expireDate,
        subTotal: itemTotal = 0
      } = orderPaymentDetail;

      setCreditCardDetails({
        firstName,
        lastName,
        cardNumber,
        expireDate: expireDate && expireDate !== '' ? moment(expireDate).format('YYYY-MM-DD') : '',
        securityCode
      });

      setSubTotal(itemTotal);

      setPaymentDetail({
        shippingPrice: shippingPrice || '',
        taxPrice: taxPrice || '',
        discountPrice: discountPrice || ''
      });
    }
  }, [orderPaymentDetail, open]);

  return (
    <Drawer
      open={open}
      width="696px"
      close={() => {
        closePayment();
        handleClearState();
      }}
    >
      <Box className="payment-details-content">
        {addAndEditPaymentLoading ? <LoaderWrapper /> : null}
        <Box display="flex" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <Box
              component="span"
              className="icon-left pointer"
              onClick={() => {
                closePayment();
                handleClearState();
              }}
            />
            <h2 className="m-0 pl-2">Pay With</h2>
          </Box>
        </Box>
        <Divider sx={{ marginTop: '24px', marginBottom: '24px' }} />
        <Box component="h3" marginBottom={2.125}>
          Credit And Debit Card
        </Box>
        <Grid container rowSpacing={0} columnSpacing={3} mb={1.250}>
          <Grid item xs={6}>
            <Input
              autoComplete="off"
              width="100%"
              placeholder="First Name"
              label="First Name"
              name="firstName"
              value={creditCardDetails.firstName}
              onChange={handleCreditCardDetailsChange}
              helperText={firstNameError}
            />
          </Grid>
          <Grid item xs={6}>
            <Input
              autoComplete="off"
              width="100%"
              label="Last Name"
              name="lastName"
              placeholder="Last Name"
              onChange={handleCreditCardDetailsChange}
              value={creditCardDetails.lastName}
              helperText={lastNameError}
            />
          </Grid>
          <Grid item xs={6}>
            <Input
              autoComplete="off"
              width="100%"
              label="Card Number"
              name="cardNumber"
              placeholder="0000 0000 0000 0000"
              onChange={(e) => {
                if (REGEX_FOR_NUMBERS.test(e.target.value)) {
                  handleCreditCardDetailsChange(e);
                } else {
                  e.target.value = '';
                }
              }}
              value={creditCardDetails.cardNumber}
            />
          </Grid>
          <Grid item xs={6}>
            <Grid container rowSpacing={0} columnSpacing={3}>
              <Grid item xs={6}>
                <Input
                  autoComplete="off"
                  width="100%"
                  type="date"
                  label="Expiration date"
                  name="expireDate"
                  placeholder="28 Dec 2022"
                  onChange={handleCreditCardDetailsChange}
                  value={creditCardDetails?.expireDate}
                  minValue={moment().format('YYYY-MM-DD')}
                  helperText={dateError}
                />
              </Grid>
              <Grid item xs={6}>
                <Input
                  autoComplete="off"
                  width="100%"
                  label="Security Code"
                  name="securityCode"
                  placeholder="0000"
                  value={creditCardDetails.securityCode}
                  onChange={(e) => {
                    if (REGEX_FOR_NUMBERS.test(e.target.value)) {
                      handleCreditCardDetailsChange(e);
                    } else {
                      e.target.value = '';
                    }
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Stack
          direction="row"
          spacing={3}
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Box component="h3" mb={0}>
            Billing Address
          </Box>
          <Button
            variant="text"
            className="btn-text-custom"
            text="Edit address"
            onClick={() => setAddress(true)}
            startIcon={<span className="icon-edit" />}
          />
        </Stack>
        <Box component="p" color="#002050" mb={0}>
          {newOrderCustomerDetail?.billInfo?.streetAddress || '--'}
        </Box>
        <Divider sx={{ marginTop: '24px', marginBottom: '24px' }} />
        <Box component="h3" marginBottom={2}>
          Payment Details
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Box component="span" color="#979797" fontSize="11px">
            Subtotal (
            {totalOrderItems}
            {' '}
            item)
          </Box>
          <Box component="span" color="#5A5F7D" fontSize="13px">
            $
            {Number(subTotal)?.toFixed(2)}
          </Box>
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Box component="span" color="#979797" fontSize="11px">
            Shipping
          </Box>
          <Input
            autoComplete="off"
            fontSize="13px"
            placeholder="$00.00"
            width="88px"
            marginBottom="0"
            name="shippingPrice"
            value={paymentDetail.shippingPrice}
            disabled={totalOrderItems === 0}
            onChange={(e) => {
              if (REGEX_FOR_DECIMAL_NUMBERS.test(e.target.value)) {
                handlePaymentDetail(e);
              } else {
                e.target.value = '';
              }
            }}
          />
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Box component="span" color="#979797" fontSize="11px">
            Discount
          </Box>
          <Box textAlign="right">
            <Input
              autoComplete="off"
              fontSize="13px"
              placeholder="$00.00"
              width="88px"
              marginBottom="0"
              disabled={subTotal === 0 || totalOrderItems === 0}
              name="discountPrice"
              value={paymentDetail.discountPrice}
              onChange={(e) => {
                if (REGEX_FOR_DECIMAL_NUMBERS.test(e.target.value)) {
                  handlePaymentDetail(e);
                } else {
                  e.target.value = '';
                }
              }}
            />
            <span style={{ color: 'rgba(220,53,69,1)', fontSize: '9px' }}>{discountErrorMessage}</span>
          </Box>
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.625}>
          <Box component="span" color="#979797" fontSize="11px">
            Tax
          </Box>
          <Input
            autoComplete="off"
            fontSize="13px"
            placeholder="$00.00"
            width="88px"
            marginBottom="0"
            name="taxPrice"
            disabled={totalOrderItems === 0}
            value={paymentDetail.taxPrice}
            onChange={(e) => {
              if (REGEX_FOR_DECIMAL_NUMBERS.test(e.target.value)) {
                handlePaymentDetail(e);
              } else {
                e.target.value = '';
              }
            }}
          />
        </Box>
        <Divider sx={{ marginTop: '24px', marginBottom: '14px' }} />
        <Box display="flex" justifyContent="space-between">
          <Box component="span" color="#979797" fontSize="11px">
            Total
          </Box>
          <Box
            component="span"
            color="#272B41"
            fontSize="13px"
            fontWeight="600"
          >
            $
            {(
              Number(subTotal || 0)
              + Number(paymentDetail.taxPrice || 0)
              + Number(paymentDetail.shippingPrice || 0)
              - Number(paymentDetail.discountPrice || 0)
            )?.toFixed(2) > 0 ? (
                Number(subTotal || 0)
              + Number(paymentDetail.taxPrice || 0)
              + Number(paymentDetail.shippingPrice || 0)
              - Number(paymentDetail.discountPrice || 0)
              )?.toFixed(2) : 0}
          </Box>
        </Box>
        <Box mt={4} textAlign="right">
          <Button
            text="Confirm and Charge"
            className="transform-none"
            variant="contained"
            disable={!editOrders}
            onClick={handleSave}
          />
        </Box>
      </Box>
      <EditAddress
        open={address}
        onClose={() => {
          if (customerOrderUpdated) {
            closePayment();
            setAddress(false);
            handleClearState();
            dispatch(SetOrderState({ field: 'customerOrderUpdated', value: false }));
          } else {
            setAddress(false);
          }
        }}
      />
    </Drawer>
  );
};

export default Payment;
