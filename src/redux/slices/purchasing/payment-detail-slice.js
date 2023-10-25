import { cloneDeep, extend } from 'lodash';

import { createSlice, createAsyncThunk, current } from '@reduxjs/toolkit';

import { HandleCatchBlock } from '../../../../utils/helpers';
import { axiosBaseUrl } from '../../../config/axios-configuration';

const axios = axiosBaseUrl();

export const GetPaymentDetails = createAsyncThunk(
  'payment-detail/get-payment-detail',
  async (data, { rejectWithValue }) => {
    try {
      const {
        skip, limit, pOId, sortBy
      } = data;
      const response = await axios.get('/purchasing/payment/get-payment-detail-by-po-id', {
        params: {
          pOId,
          skip,
          limit,
          sortBy
        }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const AddPaymentDetail = createAsyncThunk(
  'payment-detail/add-payment-detail',
  async (data, { rejectWithValue }) => {
    try {
      const { addPaymentDetails } = data;

      const response = await axios.post('/purchasing/payment/add-payment-detail', {
        addPaymentDetails
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

const paymentDetail = createSlice({
  name: 'paymentDetail',
  initialState: {
    error: '',
    message: '',
    loading: false,
    success: false,
    notifyMessage: '',
    notify: false,
    notifyType: '',
    totalPaymentDetails: 0,
    paymentDetails: [],
    paymentDetailPageLimit: 100,
    paymentDetailPageNumber: 1,
    addPayment: false
  },
  reducers: {
    SetPaymentDetailState(state, { payload: { field, value } }) {
      state[field] = value;
    },
    SetPaymentDetailNotifyState(state, { payload: { message, type } }) {
      state.notify = true;
      state.notifyMessage = message;
      state.notifyType = type;
    }
  },
  extraReducers: {
    [GetPaymentDetails.pending]: (state) => ({
      ...state,
      loading: true,
      success: false
    }),
    [GetPaymentDetails.fulfilled]: (state, action) => ({
      ...state,
      loading: false,
      success: true,
      totalPaymentDetails: action.payload.data.totalPaymentDetails,
      paymentDetails: action.payload.data.paymentDetails
    }),
    [GetPaymentDetails.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      error: action.payload.error
    }),
    [AddPaymentDetail.pending]: (state) => ({
      ...state,
      loading: true,
      success: false,
      addPayment: false
    }),
    [AddPaymentDetail.fulfilled]: (state, action) => {
      const currentState = current(state);
      const paymentDetailsList = cloneDeep(currentState.paymentDetails);

      const { totalPaymentDetails, paymentDetailPageLimit } = currentState;
      const { newPaymentDetail } = action.payload.data;

      paymentDetailsList.unshift(newPaymentDetail);
      if (paymentDetailsList.length > paymentDetailPageLimit) {
        paymentDetailsList.pop();
      }

      return {
        ...state,
        loading: false,
        success: true,
        notifyMessage: action.payload.message,
        notifyType: 'success',
        notify: true,
        paymentDetails: paymentDetailsList,
        totalPaymentDetails: totalPaymentDetails + 1,
        addPayment: true
      };
    },
    [AddPaymentDetail.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      error: action.payload.error,
      addPayment: false
    })
  }
});

const { reducer, actions } = paymentDetail;

export const { SetPaymentDetailState, SetPaymentDetailNotifyState } = actions;
export default reducer;
