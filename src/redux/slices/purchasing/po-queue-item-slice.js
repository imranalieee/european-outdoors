import { cloneDeep } from 'lodash';
import { createSlice, createAsyncThunk, current } from '@reduxjs/toolkit';

import { HandleCatchBlock } from '../../../../utils/helpers';
import { axiosBaseUrl } from '../../../config/axios-configuration';

const axios = axiosBaseUrl();

export const GetQueueItems = createAsyncThunk(
  'purchasing/po-queue/get-queue-items',
  async (data, { rejectWithValue }) => {
    try {
      const {
        filters,
        skip,
        limit,
        sortBy
      } = data;
      const response = await axios.get('/purchasing/po-queue/get-queue-items', {
        params: {
          filters: JSON.stringify(filters),
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

export const GetPoQueueItems = createAsyncThunk(
  'purchasing/po-queue/get-po-queue-items',
  async (data, { rejectWithValue }) => {
    try {
      const {
        skip,
        limit,
        filters,
        sortBy
      } = data;
      const response = await axios.get('/purchasing/po-queue/get-po-queue-items', {
        params: {
          filters: JSON.stringify(filters),
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

export const GetAggregatedDataOfPOQueue = createAsyncThunk(
  'purchasing/po-queue/get-aggregated-data-for-po-queue',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.get('/purchasing/po-queue/get-aggregated-data-for-po-queue');
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetPoQueueHitory = createAsyncThunk(
  'purchasing/po-queue/get-purchase-item-history-confirmed-po',
  async (data, { rejectWithValue }) => {
    try {
      const {
        skip,
        limit,
        supplierId,
        productId,
        poStatus,
        filters,
        sortBy
      } = data;
      const response = await axios.get('/purchasing/po-queue/get-purchase-item-history-confirmed-po', {
        params: {
          skip,
          limit,
          supplierId,
          productId,
          poStatus,
          filters: JSON.stringify(filters),
          sortBy
        }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const SaveSelectedQueueItemsId = createAsyncThunk(
  'purchasing/po-queue/save-export-queue-items-params',
  async (data, { rejectWithValue }) => {
    try {
      const { selectIds } = data;

      const jsonSelectedPurchasingIds = JSON.stringify(selectIds);
      const blobSelectedPurchasingIds = new Blob([jsonSelectedPurchasingIds], {
        type: 'application/json'
      });
      const formData = new FormData();
      formData.append('selectedQueueItemIds', blobSelectedPurchasingIds);

      const response = await axios.post('/purchasing/po-queue/save-export-queue-items-params', formData);
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const DownloadQueueItems = createAsyncThunk(
  'purchasing/download-queue-items-sheet',
  async (data, { rejectWithValue }) => {
    try {
      const { userId } = data;
      const url = `${process.env.API_URL}/non-secure-route/download-queue-items?userId=${userId}`;

      window.open(url, '_blank');

      return 0;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetAndSaveUploadedSheetInDb = createAsyncThunk(
  'purchasing/get-and-save-uploaded-sheet-in-db',
  async (data, { rejectWithValue }) => {
    try {
      const {
        userId,
        fileUploadKey
      } = data;
      const response = await fetch(`${process.env.JOB_URL}/script?method=StartSingleJob&jobName=get-and-save-s3-uploaded-po-queue-file&userId=${userId}&fileUploadKey=${fileUploadKey}`);
      return response;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetItemPurchaseHistoryByProductAndSupplierId = createAsyncThunk(
  'purchasing/purchase-order/get-item-purchase-history-by-productId-and-supplierId',
  async (data, { rejectWithValue }) => {
    try {
      const {
        productId,
        supplierId,
        filters,
        skip,
        limit,
        sortBy
      } = data;

      const response = await axios.get('/purchasing/purchase-order/get-item-purchase-history-by-productId-and-supplierId', {
        params: {
          productId,
          supplierId,
          filters: JSON.stringify(filters),
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

export const AddItemToPoQueue = createAsyncThunk(
  'purchasing/po-queue/add-items-to-po-queue',
  async (data, { rejectWithValue }) => {
    try {
      const {
        items
      } = data;

      const response = await axios.post('/purchasing/po-queue/add-items-to-po-queue', {
        items
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const UpdatePOQueueItem = createAsyncThunk(
  'purchasing/po-queue/update-single-po-queue-item',
  async ({ poQueueItemId, updateParams, poId }, { rejectWithValue }) => {
    try {
      const response = await axios.put('/purchasing/po-queue/update-single-po-queue-item', {
        poQueueItemId,
        updateParams,
        poId
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const DeletePOQueueItems = createAsyncThunk(
  'purchasing/po-queue/remove-items-from-po-queue',
  async (data, { rejectWithValue }) => {
    try {
      const {
        items
      } = data;
      const response = await axios.delete('/purchasing/po-queue/remove-items-from-po-queue', {
        params: {
          items
        }

      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

const poQueueItem = createSlice({
  name: 'poQueueItem',
  initialState: {
    loading: false,
    success: false,
    notify: false,
    notifyMessage: '',
    notifyType: 'error',
    addItemsToQueueFilters: {
      searchByKeyWords: {
        title: '',
        stockNumber: '',
        mfgPartNo: ''
      },
      extendedFilters: []
    },
    addItemsToQueuePageLimit: 100,
    addItemsToQueuePageNumber: 1,
    queueItems: [],
    totalQueueItems: 0,
    addItemsToPoQueueFilters: {
      searchByKeyWords: {
        title: '',
        stockNumber: '',
        mfgPartNo: ''
      },
      supplierId: '',
      extendedFilters: []
    },
    addItemsToPoQueuePageNumber: 1,
    addItemsToPoQueuePageLimit: 100,
    poQueueItemLoading: false,
    poQueueItems: [],
    totalPoQueueItems: 0,
    saveSelectedQueueItemsParams: false,
    queueItemsDownloaded: false,
    purchaseItemHistoryLoading: false,
    poQueueHistoryFilters: {
      searchByKeyWords: {
        poId: ''
      }
    },
    poQueueHistory: [],
    totalPoQueueHistory: 0,
    totalPoQueueHistoryCost: 0,
    poQueueHistoryPageLimit: 100,
    poQueueHistoryPageNumber: 1,
    poQueueHistoryLoading: false,
    itemPurchaseHistoryPageNumber: 1,
    itemPurchaseHistoryPageLimit: 100,
    addedItemToPOQueue: false,
    poQueueItemDeleted: false,
    aggregatedDataOfPOQueue: null,
    poQueueItemUpdated: false,
    purchasingLoading: false,
    purchasingTab: 0,
    getQueueItemsLoading: false,
    updatePOQueueItemLoading: false,
    deletePOQueueItemsLoading: false
  },
  reducers: {
    SetPoQueueItemState(state, { payload: { field, value } }) {
      state[field] = value;
    },
    SetPoQueueItemNotifyState(state, { payload: { message, type } }) {
      state.notify = true;
      state.notifyMessage = message;
      state.notifyType = type;
    }
  },
  extraReducers: {
    [GetQueueItems.pending]: (state) => ({
      ...state,
      success: false,
      getQueueItemsLoading: true
    }),
    [GetQueueItems.fulfilled]: (state, action) => ({
      ...state,
      success: true,
      queueItems: action.payload.data.queueItems,
      totalQueueItems: action.payload.data.totalQueueItems
    }),
    [GetQueueItems.rejected]: (state, action) => ({
      ...state,
      getQueueItemsLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [GetPoQueueItems.pending]: (state) => ({
      ...state,
      success: false,
      poQueueItemLoading: true
    }),
    [GetPoQueueItems.fulfilled]: (state, action) => ({
      ...state,
      poQueueItemLoading: false,
      success: true,
      poQueueItems: action.payload.data.queues,
      totalPoQueueItems: action.payload.data.totalQueues
    }),
    [GetPoQueueItems.rejected]: (state, action) => ({
      ...state,
      poQueueItemLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [GetAggregatedDataOfPOQueue.pending]: (state) => ({
      ...state,
      success: false,
      loading: true
    }),
    [GetAggregatedDataOfPOQueue.fulfilled]: (state, action) => ({
      ...state,
      loading: false,
      success: true,
      aggregatedDataOfPOQueue: action.payload.data.queues
    }),
    [GetAggregatedDataOfPOQueue.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [GetPoQueueHitory.pending]: (state) => ({
      ...state,
      success: false,
      poQueueHistoryLoading: true
    }),
    [GetPoQueueHitory.fulfilled]: (state, action) => ({
      ...state,
      poQueueHistoryLoading: false,
      success: true,
      poQueueHistory: action.payload.data.history,
      totalPoQueueHistory: action.payload.data.totalHistories || 0,
      totalPoQueueHistoryCost: action.payload.data.totalAmount
    }),
    [GetPoQueueHitory.rejected]: (state, action) => ({
      ...state,
      poQueueHistoryLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [SaveSelectedQueueItemsId.pending]: (state) => ({
      ...state,
      loading: true,
      success: false,
      saveSelectedQueueItemsParams: false
    }),
    [SaveSelectedQueueItemsId.fulfilled]: (state) => ({
      ...state,
      loading: false,
      success: true,
      saveSelectedQueueItemsParams: true
    }),
    [SaveSelectedQueueItemsId.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      saveSelectedQueueItemsParams: false
    }),
    [DownloadQueueItems.pending]: (state) => ({
      ...state,
      loading: true,
      saveSelectedSupplierParams: false,
      success: false,
      queueItemsDownloaded: false
    }),
    [DownloadQueueItems.fulfilled]: (state) => ({
      ...state,
      loading: false,
      success: true,
      queueItemsDownloaded: true
    }),
    [DownloadQueueItems.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      queueItemsDownloaded: false
    }),
    [GetAndSaveUploadedSheetInDb.pending]: (state) => ({
      ...state,
      success: false,
      loading: true,
      jobTriggered: false
    }),
    [GetAndSaveUploadedSheetInDb.fulfilled]: (state) => ({
      ...state,
      loading: false,
      success: true,
      notify: true,
      jobTriggered: true,
      notifyMessage: 'It takes few minutes to save uploaded the sheet',
      notifyType: 'success'
    }),
    [GetAndSaveUploadedSheetInDb.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      jobTriggered: false
    }),
    [GetItemPurchaseHistoryByProductAndSupplierId.pending]: (state) => ({
      ...state,
      purchasingLoading: true,
      success: false
    }),
    [GetItemPurchaseHistoryByProductAndSupplierId.fulfilled]: (state, action) => ({
      ...state,
      purchasingLoading: false,
      success: true,
      itemPurchaseHistory: action.payload.data.itemPurchaseHistory,
      totalOfItemPurchaseHistory: action.payload.data.totalOfItemPurchaseHistory
    }),
    [GetItemPurchaseHistoryByProductAndSupplierId.rejected]: (state, action) => ({
      ...state,
      purchasingLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [AddItemToPoQueue.pending]: (state) => ({
      ...state,
      purchasingLoading: true,
      addedItemToPOQueue: false,
      success: false
    }),
    [AddItemToPoQueue.fulfilled]: (state, action) => ({
      ...state,
      purchasingLoading: false,
      success: true,
      addedItemToPOQueue: true,
      notifyMessage: action.payload.message,
      notifyType: 'success',
      notify: true
    }),
    [AddItemToPoQueue.rejected]: (state, action) => ({
      ...state,
      purchasingLoading: false,
      success: false,
      addedItemToPOQueue: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [UpdatePOQueueItem.pending]: (state) => ({
      ...state,
      success: false,
      loading: true,
      poQueueItemUpdated: false,
      updatePOQueueItemLoading: true
    }),
    [UpdatePOQueueItem.fulfilled]: (state, action) => {
      const currentState = current(state);

      const poQueueItemsList = cloneDeep(currentState.poQueueItems);

      const {
        poQueueItemId,
        poQuantity,
        unitCost,
        receivedQuantity
      } = action.payload.data.updatedPoQueueItem;

      const pOQueueItemIndex = poQueueItemsList.findIndex(
        (doc) => doc._id === (poQueueItemId)
      );

      if (pOQueueItemIndex > -1) {
        if (unitCost) poQueueItemsList[pOQueueItemIndex].unitCost = unitCost;
        if (poQuantity) poQueueItemsList[pOQueueItemIndex].poQuantity = poQuantity;
        if (receivedQuantity) {
          poQueueItemsList[pOQueueItemIndex].poQueueItem.receivedQuantity = receivedQuantity;
        }
      }

      return {
        ...state,
        loading: false,
        success: true,
        notifyMessage: action.payload.message,
        notifyType: 'success',
        notify: true,
        poQueueItems: poQueueItemsList,
        poQueueItemUpdated: true,
        updatePOQueueItemLoading: false
      };
    },
    [UpdatePOQueueItem.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      error: action.payload.error,
      poQueueItemUpdated: false,
      updatePOQueueItemLoading: false
    }),
    [DeletePOQueueItems.pending]: (state) => ({
      ...state,
      success: false,
      loading: true,
      poQueueItemDeleted: false,
      deletePOQueueItemsLoading: true
    }),
    [DeletePOQueueItems.fulfilled]: (state, action) => ({
      ...state,
      loading: false,
      success: true,
      notifyMessage: action.payload.message,
      notifyType: 'success',
      poQueueItemDeleted: true,
      notify: true,
      deletePOQueueItemsLoading: false
    }),
    [DeletePOQueueItems.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      poQueueItemDeleted: false,
      notifyType: 'error',
      notify: true,
      deletePOQueueItemsLoading: false
    })
  }
});

const { reducer, actions } = poQueueItem;

export const { SetPoQueueItemState, SetPoQueueItemNotifyState } = actions;

export default reducer;
