import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { HandleCatchBlock } from '../../../../utils/helpers';
import { axiosBaseUrl } from '../../../config/axios-configuration';

const axios = axiosBaseUrl();

export const AddUspsShipment = createAsyncThunk(
  'shipment/usps/add-shipment',
  async (data, { rejectWithValue }) => {
    try {
      const {
        shipper,
        shipTo,
        boxDimensions,
        parcelShape,
        mailClass,
        orderId,
        boxId
      } = data;

      const response = await axios.post('shipment/usps/add-shipment', {
        shipper, shipTo, boxDimensions, parcelShape, mailClass, orderId, boxId
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const UspsGroundAdvantageRates = createAsyncThunk(
  'shipment/usps/usps-ground-agvantage-rates',
  async (data, { rejectWithValue }) => {
    try {
      const { shipper, shipTo, boxDimensions } = data;

      const response = await axios.post('shipment/usps/usps-ground-agvantage-rates', {
        shipper, shipTo, boxDimensions
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

const uspsSlice = createSlice({
  name: 'uspsSlice',
  initialState: {
    uspsAddShipmentLoading: false,
    uspsShipmentDetails: {},
    uspsShipmentAdded: false,
    uspsGroundRatesFetched: false,
    uspsGroundRatesLoading: false,
    uspsGroundRates: {},
    notifyMessage: '',
    notifyType: 'error'
  },
  reducers: {
    SetUspsState(state, { payload: { field, value } }) {
      state[field] = value;
    },
    SetUspsNotifyState(state, { payload: { message, type } }) {
      state.notify = true;
      state.notifyMessage = message;
      state.notifyType = type;
    }
  },
  extraReducers: {
    [AddUspsShipment.pending]: (state) => ({
      ...state,
      uspsAddShipmentLoading: true,
      success: false,
      uspsShipmentAdded: false
    }),
    [AddUspsShipment.fulfilled]: (state, action) => ({
      ...state,
      uspsAddShipmentLoading: false,
      success: true,
      notifyMessage: action.payload.message,
      notifyType: 'success',
      notify: true,
      uspsShipmentDetails: action.payload.data,
      uspsShipmentAdded: true
    }),
    [AddUspsShipment.rejected]: (state, action) => ({
      ...state,
      uspsAddShipmentLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      error: action.payload.error,
      uspsShipmentAdded: false
    }),
    [UspsGroundAdvantageRates.pending]: (state) => ({
      ...state,
      uspsGroundRatesLoading: true,
      success: false,
      uspsGroundRatesFetched: false
    }),
    [UspsGroundAdvantageRates.fulfilled]: (state, action) => ({
      ...state,
      uspsGroundRatesLoading: false,
      success: true,
      notifyMessage: action.payload.message,
      notifyType: 'success',
      notify: true,
      uspsGroundRates: action.payload.data.rates,
      uspsGroundRatesFetched: true
    }),
    [UspsGroundAdvantageRates.rejected]: (state, action) => ({
      ...state,
      uspsGroundRatesLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      error: action.payload.error,
      uspsGroundRatesFetched: false
    })
  }
});

const { reducer, actions } = uspsSlice;

export const { SetUspsState, SetUspsNotifyState } = actions;

export default reducer;
