import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { HandleCatchBlock } from '../../../../utils/helpers';
import { axiosBaseUrl } from '../../../config/axios-configuration';

const axios = axiosBaseUrl();

export const AddAmazonShipment = createAsyncThunk(
  'shipment/amazon/add-shipment',
  async (data, { rejectWithValue }) => {
    try {
      const {
        requestToken,
        requestedDocumentSpecification,
        requestedValueAddedServices,
        rateId,
        orderId,
        boxId
      } = data;

      const response = await axios.post('shipment/amazon/add-shipment', {
        requestToken,
        requestedDocumentSpecification,
        requestedValueAddedServices,
        rateId,
        orderId,
        boxId
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const AmazonRates = createAsyncThunk(
  'shipment/amazon/amazon-rates',
  async (data, { rejectWithValue }) => {
    try {
      const {
        shipper, boxDimensions, orderId, marketplaceOrderId, boxId
      } = data;

      const response = await axios.post('shipment/amazon/amazon-rates', {
        shipper, boxDimensions, orderId, marketplaceOrderId, boxId
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

const amazonSlice = createSlice({
  name: 'amazonSlice',
  initialState: {
    amazonAddShipmentLoading: false,
    amazonShipmentDetails: {},
    amazonShipmentAdded: false,
    amazonRatesFetched: false,
    amazonRatesLoading: false,
    amazonRates: {},
    notifyMessage: '',
    notifyType: 'error'
  },
  reducers: {
    SetAmazonState(state, { payload: { field, value } }) {
      state[field] = value;
    },
    SetAmazonNotifyState(state, { payload: { message, type } }) {
      state.notify = true;
      state.notifyMessage = message;
      state.notifyType = type;
    }
  },
  extraReducers: {
    [AddAmazonShipment.pending]: (state) => ({
      ...state,
      amazonAddShipmentLoading: true,
      success: false,
      amazonShipmentAdded: false
    }),
    [AddAmazonShipment.fulfilled]: (state, action) => ({
      ...state,
      amazonAddShipmentLoading: false,
      success: true,
      notifyMessage: action.payload.message,
      notifyType: 'success',
      notify: true,
      amazonShipmentDetails: action.payload.data,
      amazonShipmentAdded: true
    }),
    [AddAmazonShipment.rejected]: (state, action) => ({
      ...state,
      amazonAddShipmentLoading: false,
      success: false,
      notifyMessage: action.payload.error.message,
      notifyType: 'error',
      notify: true,
      error: action.payload.error,
      amazonShipmentAdded: false
    }),
    [AmazonRates.pending]: (state) => ({
      ...state,
      amazonRatesLoading: true,
      success: false,
      amazonRatesFetched: false
    }),
    [AmazonRates.fulfilled]: (state, action) => ({
      ...state,
      amazonRatesLoading: false,
      success: true,
      notifyMessage: action.payload.message,
      notifyType: 'success',
      notify: true,
      amazonRates: action.payload.data.rates,
      amazonRatesFetched: true
    }),
    [AmazonRates.rejected]: (state, action) => ({
      ...state,
      amazonRatesLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      error: action.payload.error,
      amazonRatesFetched: false
    })
  }
});

const { reducer, actions } = amazonSlice;

export const { SetAmazonState, SetAmazonNotifyState } = actions;

export default reducer;
