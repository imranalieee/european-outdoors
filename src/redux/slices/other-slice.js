import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { HandleCatchBlock } from '../../../utils/helpers';
import { axiosBaseUrl } from '../../config/axios-configuration';

const axios = axiosBaseUrl();

export const GetS3PreSignedUrl = createAsyncThunk(
  'other/get-s3-pre-signed-url',
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

      return {
        data: response.data
      };
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

const others = createSlice({
  name: 'other',
  initialState: {
    loading: false,
    success: false,
    notify: false,
    notifyMessage: '',
    notifyType: 'error',
    preSignedUrl: '',
    fileUploadKey: '',
    stockJobProgress: undefined
  },
  reducers: {
    SetOtherState(state, { payload: { field, value } }) {
      state[field] = value;
    },
    SetOtherNotifyState(state, { payload: { message, type } }) {
      state.notify = true;
      state.notifyMessage = message;
      state.notifyType = type;
    }
  },
  extraReducers: {
    [GetS3PreSignedUrl.pending]: (state) => ({
      ...state,
      success: false,
      loading: true
    }),
    [GetS3PreSignedUrl.fulfilled]: (state, action) => ({
      ...state,
      loading: false,
      success: true,
      preSignedUrl: action.payload.data.data.preSignedUrl,
      fileUploadKey: action.payload.data.data.fileUploadKey
    }),
    [GetS3PreSignedUrl.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    })
  }
});

const { reducer, actions } = others;

export const { SetOtherState, SetOtherNotifyState } = actions;

export default reducer;
