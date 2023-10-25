import { cloneDeep } from 'lodash';
import { createSlice, createAsyncThunk, current } from '@reduxjs/toolkit';

import { HandleCatchBlock } from '../../../../utils/helpers';
import { axiosBaseUrl } from '../../../config/axios-configuration';

const axios = axiosBaseUrl();

export const GetProcessOrders = createAsyncThunk(
  'order/get-printed-orders',
  async (data, { rejectWithValue }) => {
    try {
      const {
        filters,
        skip,
        limit,
        sortBy
      } = data;

      const response = await axios.get('order/get-printed-orders', {
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

export const SaveSelectedProcessOrders = createAsyncThunk(
  'order/save-export-printed-orders',
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

      const response = await axios.post('/order/save-export-printed-orders', formData);
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetItemsOfProcessOrder = createAsyncThunk(
  'order/get-items-of-process-order',
  async (data, { rejectWithValue }) => {
    try {
      const {
        orderId,
        skip,
        limit
      } = data;

      const response = await axios.get('order/get-items-of-process-order', {
        params: {
          orderId,
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

export const AddBox = createAsyncThunk(
  'box/add-box',
  async (data, { rejectWithValue }) => {
    try {
      const { addBox } = data;

      const response = await axios.post('box/add-box', {
        addBox
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetBoxesByOrderId = createAsyncThunk(
  'box/get-all-boxes-by-order-id',
  async (data, { rejectWithValue }) => {
    try {
      const {
        orderId
      } = data;
      const response = await axios.get('/box/get-all-boxes-by-order-id', {
        params: {
          orderId
        }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const DeleteBoxById = createAsyncThunk(
  'box/delete-box',
  async (data, { rejectWithValue }) => {
    try {
      const {
        boxId,
        orderId
      } = data;
      const response = await axios.delete('/box/delete-box', {
        data: {
          boxId,
          orderId
        }

      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const AddBoxItem = createAsyncThunk(
  'box/add-box-item',
  async (data, { rejectWithValue }) => {
    try {
      const { addBoxItem } = data;

      const response = await axios.post('/box/add-box-item', {
        addBoxItem
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetBoxItemsByBoxIds = createAsyncThunk(
  'box/get-box-items-by-box-ids',
  async (data, { rejectWithValue }) => {
    try {
      const {
        boxIds
      } = data;
      const response = await axios.get('/box/get-box-items-by-box-ids', {
        params: {
          boxIds
        }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetBoxLogsByBoxId = createAsyncThunk(
  'box/get-box-logs-by-box-id',
  async (data, { rejectWithValue }) => {
    try {
      const {
        boxId
      } = data;
      const response = await axios.get('/box/get-box-logs-by-box-id', {
        params: {
          boxId
        }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const UpdateBox = createAsyncThunk(
  'box/update-box',
  async (data, { rejectWithValue }) => {
    try {
      const { boxId, updateParams } = data;

      const response = await axios.patch('box/update-box', {
        boxId, updateParams
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const UpdateBoxDetail = createAsyncThunk(
  'box/update-box-detail',
  async (data, { rejectWithValue }) => {
    try {
      const { boxId, orderId, isPrint } = data;

      const response = await axios.patch('box/update-box-detail', {
        boxId, orderId, isPrint
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetProductBoxDimensionById = createAsyncThunk(
  'product/get-product-box-dimension-by-id',
  async (data, { rejectWithValue }) => {
    try {
      const { productId } = data;
      const response = await axios.get('/product/get-product-box-dimension-by-id', {
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

const processOrder = createSlice({
  name: 'processOrder',
  initialState: {
    processOrderFilters: {
      processOrderPageNumber: 1,
      processOrderPageLimit: 100,
      salesChannel: '',
      orderStatus: '',
      searchByKeyWords: { orderNo: '' }
    },
    processOrders: [],
    totalProcessOrders: 0,
    selectLookUpProcess: false,
    saveOrderJobTriggered: false,
    itemsOfProcessOrderPageNumber: 1,
    itemsOfProcessOrderPageLimit: 100,
    addBoxLoading: false,
    addedBox: false,
    newBox: {},
    boxDeleted: false,
    deleteBoxLoading: false,
    addBoxItemLoading: false,
    addedBoxItem: false,
    itemsOfProcessOrderLoading: false,
    updateBoxLoading: false,
    updatedBox: false,
    editedBox: false,
    notify: false,
    notifyMessage: '',
    notifyType: 'error',
    productBoxDimension: {},
    productDimensionsFetched: false,
    itemsOfProcessOrder: [],
    openModal: {},
    updatedBoxDetail: false,
    updateBoxDetailLoading: false,
    editedBoxDetail: {}
  },
  reducers: {
    SetProcessOrderState(state, { payload: { field, value } }) {
      state[field] = value;
    },
    SetProcessOrderNotifyState(state, { payload: { message, type } }) {
      state.notify = true;
      state.notifyMessage = message;
      state.notifyType = type;
    }
  },
  extraReducers: {
    [GetProcessOrders.pending]: (state) => ({
      ...state,
      success: false,
      getProcessOrdersLoading: true
    }),
    [GetProcessOrders.fulfilled]: (state, action) => ({
      ...state,
      success: true,
      getProcessOrdersLoading: false,
      processOrders: action.payload.data.orders,
      totalProcessOrders: action.payload.data.totalOrders
    }),
    [GetProcessOrders.rejected]: (state, action) => ({
      ...state,
      success: false,
      getProcessOrdersLoading: false,
      notifyMessage: action.payload.error || 'Error',
      notifyType: 'error',
      notify: true
    }),
    [SaveSelectedProcessOrders.pending]: (state) => ({
      ...state,
      success: false,
      saveSelectedOrdersParams: false
    }),
    [SaveSelectedProcessOrders.fulfilled]: (state) => ({
      ...state,
      success: true,
      saveSelectedOrdersParams: true
    }),
    [SaveSelectedProcessOrders.rejected]: (state, action) => ({
      ...state,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      saveSelectedOrdersParams: false
    }),
    [GetItemsOfProcessOrder.pending]: (state) => ({
      ...state,
      success: false,
      itemsOfProcessOrderLoading: true
    }),
    [GetItemsOfProcessOrder.fulfilled]: (state, action) => ({
      ...state,
      success: true,
      itemsOfProcessOrderLoading: false,
      itemsOfProcessOrder: action.payload.data.orderItems,
      totalItemsOfProcessOrder: action.payload.data.totalOrderItems
    }),
    [GetItemsOfProcessOrder.rejected]: (state, action) => ({
      ...state,
      success: false,
      itemsOfProcessOrderLoading: false,
      notifyMessage: action.payload.error || 'Error',
      notifyType: 'error',
      notify: true
    }),
    [AddBox.pending]: (state) => ({
      ...state,
      addBoxLoading: true,
      success: false,
      addedBox: false
    }),
    [AddBox.fulfilled]: (state, action) => {
      const currentState = current(state);
      const orderBoxesList = cloneDeep(currentState.orderBoxes);

      const { newBox } = action.payload.data;

      orderBoxesList.unshift(newBox);

      return {
        ...state,
        addBoxLoading: false,
        success: true,
        notifyMessage: action.payload.message,
        notifyType: 'success',
        notify: true,
        newBox: action.payload.data.newBox,
        addedBox: true,
        orderBoxes: orderBoxesList
      };
    },
    [AddBox.rejected]: (state, action) => ({
      ...state,
      addBoxLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      error: action.payload.error,
      addedBox: false
    }),
    [GetBoxesByOrderId.pending]: (state) => ({
      ...state,
      success: false,
      boxesLoading: true
    }),
    [GetBoxesByOrderId.fulfilled]: (state, action) => ({
      ...state,
      boxesLoading: false,
      success: true,
      orderBoxes: action.payload.data.orderBoxes
    }),
    [GetBoxesByOrderId.rejected]: (state, action) => ({
      ...state,
      boxesLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [DeleteBoxById.pending]: (state) => ({
      ...state,
      success: false,
      deleteBoxLoading: true,
      boxDeleted: false
    }),
    [DeleteBoxById.fulfilled]: (state, action) => ({
      ...state,
      deleteBoxLoading: false,
      success: true,
      notifyMessage: action.payload.message,
      notifyType: 'success',
      boxDeleted: true,
      notify: true
    }),
    [DeleteBoxById.rejected]: (state, action) => ({
      ...state,
      deleteBoxLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      boxDeleted: false,
      notifyType: 'error',
      notify: true
    }),
    [AddBoxItem.pending]: (state) => ({
      ...state,
      addBoxItemLoading: true,
      success: false,
      addedBoxItem: false
    }),
    [AddBoxItem.fulfilled]: (state, action) => ({
      ...state,
      addBoxItemLoading: false,
      success: true,
      notifyMessage: action.payload.message,
      addedBoxItem: true,
      notifyType: 'success',
      notify: true
    }),
    [AddBoxItem.rejected]: (state, action) => ({
      ...state,
      addBoxItemLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      error: action.payload.error,
      addedBoxItem: false
    }),
    [GetBoxItemsByBoxIds.pending]: (state) => ({
      ...state,
      success: false,
      boxItemsLoading: true
    }),
    [GetBoxItemsByBoxIds.fulfilled]: (state, action) => ({
      ...state,
      boxItemsLoading: false,
      success: true,
      boxItems: action.payload.data.boxItems
    }),
    [GetBoxItemsByBoxIds.rejected]: (state) => ({
      ...state,
      boxItemsLoading: false,
      success: false
    }),
    [GetBoxLogsByBoxId.pending]: (state) => ({
      ...state,
      success: false,
      boxlogsLoading: true
    }),
    [GetBoxLogsByBoxId.fulfilled]: (state, action) => ({
      ...state,
      boxlogsLoading: false,
      success: true,
      boxLogs: action.payload.data.boxLogs
    }),
    [GetBoxLogsByBoxId.rejected]: (state) => ({
      ...state,
      boxlogsLoading: false,
      success: false
    }),
    [UpdateBox.pending]: (state) => ({
      ...state,
      updateBoxLoading: true,
      success: false,
      updatedBox: false
    }),
    [UpdateBox.fulfilled]: (state, action) => ({
      ...state,
      updateBoxLoading: false,
      success: true,
      notifyMessage: action.payload.message,
      notifyType: 'success',
      notify: true,
      editedBox: action.payload.data.updatedBox,
      updatedBox: true
    }),
    [UpdateBox.rejected]: (state, action) => ({
      ...state,
      updateBoxLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      error: action.payload.error,
      updatedBox: false
    }),
    [UpdateBoxDetail.pending]: (state) => ({
      ...state,
      updateBoxDetailLoading: true,
      success: false,
      updatedBoxDetail: false
    }),
    [UpdateBoxDetail.fulfilled]: (state, action) => ({
      ...state,
      updateBoxDetailLoading: false,
      success: true,
      notifyMessage: action.payload.message,
      notifyType: 'success',
      notify: false,
      editedBoxDetail: action.payload.data.updatedBoxDetail,
      updatedBoxDetail: true
    }),
    [UpdateBoxDetail.rejected]: (state, action) => ({
      ...state,
      updateBoxDetailLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: false,
      error: action.payload.error,
      updatedBoxDetail: false
    }),
    [GetProductBoxDimensionById.pending]: (state) => ({
      ...state,
      success: false,
      productDimensionsFetched: false
    }),
    [GetProductBoxDimensionById.fulfilled]: (state, action) => ({
      ...state,
      success: true,
      productBoxDimension: action.payload.data.product,
      productDimensionsFetched: true
    }),
    [GetProductBoxDimensionById.rejected]: (state, action) => ({
      ...state,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      productDimensionsFetched: true
    })
  }
});

const { reducer, actions } = processOrder;

export const { SetProcessOrderState, SetProcessOrderNotifyState } = actions;

export default reducer;
