import { cloneDeep, isEmpty, extend } from 'lodash';
import { createSlice, createAsyncThunk, current } from '@reduxjs/toolkit';

import { HandleCatchBlock } from '../../../../utils/helpers';
import { axiosBaseUrl } from '../../../config/axios-configuration';

const axios = axiosBaseUrl();

export const GetPurchaseOrderHitory = createAsyncThunk(
  'purchasing/purchase-order/get-purchase-order-history',
  async (data, { rejectWithValue }) => {
    try {
      const {
        skip,
        limit,
        supplierId,
        poStatus,
        filters
      } = data;
      const response = await axios.get('/purchasing/purchase-order/get-purchase-order-history', {
        params: {
          skip,
          limit,
          supplierId,
          poStatus,
          filters: JSON.stringify(filters)
        }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const CreatePurchaseOrder = createAsyncThunk(
  'purchasing/purchase-order/add-items-to-purchase-order',
  async (data, { rejectWithValue }) => {
    try {
      const {
        items
      } = data;

      const response = await axios.post('/purchasing/purchase-order/add-items-to-purchase-order', {
        items
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetOpenPurchaseOrders = createAsyncThunk(
  'purchasing/purchase-order/get-open-pos-by-product-and-supplier-id',
  async (data, { rejectWithValue }) => {
    try {
      const {
        skip,
        limit,
        supplierId,
        productId
      } = data;
      const response = await axios.get('/purchasing/purchase-order/get-open-pos-by-product-and-supplier-id', {
        params: {
          skip,
          limit,
          supplierId,
          productId
        }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const CreateOpenPurchaseOrder = createAsyncThunk(
  'purchasing/po-queue/add-items-to-open-po',
  async (data, { rejectWithValue }) => {
    try {
      const {
        isNewPO,
        item
      } = data;

      const response = await axios.post('/purchasing/po-queue/add-items-to-open-po', {
        isNewPO,
        item
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const SaveSelectedPOQueueItemsId = createAsyncThunk(
  'purchasing/purchase-order/save-export-po-queue-items-params',
  async (data, { rejectWithValue }) => {
    try {
      const { selectIds } = data;
      const jsonSelectedPurchasingIds = JSON.stringify(selectIds);
      const blobSelectedPurchasingIds = new Blob([jsonSelectedPurchasingIds], {
        type: 'application/json'
      });
      const formData = new FormData();
      formData.append('selectedPoQueueItemIds', blobSelectedPurchasingIds);

      const response = await axios.post('/purchasing/purchase-order/save-export-po-queue-items-params', formData);
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const DownloadPOQueueItems = createAsyncThunk(
  'purchasing/download-po-queue-items-sheet',
  async (data, { rejectWithValue }) => {
    try {
      const { userId } = data;
      const url = `${process.env.API_URL}/non-secure-route/download-po-queue-items?userId=${userId}`;

      window.open(url, '_blank');

      return 0;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetPONumbers = createAsyncThunk(
  'purchasing/purchase-order/get-all-po-numbers',
  async (data, { rejectWithValue }) => {
    try {
      const {
        poStatus
      } = data;
      const response = await axios.get('/purchasing/purchase-order/get-all-po-numbers', {
        params: {
          poStatus
        }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetPurchaseOrderById = createAsyncThunk(
  'purchasing/purchase-order/get-po-by-id',
  async (data, { rejectWithValue }) => {
    try {
      const {
        poId
      } = data;
      const response = await axios.get('/purchasing/purchase-order/get-po-by-id', {
        params: {
          poId
        }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetItemsOfPurchaseOrder = createAsyncThunk(
  'purchasing/purchase-order/get-items-of-po',
  async (data, { rejectWithValue }) => {
    try {
      const {
        skip,
        limit,
        purchaseOrderId,
        poStatus,
        sortBy
      } = data;
      const response = await axios.get('/purchasing/purchase-order/get-items-of-po', {
        params: {
          skip,
          limit,
          purchaseOrderId,
          poStatus,
          sortBy
        }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetAggregatedDataOfNonConfirmPO = createAsyncThunk(
  'purchasing/purchase-order/get-aggregated-data-of-non-confirm-po',
  async (data, { rejectWithValue }) => {
    try {
      const {
        poId,
        poStatus
      } = data;
      const response = await axios.get('/purchasing/purchase-order/get-aggregated-data-of-non-confirm-po', {
        params: {
          poId,
          poStatus
        }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetAllNonConfirmPOs = createAsyncThunk(
  'purchasing/purchase-order/get-all-non-confirm-po',
  async (data, { rejectWithValue }) => {
    try {
      const {
        skip,
        limit,
        filters,
        poStatus
      } = data;
      const response = await axios.get('/purchasing/purchase-order/get-all-non-confirm-po', {
        params: {
          skip,
          limit,
          filters: JSON.stringify(filters),
          poStatus
        }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetSuppliersOfPO = createAsyncThunk(
  'purchasing/purchase-order/get-suppliers-of-po',
  async (data, { rejectWithValue }) => {
    try {
      const {
        poStatus
      } = data;
      const response = await axios.get('/purchasing/purchase-order/get-suppliers-of-po', {
        params: {
          poStatus
        }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const UpdatePurchaseOrder = createAsyncThunk(
  'purchasing/purchase-order/update-details-of-non-confirm-po',
  async ({ purchaseOrderId, updateParams, editAction = 'poDetailEdit' }, { rejectWithValue }) => {
    try {
      const response = await axios.put('/purchasing/purchase-order/update-details-of-non-confirm-po', {
        purchaseOrderId,
        updateParams
      });

      return {
        editAction,
        ...response.data
      };
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const DeletePOById = createAsyncThunk(
  'purchasing/purchase-order/delete-po-order-by-id',
  async (data, { rejectWithValue }) => {
    try {
      const {
        poId
      } = data;
      const response = await axios.delete('purchasing/purchase-order/delete-po-order-by-id', {
        data: {
          poId
        }

      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetItemsOfSupplierForNonConfirmPO = createAsyncThunk(
  'purchasing/purchase-order/get-items-of-supplier',
  async (data, { rejectWithValue }) => {
    try {
      const {
        skip,
        limit,
        filters,
        supplierId,
        poId,
        sortBy
      } = data;
      const response = await axios.get('/purchasing/purchase-order/get-items-of-supplier', {
        params: {
          skip,
          limit,
          filters: JSON.stringify(filters),
          supplierId,
          poId,
          sortBy
        }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const DownloadPurchaseOrderXlsxSheet = createAsyncThunk(
  'purchasing/download-purchase-order-xlsx-sheet',
  async (data, { rejectWithValue }) => {
    try {
      const { userId, pOId, withUPC } = data;
      const url = `${process.env.API_URL}/non-secure-route/download-po-xlsx-sheet?userId=${userId}&pOId=${pOId}&withUPC=${withUPC}`;
      window.open(url, '_blank');

      return 0;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const DownloadPurchaseOrderPdf = createAsyncThunk(
  'purchasing/download-purchase-order-pdf',
  async (data, { rejectWithValue }) => {
    try {
      const { userId, pOId } = data;
      const url = `${process.env.API_URL}/non-secure-route/download-po-pdf?userId=${userId}&pOId=${pOId}`;
      window.open(url, '_blank');

      return 0;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const AddItemsToNonConfirmPO = createAsyncThunk(
  'purchasing/purchase-order/add-items-to-non-confirm-po',
  async (data, { rejectWithValue }) => {
    try {
      const {
        items
      } = data;

      const response = await axios.post('/purchasing/purchase-order/add-items-to-non-confirm-po', {
        items
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const ConfirmPO = createAsyncThunk(
  'purchasing/purchase-order/confirm-po',
  async ({ purchaseOrderId }, { rejectWithValue }) => {
    try {
      const response = await axios.put('/purchasing/purchase-order/confirm-po', {
        purchaseOrderId
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const UpdatePOQuantityAndCost = createAsyncThunk(
  'purchasing/purchase-order/update-details-of-non-confirm-po-quantity',
  async ({ purchaseOrderId, updateParams }, { rejectWithValue }) => {
    try {
      const response = await axios.put('/purchasing/purchase-order/update-details-of-non-confirm-po', {
        purchaseOrderId,
        updateParams
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetAllConfirmPOs = createAsyncThunk(
  'purchasing/purchase-order/get-all-po',
  async (data, { rejectWithValue }) => {
    try {
      const {
        skip,
        limit,
        filters,
        sortBy
      } = data;
      const response = await axios.get('/purchasing/purchase-order/get-all-po', {
        params: {
          skip,
          limit,
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

export const GetSuppliersOfConfirmPO = createAsyncThunk(
  'purchasing/purchase-order/get-suppliers-of-confirm-po',
  async (data, { rejectWithValue }) => {
    try {
      const {
        poStatus
      } = data;
      const response = await axios.get('/purchasing/purchase-order/get-suppliers-of-po', {
        params: {
          poStatus
        }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetConfirmPONumbers = createAsyncThunk(
  'purchasing/purchase-order/get-all-confirm-po-numbers',
  async (data, { rejectWithValue }) => {
    try {
      const {
        poStatus
      } = data;
      const response = await axios.get('/purchasing/purchase-order/get-all-po-numbers', {
        params: {
          poStatus
        }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetItemsOfConfirmPO = createAsyncThunk(
  'purchasing/purchase-order/get-items-of-confirm-po',
  async (data, { rejectWithValue }) => {
    try {
      const {
        skip,
        limit,
        purchaseOrderId,
        poStatus
      } = data;
      const response = await axios.get('/purchasing/purchase-order/get-items-of-po', {
        params: {
          skip,
          limit,
          purchaseOrderId,
          poStatus
        }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetConfirmPOById = createAsyncThunk(
  'purchasing/purchase-order/get-confirm-po-by-id',
  async (data, { rejectWithValue }) => {
    try {
      const {
        poId
      } = data;
      const response = await axios.get('/purchasing/purchase-order/get-po-by-id', {
        params: {
          poId
        }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const SendPOEmail = createAsyncThunk(
  'purchasing/send-po-email',
  async (data, { rejectWithValue }) => {
    try {
      const { pOId } = data;

      const jobName = 'create-po-pdf-and-send-email';
      const response = await fetch(`${process.env.JOB_URL}/script?method=StartSingleJob&jobName=${jobName}&pOId=${pOId}`);
      return response;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const SavePOAttachment = createAsyncThunk(
  'purchasing/purchase-order/save-po-attachment',
  async (data, { rejectWithValue }) => {
    try {
      const {
        poId,
        key,
        archived,
        size,
        uploadedDate
      } = data;
      const response = await axios.post('/purchasing/purchase-order/save-po-attachment', {
        poId,
        key,
        archived,
        size,
        uploadedDate
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetPOAttachmentsByPOId = createAsyncThunk(
  'purchasing/purchase-order/get-po-attachments-by-poId',
  async (data, { rejectWithValue }) => {
    try {
      const {
        poId
      } = data;

      const response = await axios.get(`/purchasing/purchase-order/get-po-attachments-by-poId?&poId=${poId}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const UpdatePOAttachmentById = createAsyncThunk(
  'purchasing/purchase-order/update-po-attachment-by-id',
  async (data, { rejectWithValue }) => {
    try {
      const {
        paramsToUpdate,
        poAttachmentId
      } = data;
      const response = await axios.patch('/purchasing/purchase-order/update-po-attachment-by-id', {
        paramsToUpdate,
        poAttachmentId
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const AddPOSlip = createAsyncThunk(
  'purchasing/slip/add-slip',
  async (data, { rejectWithValue }) => {
    try {
      const { addSlip } = data;

      const response = await axios.post('/purchasing/slip/add-slip', {
        addSlip
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetPOSlipNumbers = createAsyncThunk(
  'purchasing/slip/get-all-slip-numbers-by-po-id',
  async (data, { rejectWithValue }) => {
    try {
      const {
        poId
      } = data;
      const response = await axios.get('/purchasing/slip/get-all-slip-numbers-by-po-id', {
        params: {
          poId
        }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetPOSlipById = createAsyncThunk(
  'purchasing/slip/get-slip-by-id',
  async (data, { rejectWithValue }) => {
    try {
      const {
        slipId
      } = data;
      const response = await axios.get('/purchasing/slip/get-slip-by-id', {
        params: {
          slipId
        }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const UpdatePOSlip = createAsyncThunk(
  'purchasing/slip/update-slip',
  async ({ slipId, updateParams }, { rejectWithValue }) => {
    try {
      const response = await axios.put('/purchasing/slip/update-slip', {
        slipId,
        updateParams
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const AddPOSlipItem = createAsyncThunk(
  'purchasing/slip/add-slip-item',
  async (data, { rejectWithValue }) => {
    try {
      const { addSlipItem } = data;

      const response = await axios.post('/purchasing/slip/add-slip-item', {
        addSlipItem
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetPOSlipItemsBySlipId = createAsyncThunk(
  'purchasing/slip/get-slip-items-by-slip-id',
  async (data, { rejectWithValue }) => {
    try {
      const {
        slipId
      } = data;
      const response = await axios.get('/purchasing/slip/get-slip-items-by-slip-id', {
        params: {
          slipId
        }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetAllItemsOfPurchaseOrder = createAsyncThunk(
  'purchasing/purchase-order/get-all-items-of-po',
  async (data, { rejectWithValue }) => {
    try {
      const {
        purchaseOrderId,
        poStatus
      } = data;
      const response = await axios.get('/purchasing/purchase-order/get-items-of-po', {
        params: {
          purchaseOrderId,
          poStatus
        }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetItemsOfSlip = createAsyncThunk(
  'purchasing/purchase-order/get-items-of-slip',
  async (data, { rejectWithValue }) => {
    try {
      const {
        skip,
        limit,
        purchaseOrderId,
        poStatus,
        productIds
      } = data;
      const response = await axios.get('/purchasing/purchase-order/get-items-of-slip', {
        params: {
          skip,
          limit,
          purchaseOrderId,
          poStatus,
          productIds
        }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const UpdatePOSlipItem = createAsyncThunk(
  'purchasing/slip/update-slip-item',
  async ({ slipId, productId, updateParams }, { rejectWithValue }) => {
    try {
      const response = await axios.put('/purchasing/slip/update-slip-item', {
        slipId,
        productId,
        updateParams
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const UpdatePOFollowUp = createAsyncThunk(
  'purchasing/purchase-order/update-po-follow-up',
  async ({ purchaseOrderId, updateParams }, { rejectWithValue }) => {
    try {
      const response = await axios.put('/purchasing/purchase-order/update-details-of-non-confirm-po', {
        purchaseOrderId,
        updateParams
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const UpdatePOWithoutNotification = createAsyncThunk(
  'purchasing/purchase-order/update-po',
  async ({ purchaseOrderId, updateParams }, { rejectWithValue }) => {
    try {
      const response = await axios.put('/purchasing/purchase-order/update-details-of-non-confirm-po', {
        purchaseOrderId,
        updateParams
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const UpdatePOItem = createAsyncThunk(
  'purchasing/po/update-single-po-queue-item',
  async ({ poQueueItemId, updateParams }, { rejectWithValue }) => {
    try {
      const response = await axios.put('/purchasing/po-queue/update-single-po-queue-item', {
        poQueueItemId,
        updateParams
      });

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const DeletePOItems = createAsyncThunk(
  'purchasing/po/remove-items-from-po-queue',
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

export const ConfirmPOSlip = createAsyncThunk(
  'purchasing/slip/confirm-slip',
  async (data, { rejectWithValue }) => {
    try {
      const { slipId } = data;

      const response = await axios.put('/purchasing/slip/confirm-slip', {
        slipId
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

const purchaseOrderSlice = createSlice({
  name: 'purchaseOrderSlice',
  initialState: {
    loading: false,
    success: false,
    notify: false,
    notifyMessage: '',
    notifyType: 'error',
    purchaseOrderHistory: [],
    totalPurchaseOrderHistory: 0,
    purchaseOrderHistoryPageLimit: 100,
    purchaseOrderHistoryPageNumber: 1,
    poCreated: false,
    openPurchaseOrders: [],
    ototalOpenPurchaseOrders: 0,
    openPoCreated: false,
    queueItemsDownloaded: false,
    saveSelectedQueueItemsParams: false,
    saveSelectedSupplierParams: false,
    queueQuantity: {
      unitCost: 0,
      poQuantity: 0
    },
    poNumberLoading: false,
    poNumbers: [],
    purchaseOrderLoading: false,
    purchaseOrder: {},
    itemsOfPOLoading: false,
    itemsOfPO: [],
    totalItemsOfPO: 0,
    itemsOfNonConfirmPOPageLimit: 100,
    itemsOfNonConfirmPOPageNumber: 1,
    itemsOfSlipPageLimit: 100,
    itemsOfSlipPageNumber: 1,
    aggregatedDataOfNOnConfirmPO: {},
    nonConfirmPOs: [],
    totalNonConfirmPOs: 0,
    suppliersOfPO: [],
    supplierLoading: false,
    nonConfirmPOsFilter: {
      supplier: {
        id: '',
        value: '',
        label: ''
      }
    },
    viewNonConfirmPOPageLimit: 100,
    viewNonConfirmPOPageNumber: 1,
    poUpdated: false,
    poDeleted: false,
    supplierItems: [],
    totalSupplierItems: 0,
    supplierItemsPageLimit: 100,
    supplierItemsPageNumber: 1,
    itemsOfSupplierFilters: {
      searchByKeyWords: {
        title: '',
        stockNumber: '',
        mfgPartNo: ''
      }
    },
    itemAddedToNonConfirmPO: false,
    poConfirmed: false,
    confirmPOs: [],
    totalConfirmPOs: 0,
    suppliersOfConfirmPO: [],
    confirmPOsFilter: {
      supplier: {
        id: '',
        value: '',
        label: ''
      },
      extendedFilters: [],
      poStatus: ''
    },
    viewConfirmPOPageLimit: 100,
    viewConfirmPOPageNumber: 1,
    confirmPONumbers: [],
    itemsOfConfirmPO: [],
    totalItemsOfConfirmPO: 0,
    itemsOfConfirmPOPageLimit: 100,
    itemsOfConfirmPOPageNumber: 1,
    confirmPO: {},
    createOpenPOloading: false,
    poAttachments: [],
    addedSlip: false,
    slipNumberLoading: false,
    poSlipNumbers: [],
    AddSlipLoading: false,
    poSlipLoading: false,
    poSlip: {},
    AddSlipItemLoading: false,
    addedSlipItem: false,
    poSlipItemLoading: false,
    poSlipItems: [],
    AllItemsOfPOLoading: false,
    allItemsOfPO: [],
    itemsOfSlipLoading: false,
    itemsOfSlip: [],
    totalItemsOfSlip: 0,
    selectedSupplierPO: {},
    poItemUpdatedLoading: false,
    poItemDeletedLoading: false,
    poItemDeleted: false,
    purchaseOrderUpdateLoading: false,
    updatePoAttachmentLoading: false,
    savePoAttachmentLoading: false,
    getPoAttachmentLoading: false,
    poItemUpdated: false,
    getAggregatedDataOfNonConfirmPOLoading: false,
    newlyAddedPoId: '',
    confirmPOSlipLoading: false
  },
  reducers: {
    SetPurchaseOrderState(state, { payload: { field, value } }) {
      state[field] = value;
    },
    SetPurchaseOrderNotifyState(state, { payload: { message, type } }) {
      state.notify = true;
      state.notifyMessage = message;
      state.notifyType = type;
    }
  },
  extraReducers: {
    [GetPurchaseOrderHitory.pending]: (state) => ({
      ...state,
      success: false,
      purchaseOrderHistoryLoading: true
    }),
    [GetPurchaseOrderHitory.fulfilled]: (state, action) => ({
      ...state,
      purchaseOrderHistoryLoading: false,
      success: true,
      purchaseOrderHistory: action.payload.data.history,
      totalPurchaseOrderHistory: action.payload.data.totalHistories
    }),
    [GetPurchaseOrderHitory.rejected]: (state, action) => ({
      ...state,
      purchaseOrderHistoryLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [CreatePurchaseOrder.pending]: (state) => ({
      ...state,
      loading: true,
      success: false,
      poCreated: false
    }),
    [CreatePurchaseOrder.fulfilled]: (state, action) => ({
      ...state,
      loading: false,
      success: true,
      notifyMessage: action.payload.message,
      newlyAddedPoId: action.payload.data.poIds[0],
      notifyType: 'success',
      notify: true,
      poCreated: true
    }),
    [CreatePurchaseOrder.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      poCreated: false
    }),
    [CreateOpenPurchaseOrder.pending]: (state) => ({
      ...state,
      createOpenPOloading: true,
      success: false,
      openPoCreated: false
    }),
    [CreateOpenPurchaseOrder.fulfilled]: (state, action) => ({
      ...state,
      createOpenPOloading: false,
      success: true,
      notifyMessage: action.payload.message,
      notifyType: 'success',
      notify: true,
      openPoCreated: true,
      newlyAddedPoId: action.payload.data.openQueue
    }),
    [CreateOpenPurchaseOrder.rejected]: (state, action) => ({
      ...state,
      createOpenPOloading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      openPoCreated: false
    }),
    [DownloadPOQueueItems.pending]: (state) => ({
      ...state,
      loading: true,
      saveSelectedSupplierParams: false,
      success: false,
      queueItemsDownloaded: false
    }),
    [DownloadPOQueueItems.fulfilled]: (state) => ({
      ...state,
      loading: false,
      success: true,
      queueItemsDownloaded: true
    }),
    [DownloadPOQueueItems.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      queueItemsDownloaded: false
    }),
    [GetOpenPurchaseOrders.pending]: (state) => ({
      ...state,
      success: false,
      loading: true
    }),
    [GetOpenPurchaseOrders.fulfilled]: (state, action) => ({
      ...state,
      loading: false,
      success: true,
      openPurchaseOrders: action.payload.data.openPOs,
      totalOpenPurchaseOrders: action.payload.data.totalOpenPos
    }),
    [GetOpenPurchaseOrders.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [SaveSelectedPOQueueItemsId.pending]: (state) => ({
      ...state,
      loading: true,
      success: false,
      saveSelectedQueueItemsParams: false
    }),
    [SaveSelectedPOQueueItemsId.fulfilled]: (state) => ({
      ...state,
      loading: false,
      success: true,
      saveSelectedQueueItemsParams: true
    }),
    [SaveSelectedPOQueueItemsId.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      saveSelectedQueueItemsParams: false
    }),
    [GetPONumbers.pending]: (state) => ({
      ...state,
      success: false,
      poNumberLoading: true
    }),
    [GetPONumbers.fulfilled]: (state, action) => ({
      ...state,
      poNumberLoading: false,
      success: true,
      poNumbers: action.payload.data.purchaseOrderNumbers
    }),
    [GetPONumbers.rejected]: (state, action) => ({
      ...state,
      poNumberLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [GetPurchaseOrderById.pending]: (state) => ({
      ...state,
      success: false,
      purchaseOrderLoading: true
    }),
    [GetPurchaseOrderById.fulfilled]: (state, action) => ({
      ...state,
      purchaseOrderLoading: false,
      success: true,
      purchaseOrder: action.payload.data.purchaseOrder
    }),
    [GetPurchaseOrderById.rejected]: (state, action) => ({
      ...state,
      purchaseOrderLoading: false,
      success: false
    }),
    [GetItemsOfPurchaseOrder.pending]: (state) => ({
      ...state,
      success: false,
      itemsOfPOLoading: true
    }),
    [GetItemsOfPurchaseOrder.fulfilled]: (state, action) => ({
      ...state,
      itemsOfPOLoading: false,
      success: true,
      itemsOfPO: action.payload.data.purchaseOrderItems,
      totalItemsOfPO: action.payload.data.totalPurchaseOrderItems
    }),
    [GetItemsOfPurchaseOrder.rejected]: (state, action) => ({
      ...state,
      itemsOfPOLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [GetAggregatedDataOfNonConfirmPO.pending]: (state) => ({
      ...state,
      success: false,
      loading: true,
      getAggregatedDataOfNonConfirmPOLoading: true
    }),
    [GetAggregatedDataOfNonConfirmPO.fulfilled]: (state, action) => ({
      ...state,
      loading: false,
      success: true,
      aggregatedDataOfNOnConfirmPO: action.payload.data.nonConfirmPOs,
      getAggregatedDataOfNonConfirmPOLoading: false
    }),
    [GetAggregatedDataOfNonConfirmPO.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      getAggregatedDataOfNonConfirmPOLoading: false
    }),
    [GetAllNonConfirmPOs.pending]: (state) => ({
      ...state,
      success: false,
      loading: true
    }),
    [GetAllNonConfirmPOs.fulfilled]: (state, action) => ({
      ...state,
      loading: false,
      success: true,
      nonConfirmPOs: action.payload.data.nonConfirmPos,
      totalNonConfirmPOs: action.payload.data.totalNonConfirmPOs
    }),
    [GetAllNonConfirmPOs.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [GetSuppliersOfPO.pending]: (state) => ({
      ...state,
      success: false,
      supplierLoading: true
    }),
    [GetSuppliersOfPO.fulfilled]: (state, action) => ({
      ...state,
      supplierLoading: false,
      success: true,
      suppliersOfPO: action.payload.data.suppliers
    }),
    [GetSuppliersOfPO.rejected]: (state, action) => ({
      ...state,
      supplierLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [UpdatePurchaseOrder.pending]: (state, action) => {
      const { editAction } = action.meta.arg;

      const updateLoading = {};

      if (editAction === 'poDetailEdit') {
        extend(updateLoading, { purchaseOrderUpdateLoading: true });
      } else if (editAction === 'discountUpdate') {
        extend(updateLoading, { getAggregatedDataOfNonConfirmPOLoading: true });
      }

      return {
        ...state,
        success: false,
        ...updateLoading,
        poUpdated: false
      };
    },
    [UpdatePurchaseOrder.fulfilled]: (state, action) => {
      const { editAction } = action.payload;
      const { updatedPurchaseOrder } = action.payload.data;
      const { purchaseOrderId, ...restParams } = updatedPurchaseOrder;

      const currentState = current(state);
      let purchaseOrderCopy = cloneDeep(currentState.purchaseOrder);

      const updateLoading = {};

      if (purchaseOrderCopy._id === purchaseOrderId) {
        purchaseOrderCopy = {
          ...purchaseOrderCopy,
          ...restParams
        };
      }

      if (editAction === 'poDetailEdit') {
        extend(updateLoading, { purchaseOrderUpdateLoading: false });
      } else if (editAction === 'discountUpdate') {
        extend(updateLoading, { getAggregatedDataOfNonConfirmPOLoading: false });
      }

      return {
        ...state,
        ...updateLoading,
        success: true,
        notifyMessage: action.payload.message,
        notifyType: 'success',
        notify: true,
        purchaseOrder: purchaseOrderCopy,
        poUpdated: true
      };
    },
    [UpdatePurchaseOrder.rejected]: (state, action) => ({
      ...state,
      purchaseOrderUpdateLoading: false,
      getAggregatedDataOfNonConfirmPOLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      error: action.payload.error,
      poUpdated: false
    }),
    [DeletePOById.pending]: (state) => ({
      ...state,
      success: false,
      purchaseOrderLoading: true,
      poDeleted: false
    }),
    [DeletePOById.fulfilled]: (state, action) => ({
      ...state,
      purchaseOrderLoading: false,
      success: true,
      notifyMessage: action.payload.message,
      notifyType: 'success',
      poDeleted: true,
      notify: true
    }),
    [DeletePOById.rejected]: (state, action) => ({
      ...state,
      purchaseOrderLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      poDeleted: false,
      notifyType: 'error',
      notify: true
    }),
    [GetItemsOfSupplierForNonConfirmPO.pending]: (state) => ({
      ...state,
      success: false,
      loading: true
    }),
    [GetItemsOfSupplierForNonConfirmPO.fulfilled]: (state, action) => ({
      ...state,
      loading: false,
      success: true,
      supplierItems: action.payload.data.supplierItems,
      totalSupplierItems: action.payload.data.totalSupplierItems
    }),
    [GetItemsOfSupplierForNonConfirmPO.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [DownloadPurchaseOrderXlsxSheet.pending]: (state) => ({
      ...state,
      loading: true,
      success: false
    }),
    [DownloadPurchaseOrderXlsxSheet.fulfilled]: (state) => ({
      ...state,
      loading: false,
      success: true
    }),
    [DownloadPurchaseOrderXlsxSheet.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [AddItemsToNonConfirmPO.pending]: (state) => ({
      ...state,
      loading: true,
      success: false,
      itemAddedToNonConfirmPO: false
    }),
    [AddItemsToNonConfirmPO.fulfilled]: (state, action) => ({
      ...state,
      loading: false,
      success: true,
      notifyMessage: action.payload.message,
      notifyType: 'success',
      notify: true,
      itemAddedToNonConfirmPO: true
    }),
    [AddItemsToNonConfirmPO.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      itemAddedToNonConfirmPO: false
    }),
    [ConfirmPO.pending]: (state) => ({
      ...state,
      success: false,
      loading: true,
      poConfirmed: false
    }),
    [ConfirmPO.fulfilled]: (state, action) => ({
      ...state,
      loading: false,
      success: true,
      notifyMessage: action.payload.message,
      notifyType: 'success',
      notify: true,
      poConfirmed: true
    }),
    [ConfirmPO.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      error: action.payload.error,
      poConfirmed: false
    }),
    [UpdatePOQuantityAndCost.pending]: (state) => ({
      ...state,
      success: false,
      loading: true
    }),
    [UpdatePOQuantityAndCost.fulfilled]: (state, action) => ({
      ...state,
      loading: false,
      success: true,
      notifyMessage: action.payload.message,
      notifyType: 'success',
      notify: true
    }),
    [UpdatePOQuantityAndCost.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      error: action.payload.error
    }),
    [GetAllConfirmPOs.pending]: (state) => ({
      ...state,
      success: false,
      loading: true
    }),
    [GetAllConfirmPOs.fulfilled]: (state, action) => ({
      ...state,
      loading: false,
      success: true,
      confirmPOs: action.payload.data.confirmPos,
      totalConfirmPOs: action.payload.data.totalConfirmPOs
    }),
    [GetAllConfirmPOs.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [GetSuppliersOfConfirmPO.pending]: (state) => ({
      ...state,
      success: false,
      supplierLoading: true
    }),
    [GetSuppliersOfConfirmPO.fulfilled]: (state, action) => ({
      ...state,
      supplierLoading: false,
      success: true,
      suppliersOfConfirmPO: action.payload.data.suppliers
    }),
    [GetSuppliersOfConfirmPO.rejected]: (state, action) => ({
      ...state,
      supplierLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [GetConfirmPONumbers.pending]: (state) => ({
      ...state,
      success: false,
      poNumberLoading: true
    }),
    [GetConfirmPONumbers.fulfilled]: (state, action) => ({
      ...state,
      poNumberLoading: false,
      success: true,
      confirmPONumbers: action.payload.data.purchaseOrderNumbers
    }),
    [GetConfirmPONumbers.rejected]: (state, action) => ({
      ...state,
      poNumberLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [GetItemsOfConfirmPO.pending]: (state) => ({
      ...state,
      success: false,
      itemsOfPOLoading: true
    }),
    [GetItemsOfConfirmPO.fulfilled]: (state, action) => ({
      ...state,
      itemsOfPOLoading: false,
      success: true,
      itemsOfConfirmPO: action.payload.data.purchaseOrderItems,
      totalItemsOfConfirmPO: action.payload.data.totalPurchaseOrderItems
    }),
    [GetItemsOfConfirmPO.rejected]: (state, action) => ({
      ...state,
      itemsOfPOLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [GetConfirmPOById.pending]: (state) => ({
      ...state,
      success: false,
      purchaseOrderLoading: true
    }),
    [GetConfirmPOById.fulfilled]: (state, action) => ({
      ...state,
      purchaseOrderLoading: false,
      success: true,
      confirmPO: action.payload.data.purchaseOrder
    }),
    [GetConfirmPOById.rejected]: (state, action) => ({
      ...state,
      purchaseOrderLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [SendPOEmail.pending]: (state) => ({
      ...state,
      success: false,
      loading: true
    }),
    [SendPOEmail.fulfilled]: (state, action) => ({
      ...state,
      loading: false,
      success: true,
      notifyMessage: 'Email request has been sent, \n kindly check the notification for confirmation',
      notifyType: 'success',
      notify: true
    }),
    [SendPOEmail.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      error: action.payload.error
    }),
    [DownloadPurchaseOrderPdf.pending]: (state) => ({
      ...state,
      success: false,
      loading: true
    }),
    [DownloadPurchaseOrderPdf.fulfilled]: (state, action) => ({
      ...state,
      loading: false,
      success: true
    }),
    [DownloadPurchaseOrderPdf.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [DownloadPurchaseOrderXlsxSheet.pending]: (state) => ({
      ...state,
      success: false,
      loading: true
    }),
    [DownloadPurchaseOrderXlsxSheet.fulfilled]: (state, action) => ({
      ...state,
      loading: false,
      success: true
    }),
    [DownloadPurchaseOrderXlsxSheet.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [SavePOAttachment.pending]: (state) => ({
      ...state,
      success: false,
      poAttachmentloading: true,
      savePoAttachmentLoading: true
    }),
    [SavePOAttachment.fulfilled]: (state, action) => {
      const currentState = current(state);
      const poAttachmentsList = cloneDeep(currentState.poAttachments);
      const { poAttachmentAdded } = action.payload.data;

      poAttachmentsList.unshift(poAttachmentAdded);
      return {
        ...state,
        poAttachmentloading: false,
        savePoAttachmentLoading: false,
        success: true,
        poAttachments: poAttachmentsList
      };
    },
    [SavePOAttachment.rejected]: (state, action) => ({
      ...state,
      poAttachmentloading: false,
      savePoAttachmentLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [GetPOAttachmentsByPOId.pending]: (state) => ({
      ...state,
      success: false,
      loading: true,
      getPoAttachmentLoading: true
    }),
    [GetPOAttachmentsByPOId.fulfilled]: (state, action) => ({
      ...state,
      loading: false,
      success: true,
      getPoAttachmentLoading: false,
      poAttachments: action.payload.data.poAttachments
    }),
    [GetPOAttachmentsByPOId.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      getPoAttachmentLoading: false
    }),
    [UpdatePOAttachmentById.pending]: (state) => ({
      ...state,
      success: false,
      poAttachmentloading: true,
      updatePoAttachmentLoading: true
    }),
    [UpdatePOAttachmentById.fulfilled]: (state, action) => {
      const currentState = current(state);
      let poAttachmentsList = cloneDeep(currentState.poAttachments);
      const { poAttachmentId } = action.payload.data;

      poAttachmentsList = poAttachmentsList.filter(
        (doc) => String(doc._id) !== poAttachmentId
      );
      return {
        ...state,
        poAttachmentloading: false,
        updatePoAttachmentLoading: false,
        success: true,
        notify: true,
        notifyType: 'success',
        notifyMessage: action.payload.message,
        poAttachments: poAttachmentsList
      };
    },
    [UpdatePOAttachmentById.rejected]: (state, action) => ({
      ...state,
      poAttachmentloading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      updatePoAttachmentLoading: false
    }),
    [AddPOSlip.pending]: (state) => ({
      ...state,
      AddSlipLoading: true,
      success: false,
      addedSlip: false
    }),
    [AddPOSlip.fulfilled]: (state, action) => {
      const currentState = current(state);
      const slipDetailsList = cloneDeep(currentState.poSlipNumbers);
      const { newSlip } = action.payload.data;

      if (!isEmpty(newSlip)) {
        const { _id, slipNo } = newSlip;
        slipDetailsList.unshift({ _id, slipNo });
      }

      return {
        ...state,
        AddSlipLoading: false,
        success: true,
        notifyMessage: action.payload.message,
        notifyType: 'success',
        notify: true,
        poSlipNumbers: slipDetailsList,
        addedSlip: true
      };
    },
    [AddPOSlip.rejected]: (state, action) => ({
      ...state,
      AddSlipLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      error: action.payload.error,
      addedSlip: false
    }),
    [GetPOSlipNumbers.pending]: (state) => ({
      ...state,
      success: false,
      slipNumberLoading: true
    }),
    [GetPOSlipNumbers.fulfilled]: (state, action) => ({
      ...state,
      slipNumberLoading: false,
      success: true,
      poSlipNumbers: action.payload.data.poSlips
    }),
    [GetPOSlipNumbers.rejected]: (state, action) => ({
      ...state,
      slipNumberLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [GetPOSlipById.pending]: (state) => ({
      ...state,
      success: false,
      poSlipLoading: true
    }),
    [GetPOSlipById.fulfilled]: (state, action) => ({
      ...state,
      poSlipLoading: false,
      success: true,
      poSlip: action.payload.data.slip
    }),
    [GetPOSlipById.rejected]: (state) => ({
      ...state,
      poSlipLoading: false,
      success: false
    }),
    [UpdatePOSlip.pending]: (state) => ({
      ...state,
      success: false,
      slipUpdateLoading: true,
      slipUpdated: false
    }),
    [UpdatePOSlip.fulfilled]: (state, action) => ({
      ...state,
      slipUpdateLoading: false,
      success: true,
      notifyMessage: action.payload.message,
      notifyType: 'success',
      notify: true,
      slipUpdated: true
    }),
    [UpdatePOSlip.rejected]: (state, action) => ({
      ...state,
      slipUpdateLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      error: action.payload.error,
      slipUpdated: false
    }),
    [AddPOSlipItem.pending]: (state) => ({
      ...state,
      AddSlipItemLoading: true,
      success: false,
      addedSlipItem: false
    }),
    [AddPOSlipItem.fulfilled]: (state, action) => ({
      ...state,
      AddSlipItemLoading: false,
      success: true,
      notifyMessage: action.payload.message,
      notifyType: 'success',
      notify: true,
      poSlipItems: action.payload.data.newSlipItem,
      addedSlipItem: true
    }),
    [AddPOSlipItem.rejected]: (state, action) => ({
      ...state,
      AddSlipItemLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      error: action.payload.error,
      addedSlipItem: false
    }),
    [GetPOSlipItemsBySlipId.pending]: (state) => ({
      ...state,
      success: false,
      poSlipItemLoading: true
    }),
    [GetPOSlipItemsBySlipId.fulfilled]: (state, action) => ({
      ...state,
      poSlipItemLoading: false,
      success: true,
      poSlipItems: action.payload.data.slipItems
    }),
    [GetPOSlipItemsBySlipId.rejected]: (state) => ({
      ...state,
      poSlipItemLoading: false,
      success: false
    }),
    [GetAllItemsOfPurchaseOrder.pending]: (state) => ({
      ...state,
      success: false,
      AllItemsOfPOLoading: true
    }),
    [GetAllItemsOfPurchaseOrder.fulfilled]: (state, action) => ({
      ...state,
      AllItemsOfPOLoading: false,
      success: true,
      allItemsOfPO: action.payload.data.purchaseOrderItems
    }),
    [GetAllItemsOfPurchaseOrder.rejected]: (state, action) => ({
      ...state,
      AllItemsOfPOLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [GetItemsOfSlip.pending]: (state) => ({
      ...state,
      success: false,
      itemsOfSlipLoading: true
    }),
    [GetItemsOfSlip.fulfilled]: (state, action) => ({
      ...state,
      itemsOfSlipLoading: false,
      success: true,
      itemsOfSlip: action.payload.data.purchaseOrderItems,
      totalItemsOfSlip: action.payload.data.totalPurchaseOrderItems
    }),
    [GetItemsOfSlip.rejected]: (state, action) => ({
      ...state,
      itemsOfSlipLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [UpdatePOSlipItem.pending]: (state) => ({
      ...state,
      success: false
    }),
    [UpdatePOSlipItem.fulfilled]: (state, action) => ({
      ...state,
      success: true,
      notifyMessage: action.payload.message,
      notifyType: 'success',
      notify: true
    }),
    [UpdatePOSlipItem.rejected]: (state, action) => ({
      ...state,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      error: action.payload.error
    }),
    [UpdatePOFollowUp.pending]: (state) => ({
      ...state,
      success: false,
      loading: true,
      poUpdated: false
    }),
    [UpdatePOFollowUp.fulfilled]: (state, action) => ({
      ...state,
      loading: false,
      success: true,
      notifyMessage: 'PO Follow Up Updated',
      notifyType: 'success',
      notify: true,
      poUpdated: true
    }),
    [UpdatePOFollowUp.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      error: action.payload.error,
      poUpdated: false
    }),
    [UpdatePOWithoutNotification.pending]: (state) => ({
      ...state,
      success: false,
      loading: true,
      poUpdated: false
    }),
    [UpdatePOWithoutNotification.fulfilled]: (state) => ({
      ...state,
      loading: false,
      success: true,
      poUpdated: true
    }),
    [UpdatePOWithoutNotification.rejected]: (state) => ({
      ...state,
      loading: false,
      success: false,
      poUpdated: false
    }),
    [UpdatePOItem.pending]: (state) => ({
      ...state,
      success: false,
      poItemUpdatedLoading: true,
      poItemUpdated: false
    }),
    [UpdatePOItem.fulfilled]: (state, action) => {
      const currentState = current(state);

      const itemsOfPOList = cloneDeep(currentState.itemsOfPO);

      const {
        poQueueItemId,
        poQuantity,
        unitCost,
        receivedQuantity
      } = action.payload.data.updatedPoQueueItem;

      const pOItemIndex = itemsOfPOList.findIndex(
        (doc) => doc.poQueueItemId === (poQueueItemId)
      );

      if (pOItemIndex > -1) {
        if (itemsOfPOList[pOItemIndex]?.poQueueItem) {
          if (unitCost) itemsOfPOList[pOItemIndex].poQueueItem.unitCost = unitCost;
          if (poQuantity) itemsOfPOList[pOItemIndex].poQueueItem.poQuantity = poQuantity;
          if (receivedQuantity) {
            itemsOfPOList[pOItemIndex].poQueueItem.receivedQuantity = receivedQuantity;
          }
        }
      }

      return {
        ...state,
        poItemUpdatedLoading: false,
        success: true,
        notifyMessage: action.payload.message,
        notifyType: 'success',
        notify: true,
        itemsOfPO: itemsOfPOList,
        poItemUpdated: true
      };
    },
    [UpdatePOItem.rejected]: (state, action) => ({
      ...state,
      poItemUpdatedLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      error: action.payload.error,
      poItemUpdated: false
    }),
    [DeletePOItems.pending]: (state) => ({
      ...state,
      success: false,
      loading: true,
      poItemDeletedLoading: true,
      poItemDeleted: false
    }),
    [DeletePOItems.fulfilled]: (state, action) => ({
      ...state,
      success: true,
      notifyMessage: action.payload.message,
      notifyType: 'success',
      poItemDeleted: true,
      poItemDeletedLoading: false,
      notify: true
    }),
    [DeletePOItems.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      poItemDeleted: false,
      notifyType: 'error',
      poItemDeletedLoading: false,
      notify: true
    }),
    [ConfirmPOSlip.pending]: (state) => ({
      ...state,
      success: false,
      loading: true,
      confirmPOSlipLoading: true
    }),
    [ConfirmPOSlip.fulfilled]: (state, action) => {
      const { confirmedSlip } = action.payload.data;

      const currentState = current(state);
      const poSlipCopy = cloneDeep(currentState.poSlip);
      if (poSlipCopy._id === confirmedSlip.slipId) {
        poSlipCopy.slipStatus = confirmedSlip.slipStatus;
      }

      return {
        ...state,
        success: true,
        confirmPOSlipLoading: false,
        notifyMessage: action.payload.message,
        notifyType: 'success',
        notify: true,
        poSlip: poSlipCopy
      };
    },
    [ConfirmPOSlip.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      confirmPOSlipLoading: true,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    })
  }
});

const { reducer, actions } = purchaseOrderSlice;

export const { SetPurchaseOrderState, SetPurchaseOrderNotifyState } = actions;

export default reducer;
