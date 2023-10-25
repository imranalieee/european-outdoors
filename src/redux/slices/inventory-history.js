import { createSlice, createAsyncThunk, current } from '@reduxjs/toolkit';
import { cloneDeep } from 'lodash';

import { HandleCatchBlock } from '../../../utils/helpers';
import { axiosBaseUrl } from '../../config/axios-configuration';

const axios = axiosBaseUrl();

export const SaveInventoryHistoryByOrderId = createAsyncThunk(
  'inventory/save-phone-order-inventory-history-by-orderId',
  async (data, { rejectWithValue }) => {
    try {
      const {
        orderId
      } = data;

      const response = await axios.post('/inventory/save-phone-order-inventory-history-by-orderId', {
        orderId
      });

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);
export const GetInventoryHistoryByProductId = createAsyncThunk(
  'inventory/get-inventory-IO-history',
  async (data, { rejectWithValue }) => {
    try {
      const {
        filters,
        productId,
        skip,
        limit,
        sortBy
      } = data;

      const response = await axios.get('/inventory/get-inventory-IO-history', {
        params: {
          filters: JSON.stringify(filters),
          productId,
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

const inventoryHistory = createSlice({
  name: 'inventoryHistory',
  initialState: {
    success: false,
    notifyMessage: '',
    notify: false,
    notifyType: '',
    totalInventoryHistoryCount: 0,
    inventoryHistory: 0,
    getInventoryHistoryLoading: false,
    totalInInventoryQuantity: 0,
    totalOutInventoryQuantity: 0
  },
  reducers: {
    SetInventoryHistoryState(state, { payload: { field, value } }) {
      state[field] = value;
    },
    SetInventoryHistoryNotifyState(state, { payload: { message, type } }) {
      state.notify = true;
      state.notifyMessage = message;
      state.notifyType = type;
    }
  },

  extraReducers: {
    [SaveInventoryHistoryByOrderId.pending]: (state) => ({
      ...state,
      success: false
    }),
    [SaveInventoryHistoryByOrderId.fulfilled]: (state, action) => ({
      ...state,
      success: true
    }),
    [SaveInventoryHistoryByOrderId.rejected]: (state, action) => ({
      ...state,
      success: false,
      error: action.payload.error,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [GetInventoryHistoryByProductId.pending]: (state) => ({
      ...state,
      success: false,
      getInventoryHistoryLoading: true
    }),
    [GetInventoryHistoryByProductId.fulfilled]: (state, action) => ({
      ...state,
      success: true,
      totalInventoryHistoryCount: action.payload.data.totalInventoryHistoryCount,
      inventoryHistory: action.payload.data.inventoryHistory,
      getInventoryHistoryLoading: false,
      totalInInventoryQuantity: action.payload.data.totalInInventoryQuantity,
      totalOutInventoryQuantity: action.payload.data.totalOutInventoryQuantity
    }),
    [GetInventoryHistoryByProductId.rejected]: (state, action) => ({
      ...state,
      success: false,
      error: action.payload.error,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      getInventoryHistoryLoading: false
    })
  }
});

const { reducer, actions } = inventoryHistory;

export const { SetInventoryHistoryState, SetInventoryHistoryNotifyState } = actions;

export default reducer;
