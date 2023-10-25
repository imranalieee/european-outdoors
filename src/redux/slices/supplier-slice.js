import { cloneDeep } from 'lodash';
import { createSlice, createAsyncThunk, current } from '@reduxjs/toolkit';

import { HandleCatchBlock } from '../../../utils/helpers';
import { axiosBaseUrl } from '../../config/axios-configuration';

const axios = axiosBaseUrl();

export const GetSuppliers = createAsyncThunk(
  'supplier/get-suppliers',
  async (data, { rejectWithValue }) => {
    try {
      const {
        fetchAll, filters, skip, limit
      } = data;
      const response = await axios.get('/supplier/get-suppliers', {
        params: {
          fetchAll,
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

export const GetSupplierDetails = createAsyncThunk(
  'supplier/get-supplier-by-id',
  async (data, { rejectWithValue }) => {
    try {
      const { supplierId } = data;
      const response = await axios.get('/supplier/get-supplier-by-id', {
        params: {
          supplierId
        }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetS3PreSignedUrl = createAsyncThunk(
  'supplier/get-s3-pre-signed-url',
  async (data, { rejectWithValue }) => {
    try {
      const {
        fileType,
        fileExtension,
        fileName,
        uploadBucket,
        id = ''
      } = data;

      const response = await axios.get(`others/get-s3-pre-signed-url?id=${id}&fileType=${fileType}&extension=${fileExtension}&fileName=${fileName}&uploadBucket=${uploadBucket}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const SaveSelectedSupplier = createAsyncThunk(
  'supplier/save-export-suppliers-params',
  async (data, { rejectWithValue }) => {
    try {
      const { selectIds } = data;

      const jsonSelectedSupplierIds = JSON.stringify(selectIds);
      const blobSelectedSupplierIds = new Blob([jsonSelectedSupplierIds], {
        type: 'application/json'
      });
      const formData = new FormData();
      formData.append('selectedSuppliers', blobSelectedSupplierIds);

      const response = await axios.post('/supplier/save-export-suppliers-params', formData);
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetSupplierAttachmentsBySupplierId = createAsyncThunk(
  'supplier/get-supplier-attachments-by-supplierId',
  async (data, { rejectWithValue }) => {
    try {
      const {
        supplierId
      } = data;

      const response = await axios.get(`supplier/get-supplier-attachments-by-supplierId?&supplierId=${supplierId}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const UpdateSupplierAttachmentById = createAsyncThunk(
  'supplier/update-supplier-attachment-by-id',
  async (data, { rejectWithValue }) => {
    try {
      const {
        paramsToUpdate,
        supplierAttachmentId
      } = data;
      const response = await axios.patch('/supplier/update-supplier-attachment-by-id', {
        paramsToUpdate,
        supplierAttachmentId
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const SaveSupplierAttachment = createAsyncThunk(
  'supplier/save-supplier-attachment',
  async (data, { rejectWithValue }) => {
    try {
      const {
        supplierId,
        key,
        archived,
        size,
        uploadedDate
      } = data;
      const response = await axios.post('/supplier/save-supplier-attachment', {
        supplierId,
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

export const AddSupplier = createAsyncThunk(
  'supplier/add-supplier',
  async (data, { rejectWithValue }) => {
    try {
      const {
        email,
        companyName,
        supplierName,
        code,
        account,
        phone,
        fax,
        streetAddress,
        city,
        state,
        zipCode,
        country,
        paymentTerms
      } = data;

      const response = await axios.post('/supplier/add-supplier', {
        email: email.trim(),
        companyName,
        supplierName,
        code,
        account,
        phone,
        fax,
        streetAddress,
        city,
        state,
        zipCode,
        country,
        paymentTerms
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const UpdateSupplier = createAsyncThunk(
  'supplier/update-supplier-details',
  async (data, { rejectWithValue }) => {
    try {
      const { supplierId, modifiedSupplierDetails } = data;
      const response = await axios.patch('/supplier/update-supplier-by-supplierId', {
        supplierId,
        paramsToUpdate: JSON.stringify(modifiedSupplierDetails)
      });

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);
export const DownloadSuppliers = createAsyncThunk(
  'supplier/download-supplier-sheet',
  async (data, { rejectWithValue }) => {
    try {
      const { userId } = data;
      const url = `${process.env.API_URL}/non-secure-route/download-suppliers?userId=${userId}`;

      window.open(url, '_blank');

      return 0;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

const supplier = createSlice({
  name: 'supplier',
  initialState: {
    loading: false,
    success: false,
    totalSuppliers: 0,
    suppliers: [],
    notify: false,
    notifyMessage: '',
    notifyType: 'error',
    saveSelectedSupplierParams: false,
    preSignedUrl: '',
    fileUploadKey: '',
    supplierDetail: {},
    supplierAttachments: [],
    supplierUpdated: false,
    supplierPageFilters: {
      searchByKeyWords: {
        keys: ['supplierName', 'companyName', 'code', 'email'],
        value: ''
      }
    },
    supplierPageNumber: 1,
    supplierPageLimit: 100
  },
  reducers: {
    SetSupplierState(state, { payload: { field, value } }) {
      state[field] = value;
    },
    SetSupplierNotifyState(state, { payload: { message, type } }) {
      state.notify = true;
      state.notifyMessage = message;
      state.notifyType = type;
    }
  },
  extraReducers: {
    [GetSupplierAttachmentsBySupplierId.pending]: (state) => ({
      ...state,
      success: false,
      loading: true
    }),
    [GetSupplierAttachmentsBySupplierId.fulfilled]: (state, action) => ({
      ...state,
      loading: false,
      success: true,
      supplierAttachments: action.payload.data.supplierAttachments
    }),
    [GetSupplierAttachmentsBySupplierId.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [SaveSupplierAttachment.pending]: (state) => ({
      ...state,
      success: false,
      loading: true
    }),
    [SaveSupplierAttachment.fulfilled]: (state, action) => {
      const currentState = current(state);
      const supplierAttachmentsList = cloneDeep(currentState.supplierAttachments);
      const { supplierAttachmentAdded, message } = action.payload.data;

      supplierAttachmentsList.unshift(supplierAttachmentAdded);
      return {
        ...state,
        loading: false,
        success: true,
        supplierAttachments: supplierAttachmentsList,
        notifyType: 'success',
        notify: true,
        notifyMessage: message
      };
    },
    [SaveSupplierAttachment.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [UpdateSupplierAttachmentById.pending]: (state) => ({
      ...state,
      success: false,
      loading: true
    }),
    [UpdateSupplierAttachmentById.fulfilled]: (state, action) => {
      const currentState = current(state);
      let supplierAttachmentsList = cloneDeep(currentState.supplierAttachments);
      const { supplierAttachmentId } = action.payload.data;

      supplierAttachmentsList = supplierAttachmentsList.filter(
        (doc) => String(doc._id) !== supplierAttachmentId
      );
      return {
        ...state,
        loading: false,
        success: true,
        supplierAttachments: supplierAttachmentsList,
        notify: true,
        notifyMessage: action.payload.message
      };
    },
    [UpdateSupplierAttachmentById.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [GetSuppliers.pending]: (state) => ({
      ...state,
      success: false,
      loading: true
    }),
    [GetSuppliers.fulfilled]: (state, action) => ({
      ...state,
      loading: false,
      success: true,
      totalSuppliers: action.payload.data.totalSupplier,
      suppliers: action.payload.data.suppliers
    }),
    [GetSuppliers.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [GetSupplierDetails.pending]: (state) => ({
      ...state,
      success: false,
      loading: true
    }),
    [GetSupplierDetails.fulfilled]: (state, action) => ({
      ...state,
      loading: false,
      success: true,
      supplierDetail: action.payload.data.supplier
    }),
    [GetSupplierDetails.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [GetS3PreSignedUrl.pending]: (state) => ({
      ...state,
      success: false,
      loading: true
    }),
    [GetS3PreSignedUrl.fulfilled]: (state, action) => ({
      ...state,
      loading: false,
      success: true,
      preSignedUrl: action.payload.data.preSignedUrl,
      fileUploadKey: action.payload.data.fileUploadKey
    }),
    [GetS3PreSignedUrl.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [SaveSelectedSupplier.pending]: (state) => ({
      ...state,
      loading: true,
      success: false,
      saveSelectedSupplierParams: false
    }),
    [SaveSelectedSupplier.fulfilled]: (state) => ({
      ...state,
      loading: false,
      success: true,
      saveSelectedSupplierParams: true
    }),
    [SaveSelectedSupplier.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      saveSelectedSupplierParams: false
    }),
    [AddSupplier.pending]: (state) => ({
      ...state,
      loading: true,
      success: false
    }),
    [AddSupplier.fulfilled]: (state, action) => {
      const currentState = current(state);
      const suppliersList = cloneDeep(currentState.suppliers);

      const { totalSuppliers, supplierPageLimit } = currentState;
      const { newSupplier } = action.payload.data;

      suppliersList.unshift(newSupplier);
      if (suppliersList.length > supplierPageLimit) {
        suppliersList.pop();
      }

      return {
        ...state,
        loading: false,
        success: true,
        notifyMessage: action.payload.message,
        notifyType: 'success',
        notify: true,
        suppliers: suppliersList,
        totalSuppliers: totalSuppliers + 1
      };
    },
    [AddSupplier.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [DownloadSuppliers.pending]: (state) => ({
      ...state,
      loading: true,
      saveSelectedSupplierParams: false,
      success: false
    }),
    [DownloadSuppliers.fulfilled]: (state) => ({
      ...state,
      loading: false,
      success: true
    }),
    [DownloadSuppliers.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [UpdateSupplier.pending]: (state) => ({
      ...state,
      loading: true,
      success: false,
      supplierUpdated: false
    }),
    [UpdateSupplier.fulfilled]: (state, action) => ({
      ...state,
      loading: false,
      success: true,
      notifyMessage: action.payload.message,
      notifyType: 'success',
      notify: true,
      supplierUpdated: true,
      supplierDetail: action.payload.data.updatedSupplier
    }),
    [UpdateSupplier.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      supplierUpdated: false
    })
  }
});

const { reducer, actions } = supplier;

export const { SetSupplierState, SetSupplierNotifyState } = actions;
export default reducer;
