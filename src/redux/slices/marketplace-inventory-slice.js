import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { HandleCatchBlock } from '../../../utils/helpers';
import { axiosBaseUrl } from '../../config/axios-configuration';

const axios = axiosBaseUrl();

export const GetMarketplaceInventory = createAsyncThunk(
  'marketplace-inventory/get-inventory',
  async (data, { rejectWithValue }) => {
    try {
      const {
        filters,
        skip,
        limit
      } = data;

      const response = await axios.get('inventory/get-inventory', {
        params: {
          filters: JSON.stringify(filters),
          skip,
          limit
        }
      });

      return {
        data: response.data
      };
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const SaveUploadedInventorySheetInDb = createAsyncThunk(
  'marketplaceInventory/save-uploaded-sheet-in-db',
  async (data, { rejectWithValue }) => {
    try {
      const {
        userId,
        fileUploadKey
      } = data;
      const response = await fetch(`${process.env.JOB_URL}/script?method=StartSingleJob&jobName=get-and-save-s3-uploaded-vc-inventory&userId=${userId}&fileUploadKey=${fileUploadKey}`);
      return response;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const SaveUploadedMarketplaceMappingSheetInDb = createAsyncThunk(
  'marketplaceInventory/get-and-save-s3-uploaded-marketplace-listing-mapping',
  async (data, { rejectWithValue }) => {
    try {
      const {
        userId,
        fileUploadKey
      } = data;
      const response = await fetch(`${process.env.JOB_URL}/script?method=StartSingleJob&jobName=get-and-save-s3-uploaded-marketplace-listing-mapping&userId=${userId}&fileUploadKey=${fileUploadKey}`);
      return response;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

const marketplaceInventory = createSlice({
  name: 'marketplaceInventory',
  initialState: {
    getMarketplaceInventoryLoading: false,
    saveInventoryJobTriggeredLoading: false,
    saveInventoryJobTriggered: false,
    success: false,
    notify: false,
    notifyMessage: '',
    notifyType: 'error',
    marketplaceInventory: [],
    totalMarketplaceInventory: 0,
    marketplaceInventoryFilters: {
      marketplaceInventoryPageNumber: 1,
      marketplaceInventoryPageLimit: 100,
      marketplace: 'sellerCentral',
      sellerCentralFilters: { sellerSku: '', asin: '', upc: '' },
      walmartFilters: { sellerSku: '', itemId: '' },
      ebayFilters: { upc: '', sellerSku: '' },
      vcDirectFulFillmentFilters: { sellerSku: '', upc: '', asin: '' }
    }
  },
  reducers: {
    SetMarketplaceInventoryState(state, { payload: { field, value } }) {
      state[field] = value;
    },
    SetMarketplaceInventoryNotifyState(state, { payload: { message, type } }) {
      state.notify = true;
      state.notifyMessage = message;
      state.notifyType = type;
    }
  },
  extraReducers: {
    [GetMarketplaceInventory.pending]: (state) => ({
      ...state,
      success: false,
      getMarketplaceInventoryLoading: true
    }),
    [GetMarketplaceInventory.fulfilled]: (state, action) => ({
      ...state,
      getMarketplaceInventoryLoading: false,
      success: true,
      marketplaceInventory: action.payload.data.data.inventory,
      totalMarketplaceInventory: action.payload.data.data.totalCount
    }),
    [GetMarketplaceInventory.rejected]: (state, action) => ({
      ...state,
      getMarketplaceInventoryLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [SaveUploadedInventorySheetInDb.pending]: (state) => ({
      ...state,
      success: false,
      saveInventoryJobTriggeredLoading: true,
      saveInventoryJobTriggered: false
    }),
    [SaveUploadedInventorySheetInDb.fulfilled]: (state) => ({
      ...state,
      success: true,
      notify: true,
      notifyMessage: 'It takes few minutes to save uploaded the sheet',
      notifyType: 'success',
      saveInventoryJobTriggeredLoading: false,
      saveInventoryJobTriggered: true
    }),
    [SaveUploadedInventorySheetInDb.rejected]: (state, action) => ({
      ...state,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      saveInventoryJobTriggeredLoading: false,
      saveInventoryJobTriggered: false
    }),
    [SaveUploadedMarketplaceMappingSheetInDb.pending]: (state) => ({
      ...state,
      success: false,
      notify: false,
      saveInventoryJobTriggeredLoading: true,
      saveInventoryJobTriggered: false
    }),
    [SaveUploadedMarketplaceMappingSheetInDb.fulfilled]: (state) => ({
      ...state,
      success: true,
      notify: true,
      notifyMessage: 'It takes few minutes to save uploaded the sheet',
      notifyType: 'success',
      saveInventoryJobTriggeredLoading: false,
      saveInventoryJobTriggered: true
    }),
    [SaveUploadedMarketplaceMappingSheetInDb.rejected]: (state, action) => ({
      ...state,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      saveInventoryJobTriggeredLoading: false,
      saveInventoryJobTriggered: false
    })
  }
});

const { reducer, actions } = marketplaceInventory;

export const { SetMarketplaceInventoryNotifyState, SetMarketplaceInventoryState } = actions;

export default reducer;
