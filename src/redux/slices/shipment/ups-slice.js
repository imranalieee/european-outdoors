import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { HandleCatchBlock } from '../../../../utils/helpers';
import { axiosBaseUrl } from '../../../config/axios-configuration';

const axios = axiosBaseUrl();

export const AddShipment = createAsyncThunk(
  'shipment/ups/add-shipment',
  async (data, { rejectWithValue }) => {
    try {
      const {
        shipper,
        shipTo,
        boxDimensions,
        serviceCode,
        orderId,
        boxId
      } = data;

      const response = await axios.post('shipment/ups/add-shipment', {
        shipper, shipTo, boxDimensions, serviceCode, orderId, boxId
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const UpsGroundRates = createAsyncThunk(
  'shipment/ups/ups-ground-rates',
  async (data, { rejectWithValue }) => {
    try {
      const { shipper, shipTo, boxDimensions } = data;

      const response = await axios.post('shipment/ups/ups-ground-rates', {
        shipper, shipTo, boxDimensions
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const UpsNextDayAirSaverRates = createAsyncThunk(
  'shipment/ups/ups-nextday-air-saver-rates',
  async (data, { rejectWithValue }) => {
    try {
      const { shipper, shipTo, boxDimensions } = data;

      const response = await axios.post('shipment/ups/ups-nextday-air-saver-rates', {
        shipper, shipTo, boxDimensions
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const UpsStandardOvernightRates = createAsyncThunk(
  'shipment/ups/ups-standard-overnight-rates',
  async (data, { rejectWithValue }) => {
    try {
      const { shipper, shipTo, boxDimensions } = data;

      const response = await axios.post('shipment/ups/ups-standard-overnight-rates', {
        shipper, shipTo, boxDimensions
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const UpsSurePostRates = createAsyncThunk(
  'shipment/ups/ups-sure-post-rates',
  async (data, { rejectWithValue }) => {
    try {
      const { shipper, shipTo, boxDimensions } = data;

      const response = await axios.post('shipment/ups/ups-sure-post-rates', {
        shipper, shipTo, boxDimensions
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

const upsSlice = createSlice({
  name: 'upsSlice',
  initialState: {
    addShipmentLoading: false,
    shipmentAdded: false,
    shipmentDetails: {},
    upsGroundRatesFetched: false,
    upsGroundRatesLoading: false,
    upsGroundRates: {},
    upsStandardOvernightRatesFetched: false,
    upsStandardOvernightRatesLoading: false,
    upsStandardOvernightRates: {},
    upsNextDayAirSaverRatesFetched: false,
    upsNextDayAirSaverRatesLoading: false,
    upsNextDayAirSaverRates: {},
    upsSurePostRatesFetched: false,
    upsSurePostRatesLoading: false,
    upsSurePostRates: {},
    notifyMessage: '',
    notifyType: 'error'
  },
  reducers: {
    SetUpsState(state, { payload: { field, value } }) {
      state[field] = value;
    },
    SetUpsNotifyState(state, { payload: { message, type } }) {
      state.notify = true;
      state.notifyMessage = message;
      state.notifyType = type;
    }
  },
  extraReducers: {
    [AddShipment.pending]: (state) => ({
      ...state,
      addShipmentLoading: true,
      success: false,
      shipmentAdded: false
    }),
    [AddShipment.fulfilled]: (state, action) => ({
      ...state,
      addShipmentLoading: false,
      success: true,
      notifyMessage: action.payload.message,
      notifyType: 'success',
      notify: true,
      shipmentDetails: action.payload.data,
      shipmentAdded: true
    }),
    [AddShipment.rejected]: (state, action) => ({
      ...state,
      addShipmentLoading: false,
      success: false,
      notifyMessage: action.payload.error.message,
      notifyType: 'error',
      notify: true,
      error: action.payload.error,
      shipmentAdded: false
    }),
    [UpsGroundRates.pending]: (state) => ({
      ...state,
      upsGroundRatesLoading: true,
      success: false,
      upsGroundRatesFetched: false
    }),
    [UpsGroundRates.fulfilled]: (state, action) => ({
      ...state,
      upsGroundRatesLoading: false,
      success: true,
      notifyMessage: action.payload.message,
      notifyType: 'success',
      notify: true,
      upsGroundRates: action.payload.data.rates,
      upsGroundRatesFetched: true
    }),
    [UpsGroundRates.rejected]: (state, action) => ({
      ...state,
      upsGroundRatesLoading: false,
      success: false,
      notifyMessage: action.payload.error.message,
      notifyType: 'error',
      notify: true,
      error: action.payload.error,
      upsGroundRatesFetched: false
    }),
    [UpsNextDayAirSaverRates.pending]: (state) => ({
      ...state,
      upsNextDayAirSaverRatesLoading: true,
      success: false,
      upsNextDayAirSaverRatesFetched: false
    }),
    [UpsNextDayAirSaverRates.fulfilled]: (state, action) => ({
      ...state,
      upsNextDayAirSaverRatesLoading: false,
      success: true,
      notifyMessage: action.payload.message,
      notifyType: 'success',
      notify: true,
      upsNextDayAirSaverRates: action.payload.data.rates,
      upsNextDayAirSaverRatesFetched: true
    }),
    [UpsNextDayAirSaverRates.rejected]: (state, action) => ({
      ...state,
      upsNextDayAirSaverRatesLoading: false,
      success: false,
      notifyMessage: action.payload.error.message,
      notifyType: 'error',
      notify: true,
      error: action.payload.error,
      upsNextDayAirSaverRatesFetched: false
    }),
    [UpsStandardOvernightRates.pending]: (state) => ({
      ...state,
      upsStandardOvernightRatesLoading: true,
      success: false,
      upsStandardOvernightRatesFetched: false
    }),
    [UpsStandardOvernightRates.fulfilled]: (state, action) => ({
      ...state,
      upsStandardOvernightRatesLoading: false,
      success: true,
      notifyMessage: action.payload.message,
      notifyType: 'success',
      notify: true,
      upsStandardOvernightRates: action.payload.data.rates,
      upsStandardOvernightRatesFetched: true
    }),
    [UpsStandardOvernightRates.rejected]: (state, action) => ({
      ...state,
      upsStandardOvernightRatesLoading: false,
      success: false,
      notifyMessage: action.payload.error.message,
      notifyType: 'error',
      notify: true,
      error: action.payload.error,
      upsStandardOvernightRatesFetched: false
    }),
    [UpsSurePostRates.pending]: (state) => ({
      ...state,
      upsSurePostRatesLoading: true,
      success: false,
      upsSurePostRatesFetched: false
    }),
    [UpsSurePostRates.fulfilled]: (state, action) => ({
      ...state,
      upsSurePostRatesLoading: false,
      success: true,
      notifyMessage: action.payload.message,
      notifyType: 'success',
      notify: true,
      upsSurePostRates: action.payload.data.rates,
      upsSurePostRatesFetched: true
    }),
    [UpsSurePostRates.rejected]: (state, action) => ({
      ...state,
      upsSurePostRatesLoading: false,
      success: false,
      notifyMessage: action.payload.error.message,
      notifyType: 'error',
      notify: true,
      error: action.payload.error,
      upsSurePostRatesFetched: false
    })
  }
});

const { reducer, actions } = upsSlice;

export const { SetUpsState, SetUpsNotifyState } = actions;

export default reducer;
