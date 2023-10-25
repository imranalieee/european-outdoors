import { startCase } from 'lodash';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { SetAuthState } from '../../redux/slices/auth-slice';
import { SetAdminState } from '../../redux/slices/admin-slice';
import { SetSupplierState } from '../../redux/slices/supplier-slice';
import { SetJobState } from '../../redux/slices/jobs-slice';
import { SetUserState } from '../../redux/slices/user-slice';
import { SetStoreState } from '../../redux/slices/store-slice';
import { SetNotificationState } from '../../redux/slices/notification-slice';
import { SetProductState } from '../../redux/slices/product-slice';
import { SetPackState } from '../../redux/slices/pack-slice';
import { SetLocationState } from '../../redux/slices/location-slice';
import { SetOtherState } from '../../redux/slices/other-slice';
import { SetPoQueueItemState, SetPurchaseOrderState, SetPaymentDetailState } from '../../redux/slices/purchasing';
import { SetOrderPaymentState, SetOrderState, SetProcessOrderState } from '../../redux/slices/order';
import { SetOrderPickSheetState } from '../../redux/slices/order/pick-sheet-slice';
import { SetMarketplaceInventoryState } from '../../redux/slices/marketplace-inventory-slice';
import { SetUpsState } from '../../redux/slices/shipment/ups-slice';
import { SetUspsState } from '../../redux/slices/shipment/usps-slice';
import { SetAmazonState } from '../../redux/slices/shipment/amazon-slice';
import { SetErrorState } from '../../redux/slices/error-slice';
import { SetVendorCentralState } from '../../redux/slices/shipment/vendor-central-slice';

const Notify = ({
  message, notifyType
}) => {
  const dispatch = useDispatch();

  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    setErrorMessage(message);
  }, [message]);

  useEffect(() => {
    if (errorMessage) {
      dispatch(SetErrorState({ field: 'errorMessage', value: null }));

      toast[notifyType](
        <>
          <Box component="h3" mb={0.3}>{startCase(notifyType)}</Box>
          <span>{errorMessage}</span>
        </>,
        {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'light'
        }
      );
    }
  }, [errorMessage]);

  return (
    null
  );
};

const AlertError = () => {
  const dispatch = useDispatch();

  const [message, setMessage] = useState(null);
  const [tostType, setToastType] = useState('success');
  const [sliceName, setSliceName] = useState('');

  const {
    notify: authNotify,
    notifyMessage: authNotifyMessage,
    notifyType: authNotifyType = 'error'
  } = useSelector(((state) => state?.auth || {}));

  const {
    notify: adminNotify,
    notifyMessage: adminNotifyMessage,
    notifyType: adminNotifyType = 'error'
  } = useSelector(((state) => state?.admin || {}));

  const {
    notify: supplierNotify,
    notifyMessage: supplierNotifyMessage,
    notifyType: supplierNotifyType = 'error'
  } = useSelector(((state) => state?.supplier || {}));

  const {
    notify: productNotify,
    notifyMessage: productNotifyMessage,
    notifyType: productNotifyType = 'error'
  } = useSelector(((state) => state?.product || {}));

  const {
    notify: packNotify,
    notifyMessage: packNotifyMessage,
    notifyType: packNotifyType = 'error'
  } = useSelector(((state) => state?.pack || {}));

  const {
    notify: locationNotify,
    notifyMessage: locationNotifyMessage,
    notifyType: locationNotifyType = 'error'
  } = useSelector(((state) => state?.location || {}));

  const {
    notify: jobsNotify,
    notifyMessage: jobsNotifyMessage,
    notifyType: jobsNotifyType = 'error'
  } = useSelector(((state) => state?.jobs || {}));

  const {
    notify: userNotify,
    notifyMessage: userNotifyMessage,
    notifyType: userNotifyType = 'error'
  } = useSelector(((state) => state?.user || {}));

  const {
    notify: storeNotify,
    notifyMessage: storeNotifyMessage,
    notifyType: storeNotifyType = 'error'
  } = useSelector(((state) => state?.store || {}));

  const {
    notify: notificationNotify,
    notifyMessage: notificationNotifyMessage,
    notifyType: notificationNotifyType = 'error'
  } = useSelector(((state) => state?.notification || {}));

  const {
    notify: otherNotify,
    notifyMessage: otherNotifyMessage,
    notifyType: otherNotifyType = 'error'
  } = useSelector(((state) => state?.other || {}));

  const {
    notify: poQueueItemNotify,
    notifyMessage: poQueueItemNotifyMessage,
    notifyType: poQueueItemNotifyType = 'error'
  } = useSelector(((state) => state?.poQueueItem || {}));

  const {
    notify: purchaseOrderNotify,
    notifyMessage: purchaseOrderNotifyMessage,
    notifyType: purchaseOrderNotifyType = 'error'
  } = useSelector(((state) => state?.purchaseOrder || {}));

  const {
    notify: paymentDetailNotify,
    notifyMessage: paymentDetailNotifyMessage,
    notifyType: paymentDetailNotifyType = 'error'
  } = useSelector(((state) => state?.paymentDetail || {}));

  const {
    notify: orderNotify,
    notifyMessage: orderNotifyMessage,
    notifyType: orderNotifyType = 'error'
  } = useSelector(((state) => state?.order || {}));

  const {
    notify: orderPaymentNotify,
    notifyMessage: orderPaymentNotifyMessage,
    notifyType: orderPaymentNotifyType = 'error'
  } = useSelector(((state) => state?.orderPayment || {}));

  const {
    notify: orderPickSheetNotify,
    notifyMessage: orderPickSheetNotifyMessage,
    notifyType: orderPickSheetNotifyType = 'error'
  } = useSelector(((state) => state?.orderPickSheet || {}));

  const {
    notify: processOrderNotify,
    notifyMessage: processOrderNotifyMessage,
    notifyType: processOrderNotifyType = 'error'
  } = useSelector(((state) => state?.processOrder || {}));

  const {
    notify: marketplaceInventoryNotify,
    notifyMessage: marketplaceInventoryNotifyMessage,
    notifyType: marketplaceInventoryNotifyType = 'error'
  } = useSelector(((state) => state?.marketplaceInventory || {}));

  const {
    notify: upsNotify,
    notifyMessage: upsNotifyMessage,
    notifyType: upsNotifyType = 'error'
  } = useSelector(((state) => state?.ups || {}));

  const {
    notify: uspsNotify,
    notifyMessage: uspsNotifyMessage,
    notifyType: uspsNotifyType = 'error'
  } = useSelector(((state) => state?.usps || {}));

  const {
    notify: amazonNotify,
    notifyMessage: amazonNotifyMessage,
    notifyType: amazonNotifyType = 'error'
  } = useSelector(((state) => state?.amazon || {}));

  const { errorMessage } = useSelector(((state) => state?.error || {}));

  const {
    notify: vendorCentralNotify,
    notifyMessage: vendorCentralNotifyMessage,
    notifyType: vendorCentralNotifyType = 'error'
  } = useSelector(((state) => state?.vendorCentral || {}));

  useEffect(() => {
    if (authNotify) {
      setToastType(authNotifyType);
      setSliceName('authNotify');
      dispatch(SetErrorState({ field: 'errorMessage', value: authNotifyMessage }));
    }
    if (adminNotify) {
      setSliceName('adminNotify');
      setToastType(adminNotifyType);
      dispatch(SetErrorState({ field: 'errorMessage', value: adminNotifyMessage }));
    }
    if (supplierNotify) {
      setSliceName('supplierNotify');
      setToastType(supplierNotifyType);
      dispatch(SetErrorState({ field: 'errorMessage', value: supplierNotifyMessage }));
    }
    if (jobsNotify) {
      setSliceName('jobsNotify');
      setMessage(jobsNotifyMessage);
      setToastType(jobsNotifyType);
      dispatch(SetErrorState({ field: 'errorMessage', value: jobsNotifyMessage }));
    }
    if (userNotify) {
      setToastType(userNotifyType);
      setSliceName('userNotify');
      dispatch(SetErrorState({ field: 'errorMessage', value: userNotifyMessage }));
    }
    if (storeNotify) {
      setToastType(storeNotifyType);
      setSliceName('storeNotify');
      dispatch(SetErrorState({ field: 'errorMessage', value: storeNotifyMessage }));
    }
    if (notificationNotify) {
      setToastType(notificationNotifyType);
      setSliceName('notificationNotify');
      dispatch(SetErrorState({ field: 'errorMessage', value: notificationNotifyMessage }));
    }
    if (productNotify) {
      setToastType(productNotifyType);
      setSliceName('productNotify');
      dispatch(SetErrorState({ field: 'errorMessage', value: productNotifyMessage }));
    }
    if (packNotify) {
      setToastType(packNotifyType);
      setSliceName('packNotify');
      dispatch(SetErrorState({ field: 'errorMessage', value: packNotifyMessage }));
    }
    if (locationNotify) {
      setToastType(locationNotifyType);
      setSliceName('locationNotify');
      dispatch(SetErrorState({ field: 'errorMessage', value: locationNotifyMessage }));
    }
    if (otherNotify) {
      setToastType(otherNotifyType);
      setSliceName('otherNotify');
      dispatch(SetErrorState({ field: 'errorMessage', value: otherNotifyMessage }));
    }
    if (poQueueItemNotify) {
      setToastType(poQueueItemNotifyType);
      setSliceName('poQueueItemNotify');
      dispatch(SetErrorState({ field: 'errorMessage', value: poQueueItemNotifyMessage }));
    }
    if (purchaseOrderNotify) {
      setToastType(purchaseOrderNotifyType);
      setSliceName('purchaseOrderNotify');
      dispatch(SetErrorState({ field: 'errorMessage', value: purchaseOrderNotifyMessage }));
    }
    if (paymentDetailNotify) {
      setSliceName('paymentDetailNotify');
      setToastType(paymentDetailNotifyType);
      dispatch(SetErrorState({ field: 'errorMessage', value: paymentDetailNotifyMessage }));
    }
    if (orderNotify) {
      setSliceName('orderNotify');
      dispatch(SetErrorState({ field: 'errorMessage', value: orderNotifyMessage }));
      setToastType(orderNotifyType);
    }
    if (orderPaymentNotify) {
      setToastType(orderPaymentNotifyType);
      setSliceName('orderPaymentNotify');
      dispatch(SetErrorState({ field: 'errorMessage', value: orderPaymentNotifyMessage }));
    }
    if (orderPickSheetNotify) {
      setToastType(orderPickSheetNotifyType);
      setSliceName('orderPickSheetNotify');
      dispatch(SetErrorState({ field: 'errorMessage', value: orderPickSheetNotifyMessage }));
    }
    if (processOrderNotify) {
      setSliceName('processOrderNotify');
      dispatch(SetErrorState({ field: 'errorMessage', value: processOrderNotifyMessage }));
      setToastType(processOrderNotifyType);
    }
    if (marketplaceInventoryNotify) {
      setSliceName('marketplaceInventoryNotify');
      dispatch(SetErrorState({ field: 'errorMessage', value: marketplaceInventoryNotifyMessage }));
      setToastType(marketplaceInventoryNotifyType);
    }

    if (upsNotify) {
      setToastType(upsNotifyType);
      setSliceName('upsNotify');
      dispatch(SetErrorState({ field: 'errorMessage', value: upsNotifyMessage }));
    }

    if (uspsNotify) {
      setToastType(uspsNotifyType);
      setSliceName('uspsNotify');
      dispatch(SetErrorState({ field: 'errorMessage', value: uspsNotifyMessage }));
    }

    if (amazonNotify) {
      setToastType(amazonNotifyType);
      setSliceName('amazonNotify');
      dispatch(SetErrorState({ field: 'errorMessage', value: amazonNotifyMessage }));
    }

    if (vendorCentralNotify) {
      setToastType(vendorCentralNotifyType);
      setSliceName('vendorCentralNotify');
      dispatch(SetErrorState({ field: 'errorMessage', value: vendorCentralNotifyMessage }));
    }
  }, [
    authNotify,
    adminNotify,
    jobsNotify,
    supplierNotify,
    productNotify,
    packNotify,
    locationNotify,
    userNotify,
    storeNotify,
    notificationNotify,
    otherNotify,
    poQueueItemNotify,
    purchaseOrderNotify,
    paymentDetailNotify,
    orderNotify,
    orderPaymentNotify,
    orderPickSheetNotify,
    processOrderNotify,
    marketplaceInventoryNotify,
    upsNotify,
    uspsNotify,
    amazonNotify,
    vendorCentralNotify
  ]);

  useEffect(() => {
    if (errorMessage === null
      && (authNotify
        || adminNotify
        || jobsNotify
        || supplierNotify
        || productNotify
        || packNotify
        || locationNotify
        || userNotify
        || storeNotify
        || notificationNotify
        || otherNotify
        || poQueueItemNotify
        || purchaseOrderNotify
        || paymentDetailNotify
        || orderNotify
        || orderPaymentNotify
        || orderPickSheetNotify
        || processOrderNotify
        || marketplaceInventoryNotify
        || upsNotify
        || uspsNotify
        || amazonNotify
        || vendorCentralNotify)
    ) {
      switch (sliceName) {
        case 'authNotify': {
          dispatch(SetAuthState({ field: 'notify', value: false }));
          break;
        }
        case 'adminNotify': {
          dispatch(SetAdminState({ field: 'notify', value: false }));
          break;
        }
        case 'supplierNotify': {
          dispatch(SetSupplierState({ field: 'notify', value: false }));
          break;
        }
        case 'jobsNotify': {
          dispatch(SetJobState({ field: 'notify', value: false }));
          break;
        }
        case 'userNotify': {
          dispatch(SetUserState({ field: 'notify', value: false }));
          break;
        }
        case 'storeNotify': {
          dispatch(SetStoreState({ field: 'notify', value: false }));
          break;
        }
        case 'notificationNotify': {
          dispatch(SetNotificationState({ field: 'notify', value: false }));
          break;
        }
        case 'productNotify': {
          dispatch(SetProductState({ field: 'notify', value: false }));
          break;
        }
        case 'packNotify': {
          dispatch(SetPackState({ field: 'notify', value: false }));
          break;
        }
        case 'locationNotify': {
          dispatch(SetLocationState({ field: 'notify', value: false }));
          break;
        }
        case 'otherNotify': {
          dispatch(SetOtherState({ field: 'notify', value: false }));
          break;
        }
        case 'poQueueItemNotify': {
          dispatch(SetPoQueueItemState({ field: 'notify', value: false }));
          break;
        }
        case 'purchaseOrderNotify': {
          dispatch(SetPurchaseOrderState({ field: 'notify', value: false }));
          break;
        }
        case 'paymentDetailNotify': {
          dispatch(SetOrderState({ field: 'notify', value: false }));
          break;
        }
        case 'orderNotify': {
          dispatch(SetOrderState({ field: 'notify', value: false }));
          break;
        }
        case 'orderPaymentNotify': {
          dispatch(SetOrderPaymentState({ field: 'notify', value: false }));
          break;
        }
        case 'orderPickSheetNotify': {
          dispatch(SetOrderPickSheetState({ field: 'notify', value: false }));
          break;
        }
        case 'processOrderNotify': {
          dispatch(SetProcessOrderState({ field: 'notify', value: false }));
          break;
        }
        case 'marketplaceInventoryNotify': {
          dispatch(SetMarketplaceInventoryState({ field: 'notify', value: false }));
          break;
        }
        case 'upsNotify': {
          dispatch(SetUpsState({ field: 'notify', value: false }));
          break;
        }
        case 'uspsNotify': {
          dispatch(SetUspsState({ field: 'notify', value: false }));
          break;
        }
        case 'amazonNotify': {
          dispatch(SetAmazonState({ field: 'notify', value: false }));
          break;
        }
        case 'vendorCentralNotify': {
          dispatch(SetVendorCentralState({ field: 'notify', value: false }));
          break;
        }
        default: {
          break;
        }
      }
    }
  }, [errorMessage]);

  return (
    <div>
      <ToastContainer />
      {
        errorMessage && errorMessage !== ''
          ? (
            <Notify
              message={errorMessage}
              notifyType={tostType}
            />
          )
          : null
      }
    </div>
  );
};

export default AlertError;
