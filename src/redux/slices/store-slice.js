import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { HandleCatchBlock } from '../../../utils/helpers';
import { axiosBaseUrl } from '../../config/axios-configuration';

const axios = axiosBaseUrl();

export const GetStores = createAsyncThunk(
  'store/get-stores',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/store/get-store-types');
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetInventorySkuListByStoreId = createAsyncThunk(
  'store/get-inventory-sku-list-by-store-id',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.get('/store/get-inventory-sku-list-by-store-id', {
        params: {
          storeId: data.storeId
        }
      });

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

const store = createSlice({
  name: 'store',
  initialState: {
    error: '',
    message: '',
    loading: false,
    success: false,
    notifyMessage: '',
    notify: false,
    notifyType: '',
    stores: [],
    inventorySkuList: [],
    isListReceived: false,
    inventoryLoading: false
  },
  reducers: {
    SetStoreState(state, { payload: { field, value } }) {
      state[field] = value;
    }
  },
  extraReducers: {
    [GetStores.pending]: (state) => ({
      ...state,
      loading: true,
      success: false
    }),
    [GetStores.fulfilled]: (state, action) => {
      const { stores } = action.payload.data;
      let storeTypes = [];
      if (stores?.length) {
        const storesData = stores.map((data) => ({
          value: data._id,
          label: data.name
        }));
        storeTypes = storesData;
      }

      return {
        ...state,
        loading: false,
        success: true,
        stores: storeTypes
      };
    },
    [GetStores.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      error: action.payload.error
    }),
    [GetInventorySkuListByStoreId.pending]: (state) => ({
      ...state,
      inventoryLoading: true,
      success: false,
      isListReceived: false
    }),
    [GetInventorySkuListByStoreId.fulfilled]: (state, action) => ({
      ...state,
      success: true,
      inventoryLoading: false,
      inventorySkuList: action.payload.data.inventorySkuList,
      isListReceived: true
    }),
    [GetInventorySkuListByStoreId.rejected]: (state, action) => ({
      ...state,
      success: false,
      inventoryLoading: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      isListReceived: true
    })
  }
});

const { reducer, actions } = store;

export const { SetStoreState, SetStoreNotifyState } = actions;

export default reducer;
