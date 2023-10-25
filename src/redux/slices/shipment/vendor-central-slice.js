import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { HandleCatchBlock } from '../../../../utils/helpers';
import { axiosBaseUrl } from '../../../config/axios-configuration';

const axios = axiosBaseUrl();

export const GetVendorCentralShipmentLabel = createAsyncThunk(
  'shipment/vendor-central/get-shipping-label-for-vendor-central',
  async (data, { rejectWithValue }) => {
    try {
      const {
        orderId
      } = data;

      const response = await axios.post('/shipment/vendor-central/get-shipping-label-for-vendor-central', {
        orderId
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const PurchaseShipmentForVendorCentral = createAsyncThunk(
  'shipment/vendor-central//purchase-shipment-for-vendor-central',
  async (data, { rejectWithValue }) => {
    try {
      const {
        orderId,
        boxId
      } = data;

      const response = await axios.post('/shipment/vendor-central/purchase-shipment-for-vendor-central', {
        orderId,
        boxId
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

const vendorCentralSlice = createSlice({
  name: 'vendorCentralSlice',
  initialState: {
    vcShipmentLabelLoading: false,
    vcShipmentLabelFetched: false,
    vcShipmentLabelDetails: {},
    vcShipmentPurchaseLoading: false,
    vcShipmentPurchased: false,
    vcShipmentPurchaseDetails: {}
  },
  reducers: {
    SetVendorCentralState(state, { payload: { field, value } }) {
      state[field] = value;
    },
    SetVendorCentralNotifyState(state, { payload: { message, type } }) {
      state.notify = true;
      state.notifyMessage = message;
      state.notifyType = type;
    }
  },
  extraReducers: {
    [GetVendorCentralShipmentLabel.pending]: (state) => ({
      ...state,
      vcShipmentLabelLoading: true,
      success: false,
      vcShipmentLabelFetched: false
    }),
    [GetVendorCentralShipmentLabel.fulfilled]: (state, action) => ({
      ...state,
      vcShipmentLabelLoading: false,
      success: true,
      notifyMessage: action.payload.message,
      notifyType: 'success',
      notify: true,
      vcShipmentLabelDetails: action.payload.data,
      vcShipmentLabelFetched: true
    }),
    [GetVendorCentralShipmentLabel.rejected]: (state, action) => ({
      ...state,
      vcShipmentLabelLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      error: action.payload.error,
      vcShipmentLabelFetched: false
    }),
    [PurchaseShipmentForVendorCentral.pending]: (state) => ({
      ...state,
      vcShipmentPurchaseLoading: true,
      success: false,
      vcShipmentPurchased: false
    }),
    [PurchaseShipmentForVendorCentral.fulfilled]: (state, action) => ({
      ...state,
      vcShipmentPurchaseLoading: false,
      success: true,
      notifyMessage: action.payload.message,
      notifyType: 'success',
      notify: true,
      vcShipmentPurchaseDetails: action.payload.data,
      vcShipmentPurchased: true
    }),
    [PurchaseShipmentForVendorCentral.rejected]: (state, action) => ({
      ...state,
      vcShipmentPurchaseLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      error: action.payload.error,
      vcShipmentPurchased: false
    })
  }
});

const { reducer, actions } = vendorCentralSlice;

export const { SetVendorCentralState, SetVendorCentralNotifyState } = actions;

export default reducer;
