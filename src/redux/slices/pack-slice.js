import { createSlice, createAsyncThunk, current } from '@reduxjs/toolkit';
import { cloneDeep, extend } from 'lodash';

import { HandleCatchBlock } from '../../../utils/helpers';
import { axiosBaseUrl } from '../../config/axios-configuration';

const axios = axiosBaseUrl();

export const AddItemsToPack = createAsyncThunk(
  'pack/add-items-to-pack',
  async (data, { rejectWithValue }) => {
    try {
      const {
        productId, items, action
      } = data;

      const response = await axios.post('/pack/add-items-to-pack', {
        productId, items, action
      });

      response.data.action = action;
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetPacksByProductId = createAsyncThunk(
  'pack/get-packs-by-product-id',
  async (data, { rejectWithValue }) => {
    try {
      const {
        productId
      } = data;

      const response = await axios.get('/pack/get-packs-by-product-id', {
        params: {
          productId
        }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetPackItems = createAsyncThunk(
  'pack/get-packs-items-product-id',
  async (data, { rejectWithValue }) => {
    try {
      const {
        productId,
        skip,
        limit,
        sortBy
      } = data;

      const response = await axios.get('/pack/get-packs-by-product-id', {
        params: {
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

export const DeleteItemsFromPack = createAsyncThunk(
  'pack/remove-items-from-pack',
  async (data, { rejectWithValue }) => {
    try {
      const {
        packItemIds
      } = data;
      const response = await axios.delete('/pack/remove-items-from-pack', {
        params: {
          packItemIds
        }

      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

const pack = createSlice({
  name: 'pack',
  initialState: {
    loading: false,
    success: false,
    insertedCount: 0,
    insertedIds: [],
    notify: false,
    notifyMessage: '',
    notifyType: 'error',
    selectedPagination: 100,
    packItemsPagination: 100,
    packAdded: false,
    packDeleted: false,
    packDetail: [],
    packItems: [],
    totalItemsInPack: 0,
    addPackItemLoading: false,
    deletePackItemLoading: false,
    getPackItemLoading: false,
    getPackDetailLoading: false,
    selectedPaginationOfPack: 100,
    totalQuantityInPack: 0,
    totalCostOfPack: 0,
    packDetailsPageNumber: 1,
    packDetailsPageLimit: 100,
    packDetailProductId: null,
    packItemsEdited: false
  },
  reducers: {
    SetPackState(state, { payload: { field, value } }) {
      state[field] = value;
    },
    SetPackNotifyState(state, { payload: { message, type } }) {
      state.notify = true;
      state.notifyMessage = message;
      state.notifyType = type;
    }
  },
  extraReducers: {
    [AddItemsToPack.pending]: (state) => ({
      ...state,
      addPackItemLoading: true,
      success: false,
      packAdded: false,
      packItemsEdited: false
    }),
    [AddItemsToPack.fulfilled]: (state, action) => {
      const { action: key } = action.payload;

      const updateParams = {};

      if (key === 'addItemsToPack') {
        const { newPackItems } = action.payload.data;

        const currentState = current(state);
        const packDetailList = cloneDeep(currentState.packDetail);

        packDetailList.unshift(...newPackItems);

        extend(updateParams, { packAdded: true, packDetail: packDetailList });
      } else if (key === 'editPackItems') {
        extend(updateParams, { packItemsEdited: true });
      }

      return {
        ...state,
        success: true,
        notifyMessage: action.payload.message,
        notifyType: 'success',
        notify: true,
        ...updateParams,
        addPackItemLoading: false
      };
    },
    [AddItemsToPack.rejected]: (state, action) => ({
      ...state,
      addPackItemLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      packAdded: false,
      packItemsEdited: false
    }),
    [GetPacksByProductId.pending]: (state) => ({
      ...state,
      success: false,
      getPackDetailLoading: true
    }),
    [GetPacksByProductId.fulfilled]: (state, action) => ({
      ...state,
      getPackDetailLoading: false,
      success: true,
      packDetail: action.payload.data.pack
    }),
    [GetPacksByProductId.rejected]: (state, action) => ({
      ...state,
      getPackDetailLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [GetPackItems.pending]: (state) => ({
      ...state,
      loading: true,
      success: false,
      getPackItemLoading: true
    }),
    [GetPackItems.fulfilled]: (state, action) => ({
      ...state,
      getPackItemLoading: false,
      success: true,
      loading: false,
      packItems: action.payload.data.pack,
      totalItemsInPack: action.payload.data.totalItemsInPack,
      totalQuantityInPack: action.payload.data.totalQuantityInPack,
      totalCostOfPack: action.payload.data.totalCostOfPack
    }),
    [GetPackItems.rejected]: (state, action) => ({
      ...state,
      loading: false,
      getPackItemLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [DeleteItemsFromPack.pending]: (state) => ({
      ...state,
      success: false,
      deletePackItemLoading: true,
      packDeleted: false
    }),
    [DeleteItemsFromPack.fulfilled]: (state, action) => ({
      ...state,
      deletePackItemLoading: false,
      success: true,
      packDetail: action.payload.data.pack,
      packDeleted: true,
      notifyType: 'success',
      notifyMessage: action.payload.message,
      notify: true
    }),
    [DeleteItemsFromPack.rejected]: (state, action) => ({
      ...state,
      deletePackItemLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      packDeleted: false,
      notifyType: 'error',
      notify: true
    })
  }
});

const { reducer, actions } = pack;

export const { SetPackState, SetPackNotifyState } = actions;

export default reducer;
