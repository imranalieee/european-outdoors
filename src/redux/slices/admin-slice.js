import { cloneDeep, isEmpty } from 'lodash';

import { createSlice, createAsyncThunk, current } from '@reduxjs/toolkit';

import { HandleCatchBlock } from '../../../utils/helpers';
import { axiosBaseUrl } from '../../config/axios-configuration';

const axios = axiosBaseUrl();

export const ReInviteUser = createAsyncThunk(
  'admin/re-invite-user',
  async (data, { rejectWithValue }) => {
    try {
      const { userId } = data;
      const response = await axios.post('/admin/re-invite-user', {
        userId
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const InviteNewUser = createAsyncThunk(
  'admin/invite-user',
  async (data, { rejectWithValue }) => {
    try {
      const { name, email } = data;
      const response = await axios.post('/admin/invite-user', {
        name, email: email.trim()
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const ArchiveUser = createAsyncThunk(
  'admin/archive-user',
  async (data, { rejectWithValue }) => {
    try {
      const { userId } = data;
      const response = await axios.patch('/admin/archive-user', {
        userId
      });

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const UnarchiveUser = createAsyncThunk(
  'admin/unarchive-user',
  async (data, { rejectWithValue }) => {
    try {
      const { userId } = data;
      const response = await axios.patch('/admin/unarchive-user', {
        userId
      });

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const UpdateUserByAdmin = createAsyncThunk(
  'admin//update-user-by-admin',
  async (data, { rejectWithValue }) => {
    try {
      const { userId, paramsToUpdate } = data;
      const response = await axios.patch('/admin/update-user-by-admin', {
        userId,
        paramsToUpdate
      });

      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const GetUsers = createAsyncThunk(
  'admin/get-users',
  async (data, { rejectWithValue }) => {
    try {
      const {
        skip, limit, filters, sortBy
      } = data;
      const response = await axios.get('/admin/get-users', {
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

export const GetUserImage = createAsyncThunk(
  'user/getUserImage',
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

const admin = createSlice({
  name: 'admin',
  initialState: {
    error: '',
    message: '',
    loading: false,
    success: false,
    totalUsers: 0,
    users: [],
    notify: false,
    notifyMessage: '',
    notifyType: 'error',
    selectedPagination: 100,
    userDeleted: false,
    imageKey: null
  },
  reducers: {
    SetAdminState(state, { payload: { field, value } }) {
      state[field] = value;
    },
    SetAdminNotifyState(state, { payload: { message, type } }) {
      state.notify = true;
      state.notifyMessage = message;
      state.notifyType = type;
    }
  },
  extraReducers: {
    [ReInviteUser.pending]: (state) => ({
      ...state,
      success: false,
      loading: true
    }),
    [ReInviteUser.fulfilled]: (state, action) => ({
      ...state,
      loading: false,
      success: true,
      notifyMessage: action.payload.message,
      notifyType: 'success',
      notify: true
    }),
    [ReInviteUser.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [InviteNewUser.pending]: (state) => ({
      ...state,
      success: false,
      loading: true
    }),
    [InviteNewUser.fulfilled]: (state, action) => {
      const currentState = current(state);
      const usersList = cloneDeep(currentState.users);

      const { totalUsers, selectedPagination } = currentState;
      const { user } = action.payload.data;

      usersList.unshift(user);
      if (usersList.length > selectedPagination) {
        usersList.pop();
      }

      return {
        ...state,
        loading: false,
        success: true,
        notifyMessage: action.payload.message,
        notifyType: 'success',
        notify: true,
        totalUsers: totalUsers + 1,
        users: usersList
      };
    },
    [InviteNewUser.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [ArchiveUser.pending]: (state) => ({
      ...state,
      success: false,
      loading: true,
      userDeleted: false
    }),
    [ArchiveUser.fulfilled]: (state, action) => {
      const currentState = current(state);
      const usersList = cloneDeep(currentState.users);

      const { user } = action.payload.data;

      let userDeleted = true;
      if (!isEmpty(user)) {
        const id = user._id;
        const index = usersList.findIndex((indx) => indx._id === id);
        usersList[index] = user;
        userDeleted = false;
      }

      return {
        ...state,
        loading: false,
        success: true,
        notifyMessage: action.payload.message,
        notifyType: 'success',
        notify: true,
        users: usersList,
        userDeleted
      };
    },
    [ArchiveUser.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      userDeleted: false
    }),
    [UnarchiveUser.pending]: (state) => ({
      ...state,
      success: false,
      loading: true
    }),
    [UnarchiveUser.fulfilled]: (state, action) => {
      const currentState = current(state);
      const usersList = cloneDeep(currentState.users);

      const { user } = action.payload.data;
      const id = user._id;
      const index = usersList.findIndex((indx) => indx._id === id);
      usersList[index] = user;

      return {
        ...state,
        loading: false,
        success: true,
        notifyMessage: action.payload.message,
        notifyType: 'success',
        notify: true,
        users: usersList
      };
    },
    [UnarchiveUser.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [GetUsers.pending]: (state) => ({
      ...state,
      success: false,
      loading: true
    }),
    [GetUsers.fulfilled]: (state, action) => ({
      ...state,
      loading: false,
      success: true,
      totalUsers: action.payload.data.totalUsers,
      users: action.payload.data.users
    }),
    [GetUsers.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [UpdateUserByAdmin.pending]: (state) => ({
      ...state,
      success: false,
      loading: true
    }),
    [UpdateUserByAdmin.fulfilled]: (state, action) => {
      const currentState = current(state);
      const usersList = cloneDeep(currentState.users);
      const { updatedUser } = action.payload.data;
      const id = updatedUser._id;
      const index = usersList.findIndex((indx) => indx._id === id);
      usersList[index] = updatedUser;

      return {
        ...state,
        loading: false,
        success: true,
        notifyMessage: action.payload.message,
        notifyType: 'success',
        notify: true,
        users: usersList
      };
    },
    [UpdateUserByAdmin.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    })
  }
});

const { reducer, actions } = admin;

export const { SetAdminState, SetAdminNotifyState } = actions;
export default reducer;
