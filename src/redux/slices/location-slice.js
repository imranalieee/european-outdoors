import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { HandleCatchBlock } from '../../../utils/helpers';
import { axiosBaseUrl } from '../../config/axios-configuration';

const axios = axiosBaseUrl();

export const AddNewLocation = createAsyncThunk(
  'location/add-location',
  async (data, { rejectWithValue }) => {
    try {
      const {
        isDefault,
        warehouse,
        quantity,
        quantityInTransfer,
        productId,
        location
      } = data;

      const response = await axios.post('/location/add-location', {
        isDefault,
        warehouse,
        quantity,
        quantityInTransfer,
        productId,
        location
      });

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const AddQuantityLocation = createAsyncThunk(
  'location/add-location-quantity',
  async (data, { rejectWithValue }) => {
    try {
      const {
        warehouse,
        quantity,
        productId,
        location
      } = data;

      const response = await axios.post('/location/add-location-quantity', {
        warehouse,
        quantity,
        productId,
        location
      });

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetLocationsQuantityByProductId = createAsyncThunk(
  'location/get-locations-quantity-product-id',
  async (data, { rejectWithValue }) => {
    try {
      const {
        filters, skip, limit, productId
      } = data;

      const response = await axios.get('/location/get-locations-quantity-product-id', {
        params: {
          filters: JSON.stringify(filters),
          skip,
          limit,
          productId
        }
      });

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetAllLocations = createAsyncThunk(
  'location/get-locations',
  async (data, { rejectWithValue }) => {
    try {
      const {
        fetchAll
      } = data;

      const response = await axios.get('/location/get-locations', {
        params: {
          fetchAll
        }
      });

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const UpdateLocation = createAsyncThunk(
  'location/update-location',
  async ({ locationId, updateParams }, { rejectWithValue }) => {
    try {
      const response = await axios.put('/location/update-location', {
        locationId,
        updateParams
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const DeleteLocation = createAsyncThunk(
  'location/delete-location',
  async ({ locationId }, { rejectWithValue }) => {
    try {
      const response = await axios.delete('/location/delete-location', {
        params: {
          locationId
        }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const TransferProductQuantity = createAsyncThunk(
  'location/transfer-product-quantity',
  async ({ locationId, transferParams }, { rejectWithValue }) => {
    try {
      const response = await axios.put('/location/transfer-product-quantity', {
        locationId,
        transferParams
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

const location = createSlice({
  name: 'location',
  initialState: {
    loading: false,
    success: false,
    totalLocations: 0,
    newLocation: [],
    locations: [],
    locationQuantityAdded: [],
    notify: false,
    notifyMessage: '',
    notifyType: 'error',
    selectedPagination: 100,
    locationAdded: false,
    locationAddedLoading: false,
    locationDeleted: false,
    locationDeletedLoading: false,
    locationUpdated: false,
    locationUpdatedLoading: false,
    quantityTransfered: false,
    quantityTransferedLoading: false,
    quantityAdded: false,
    quantityAddedLoading: false,
    locationNotAdded: false,
    locationDetail: {},
    allLocations: []
  },
  reducers: {
    SetLocationState(state, { payload: { field, value } }) {
      state[field] = value;
    },
    SetLocationNotifyState(state, { payload: { message, type } }) {
      state.notify = true;
      state.notifyMessage = message;
      state.notifyType = type;
    }
  },
  extraReducers: {
    [AddNewLocation.pending]: (action, state) => ({
      ...state,
      locationAddedLoading: true,
      success: false,
      locationNotAdded: false,
      locationAdded: false
    }),
    [AddNewLocation.fulfilled]: (state, action) => ({
      ...state,
      locationNotAdded: false,
      locationAddedLoading: false,
      success: true,
      notifyMessage: action.payload.message,
      notifyType: 'success',
      notify: true,
      locationAdded: true,
      newLocation: action.payload.newLocation
    }),
    [AddNewLocation.rejected]: (state, action) => ({
      ...state,
      locationAddedLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      locationAdded: true,
      notify: true
    }),
    [AddQuantityLocation.pending]: (action, state) => ({
      ...state,
      quantityAddedLoading: true,
      success: false,
      quantityAdded: false
    }),
    [AddQuantityLocation.fulfilled]: (state, action) => ({
      ...state,
      quantityAddedLoading: false,
      success: true,
      notifyMessage: action.payload.message,
      notifyType: 'success',
      notify: true,
      quantityAdded: true,
      locationQuantityAdded: action.payload.locationQuantityAdded
    }),
    [AddQuantityLocation.rejected]: (state, action) => ({
      ...state,
      quantityAddedLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      quantityAdded: false,
      notify: true
    }),
    [GetLocationsQuantityByProductId.pending]: (state) => ({
      ...state,
      success: false,
      loading: true
    }),
    [GetLocationsQuantityByProductId.fulfilled]: (state, action) => ({
      ...state,
      loading: false,
      success: true,
      totalLocations: action.payload.data.totalLocation,
      locations: action.payload.data.locations
    }),
    [GetLocationsQuantityByProductId.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [GetAllLocations.pending]: (state) => ({
      ...state,
      success: false,
      loading: true
    }),
    [GetAllLocations.fulfilled]: (state, action) => ({
      ...state,
      loading: false,
      success: true,
      allLocations: action.payload.data.locations
    }),
    [GetAllLocations.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [UpdateLocation.pending]: (state) => ({
      ...state,
      success: false,
      locationUpdatedLoading: true,
      locationUpdated: false
    }),
    [UpdateLocation.fulfilled]: (state, action) => ({
      ...state,
      locationUpdatedLoading: false,
      success: true,
      notifyMessage: action.payload.message,
      notifyType: 'success',
      notify: true,
      locationUpdated: true,
      locationDetail: action.payload.data.updatedLocation
    }),
    [UpdateLocation.rejected]: (state, action) => ({
      ...state,
      locationUpdatedLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      error: action.payload.error,
      locationUpdated: false
    }),
    [DeleteLocation.pending]: (state) => ({
      ...state,
      success: false,
      locationDeletedLoading: true,
      locationDeleted: false
    }),
    [DeleteLocation.fulfilled]: (state, action) => ({
      ...state,
      locationDeleted: true,
      locationDeletedLoading: false,
      success: true,
      notifyMessage: action.payload.message,
      notifyType: 'success',
      notify: true

    }),
    [DeleteLocation.rejected]: (state, action) => ({
      ...state,
      locationDeletedLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      error: action.payload.error,
      locationDeleted: false
    }),
    [TransferProductQuantity.pending]: (state) => ({
      ...state,
      quantityTransferedLoading: true,
      quantityTransfered: false
    }),
    [TransferProductQuantity.fulfilled]: (state, action) => ({
      ...state,
      quantityTransferedLoading: false,
      success: true,
      notifyMessage: action.payload.message,
      notifyType: 'success',
      notify: true,
      quantityTransfered: true
    }),
    [TransferProductQuantity.rejected]: (state, action) => ({
      ...state,
      quantityTransferedLoading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      error: action.payload.error,
      quantityTransfered: false
    })
  }
});

const { reducer, actions } = location;

export const { SetLocationState, SetLocationNotifyState } = actions;

export default reducer;
