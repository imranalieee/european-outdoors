import React,
{
  useState, useEffect, useRef, forwardRef
}
  from 'react';
import ReactToPrint from 'react-to-print';
import {
  Box, Stack, Divider, Grid
} from '@mui/material';
import { startCase, isEmpty, isEqual } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { ReactSVG } from 'react-svg';
import Drawer from '../../../../../components/drawer';
import Switch from '../../../../../components/switch';
import Input from '../../../../../components/inputs/input';
import Select from '../../../../../components/select';
import Button from '../../../../../components/button';
import LoaderWrapper from '../../../../../components/loader';
import ConfirmShipment from '../modals/delete';

import Shipment from '../../../../../static/images/shipment.svg';
import Ups from '../../../../../static/images/ups.svg';
import Fedex from '../../../../../static/images/fedex.svg';
import AmazonPrime from '../../../../../static/images/amazon-prime.svg';
import Amazon from '../../../../../static/images/amazon.svg';
import calculatorIcon from '../../../../../static/images/calc-icon.svg';
// Redux
import {
  AddBox,
  UpdateBox,
  UpdateBoxDetail,
  SetOrderNotifyState,
  GetBoxLogsByBoxId,
  GetOrderDetail
} from '../../../../../redux/slices/order';
import {
  AmazonRates,
  AddAmazonShipment,
  AddShipment,
  AddUspsShipment,
  GetVendorCentralShipmentLabel,
  PurchaseShipmentForVendorCentral,
  SetUpsState,
  SetAmazonState,
  SetUspsState,
  SetVendorCentralState,
  UpsGroundRates,
  UspsGroundAdvantageRates,
  UpsNextDayAirSaverRates,
  UpsStandardOvernightRates,
  UpsSurePostRates
} from '../../../../../redux/slices/shipment/index';
import { GetS3ImageUrl } from '../../../../../../utils/helpers';
// constants
import {
  REGEX_FOR_DECIMAL_NUMBERS,
  INPUT_TYPE_NUMBER,
  Shipper,
  DIMENSIONAL_FACTOR_UPS_WEIGHT,
  VENDOR_CENTRAL,
  AMAZON_CHANNEL
} from '../../../../../constants';

const PrintableContent = forwardRef(({ imageUrl }, ref) => (
  <div ref={ref}>
    <img src={imageUrl} alt="Shipping Label" />
  </div>
));

const CreateBox = (props) => {
  const dispatch = useDispatch();
  const labelRef = useRef();
  const params = useParams();
  const {
    addedBox,
    updatedBox,
    addBoxLoading,
    orderBoxes,
    boxLogs
  } = useSelector((state) => state.processOrder);

  const {
    addShipmentLoading,
    upsGroundRates,
    upsGroundRatesLoading,
    upsNextDayAirSaverRates,
    upsNextDayAirSaverRatesLoading,
    upsStandardOvernightRates,
    upsStandardOvernightRatesLoading,
    upsSurePostRates,
    upsSurePostRatesLoading,
    shipmentDetails,
    shipmentAdded
  } = useSelector((state) => state.ups);

  const {
    uspsAddShipmentLoading,
    uspsGroundRates,
    uspsGroundRatesLoading,
    uspsShipmentDetails,
    uspsShipmentAdded
  } = useSelector((state) => state.usps);

  const {
    amazonAddShipmentLoading,
    amazonRates,
    amazonRatesLoading,
    amazonShipmentDetails,
    amazonShipmentAdded
  } = useSelector((state) => state.amazon);

  const {
    vcShipmentLabelDetails,
    vcShipmentLabelLoading,
    vcShipmentPurchaseLoading,
    vcShipmentLabelFetched,
    vcShipmentPurchased
  } = useSelector((state) => state.vendorCentral);

  const {
    onClose,
    open,
    orderId,
    orderNo,
    isEdit,
    editBox,
    customerDetail,
    marketplaceOrderId,
    salesChannel,
    itemsInBox,
    setEditBox,
    scannedBarcode
  } = props;
  const [shipmentCarrier, setShipmentCarrier] = useState(false);
  const [edit, setEdit] = useState(false);
  const [connectScale, setConnectScale] = useState(false);
  const [calculateRates, setCalculateRates] = useState(false);
  const [addTracking, setAddTracking] = useState('');
  const [labelKey, setLabelKey] = useState('');
  const [confirmShipment, setConfirmShipment] = useState(false);
  const [isReprint, setIsReprint] = useState(false);
  const [addBox, setAddBox] = useState({
    width: '',
    height: '',
    length: '',
    weight: ''
  });
  const [addBoxHelperText, setAddBoxHelperText] = useState({
    width: '',
    height: '',
    length: '',
    weight: ''
  });
  const [isLabel, setIsLabel] = useState(false);

  const shipment = [
    {
      image: Shipment,
      title: uspsGroundRatesLoading ? '--' : `${uspsGroundRates?.MailService || 'Priority Mail'}`,
      total: uspsGroundRatesLoading ? '--' : `$${uspsGroundRates?.TotalAmount || 0}`
    },
    {
      image: Ups,
      title: 'Standard Overnight',
      total: upsStandardOvernightRatesLoading ? '--' : `$${upsStandardOvernightRates?.MonetaryValue || 0}`
    },
    {
      image: Ups,
      title: 'Next Day Air Saver',
      total: upsNextDayAirSaverRatesLoading ? '--' : `$${upsNextDayAirSaverRates?.MonetaryValue || 0}`
    },
    {
      image: Ups,
      title: 'Ground',
      total: upsGroundRatesLoading ? '--' : `$${upsGroundRates?.MonetaryValue || 0}`
    },
    {
      image: Ups,
      title: 'SurePost 1 lb or Greater',
      total: upsSurePostRatesLoading ? '--' : `$${upsSurePostRates?.MonetaryValue || 0}`
    },
    {
      image: Amazon,
      title: amazonRatesLoading ? '--' : `${amazonRates?.serviceName || 'Self Delivery'}`,
      total: amazonRatesLoading ? '--' : `$${amazonRates?.totalCharge?.value || 0}`
    }
  ];

  const otherShipment = [
    {
      image: Fedex,
      title: 'First Overnight',
      total: '--'
    },
    {
      image: Fedex,
      title: 'Priority Overnight',
      total: '--'
    },
    {
      image: Fedex,
      title: 'Ground Home Delivery',
      total: '--'
    },
    {
      image: AmazonPrime,
      title: 'Not calculated',
      total: '--'
    }
  ];

  const handleBoxChange = (e) => {
    const { value: val, name: key } = e.target;
    const errors = {};

    if (val === '') {
      errors[key] = `${startCase(key)} is required!`;
      setAddBox({
        ...addBox,
        [key]: val
      });
    } else {
      errors[key] = '';
      setAddBox({
        ...addBox,
        [key]: val
      });
    }
    setAddBoxHelperText((prevHelperText) => ({
      ...prevHelperText,
      ...errors
    }));
  };

  const handleBoxSave = () => {
    const errors = {};
    Object.keys(addBox).forEach((key) => {
      if (addBox[key] === '') {
        errors[key] = `${startCase(key)} is required!`;
      } else {
        errors[key] = '';
      }
    });
    setAddBoxHelperText((prevHelperText) => ({
      ...prevHelperText,
      ...errors
    }));

    if (Object.values(errors).every((errorValue) => errorValue === '')) {
      if (isEdit) {
        const updateParams = {
          width: addBox?.width,
          height: addBox?.height,
          length: addBox?.length,
          weight: addBox?.weight,
          trackingNo: addTracking,
          connectScale
        };
        const prevParams = {
          width: editBox?.width,
          height: editBox?.height,
          length: editBox?.length,
          weight: editBox?.weight,
          connectScale: editBox?.connectScale,
          trackingNo: editBox?.trackingNo
        };
        if (isEqual(updateParams, prevParams)) {
          dispatch(
            SetOrderNotifyState({
              message: 'Nothing updated !',
              type: 'info'
            })
          );
        } else {
          dispatch(UpdateBox({
            boxId: editBox?._id,
            updateParams
          }));
        }
      } else {
        dispatch(AddBox({
          addBox: {
            orderId,
            width: addBox?.width,
            height: addBox?.height,
            length: addBox?.length,
            weight: addBox?.weight,
            connectScale
          }
        }));
      }
    }
  };

  const handleResetValues = () => {
    setEdit(false);
    onClose();
    setAddBox({
      width: '',
      height: '',
      length: '',
      weight: ''
    });
    setAddBoxHelperText({
      width: '',
      height: '',
      length: '',
      weight: ''
    });
    setConnectScale(false);
    setAddTracking('');
    setLabelKey('');
  };

  const handleF2KeyPress = () => {
    handleBoxSave();
  };

  const resetValues = () => {
    dispatch(
      SetUpsState({
        field: 'upsGroundRates',
        value: 0
      })
    );
    dispatch(
      SetUspsState({
        field: 'uspsGroundRates',
        value: 0
      })
    );
    dispatch(
      SetAmazonState({
        field: 'amazonRates',
        value: 0
      })
    );
    dispatch(
      SetUpsState({
        field: 'upsStandardOvernightRates',
        value: 0
      })
    );
    dispatch(
      SetUpsState({
        field: 'upsNextDayAirSaverRates',
        value: 0
      })
    );
    dispatch(
      SetUpsState({
        field: 'upsSurePostRates',
        value: 0
      })
    );
  };

  const calculateShippingRates = () => {
    const shipToObj = {
      Name: customerDetail?.customerName,
      Address: {
        AddressLine: [
          customerDetail?.shippingInfo?.streetAddress
        ],
        City: customerDetail?.shippingInfo?.city,
        StateProvinceCode: customerDetail?.shippingInfo?.state,
        PostalCode: customerDetail?.shippingInfo?.zipCode,
        CountryCode: customerDetail?.shippingInfo?.country
      }
    };
    if (addBox?.height
      && addBox?.length
      && addBox?.width
      && addBox?.weight
      && !isEmpty(Shipper)
      && !isEmpty(customerDetail)
      && !shipmentCarrier) {
      resetValues();
      if (itemsInBox?.length) {
        if (salesChannel === AMAZON_CHANNEL) {
          dispatch(AmazonRates({
            shipper: Shipper,
            boxDimensions: addBox,
            orderId,
            marketplaceOrderId,
            boxId: editBox?._id
          }));
        } else {
          dispatch(UpsGroundRates({
            shipper: Shipper,
            shipTo: shipToObj,
            boxDimensions: addBox
          }));

          dispatch(UspsGroundAdvantageRates({
            shipper: Shipper,
            shipTo: shipToObj,
            boxDimensions: addBox
          }));
          dispatch(UpsSurePostRates({
            shipper: Shipper,
            shipTo: shipToObj,
            boxDimensions: addBox
          }));
          dispatch(UpsNextDayAirSaverRates({
            shipper: Shipper,
            shipTo: shipToObj,
            boxDimensions: addBox
          }));
          dispatch(UpsStandardOvernightRates({
            shipper: Shipper,
            shipTo: shipToObj,
            boxDimensions: addBox
          }));
        }
      } else {
        dispatch(
          SetOrderNotifyState({
            message: 'There should be at least one item in the box !',
            type: 'info'
          })
        );
      }
    }
    if (addBox?.height
      && addBox?.length
      && addBox?.width
      && addBox?.weight
      && !isEmpty(Shipper)
      && !isEmpty(customerDetail)
      && shipmentCarrier) {
      resetValues();
    }
  };

  const getVendorCentralShipmentLabel = () => {
    if (!isEmpty(editBox?._id)) {
      if (itemsInBox?.length) {
        dispatch(GetVendorCentralShipmentLabel({
          orderId
        }));
      } else {
        dispatch(
          SetOrderNotifyState({
            message: 'There should be at least one item in the box !',
            type: 'info'
          })
        );
      }
    }
  };

  const purchaseShipmentForVendorCentral = () => {
    if (!isEmpty(editBox?.shipmentCarrier)) {
      dispatch(PurchaseShipmentForVendorCentral({
        orderId,
        boxId: editBox?._id
      }));
    }
  };
  const getBoxLogsByBoxId = () => {
    if (!isEmpty(editBox?._id)) {
      dispatch(GetBoxLogsByBoxId({ boxId: editBox?._id }));
    }
  };

  useEffect(() => {
    if (open) {
      getBoxLogsByBoxId();
    }
  }, [open]);

  useEffect(() => {
    setEdit(false);
    if (salesChannel === VENDOR_CENTRAL) {
      if (isEmpty(editBox)) {
        onClose();
      }
    } else {
      onClose();
    }
  }, [addedBox, updatedBox]);

  const handleKeyPress = (event) => {
    if (event.key === 'F2') {
      handleF2KeyPress();
    } else if (event.key === 'F4') {
      if (salesChannel !== VENDOR_CENTRAL && !isEmpty(editBox?._id) && !addTracking) {
        calculateShippingRates();
      }
    } else if (event.key === 'F3' || event.key === 'Enter') {
      const button = document.getElementById('labelPrint');
      if (button) {
        button.click();
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  useEffect(() => {
    if (!isEmpty(editBox)) {
      // setConnectScale(editBox?.connectScale);
      setAddTracking(editBox?.trackingNo);
      setLabelKey(editBox?.labelKey);
      setIsLabel(true);
      setAddBox({
        width: editBox?.width,
        height: editBox?.height,
        length: editBox?.length,
        weight: editBox?.weight
      });
    } else {
      setAddBox({
        width: '',
        height: '',
        length: '',
        weight: ''
      });
      setAddTracking('');
      setLabelKey('');
      setIsLabel(false);
      setConnectScale(false);
    }
  }, [editBox]);

  const handleArrow = (propertyName, propertyValue) => {
    setAddBox({ ...addBox, [propertyName]: propertyValue });
    setAddBoxHelperText({ ...addBoxHelperText, [propertyName]: '' });
  };

  const handleAddShipment = ({ title }) => {
    if (isEmpty(addTracking) && isEdit) {
      const shipToObj = {
        Name: customerDetail?.customerName,
        Address: {
          AddressLine: [
            customerDetail?.shippingInfo?.streetAddress
          ],
          City: customerDetail?.shippingInfo?.city,
          StateProvinceCode: customerDetail?.shippingInfo?.state,
          PostalCode: customerDetail?.shippingInfo?.zipCode,
          CountryCode: customerDetail?.shippingInfo?.country
        }
      };
      let serviceCode = '';

      if (title === 'Ground') {
        serviceCode = '02';
      } else if (title === 'SurePost 1 lb or Greater') {
        serviceCode = '93';
      } else if (title === 'Standard Overnight') {
        serviceCode = '13';
      } else if (title === 'Next Day Air Saver') {
        serviceCode = '01';
      }

      if ((title === 'Ground'
        || title === 'SurePost 1 lb or Greater'
        || title === 'Standard Overnight'
        || title === 'Next Day Air Saver') && !isEmpty(upsGroundRates?.MonetaryValue)) {
        if (!isEmpty(serviceCode)) {
          dispatch(AddShipment({
            shipper: Shipper,
            shipTo: shipToObj,
            boxDimensions: addBox,
            serviceCode,
            orderId: params.id,
            boxId: editBox?._id
          }));
        }
      } else if (title === uspsGroundRates?.MailService && !isEmpty(uspsGroundRates?.TotalAmount)) {
        dispatch(AddUspsShipment({
          shipper: Shipper,
          shipTo: shipToObj,
          boxDimensions: addBox,
          parcelShape: uspsGroundRates?.ParcelShape,
          mailClass: uspsGroundRates?.MailClass,
          orderId: params.id,
          boxId: editBox?._id
        }));
      } else if (title === amazonRates?.serviceName && !isEmpty(amazonRates)) {
        const findPng = amazonRates?.requestedDocumentSpecification?.find((item) => item?.format === 'PNG');
        dispatch(AddAmazonShipment({
          requestToken: amazonRates?.requestToken,
          requestedDocumentSpecification: findPng,
          requestedValueAddedServices: amazonRates?.requestedValueAddedServices,
          rateId: amazonRates?.rateId,
          orderId: params.id,
          boxId: editBox?._id
        }));
      }
      dispatch(
        SetUpsState({
          field: 'shipmentDetails',
          value: {}
        })
      );
      dispatch(
        SetUspsState({
          field: 'uspsShipmentDetails',
          value: {}
        })
      );
      dispatch(
        SetAmazonState({
          field: 'amazonShipmentDetails',
          value: {}
        })
      );
    }
  };

  useEffect(() => {
    if (editBox?._id) {
      calculateShippingRates();
    }
  }, [calculateRates]);

  useEffect(() => {
    if (!isEmpty(shipmentDetails?.trackingNumber) && !isEmpty(shipmentDetails?.labelKey)) {
      onClose();
      dispatch(UpdateBox({
        boxId: editBox?._id,
        updateParams: {
          trackingNo: shipmentDetails?.trackingNumber,
          labelKey: shipmentDetails?.labelKey,
          shipmentCarrier: shipmentDetails?.shipmentCarrier,
          shippingCompany: 'UPS',
          shippingAmount: shipmentDetails?.charges?.MonetaryValue
        }
      }));
      setAddTracking(shipmentDetails?.trackingNumber);
      setLabelKey(shipmentDetails?.labelKey);
      dispatch(SetUpsState({
        field: 'shipmentDetails',
        value: {}
      }));
    } else {
      setAddTracking('');
      setLabelKey('');
    }
  }, [shipmentDetails]);

  useEffect(() => {
    if (!isEmpty(uspsShipmentDetails?.trackingNumber) && !isEmpty(uspsShipmentDetails?.labelKey)) {
      onClose();
      dispatch(UpdateBox({
        boxId: editBox?._id,
        updateParams: {
          trackingNo: uspsShipmentDetails?.trackingNumber,
          labelKey: uspsShipmentDetails?.labelKey,
          shipmentCarrier: uspsGroundRates?.MailService,
          shippingCompany: 'USPS',
          shippingAmount: uspsGroundRates?.TotalAmount
        }
      }));
      setAddTracking(uspsShipmentDetails?.trackingNumber);
      setLabelKey(uspsShipmentDetails?.labelKey);
      dispatch(SetUspsState({
        field: 'uspsShipmentDetails',
        value: {}
      }));
    } else {
      setAddTracking('');
      setLabelKey('');
    }
  }, [uspsShipmentDetails]);

  useEffect(() => {
    if (!isEmpty(amazonShipmentDetails?.trackingNumber)
      && !isEmpty(amazonShipmentDetails?.labelKey)) {
      onClose();
      dispatch(UpdateBox({
        boxId: editBox?._id,
        updateParams: {
          trackingNo: amazonShipmentDetails?.trackingNumber,
          labelKey: amazonShipmentDetails?.labelKey,
          shipmentCarrier: amazonRates?.serviceName,
          shippingCompany: 'Amazon',
          shippingAmount: amazonRates?.totalCharge?.value
        }
      }));
      setAddTracking(amazonShipmentDetails?.trackingNumber);
      setLabelKey(amazonShipmentDetails?.labelKey);
      dispatch(SetAmazonState({
        field: 'amazonShipmentDetails',
        value: {}
      }));
    } else {
      setAddTracking('');
      setLabelKey('');
    }
  }, [amazonShipmentDetails]);

  useEffect(() => {
    if (!isEmpty(vcShipmentLabelDetails?.trackingNumber)
      && !isEmpty(vcShipmentLabelDetails?.labelKey)) {
      dispatch(UpdateBox({
        boxId: editBox?._id,
        updateParams: {
          trackingNo: vcShipmentLabelDetails?.trackingNumber,
          labelKey: vcShipmentLabelDetails?.labelKey,
          shipmentCarrier: vcShipmentLabelDetails?.shipMethodName,
          sellingPartyId: vcShipmentLabelDetails?.sellingParty?.partyId,
          shipFromPartyId: vcShipmentLabelDetails?.shipFromParty?.partyId
        }
      }));
      setAddTracking(vcShipmentLabelDetails?.trackingNumber);
      setLabelKey(vcShipmentLabelDetails?.labelKey);
      dispatch(SetVendorCentralState({
        field: 'vcShipmentLabelDetails',
        value: {}
      }));
    } else {
      setAddTracking('');
      setLabelKey('');
    }
  }, [vcShipmentLabelDetails]);

  useEffect(() => {
    if (connectScale) {
      const calculate = (Math?.round(Number(addBox?.length))
        * Math?.round(Number(addBox?.height))
        * Math?.round(Number(addBox?.width))) / DIMENSIONAL_FACTOR_UPS_WEIGHT;
      setAddBox({ ...addBox, weight: calculate?.toFixed(2) });
      setAddBoxHelperText((prevHelperText) => ({
        ...prevHelperText,
        weight: ''
      }));
    } else {
      setAddBox({ ...addBox, weight: '' });
    }
  }, [connectScale]);

  useEffect(() => {
    if (orderBoxes?.length) {
      const findBox = orderBoxes?.find((item) => item?._id === editBox?._id);
      setEditBox(findBox);
      if (vcShipmentLabelFetched) {
        setIsLabel(true);
      }
    }
  }, [orderBoxes]);

  useEffect(() => {
    if (isLabel && !isEmpty(labelKey) && vcShipmentLabelFetched) {
      const button = document.getElementById('TriggerPrint');
      if (button) {
        button.click();
      }
      dispatch(SetVendorCentralState({
        field: 'vcShipmentLabelFetched',
        value: false
      }));
    }
  }, [isLabel, labelKey]);

  useEffect(() => {
    if (vcShipmentPurchased) {
      onClose();
      setConfirmShipment(false);
      dispatch(SetVendorCentralState({
        field: 'vcShipmentPurchased',
        value: false
      }));
      dispatch(GetOrderDetail({ orderId: params?.id }));
    }
    if (uspsShipmentAdded) {
      onClose();
      setConfirmShipment(false);
      dispatch(SetUspsState({
        field: 'uspsShipmentAdded',
        value: false
      }));
      dispatch(GetOrderDetail({ orderId: params?.id }));
    }
    if (shipmentAdded) {
      onClose();
      setConfirmShipment(false);
      dispatch(SetUpsState({
        field: 'shipmentAdded',
        value: false
      }));
      dispatch(GetOrderDetail({ orderId: params?.id }));
    }
    if (amazonShipmentAdded) {
      onClose();
      setConfirmShipment(false);
      dispatch(SetAmazonState({
        field: 'amazonShipmentAdded',
        value: false
      }));
      dispatch(GetOrderDetail({ orderId: params?.id }));
    }
  }, [vcShipmentPurchased, uspsShipmentAdded, shipmentAdded, amazonShipmentAdded]);

  useEffect(() => {
    if (boxLogs?.length) {
      const findPrint = boxLogs?.find((item) => item?.labelPrintedBy);
      if (!isEmpty(findPrint)) {
        setIsReprint(true);
      } else {
        setIsReprint(false);
      }
    } else {
      setIsReprint(false);
    }
  }, [boxLogs]);

  return (
    <Drawer
      open={open}
      width="778px"
      close={() => {
        handleResetValues();
        onClose();
      }}
    >
      <Box position="relative">
        {addBoxLoading
          || vcShipmentLabelLoading
          || addShipmentLoading
          || uspsAddShipmentLoading
          || amazonAddShipmentLoading
          || amazonRatesLoading
          ? <LoaderWrapper /> : null}
        <Stack alignItems="center" direction="row" spacing={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
            <Box display="flex" alignItems="center">
              <Box
                component="span"
                className="icon-left pointer"
                onClick={handleResetValues}
              />
              <h2 className="m-0 pl-2">
                Order No:
                {orderNo}
              </h2>
            </Box>
          </Box>
        </Stack>
        <Divider sx={{ marginTop: '24px', marginBottom: '26px' }} />
        <Box display="flex" gap={7.5}>
          <Box maxWidth="275px">
            <h3>Ships From</h3>
            <Box color="#5A5F7D" mb={0.5} fontWeight="600">European Outdoors</Box>
            <Box
              component="p"
              fontSize="12px"
              color="#5A5F7D"
              lineHeight="17px"
              marginBottom="0px"
            >
              2596 NY 17m, Goshen NY 10924, MA 01430 (845) 341-2080

            </Box>

          </Box>
          <Box maxWidth="275px">
            <h3>Ships To</h3>
            <Box color="#5A5F7D" mb={0.5} fontWeight="600">
              {customerDetail?.customerName || '--'}
            </Box>
            <Box
              component="p"
              fontSize="12px"
              color="#5A5F7D"
              lineHeight="17px"
              marginBottom="0px"
            >
              {customerDetail?.shippingInfo?.streetAddress || '--'}
              {customerDetail?.shippingInfo?.streetAddress ? ',' : ''}
              {' '}
              {customerDetail?.shippingInfo?.country || '--'}
              {customerDetail?.shippingInfo?.country ? ',' : ''}
              {' '}
              {customerDetail?.shippingInfo?.zipCode || '--'}
              {'\n'}
              {customerDetail?.phoneNumber}

            </Box>

          </Box>
        </Box>
        <Divider sx={{ marginTop: '24px', marginBottom: '16px' }} />
        {(salesChannel !== VENDOR_CENTRAL || !isEdit)
          && (
            <>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <h3 className="mb-0">Box Dimensions</h3>
                <Switch
                  disabled={!isEmpty(editBox?.trackingNo)}
                  width="150px"
                  height="32px"
                  thumdWidth="16px"
                  thumdHeight="16px"
                  leftSpacing="36px"
                  rightSpacing="41px"
                  translate="translateX(118px)"
                  offText="Disconnect Scale"
                  onText="Connect Scale"
                  margin="-1px"
                  checked={connectScale}
                  onChange={() => {
                    setConnectScale(!connectScale);
                  }}
                />
              </Box>
              <Box display="flex" mt={1.375} gap={2}>
                <Input
                  disabled={!isEmpty(editBox?.trackingNo)}
                  autoComplete="off"
                  minValue={0}
                  name="length"
                  type={!isEmpty(editBox?.trackingNo) ? 'text' : 'number'}
                  width="124px"
                  label="Length (Inches)"
                  placeholder="0"
                  value={addBox?.length || ''}
                  helperText={addBoxHelperText.length}
                  onChange={(e) => {
                    if (REGEX_FOR_DECIMAL_NUMBERS.test(e.target.value)) {
                      handleBoxChange(e);
                    } else {
                      e.target.value = addBox?.width;
                    }
                  }}
                  onNext={() => {
                    handleArrow('length', Number(addBox?.length + 1));
                  }}
                  onPrev={() => {
                    if (addBox?.length > 1) {
                      handleArrow('length', Number(addBox?.length - 1));
                    }
                  }}
                  onKeyDown={(evt) => INPUT_TYPE_NUMBER.includes(evt.key) && evt.preventDefault()}
                />
                <Input
                  disabled={!isEmpty(editBox?.trackingNo)}
                  autoComplete="off"
                  name="width"
                  type={!isEmpty(editBox?.trackingNo) ? 'text' : 'number'}
                  width="124px"
                  label="Width (Inches)"
                  placeholder="0"
                  value={addBox?.width || ''}
                  helperText={addBoxHelperText.width}
                  onChange={(e) => {
                    if (REGEX_FOR_DECIMAL_NUMBERS.test(e.target.value)) {
                      handleBoxChange(e);
                    } else {
                      e.target.value = addBox?.width;
                    }
                  }}
                  onNext={() => {
                    handleArrow('width', Number(addBox?.width + 1));
                  }}
                  onPrev={() => {
                    if (addBox?.width > 1) {
                      handleArrow('width', Number(addBox?.width - 1));
                    }
                  }}
                  onKeyDown={(evt) => INPUT_TYPE_NUMBER.includes(evt.key) && evt.preventDefault()}
                />
                <Input
                  disabled={!isEmpty(editBox?.trackingNo)}
                  autoComplete="off"
                  name="height"
                  type={!isEmpty(editBox?.trackingNo) ? 'text' : 'number'}
                  width="124px"
                  label="Height (Inches)"
                  placeholder="0"
                  value={addBox?.height || ''}
                  helperText={addBoxHelperText.height}
                  onChange={(e) => {
                    if (REGEX_FOR_DECIMAL_NUMBERS.test(e.target.value)) {
                      handleBoxChange(e);
                    } else {
                      e.target.value = addBox?.height;
                    }
                  }}
                  onNext={() => {
                    handleArrow('height', Number(addBox?.height + 1));
                  }}
                  onPrev={() => {
                    if (addBox?.height > 1) {
                      handleArrow('height', Number(addBox?.height - 1));
                    }
                  }}
                  onKeyDown={(evt) => INPUT_TYPE_NUMBER.includes(evt.key) && evt.preventDefault()}
                />
                <Input
                  disabled={!isEmpty(editBox?.trackingNo)}
                  autoComplete="off"
                  name="weight"
                  type={!isEmpty(editBox?.trackingNo) ? 'text' : 'number'}
                  width="124px"
                  label="Weight (lb)"
                  labelWeight="600"
                  placeholder="0"
                  value={addBox?.weight || ''}
                  helperText={addBoxHelperText.weight}
                  onChange={(e) => {
                    if (REGEX_FOR_DECIMAL_NUMBERS.test(e.target.value)) {
                      handleBoxChange(e);
                    } else {
                      e.target.value = addBox?.weight;
                    }
                  }}
                  onNext={() => {
                    handleArrow('weight', Number(addBox?.weight + 1));
                  }}
                  onPrev={() => {
                    if (addBox?.weight > 1) {
                      handleArrow('weight', Number(addBox?.weight - 1));
                    }
                  }}
                  onKeyDown={(evt) => INPUT_TYPE_NUMBER.includes(evt.key) && evt.preventDefault()}
                />
                <Box mt={2} ml={1}>
                  <Button
                    disabled={!isEmpty(editBox?.trackingNo)}
                    textTransform="none"
                    padding="4px 16px 4px 16px"
                    text="Press F2 to Save"
                    startIcon={<span className="icon-Save" />}
                    onClick={handleBoxSave}
                  />
                </Box>
              </Box>
              <Box display="flex" mt={0.125} gap={2} alignItems="center">
                <Select
                  label="Confirmation"
                  value=""
                  placeholder="Select"
                  width={salesChannel === VENDOR_CENTRAL ? '232px' : '148px'}
                />
                <Select
                  label="Insurance"
                  value=""
                  placeholder="Select"
                  width={salesChannel === VENDOR_CENTRAL ? '232px' : '148px'}
                />
                <Input
                  autoComplete="off"
                  width={salesChannel === VENDOR_CENTRAL ? '232px' : '148px'}
                  label="Package Value"
                  labelWeight="600"
                  placeholder="$00.00"
                  marginBottom="0"
                />
                {salesChannel !== VENDOR_CENTRAL && (
                  <Box mt={2} ml={1}>
                    <Button
                      text="Press F4 to Calculate Rate"
                      width="230px"
                      startIcon={<ReactSVG src={calculatorIcon} />}
                      onClick={() => {
                        if (salesChannel !== VENDOR_CENTRAL && !addTracking) {
                          setCalculateRates(!calculateRates);
                        }
                      }}
                      disabled={isEmpty(editBox?._id) || addTracking}
                    />
                  </Box>
                )}
              </Box>
              <Divider sx={{ marginTop: '24px', marginBottom: '24px' }} />
            </>
          )}
        {isEdit
          && (
            <Box display="flex" justifyContent="center" gap={3} mb={3}>
              <Input
                autoComplete="off"
                fontSize="16px"
                placeholder="Tracking Number"
                sx={{ width: '673px' }}
                width="673px"
                label="Add Tracking No. Manually"
                marginBottom="0"
                disabled={!isEmpty(editBox?.trackingNo) ? true : !edit}
                value={addTracking || ''}
                onChange={(e) => {
                  setAddTracking(e.target.value);
                }}
              />
              <Box
                sx={{ border: `1px solid ${addTracking ? '#979797' : '#3C76FF'}` }}
                padding="6px 8px"
                borderRadius={1}
                className="pointer"
                marginTop="16px"
                fontSize="16px"
                onClick={() => {
                  if (isEmpty(editBox?.trackingNo)) {
                    setEdit(!edit);
                    if (edit) {
                      if (isEqual(editBox?.trackingNo, addTracking) || isEmpty(addTracking)) {
                        dispatch(
                          SetOrderNotifyState({
                            message: 'Nothing updated !',
                            type: 'info'
                          })
                        );
                      } else {
                        handleBoxSave();
                      }
                    }
                  }
                }}
              >
                {!edit
                  ? <span className={`icon-edit ${addTracking && 'disabled'}`} />
                  : <Box className="icon-Save icon-save-custom" />}
              </Box>
            </Box>
          )}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <h3
            className="mb-0"
          >
            {shipmentCarrier ? `Other Shipping Option  (${'10'})`
              : salesChannel !== VENDOR_CENTRAL && !addTracking && editBox?._id && 'Shipment Carriers'}

          </h3>
          {salesChannel !== VENDOR_CENTRAL
            && (
              <Box>
                {shipmentCarrier
                  ? (
                    <Box
                      display="flex"
                      alignItems="center"
                      className="pointer"
                      onClick={() => setShipmentCarrier(false)}
                    >
                      <Box
                        component="span"
                        className="icon-left"
                      />
                      <Box
                        color="#3C76FF"
                        fontWeight="600"
                        className="m-0 pl-2"
                      >
                        Back to Shipping Carriers

                      </Box>
                    </Box>
                  )

                  : (
                    // <Box
                    //   onClick={() => setShipmentCarrier(true)}
                    //   className="pointer"
                    //   color="#3C76FF"
                    //   fontWeight="600"
                    // >
                    //   Other Shipping Options
                    // </Box>
                    <></>
                  )}

              </Box>
            )}
        </Box>
        {salesChannel !== VENDOR_CENTRAL && !addTracking && editBox?._id
          && (
            <Grid container columnSpacing={3} mt={2.875}>
              {shipmentCarrier
                ? otherShipment.map((ship, key) => (
                  <Grid
                    item
                    md={6}
                    key={key}
                    sx={{ cursor: 'pointer' }}
                    onClick={() => {
                      handleAddShipment({ title: ship.title });
                    }}
                  >
                    <Box
                      border="1px solid #D9D9D9"
                      justifyContent="space-between"
                      display="flex"
                      borderRadius={1}
                      p={2}
                      mb={1.75}
                    >
                      <img src={ship.image} height="40px" alt="no-shipment" />
                      <Stack
                        alignItems="flex-end"
                      >
                        <Box
                          color="#272B41"
                          pt={0.5}
                          fontSize="16px"
                          fontWeight="700"
                        >
                          {ship.total}
                        </Box>
                        <Box color="#5A5F7D" mt={0.25}>
                          {ship.title}
                        </Box>
                      </Stack>
                    </Box>
                  </Grid>
                ))
                : shipment.map((ship, key) => (
                  <Grid
                    item
                    md={4}
                    key={key}
                    onClick={() => {
                      handleAddShipment({ title: ship.title });
                    }}
                    sx={{ cursor: 'pointer' }}
                  >
                    <Stack
                      border="1px solid #D9D9D9"
                      borderRadius={1}
                      mb={1.75}
                      alignItems="center"
                      p={2}
                    >
                      <img src={ship.image} alt="no-shipment" height="24px" />
                      <Box
                        color="#5A5F7D"
                        mt={1.125}
                        mb={0.25}
                      >
                        {ship.title}
                      </Box>
                      <Box
                        color="#272B41"
                        fontSize="16px"
                        fontWeight="700"
                      >
                        {ship.total}
                      </Box>
                    </Stack>
                  </Grid>
                ))}

            </Grid>
          )}
        <Box>
          <Box
            textAlign="right"
            mt={1}
            display={salesChannel === VENDOR_CENTRAL && 'flex'}
            justifyContent={salesChannel === VENDOR_CENTRAL && 'space-between'}
          >

            {editBox?._id && (
              <Button
                id="labelPrint"
                textTransform="none"
                text={`Press F3 to ${isReprint ? 'Re-print' : 'Print'} Shipping Label`}
                variant="contained"
                startIcon={<span className="icon-print" />}
                onClick={(() => {
                  if (isEmpty(editBox?.labelKey)
                    && salesChannel === VENDOR_CENTRAL
                    && !scannedBarcode) {
                    getVendorCentralShipmentLabel();
                  } else {
                    const button = document.getElementById('TriggerPrint');
                    if (button) {
                      button.click();
                    }
                  }
                })}
                disabled={salesChannel !== VENDOR_CENTRAL && !labelKey}
              />
            )}

            {labelKey && isLabel && (
              <ReactToPrint
                trigger={() => <button id="TriggerPrint" style={{ display: 'none' }}>Print Label</button>}
                content={() => labelRef.current}
                onAfterPrint={() => {
                  dispatch(UpdateBoxDetail({
                    boxId: editBox?._id,
                    orderId,
                    isPrint: true
                  }));
                  if (isEmpty(editBox?.transactionId) && salesChannel === VENDOR_CENTRAL) {
                    setConfirmShipment(true);
                  }
                }}
              />
            )}
            <div style={{ display: 'none' }}>
              <PrintableContent ref={labelRef} imageUrl={GetS3ImageUrl({ bucketName: 'shipmentLabel', key: labelKey })} />
            </div>
          </Box>
        </Box>
      </Box>
      <ConfirmShipment
        focusYes
        show={confirmShipment}
        lastTitle="Confirm this shipment!"
        onClose={() => {
          setConfirmShipment(false);
        }}
        onDelete={purchaseShipmentForVendorCentral}
        loading={vcShipmentPurchaseLoading}
        confirmShipment={confirmShipment}
        purchaseShipmentForVendorCentral={purchaseShipmentForVendorCentral}
      />
    </Drawer>

  );
};

export default CreateBox;
