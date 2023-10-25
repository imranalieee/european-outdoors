import { cloneDeep, extend } from 'lodash';

import { createSlice, createAsyncThunk, current } from '@reduxjs/toolkit';

import { HandleCatchBlock } from '../../../../utils/helpers';
import { axiosBaseUrl } from '../../../config/axios-configuration';

const axios = axiosBaseUrl();

export const GetOrders = createAsyncThunk(
  'order/get-orders',
  async (data, { rejectWithValue }) => {
    try {
      const {
        filters,
        skip,
        limit,
        sortBy
      } = data;

      const response = await axios.get('order/get-orders', {
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

export const SaveSelectedOrdersId = createAsyncThunk(
  'order/save-export-orders-params',
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

export const DownloadOrders = createAsyncThunk(
  'order/download-orders',
  async (data, { rejectWithValue }) => {
    try {
      const { userId, isProcessOrder } = data;
      const url = `${process.env.API_URL}/non-secure-route/download-orders?userId=${userId}&isProcessOrder=${isProcessOrder}`;

      window.open(url, '_blank');

      return 0;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const SaveOrderAttachment = createAsyncThunk(
  'order/save-order-attachment',
  async (data, { rejectWithValue }) => {
    try {
      const {
        orderId,
        key,
        size,
        uploadedDate,
        pageName = 'addOrder'
      } = data;
      const response = await axios.post('/order/save-order-attachment', {
        orderId,
        key,
        size,
        uploadedDate
      });

      response.data.key = pageName;

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const AddNewOrder = createAsyncThunk(
  'order/add-order',
  async (data, { rejectWithValue }) => {
    try {
      const {
        orderCustomerDetail,
        orderDetail,
        billInfo,
        shippingInfo,
        deliveryDates,
        isBillingShippingAddressingSame,
        instructions
      } = data;

      const response = await axios.post('order/add-order', {
        ...orderCustomerDetail,
        ...orderDetail,
        ...instructions,
        shippingInfo,
        billInfo,
        deliveryDates,
        isBillingShippingAddressingSame
      });

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const UpdateOrderAttachmentById = createAsyncThunk(
  'order/update-order-attachment-by-id',
  async (data, { rejectWithValue }) => {
    try {
      const {
        paramsToUpdate,
        orderAttachmentId,
        pageName = 'addOrder'
      } = data;
      const response = await axios.post('/order/update-order-attachment-by-id', {
        paramsToUpdate,
        orderAttachmentId
      });

      response.data.key = pageName;

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetItemsForAnOrder = createAsyncThunk(
  'order/get-items',
  async (data, { rejectWithValue }) => {
    try {
      const {
        filters,
        skip,
        limit,
        orderId,
        sortBy
      } = data;

      const response = await axios.get('/order/get-items', {
        params: {
          orderId,
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

export const AddOrderItems = createAsyncThunk(
  'order/add-order-item',
  async (data, { rejectWithValue }) => {
    try {
      const {
        orderId,
        orderItemsIdList
      } = data;
      const response = await axios.post('/order/add-order-item', {
        orderId,
        orderItemsIdList
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const UpdateOrderItem = createAsyncThunk(
  'order/update-order-item-by-id',
  async (data, { rejectWithValue }) => {
    try {
      const {
        orderItemId,
        quantity,
        price
      } = data;

      const response = await axios.patch('/order/update-order-item-by-id', {
        orderItemId,
        quantity,
        price
      });

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const DeleteOrderItemsById = createAsyncThunk(
  'order/delete-order-items-by-id',
  async (data, { rejectWithValue }) => {
    try {
      const {
        orderItemsIdList
      } = data;

      const response = await axios.post('/order/delete-order-items-by-id', {
        orderItemsIdList
      });

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const UpdateOrderCustomerDetail = createAsyncThunk(
  'order/update-order-customer-detail-by-orderId',
  async (data, { rejectWithValue }) => {
    try {
      const {
        orderId,
        personalInformation,
        billingInformation,
        deliveryInstructions,
        defaultAddress
      } = data;

      const response = await axios.patch('/order/update-order-customer-detail-by-orderId', {
        orderId,
        personalInformation,
        billingInformation,
        deliveryInstructions,
        defaultAddress
      });

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetOrderItems = createAsyncThunk(
  'order/get-order-items',
  async (data, { rejectWithValue }) => {
    try {
      const {
        orderId,
        skip,
        limit,
        pageName = 'addOrder'
      } = data;

      const response = await axios.get('order/get-order-items', {
        params: {
          orderId,
          skip,
          limit
        }
      });

      response.data.key = pageName;
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetRelationalOrderItems = createAsyncThunk(
  'order/get-relational-order-items',
  async (data, { rejectWithValue }) => {
    try {
      const {
        orderId,
        skip,
        limit
      } = data;

      const response = await axios.get('order/get-relational-order-items', {
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

export const GetOrderAttachmentByOrderId = createAsyncThunk(
  'order/get-order-attachments-by-orderId',
  async (data, { rejectWithValue }) => {
    try {
      const {
        orderId
      } = data;

      const response = await axios.get('/order/get-order-attachments-by-orderId', {
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

export const GetMatchItems = createAsyncThunk(
  'order/get-match-items',
  async (data, { rejectWithValue }) => {
    try {
      const {
        filters,
        skip,
        limit,
        sortBy
      } = data;

      const response = await axios.get('order/get-match-items', {
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

export const MarkItemAsMatched = createAsyncThunk(
  'product/mark-item-as-matched',
  async (data, { rejectWithValue }) => {
    try {
      const {
        orderItemId,
        sku,
        productId,
        platform
      } = data;

      const response = await axios.post('/order/mark-item-as-matched', {
        orderItemId,
        sku,
        productId,
        platform
      });

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetOrderDetail = createAsyncThunk(
  'order/get-order-by-orderId',
  async (data, { rejectWithValue }) => {
    try {
      const {
        orderId
      } = data;

      const response = await axios.get('/order/get-order-by-orderId', {
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

export const UpdateOrderStatusByOrderId = createAsyncThunk(
  'order/update-order-status-by-id',
  async (data, { rejectWithValue }) => {
    try {
      const {
        orderId,
        status
      } = data;

      const response = await axios.patch('/order/update-order-status-by-id', {
        orderId,
        status
      });

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetProcessOrders = createAsyncThunk(
  'order/get-printed-orders',
  async (data, { rejectWithValue }) => {
    try {
      const {
        filters,
        skip,
        limit
      } = data;

      const response = await axios.get('order/get-printed-orders', {
        params: {
          filters: JSON.stringify(filters),
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

export const SaveUploadedOrderSheetInDb = createAsyncThunk(
  'order/save-uploaded-sheet-in-db',
  async (data, { rejectWithValue }) => {
    try {
      const {
        userId,
        fileUploadKey
      } = data;
      const response = await fetch(`${process.env.JOB_URL}/script?method=StartSingleJob&jobName=get-and-save-s3-uploaded-order-file&userId=${userId}&fileUploadKey=${fileUploadKey}`);
      return response;
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

export const PrintOrderInvoice = createAsyncThunk(
  'order/download-invoice',
  async (data, { rejectWithValue }) => {
    try {
      const { userId, orderId } = data;
      const url = `${process.env.API_URL}/non-secure-route/download-order-invoice-pdf?userId=${userId}&orderId=${orderId}`;

      window.open(url, '_blank');

      return 0;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const UpdateOrderById = createAsyncThunk(
  'order/update-order-by-id',
  async (data, { rejectWithValue }) => {
    try {
      const {
        orderId,
        shipBy
      } = data;

      const response = await axios.patch('/order/update-order-by-id', {
        orderId,
        shipBy
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
        orderId
      } = data;

      const response = await axios.get('order/get-print-order-invoice-data', {
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

export const GetBoxesForViewOrder = createAsyncThunk(
  'box/get-all-boxes-for-view-order-by-order-id',
  async (data, { rejectWithValue }) => {
    try {
      const {
        orderId, skip, limit
      } = data;
      const response = await axios.get('/box/get-all-boxes-for-view-order-by-order-id', {
        params: {
          orderId, skip, limit
        }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const UpdateMatchedItem = createAsyncThunk(
  'order/update-matched-order-item',
  async (data, { rejectWithValue }) => {
    try {
      const {
        orderItemId,
        productId
      } = data;
      const response = await axios.patch('/order/update-matched-order-item', {
        orderItemId,
        productId
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetItemsForOrderItemPack = createAsyncThunk(
  'order/get-order-items-for-pack',
  async (data, { rejectWithValue }) => {
    try {
      const {
        orderItemId,
        filters,
        skip,
        limit,
        sortBy
      } = data;
      const response = await axios.get('/order/get-order-items-for-pack', {
        params: {
          orderItemId,
          filters,
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

export const AddOrderItemsToPack = createAsyncThunk(
  'order/add-order-items-to-pack',
  async (data, { rejectWithValue }) => {
    try {
      const {
        orderItemId, items, action
      } = data;

      const response = await axios.post('/order/add-order-items-to-pack', {
        orderItemId, items, action
      });

      response.data.action = action;
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetOrderItemPackItems = createAsyncThunk(
  'order/get-order-item-packs-items',
  async (data, { rejectWithValue }) => {
    try {
      const { orderItemId, sortBy } = data;

      const response = await axios.get('/order/get-order-item-packs-items', {
        params: {
          sortBy,
          orderItemId
        }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const DeleteItemsFromPack = createAsyncThunk(
  'order/remove-items-from-pack',
  async (data, { rejectWithValue }) => {
    try {
      const {
        packItemIds
      } = data;
      const response = await axios.delete('/order/remove-items-from-pack', {
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

const order = createSlice({
  name: 'order',
  initialState: {
    getOrdersLoading: false,
    addNewOrderLoading: false,
    saveOrderAttachmentLoading: false,
    updateOrderAttachmentLoading: false,
    getItemsForAnOrderLoading: false,
    addItemsInOrderLoading: false,
    deleteOrderItemLoading: false,
    updateOrderCustomerDetailLoading: false,
    getOrderAttachmentLoading: false,
    getOrderDetailLoading: false,
    updateOrderStatusLoading: false,
    saveOrderJobTriggeredLoading: false,
    updateOrderLoading: false,
    itemsDeleted: false,
    itemsAdded: false,
    customerOrderUpdated: false,
    success: false,
    notify: false,
    notifyMessage: '',
    notifyType: 'error',
    orders: [],
    totalOrders: 0,
    // orderManagerPageLimit: 100,
    // orderManagerPageNumber: 1,
    orderManagerFilters: {
      orderManagerPageNumber: 1,
      orderManagerPageLimit: 100,
      salesChannel: '',
      orderStatus: '',
      searchByKeyWords: { orderNo: '' }
    },
    saveSelectedOrdersParams: false,
    ordersDownloaded: false,
    orderId: '',
    newOrderId: '',
    newOrder: {},
    newOrderCustomerDetail: {},
    orderAttachments: [],
    totalAddItems: 0,
    addItems: [],
    orderItems: [],
    totalOrderItems: 0,
    viewOrderItems: [],
    viewTotalOrderItems: 0,
    orderItemUpdated: false,
    totalMatchItems: 0,
    matchItems: [],
    getMatchItemsLoading: false,
    getOrderItemsLoading: false,
    viewOrderAttachments: [],
    orderDetail: {},
    orderAttachmentUpdated: false,
    order: {},
    orderCustomerDetail: {},
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
    orderConfirmed: false,
    orderUpdated: false,
    orderInvoicePrintableData: {},
    pdfDataLoading: false,
    orderBoxes: [],
    totalOrderBoxes: 0,
    progress: undefined,
    markItemMatched: false,
    loadOrderItems: false,
    orderStatusUpdated: false,
    getOrderItemsForPackLoading: false,
    totalItemsForPack: 0,
    itemsForPack: [],
    orderPackItemAdded: false,
    orderPackItemEdited: false,
    orderItemPackDetail: [],
    addOrderPackItemLoading: false,
    totalOrderItemsInPack: 0,
    totalCostOfPack: 0,
    deletePackItemLoading: false,
    packDeleted: false,
    packDetailOrderItemId: null
  },
  reducers: {
    SetOrderState(state, { payload: { field, value } }) {
      state[field] = value;
    },
    SetOrderNotifyState(state, { payload: { message, type } }) {
      state.notify = true;
      state.notifyMessage = message;
      state.notifyType = type;
    },
    SetClearNewOrderData(state) {
      state.newOrderId = '';
      state.newOrder = {};
      state.orderConfirmed = true;
      state.newOrderCustomerDetail = {};
      state.orderAttachments = [];
      state.totalAddItems = 0;
      state.orderItems = [];
      state.totalOrderItems = 0;
      state.orderItemUpdated = false;
      state.saveSelectedOrdersParams = false;
    }
  },
  extraReducers: {
    [GetOrders.pending]: (state) => ({
      ...state,
      success: false,
      getOrdersLoading: true
    }),
    [GetOrders.fulfilled]: (state, action) => ({
      ...state,
      success: true,
      getOrdersLoading: false,
      orders: action.payload.data.orders,
      totalOrders: action.payload.data.totalOrders
    }),
    [GetOrders.rejected]: (state, action) => ({
      ...state,
      success: false,
      getOrdersLoading: false,
      notifyMessage: action.payload.error || 'Error',
      notifyType: 'error',
      notify: true
    }),
    [SaveSelectedOrdersId.pending]: (state) => ({
      ...state,
      success: false,
      saveSelectedOrdersParams: false
    }),
    [SaveSelectedOrdersId.fulfilled]: (state) => ({
      ...state,
      success: true,
      saveSelectedOrdersParams: true
    }),
    [SaveSelectedOrdersId.rejected]: (state, action) => ({
      ...state,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      saveSelectedOrdersParams: false
    }),
    [DownloadOrders.pending]: (state) => ({
      ...state
    }),
    [DownloadOrders.fulfilled]: (state) => ({
      ...state,
      ordersDownloaded: true
    }),
    [DownloadOrders.rejected]: (state, action) => ({
      ...state,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      ordersDownloaded: false
    }),
    [AddNewOrder.pending]: (state) => ({
      ...state,
      success: true,
      addNewOrderLoading: true
    }),
    [AddNewOrder.fulfilled]: (state, action) => ({
      ...state,
      success: true,
      addNewOrderLoading: false,
      newOrderId: action.payload.data.newOrder._id,
      newOrder: action.payload.data.newOrder,
      newOrderCustomerDetail: action.payload.data.newOrderCustomerDetail,
      notifyType: 'success',
      notify: true,
      notifyMessage: action.payload.message
    }),
    [AddNewOrder.rejected]: (state, action) => ({
      ...state,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      addNewOrderLoading: false
    }),
    [SaveOrderAttachment.pending]: (state) => ({
      ...state,
      success: true,
      saveOrderAttachmentLoading: true
    }),
    [SaveOrderAttachment.fulfilled]: (state, action) => {
      const currentState = current(state);
      const { key, message } = action.payload;

      const updateFields = {};
      if (key === 'addOrder') {
        const orderAttachmentsList = cloneDeep(currentState.orderAttachments);
        const { orderAttachmentAdded } = action.payload.data;

        orderAttachmentsList.unshift(orderAttachmentAdded);

        extend(updateFields, { orderAttachments: orderAttachmentsList });
      } else if (key === 'viewOrder') {
        const viewOrderAttachmentsList = cloneDeep(currentState.viewOrderAttachments);
        const { orderAttachmentAdded } = action.payload.data;
        viewOrderAttachmentsList.unshift(orderAttachmentAdded);

        extend(updateFields, { viewOrderAttachments: viewOrderAttachmentsList });
      }

      return {
        ...state,
        success: true,
        notifyType: 'success',
        notify: true,
        notifyMessage: message,
        saveOrderAttachmentLoading: false,
        ...updateFields
      };
    },
    [SaveOrderAttachment.rejected]: (state, action) => ({
      ...state,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      saveOrderAttachmentLoading: false
    }),
    [UpdateOrderAttachmentById.pending]: (state) => ({
      ...state,
      success: false,
      updateOrderAttachmentLoading: true,
      orderAttachmentUpdated: false
    }),
    [UpdateOrderAttachmentById.fulfilled]: (state, action) => {
      const currentState = current(state);

      const { key, message } = action.payload;

      const updateFields = {};

      if (key === 'addOrder') {
        let orderAttachmentsList = cloneDeep(currentState.orderAttachments);
        const { _id: orderAttachmentId } = action.payload.data.updatedOrderAttachment;

        orderAttachmentsList = orderAttachmentsList.filter(
          (doc) => String(doc._id) !== orderAttachmentId
        );

        extend(updateFields, { orderAttachments: orderAttachmentsList });
      } else if (key === 'viewOrder') {
        let viewOrderAttachmentsList = cloneDeep(currentState.viewOrderAttachments);
        const { _id: orderAttachmentId } = action.payload.data.updatedOrderAttachment;

        viewOrderAttachmentsList = viewOrderAttachmentsList.filter(
          (doc) => String(doc._id) !== orderAttachmentId
        );

        extend(updateFields, { viewOrderAttachments: viewOrderAttachmentsList });
      }

      return {
        ...state,
        updateOrderAttachmentLoading: false,
        success: true,
        notify: true,
        notifyMessage: message,
        notifyType: 'success',
        orderAttachmentUpdated: true,
        ...updateFields
      };
    },
    [UpdateOrderAttachmentById.rejected]: (state, action) => ({
      ...state,
      updateOrderAttachmentLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      orderAttachmentUpdated: false
    }),
    [GetItemsForAnOrder.pending]: (state) => ({
      ...state,
      success: false,
      getItemsForAnOrderLoading: true
    }),
    [GetItemsForAnOrder.fulfilled]: (state, action) => ({
      ...state,
      success: true,
      getItemsForAnOrderLoading: false,
      addItems: action.payload.data.products,
      totalAddItems: action.payload.data.totalProduct
    }),
    [GetItemsForAnOrder.rejected]: (state, action) => ({
      ...state,
      success: false,
      getItemsForAnOrderLoading: false,
      notifyMessage: action.payload.error || 'Error',
      notifyType: 'error',
      notify: true
    }),
    [AddOrderItems.pending]: (state) => ({
      ...state,
      success: false,
      addItemsInOrderLoading: true,
      itemsAdded: false
    }),
    [AddOrderItems.fulfilled]: (state, action) => ({
      ...state,
      success: true,
      itemsAdded: true,
      addItemsInOrderLoading: false,
      notifyMessage: action.payload.message,
      notifyType: 'success',
      notify: true
    }),
    [AddOrderItems.rejected]: (state, action) => ({
      ...state,
      success: false,
      itemsAdded: false,
      addItemsInOrderLoading: false,
      notifyMessage: action.payload.error || 'Error',
      notifyType: 'error',
      notify: true
    }),
    [GetOrderItems.pending]: (state) => ({
      ...state,
      success: false,
      getOrderItemsLoading: true
    }),
    [GetOrderItems.fulfilled]: (state, action) => {
      const { key } = action.payload;
      const updateFields = {};

      const { orderItems, totalOrderItems } = action.payload.data;
      if (key === 'addOrder') {
        extend(updateFields, {
          orderItems,
          totalOrderItems
        });
      } else if (key === 'viewOrder') {
        extend(updateFields, {
          viewOrderItems: orderItems,
          viewTotalOrderItems: totalOrderItems
        });
      }

      return {
        ...state,
        success: true,
        getOrderItemsLoading: false,
        ...updateFields
      };
    },
    [GetOrderItems.rejected]: (state, action) => ({
      ...state,
      success: false,
      getOrderItemsLoading: false,
      notifyMessage: action.payload.error || 'Error',
      notifyType: 'error',
      notify: true
    }),
    [GetRelationalOrderItems.pending]: (state) => ({
      ...state,
      success: false,
      getOrderItemsLoading: true
    }),
    [GetRelationalOrderItems.fulfilled]: (state, action) => {
      const { relationalProductList, totalRelationOrderItems } = action.payload.data;

      return {
        ...state,
        success: true,
        getOrderItemsLoading: false,
        relationalProductList,
        totalRelationOrderItems
      };
    },
    [GetRelationalOrderItems.rejected]: (state, action) => ({
      ...state,
      success: false,
      getOrderItemsLoading: false,
      notifyMessage: action.payload.error || 'Error',
      notifyType: 'error',
      notify: true
    }),
    [UpdateOrderItem.pending]: (state) => ({
      ...state,
      success: false,
      updateOrderItemLoading: true
    }),
    [UpdateOrderItem.fulfilled]: (state, action) => {
      const currentState = current(state);
      const orderItemsList = cloneDeep(currentState.orderItems);
      const {
        _id: orderItemId, unitPrice, quantity, status,
        fulfilledBy, fulfilledQuantityDetails, committedQuantity
      } = action.payload.data.updatedOrderItem;

      const indexOfItem = orderItemsList.findIndex(
        (doc) => (doc.orderItemId) === (orderItemId)
      );

      orderItemsList[indexOfItem].orderItemQuantity = quantity;
      orderItemsList[indexOfItem].salePrice = unitPrice;
      orderItemsList[indexOfItem].status = status;

      orderItemsList[indexOfItem].fulfilledBy = fulfilledBy;
      orderItemsList[indexOfItem].fulfilledQuantityDetails = fulfilledQuantityDetails;
      orderItemsList[indexOfItem].committedQuantity = committedQuantity;

      return {
        ...state,
        updateOrderItemLoading: false,
        orderItems: orderItemsList,
        success: true,
        notify: true,
        notifyMessage: action.payload.message,
        orderItemUpdated: true,
        notifyType: 'success'
      };
    },
    [UpdateOrderItem.rejected]: (state, action) => ({
      ...state,
      updateOrderItemLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      orderItemUpdated: false
    }),
    [DeleteOrderItemsById.pending]: (state) => ({
      ...state,
      success: false,
      deleteOrderItemLoading: true
    }),
    [DeleteOrderItemsById.fulfilled]: (state, action) => ({
      ...state,
      success: true,
      deleteOrderItemLoading: false,
      notifyMessage: action.payload.message,
      notify: true,
      notifyType: 'success',
      itemsDeleted: true
    }),
    [DeleteOrderItemsById.rejected]: (state, action) => ({
      ...state,
      success: false,
      deleteOrderItemLoading: false,
      notifyMessage: action.payload.error || 'Error',
      notifyType: 'error',
      notify: true,
      itemsDeleted: false
    }),
    [UpdateOrderCustomerDetail.pending]: (state) => ({
      ...state,
      success: false,
      update: true,
      customerOrderUpdated: false,
      updateOrderCustomerDetailLoading: true
    }),
    [UpdateOrderCustomerDetail.fulfilled]: (state, action) => ({
      ...state,
      success: true,
      updateOrderCustomerDetailLoading: false,
      notifyMessage: action.payload.message,
      notify: true,
      notifyType: 'success',
      customerOrderUpdated: true,
      newOrderCustomerDetail: action.payload.data.updatedOrder.updatedOrderCustomer,
      newOrder: action.payload.data.updatedOrder.order
    }),
    [UpdateOrderCustomerDetail.rejected]: (state, action) => ({
      ...state,
      success: false,
      customerOrderUpdated: false,
      updateOrderCustomerDetailLoading: false,
      notifyMessage: action.payload.error || 'Error',
      notifyType: 'error',
      notify: true
    }),
    [GetMatchItems.pending]: (state) => ({
      ...state,
      success: false,
      getMatchItemsLoading: true
    }),
    [GetMatchItems.fulfilled]: (state, action) => ({
      ...state,
      getMatchItemsLoading: false,
      success: true,
      matchItems: action.payload.data.matchItems,
      totalMatchItems: action.payload.data.totalMatchItems
    }),
    [GetMatchItems.rejected]: (state, action) => ({
      ...state,
      getMatchItemsLoading: false,
      success: false,
      notifyMessage: action.payload.error || 'Error',
      notifyType: 'error',
      notify: true
    }),
    [MarkItemAsMatched.pending]: (state) => ({
      ...state,
      getOrderItemsLoading: true,
      success: false
    }),
    [MarkItemAsMatched.fulfilled]: (state, action) => {
      const { markedItem } = action.payload.data;

      const currentState = current(state);
      const viewOrderItemsList = cloneDeep(currentState.viewOrderItems);
      const index = viewOrderItemsList.findIndex((item) => (
        item.orderItemId === markedItem?.orderItemId));
      viewOrderItemsList[index] = markedItem;

      return {
        ...state,
        getOrderItemsLoading: false,
        success: true,
        notifyMessage: action.payload.message,
        notifyType: 'success',
        notify: true,
        viewOrderItems: viewOrderItemsList,
        markItemMatched: true
      };
    },
    [MarkItemAsMatched.rejected]: (state, action) => ({
      ...state,
      getOrderItemsLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [GetOrderAttachmentByOrderId.pending]: (state) => ({
      ...state,
      success: false,
      getOrderAttachmentLoading: true
    }),
    [GetOrderAttachmentByOrderId.fulfilled]: (state, action) => ({
      ...state,
      getOrderAttachmentLoading: false,
      success: true,
      viewOrderAttachments: action.payload.data.orderAttachments
    }),
    [GetOrderAttachmentByOrderId.rejected]: (state, action) => ({
      ...state,
      getOrderAttachmentLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [GetOrderDetail.pending]: (state) => ({
      ...state,
      success: false,
      getOrderDetailLoading: true
    }),
    [GetOrderDetail.fulfilled]: (state, action) => ({
      ...state,
      getOrderDetailLoading: false,
      success: true,
      order: action.payload.data.order,
      orderCustomerDetail: action.payload.data.orderCustomerDetail
    }),
    [GetOrderDetail.rejected]: (state, action) => ({
      ...state,
      getOrderDetailLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [UpdateOrderStatusByOrderId.pending]: (state) => ({
      ...state,
      success: false,
      updateOrderStatusLoading: true,
      orderStatusUpdated: false
    }),
    [UpdateOrderStatusByOrderId.fulfilled]: (state, action) => {
      const currentState = current(state);
      const viewOrderCopy = cloneDeep(currentState.order);
      const { updatedOrderStatus, updatedAt } = action.payload.data;

      extend(viewOrderCopy, { orderStatus: updatedOrderStatus, updatedAt });

      return {
        ...state,
        success: true,
        notifyType: 'success',
        notifyMessage: action.payload.message,
        notify: true,
        order: viewOrderCopy,
        orderStatusUpdated: true,
        updateOrderStatusLoading: false
      };
    },
    [UpdateOrderStatusByOrderId.rejected]: (state, action) => ({
      ...state,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      orderStatusUpdated: false,
      updateOrderStatusLoading: false
    }),
    [SaveUploadedOrderSheetInDb.pending]: (state) => ({
      ...state,
      success: false,
      saveOrderJobTriggeredLoading: true,
      saveOrderJobTriggered: false
    }),
    [SaveUploadedOrderSheetInDb.fulfilled]: (state) => ({
      ...state,
      success: true,
      notify: true,
      notifyMessage: 'It takes few minutes to save uploaded the sheet',
      notifyType: 'success',
      saveOrderJobTriggeredLoading: false,
      saveOrderJobTriggered: true
    }),
    [SaveUploadedOrderSheetInDb.rejected]: (state, action) => ({
      ...state,
      success: false,
      notifyMessage: action.payload.error,
      saveOrderJobTriggeredLoading: false,
      notifyType: 'error',
      notify: true,
      saveOrderJobTriggered: false
    }),
    [PrintOrderInvoice.pending]: (state) => ({
      ...state,
      success: false
    }),
    [PrintOrderInvoice.fulfilled]: (state) => ({
      ...state,
      success: true
    }),
    [PrintOrderInvoice.rejected]: (state, action) => ({
      ...state,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      success: false
    }),
    [UpdateOrderById.pending]: (state) => ({
      ...state,
      success: false,
      updateOrderLoading: true
    }),
    [UpdateOrderById.fulfilled]: (state, action) => {
      const currentState = current(state);
      const viewOrderCopy = cloneDeep(currentState.order);
      const { updatedOrder: { shipBy, updatedAt } = {} } = action.payload.data;

      if (shipBy) {
        extend(viewOrderCopy, { shipBy });
      }

      if (updatedAt) extend(viewOrderCopy, { updatedAt });

      return {
        ...state,
        success: true,
        notifyType: 'success',
        notifyMessage: action.payload.message,
        notify: true,
        order: viewOrderCopy,
        updateOrderLoading: false,
        orderUpdated: true
      };
    },
    [UpdateOrderById.rejected]: (state, action) => ({
      ...state,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      updateOrderLoading: false,
      orderUpdated: false
    }),
    [GetOrderInvoicePrintableData.pending]: (state) => ({
      ...state,
      notify: false,
      pdfDataLoading: true,
      orderInvoicePrintableData: {},
      success: false
    }),
    [GetOrderInvoicePrintableData.fulfilled]: (state, action) => ({
      ...state,
      success: true,
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
      success: false
    }),
    [GetBoxesForViewOrder.pending]: (state) => ({
      ...state,
      success: false,
      boxesLoading: true
    }),
    [GetBoxesForViewOrder.fulfilled]: (state, action) => ({
      ...state,
      boxesLoading: false,
      success: true,
      orderBoxes: action.payload.data.orderBoxes,
      totalOrderBoxes: action.payload.data.totalOrderBoxes
    }),
    [GetBoxesForViewOrder.rejected]: (state, action) => ({
      ...state,
      boxesLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [UpdateMatchedItem.pending]: (state) => ({
      ...state,
      getOrderItemsLoading: true,
      success: false
    }),
    [UpdateMatchedItem.fulfilled]: (state, action) => {
      const {
        updatedMatchedItem,
        message,
        updatedOrderStatus,
        updatedAt
      } = action.payload.data;

      const currentState = current(state);
      const viewOrderItemsList = cloneDeep(currentState.viewOrderItems);
      const index = viewOrderItemsList.findIndex((item) => (
        item.orderItemId === updatedMatchedItem?.orderItemId));
      viewOrderItemsList[index] = updatedMatchedItem;

      const viewOrderCopy = cloneDeep(currentState.order);

      extend(viewOrderCopy, { orderStatus: updatedOrderStatus, updatedAt });

      return {
        ...state,
        getOrderItemsLoading: false,
        success: true,
        notifyMessage: message,
        notifyType: 'success',
        notify: true,
        viewOrderItems: viewOrderItemsList,
        markItemMatched: true,
        order: viewOrderCopy
      };
    },
    [UpdateMatchedItem.rejected]: (state, action) => ({
      ...state,
      getOrderItemsLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [GetItemsForOrderItemPack.pending]: (state) => ({
      ...state,
      success: false,
      getOrderItemsForPackLoading: true
    }),
    [GetItemsForOrderItemPack.fulfilled]: (state, action) => ({
      ...state,
      getOrderItemsForPackLoading: false,
      success: true,
      totalItemsForPack: action.payload.data.totalProduct,
      itemsForPack: action.payload.data.products
    }),
    [GetItemsForOrderItemPack.rejected]: (state, action) => ({
      ...state,
      getOrderItemsForPackLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [AddOrderItemsToPack.pending]: (state) => ({
      ...state,
      addOrderPackItemLoading: true,
      success: false,
      orderPackItemAdded: false,
      orderPackItemEdited: false
    }),
    [AddOrderItemsToPack.fulfilled]: (state, action) => {
      const { action: key } = action.payload;

      const updateParams = {};
      const currentState = current(state);

      const { updatedOrderStatus, updatedAt } = action.payload.data;

      if (key === 'addItemsToPack') {
        const {
          newPackItems,
          totalCostPrice
        } = action.payload.data;

        const orderItemPackDetailList = cloneDeep(currentState.orderItemPackDetail);
        let totalCostPriceCopy = cloneDeep(currentState.totalCostOfPack);

        orderItemPackDetailList.unshift(...newPackItems);

        totalCostPriceCopy += totalCostPrice;
        extend(updateParams, {
          totalCostOfPack: totalCostPriceCopy,
          orderPackItemAdded: true,
          orderItemPackDetail: orderItemPackDetailList
        });
      } else if (key === 'editPackItems') {
        extend(updateParams, { orderPackItemEdited: true });
      }

      const viewOrderCopy = cloneDeep(currentState.order);

      extend(viewOrderCopy, { orderStatus: updatedOrderStatus, updatedAt });

      return {
        ...state,
        success: true,
        notifyMessage: action.payload.message,
        notifyType: 'success',
        notify: true,
        ...updateParams,
        order: viewOrderCopy,
        addOrderPackItemLoading: false
      };
    },
    [AddOrderItemsToPack.rejected]: (state, action) => ({
      ...state,
      addOrderPackItemLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      orderPackItemAdded: false,
      orderPackItemEdited: false
    }),
    [GetOrderItemPackItems.pending]: (state) => ({
      ...state,
      success: false,
      getOrderItemPackItemLoading: true
    }),
    [GetOrderItemPackItems.fulfilled]: (state, action) => ({
      ...state,
      getOrderItemPackItemLoading: false,
      success: true,
      orderItemPackDetail: action.payload.data.orderItemPack,
      totalCostOfPack: action.payload.data.totalCostPrice
    }),
    [GetOrderItemPackItems.rejected]: (state, action) => ({
      ...state,
      loading: false,
      getOrderItemPackItemLoading: false,
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
      packDeleted: true,
      deletePackItemLoading: false,
      success: true,
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

const { reducer, actions } = order;

export const { SetClearNewOrderData, SetOrderState, SetOrderNotifyState } = actions;

export default reducer;
