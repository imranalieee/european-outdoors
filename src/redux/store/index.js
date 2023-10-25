import { configureStore, combineReducers } from '@reduxjs/toolkit';
import logger from 'redux-logger';
import { persistReducer } from 'redux-persist';
import thunk from 'redux-thunk';
import storage from 'redux-persist/lib/storage';
import createFilter from 'redux-persist-transform-filter';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

import authSlice from '../slices/auth-slice';
import adminSlice from '../slices/admin-slice';
import amazonSlice from '../slices/shipment/amazon-slice';
import errorSlice from '../slices/error-slice';
import marketplaceInventorySlice from '../slices/marketplace-inventory-slice';
import notificationSlice from '../slices/notification-slice';
import supplierSlice from '../slices/supplier-slice';
import storeSlice from '../slices/store-slice';
import jobsSlice from '../slices/jobs-slice';
import userSlice from '../slices/user-slice';
import productSlice from '../slices/product-slice';
import packSlice from '../slices/pack-slice';
import locationSlice from '../slices/location-slice';
import orderPaymentSlice from '../slices/order/order-payment';
import orderPickSheetSlice from '../slices/order/pick-sheet-slice';
import orderSlice from '../slices/order/order-slice';
import processOrderSlice from '../slices/order/process-order-slice';
import otherSlice from '../slices/other-slice';
import paymentDetailSlice from '../slices/purchasing/payment-detail-slice';
import poQueueItemSlice from '../slices/purchasing/po-queue-item-slice';
import purchaseOrderSlice from '../slices/purchasing/purchase-order-slice';
import upsSlice from '../slices/shipment/ups-slice';
import uspsSlice from '../slices/shipment/usps-slice';
import inventoryHistorySlice from '../slices/inventory-history';
import vendorCentralSlice from '../slices/shipment/vendor-central-slice';

const authTransform = createFilter('auth', ['token', 'user', 'allowedRoutes', 'defaultRoute']);
const productTransform = createFilter('product', ['selectedTabPane']);
const orderTransform = createFilter('order', ['newOrder', 'newOrderCustomerDetail', 'orderItems', 'orderAttachments', 'totalOrderItems', 'newOrderId']);
const orderPaymentTransform = createFilter('orderPayment', ['orderPaymentDetail', 'updatePaymentDetail']);
const pOQueueTransform = createFilter('poQueueItem', ['purchasingTab']);

const persistConfig = {
  key: 'root',
  storage,
  stateReconciler: autoMergeLevel2,
  whitelist: ['auth', 'product', 'poQueueItem', 'order', 'orderPayment'],
  transforms: [
    authTransform,
    productTransform,
    pOQueueTransform,
    orderTransform,
    orderPaymentTransform]
};

const reducers = combineReducers({
  auth: authSlice,
  admin: adminSlice,
  amazon: amazonSlice,
  notification: notificationSlice,
  supplier: supplierSlice,
  store: storeSlice,
  jobs: jobsSlice,
  user: userSlice,
  product: productSlice,
  pack: packSlice,
  location: locationSlice,
  orderPayment: orderPaymentSlice,
  order: orderSlice,
  orderPickSheet: orderPickSheetSlice,
  other: otherSlice,
  processOrder: processOrderSlice,
  paymentDetail: paymentDetailSlice,
  poQueueItem: poQueueItemSlice,
  purchaseOrder: purchaseOrderSlice,
  marketplaceInventory: marketplaceInventorySlice,
  ups: upsSlice,
  usps: uspsSlice,
  error: errorSlice,
  inventoryHistory: inventoryHistorySlice,
  vendorCentral: vendorCentralSlice
});

const rootReducer = (state, action) => {
  if (action.type === 'auth/LogOut') {
    state = undefined;
  }
  return reducers(state, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export default configureStore({
  reducer: persistedReducer,
  middleware: [thunk, logger],
  devTools: true
});
