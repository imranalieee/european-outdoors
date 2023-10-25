import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { HandleCatchBlock } from '../../../utils/helpers';
import { axiosBaseUrl } from '../../config/axios-configuration';

const axios = axiosBaseUrl();

export const UpdateUser = createAsyncThunk(
  'user/updateUser',
  async ({ oldPassword, updateParams }, { rejectWithValue }) => {
    try {
      const response = await axios.patch('/user/update-user-by-id', {
        oldPassword,
        updateParams
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetPreSignedUrl = createAsyncThunk(
  'user/getPreSignedUrl',
  async (fileData, { rejectWithValue }) => {
    try {
      const {
        uploadBucket,
        fileName,
        fileType,
        extension
      } = fileData;
      const response = await axios.get('/others/get-s3-pre-signed-url', {
        params: {
          uploadBucket,
          fileName,
          fileType,
          extension
        }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const UpdateProfileImage = createAsyncThunk(
  'user/updateProfileImage',
  async ({ updateParams }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        '/user/update-user-profile-image',
        { updateParams }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetS3Document = createAsyncThunk(
  'user/getS3Document',
  async (params, { rejectWithValue }) => {
    try {
      const {
        uploadBucket,
        key
      } = params;
      const response = await axios.get('/others/get-s3-document', {
        params: {
          uploadBucket,
          key
        }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

const user = createSlice({
  name: 'user',
  initialState: {
    error: '',
    message: '',
    loading: false,
    success: false,
    loggedUser: {},
    notifyMessage: '',
    notify: false,
    notifyType: '',
    userUpdated: false,
    preSignedUrl: '',
    profilePictureUrl: null,
    fileUploadKey: '',
    tempUserState: null
  },
  reducers: {
    SetUserState(state, { payload: { field, value } }) {
      state[field] = value;
    },
    SetUserNotifyState(state, { payload: { message, type } }) {
      state.notify = true;
      state.notifyMessage = message;
      state.notifyType = type;
    }
  },
  extraReducers: {
    [UpdateUser.pending]: (state) => ({
      ...state,
      success: false,
      loading: true,
      userUpdated: false
    }),
    [UpdateUser.fulfilled]: (state, action) => ({
      ...state,
      loading: false,
      success: true,
      notifyMessage: action.payload.message,
      notifyType: 'success',
      notify: true,
      userUpdated: true,
      loggedUser: action.payload.data.user
    }),
    [UpdateUser.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      error: action.payload.error,
      userUpdated: false
    }),
    [GetPreSignedUrl.pending]: (state) => ({
      ...state,
      success: false,
      loading: true
    }),
    [GetPreSignedUrl.fulfilled]: (state, action) => ({
      ...state,
      loading: false,
      success: true,
      preSignedUrl: action.payload.data.preSignedUrl,
      fileUploadKey: action.payload.data.fileUploadKey
    }),
    [GetPreSignedUrl.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      error: action.payload.error
    }),
    [UpdateProfileImage.pending]: (state) => ({
      ...state,
      success: false,
      loading: true,
      userUpdated: false
    }),
    [UpdateProfileImage.fulfilled]: (state, action) => ({
      ...state,
      loading: false,
      success: true,
      notifyMessage: action.payload.message,
      notifyType: 'success',
      notify: true,
      userUpdated: true,
      loggedUser: action.payload.data.user
    }),
    [UpdateProfileImage.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      error: action.payload.error,
      userUpdated: false
    })
  }
});

const { reducer, actions } = user;

export const { LogOut, SetUserState, SetUserNotifyState } = actions;

export default reducer;
