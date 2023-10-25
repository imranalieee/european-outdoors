import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { extend } from 'lodash';

import { HandleCatchBlock } from '../../../../utils/helpers';
import { axiosBaseUrl } from '../../../config/axios-configuration';

const axios = axiosBaseUrl();

export const GetOrderPaymentDetail = createAsyncThunk(
  'order-payment/get-order-payment-by-orderId',
  async (data, { rejectWithValue }) => {
    try {
      const {
        orderId,
        pageName = 'addOrder'
      } = data;

      const response = await axios.get('/order-payment/get-order-payment-detail-by-OrderId', {
        params: {
          orderId
        }
      });

      response.data.key = pageName;
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const AddAndUpdateOrderPaymentDetail = createAsyncThunk(
  'order-payment/add-and-edit-order-payment-detail',
  async (data, { rejectWithValue }) => {
    try {
      const {
        orderId,
        creditCardDetails,
        paymentDetails
      } = data;

      const response = await axios.post('/order-payment/add-and-edit-order-payment-detail', {

        orderId,
        creditCardDetails,
        paymentDetails
      });

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

const order = createSlice({
  name: 'orderPayment',
  initialState: {
    getOrderPaymentLoading: false,
    addAndEditPaymentLoading: false,
    updatePaymentDetail: false,
    success: false,
    notify: false,
    notifyMessage: '',
    notifyType: 'error',
    orderPaymentDetail: {},
    viewOrderPaymentDetail: {}
  },
  reducers: {
    SetOrderPaymentState(state, { payload: { field, value } }) {
      state[field] = value;
    },
    SetOrderPaymentNotifyState(state, { payload: { message, type } }) {
      state.notify = true;
      state.notifyMessage = message;
      state.notifyType = type;
    }
  },
  extraReducers: {
    [GetOrderPaymentDetail.pending]: (state) => ({
      ...state,
      success: false,
      getOrderPaymentLoading: true,
    }),
    [GetOrderPaymentDetail.fulfilled]: (state, action) => {
      const { key } = action.payload;
      const { orderPaymentDetail } = action.payload.data;
      const updateFields = {};

      if (key === 'addOrder') {
        extend(updateFields, { orderPaymentDetail });
      } else if (key === 'viewOrder') {
        extend(updateFields, { viewOrderPaymentDetail: orderPaymentDetail });
      }

      return {
        ...state,
        success: true,
        getOrderPaymentLoading: false,
        ...updateFields
      };
    },
    [GetOrderPaymentDetail.rejected]: (state, action) => ({
      ...state,
      success: false,
      getOrderPaymentLoading: false,
      notifyMessage: action.payload.error || 'Error',
      notifyType: 'error',
      notify: true
    }),
    [AddAndUpdateOrderPaymentDetail.pending]: (state) => ({
      ...state,
      success: false,
      addAndEditPaymentLoading: true,
      updatePaymentDetail: false
    }),
    [AddAndUpdateOrderPaymentDetail.fulfilled]: (state, action) => ({
      ...state,
      success: true,
      addAndEditPaymentLoading: false,
      orderPaymentDetail: action.payload.data.orderPaymentDetail,
      updatePaymentDetail: true,
      notifyMessage: action.payload.message,
      notifyType: 'success',
      notify: true
    }),
    [AddAndUpdateOrderPaymentDetail.rejected]: (state, action) => ({
      ...state,
      success: false,
      addAndEditPaymentLoading: false,
      notifyMessage: action.payload.error || 'Error',
      notifyType: 'error',
      notify: true,
      updatePaymentDetail: false
    })
  }
});

const { reducer, actions } = order;

export const { SetOrderPaymentState, SetOrderPaymentNotifyState } = actions;

export default reducer;
