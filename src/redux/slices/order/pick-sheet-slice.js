import CryptoJS from 'crypto-js';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { HandleCatchBlock } from '../../../../utils/helpers';
import { axiosBaseUrl } from '../../../config/axios-configuration';

const axios = axiosBaseUrl();

export const GetPickSheetOrders = createAsyncThunk(
  'pickSheetOrder/get-commit-orders',
  async (data, { rejectWithValue }) => {
    try {
      const {
        filters,
        skip,
        limit,
        sortBy
      } = data;

      const response = await axios.get('order-pick-sheet/get-commit-orders', {
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

export const DownloadOrders = createAsyncThunk(
  'pickSheetOrder/save-export-orders-params-and-download',
  async (data, { rejectWithValue }) => {
    try {
      const { selectIds, salesChannel, userId } = data;

      const jsonSelectedOrdersId = JSON.stringify(selectIds);
      const blobSelectedOrdersId = new Blob([jsonSelectedOrdersId], {
        type: 'application/json'
      });

      const formData = new FormData();

      formData.append('selectedOrdersId', blobSelectedOrdersId);
      formData.append('salesChannel', salesChannel);

      const response = await axios.post('/order/save-export-orders-params', formData);
      const userIdJson = CryptoJS.AES.encrypt(String(userId), process.env.HASH).toString();
      const userIdData = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(userIdJson));
      const url = `${process.env.API_URL}/non-secure-route/download-pick-sheet-orders?userId=${userIdData}`;
      window.open(url, '_blank');
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const SaveSelectedOrdersId = createAsyncThunk(
  'pickSheetOrder/save-export-orders-params',
  async (data, { rejectWithValue }) => {
    try {
      const { selectIds, salesChannel } = data;

      const jsonSelectedOrdersId = JSON.stringify(selectIds);
      const blobSelectedOrdersId = new Blob([jsonSelectedOrdersId], {
        type: 'application/json'
      });

      const formData = new FormData();

      formData.append('selectedOrdersId', blobSelectedOrdersId);
      formData.append('salesChannel', salesChannel);

      const response = await axios.post('/order/save-export-orders-params', formData);
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetOrdersForPrintSheet = createAsyncThunk(
  'pickSheetOrder/get-selected-orders',
  async (data, { rejectWithValue }) => {
    try {
      const {
        userId,
        skip,
        limit
      } = data;

      const response = await axios.get('order-pick-sheet/get-selected-orders', {
        params: {
          userId,
          skip,
          limit
        }
      });

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const AddOrderBatch = createAsyncThunk(
  'pickSheetOrder/add-order-batch',
  async (data, { rejectWithValue }) => {
    try {
      const {
        orderNumberList,
        printedFormat
      } = data;

      const response = await axios.post('order-pick-sheet/add-order-batch', {
        orderNumberList,
        printedFormat
      });

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetOrderBatchDetails = createAsyncThunk(
  'pickSheetOrder/get-batch-details',
  async (data, { rejectWithValue }) => {
    try {
      const {
        skip,
        limit,
        sortBy
      } = data;

      const response = await axios.get('order-pick-sheet/get-batch-details', {
        params: {
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

export const DownloadOrderBatch = createAsyncThunk(
  'pickSheetOrder/download-order-batch-pdf',
  async (data, { rejectWithValue }) => {
    try {
      const { batchId, userId } = data;

      const url = `${process.env.API_URL}/non-secure-route/download-order-batch-pdf?userId=${userId}&batchId=${batchId}`;
      window.open(url, '_blank');
      return 0;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetPickSheetPrintableData = createAsyncThunk(
  'pickSheetOrder/get-printable-data',
  async (data, { rejectWithValue }) => {
    try {
      const {
        batchId,
        orderIdsList
      } = data;

      const response = await axios.get('order-pick-sheet/get-printable-data', {
        params: {
          batchId,
          orderIdsList: JSON.stringify(orderIdsList)
        }
      });

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetOrderInvoicePrintableData = createAsyncThunk(
  'order/get-print-order-invoice-data',
  async (data, { rejectWithValue }) => {
    try {
      const {
        batchId,
        orderIdsList
      } = data;

      const response = await axios.get('order/get-print-order-invoice-data', {
        params: {
          batchId,
          orderIdsList: JSON.stringify(orderIdsList)

        }
      });

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const PrintOrderInvoices = createAsyncThunk(
  'pickSheetOrder/download-invoices',
  async (data, { rejectWithValue }) => {
    try {
      const { batchId, userId } = data;
      const url = `${process.env.API_URL}/non-secure-route/download-order-invoices-for-order-batch?userId=${userId}&batchId=${batchId}`;

      window.open(url, '_blank');

      return 0;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetPickSheetAndPackingSlipPrintableData = createAsyncThunk(
  'pickSheetOrder/get-pick-sheet-and-order-invoice-printable-data',
  async (data, { rejectWithValue }) => {
    try {
      const {
        batchId,
        orderIdsList
      } = data;

      const response = await axios.get('order-pick-sheet/get-pick-sheet-and-order-invoice-printable-data', {
        params: {
          batchId,
          orderIdsList: JSON.stringify(orderIdsList)
        }
      });

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

const pickSheetOrder = createSlice({
  name: 'pickSheetOrder',
  initialState: {
    success: false,
    notify: false,
    notifyMessage: '',
    notifyType: 'error',
    pickSheetOrders: [],
    totalPickSheetOrders: 0,
    pickSheetFilters: {
      pickSheetPageNumber: 1,
      pickSheetPageLimit: 100,
      salesChannel: '',
      searchByKeyWords: { orderNo: '' }
    },
    selectedOrders: [],
    totalSelectedOrders: 0,
    printSheetLoading: false,
    orderBatches: [],
    totalBatches: 0,
    addOrderSuccess: false,
    saveSelectedOrders: false,
    batchCreated: false,
    batchId: '',
    pickSheetPrintableData: {},
    orderInvoicePrintableData: {},
    pdfDataLoading: false,
    batchPickId: '',
    printDataSuccess: false
  },
  reducers: {
    SetOrderPickSheetState(state, { payload: { field, value } }) {
      state[field] = value;
    },
    SetOrderPickSheetNotifyState(state, { payload: { message, type } }) {
      state.notify = true;
      state.notifyMessage = message;
      state.notifyType = type;
    }
  },
  extraReducers: {
    [GetPickSheetOrders.pending]: (state) => ({
      ...state,
      success: false,
      loading: true
    }),
    [GetPickSheetOrders.fulfilled]: (state, action) => ({
      ...state,
      success: true,
      loading: false,
      pickSheetOrders: action.payload.data.committedOrders,
      totalPickSheetOrders: action.payload.data.totalCommittedOrders
    }),
    [GetPickSheetOrders.rejected]: (state, action) => ({
      ...state,
      success: false,
      loading: false,
      notifyMessage: action.payload.error || 'Error',
      notifyType: 'error',
      notify: true
    }),
    [DownloadOrders.pending]: (state) => ({
      ...state,
      success: false,
      ordersDownloaded: false
    }),
    [DownloadOrders.fulfilled]: (state) => ({
      ...state,
      success: true,
      ordersDownloaded: true
    }),
    [DownloadOrders.rejected]: (state, action) => ({
      ...state,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      ordersDownloaded: false
    }),
    [SaveSelectedOrdersId.pending]: (state) => ({
      ...state,
      saveSelectedOrders: false,
      printSheetLoading: true
    }),
    [SaveSelectedOrdersId.fulfilled]: (state) => ({
      ...state,
      saveSelectedOrders: true
    }),
    [SaveSelectedOrdersId.rejected]: (state, action) => ({
      ...state,
      saveSelectedOrders: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [GetOrdersForPrintSheet.pending]: (state) => ({
      ...state,
      success: false,
      printSheetLoading: true
    }),
    [GetOrdersForPrintSheet.fulfilled]: (state, action) => ({
      ...state,
      success: true,
      printSheetLoading: false,
      selectedOrders: action.payload.data.selectedOrders,
      totalSelectedOrders: action.payload.data.totalSelectedOrders
    }),
    [GetOrdersForPrintSheet.rejected]: (state, action) => ({
      ...state,
      success: false,
      printSheetLoading: false,
      notifyMessage: action.payload.error || 'Error',
      notifyType: 'error',
      notify: true
    }),
    [AddOrderBatch.pending]: (state) => ({
      ...state,
      addOrderSuccess: false,
      printSheetLoading: true,
      batchCreated: false
    }),
    [AddOrderBatch.fulfilled]: (state, action) => ({
      ...state,
      addOrderSuccess: true,
      printSheetLoading: false,
      batchCreated: true,
      batchId: action.payload.data.orderBatch._id,
      batchPickId: action.payload.data.orderBatch.batchPickId,
      notify: true,
      notifyMessage: 'Order Batch created successfully!',
      notifyType: 'success'
    }),
    [AddOrderBatch.rejected]: (state, action) => ({
      ...state,
      addOrderSuccess: false,
      printSheetLoading: false,
      notifyMessage: action.payload.error || 'Error',
      notifyType: 'error',
      notify: true,
      batchCreated: false
    }),
    [GetOrderBatchDetails.pending]: (state) => ({
      ...state,
      success: false,
      loading: true
    }),
    [GetOrderBatchDetails.fulfilled]: (state, action) => ({
      ...state,
      success: true,
      loading: false,
      orderBatches: action.payload.data.orderBatches,
      totalBatches: action.payload.data.totalBatches
    }),
    [GetOrderBatchDetails.rejected]: (state, action) => ({
      ...state,
      success: false,
      loading: false,
      notifyMessage: action.payload.error || 'Error',
      notifyType: 'error',
      notify: true
    }),
    [DownloadOrderBatch.pending]: (state) => ({
      ...state,
      success: false
    }),
    [DownloadOrderBatch.fulfilled]: (state) => ({
      ...state,
      success: true
    }),
    [DownloadOrderBatch.rejected]: (state, action) => ({
      ...state,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [PrintOrderInvoices.pending]: (state) => ({
      ...state,
      success: false
    }),
    [PrintOrderInvoices.fulfilled]: (state) => ({
      ...state,
      success: true
    }),
    [PrintOrderInvoices.rejected]: (state, action) => ({
      ...state,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      success: false
    }),
    [GetPickSheetPrintableData.pending]: (state) => ({
      ...state,
      pdfDataLoading: true,
      pickSheetPrintableData: {},
      printDataSuccess: false
    }),
    [GetPickSheetPrintableData.fulfilled]: (state, action) => ({
      ...state,
      pdfDataLoading: false,
      pickSheetPrintableData: action.payload.data,
      printDataSuccess: true
    }),
    [GetPickSheetPrintableData.rejected]: (state, action) => ({
      ...state,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      pdfDataLoading: false,
      pickSheetPrintableData: {},
      notify: true,
      printDataSuccess: false
    }),
    [GetOrderInvoicePrintableData.pending]: (state) => ({
      ...state,
      pdfDataLoading: true,
      orderInvoicePrintableData: {},
      printDataSuccess: false
    }),
    [GetOrderInvoicePrintableData.fulfilled]: (state, action) => ({
      ...state,
      printDataSuccess: true,
      pdfDataLoading: false,
      orderInvoicePrintableData: action.payload.data
    }),
    [GetOrderInvoicePrintableData.rejected]: (state, action) => ({
      ...state,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      pdfDataLoading: false,
      orderInvoicePrintableData: {},
      notify: true,
      printDataSuccess: false
    }),
    [GetPickSheetAndPackingSlipPrintableData.pending]: (state) => ({
      ...state,
      pdfDataLoading: true,
      printDataSuccess: false,
      pickSheetPrintableData: {},
      orderInvoicePrintableData: {}
    }),
    [GetPickSheetAndPackingSlipPrintableData.fulfilled]: (state, action) => ({
      ...state,
      printDataSuccess: true,
      pdfDataLoading: false,
      pickSheetPrintableData: action.payload.data.pickSheetData,
      orderInvoicePrintableData: action.payload.data.printInvoiceData
    }),
    [GetPickSheetAndPackingSlipPrintableData.rejected]: (state, action) => ({
      ...state,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      pdfDataLoading: false,
      pickSheetPrintableData: {},
      orderInvoicePrintableData: {},
      notify: true,
      printDataSuccess: false
    })
  }
});

const { reducer, actions } = pickSheetOrder;

export const { SetOrderPickSheetState, SetOrderPickSheetNotifyState } = actions;

export default reducer;
