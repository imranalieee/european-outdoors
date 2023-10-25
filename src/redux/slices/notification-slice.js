import { cloneDeep } from 'lodash';

import { createSlice, createAsyncThunk, current } from '@reduxjs/toolkit';

import { HandleCatchBlock } from '../../../utils/helpers';
import { axiosBaseUrl } from '../../config/axios-configuration';

const axios = axiosBaseUrl();

export const GetNotifications = createAsyncThunk(
  'jobs/getNotifications',
  async (data, { rejectWithValue }) => {
    try {
      const {
        skip,
        limit,
        filters,
        key
      } = data || {};
      const response = await axios.get('/notification/get-notifications', {
        params: {
          filters: JSON.stringify(filters),
          skip,
          limit
        }
      });
      return { data: response.data, key };
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const UpdateNotification = createAsyncThunk(
  'jobs/updateNotification',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await axios.patch('/notification/update-notification-by-id', { notificationId });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

const notifications = createSlice({
  name: 'notifications',
  initialState: {
    error: '',
    message: '',
    loading: false,
    success: false,
    notifyMessage: '',
    notify: false,
    notifyType: '',
    totalNotifications: 0,
    unreadCount: 0,
    allNotifications: [],
    drawerNotifications: [],
    updatedNotification: {}
  },
  reducers: {
    SetNotificationState(state, { payload: { field, value } }) {
      state[field] = value;
    }
  },
  extraReducers: {
    [GetNotifications.pending]: (state) => ({
      ...state,
      loading: true,
      success: false
    }),
    [GetNotifications.fulfilled]: (state, action) => {
      const { key } = action.payload;
      const currentState = current(state);

      let drawerNotificationsList = cloneDeep(currentState.drawerNotifications);
      let allNotificationsList = cloneDeep(currentState.allNotifications);
      let totalNotifications = cloneDeep(currentState.totalNotifications);
      let unreadCount = cloneDeep(currentState.unreadCount);
      if (key === 'drawer') {
        drawerNotificationsList = action.payload.data.data.notifications;
        unreadCount = action.payload.data.data.totalNotifications;
      } else if (key === 'all') {
        allNotificationsList = action.payload.data.data.notifications;
        totalNotifications = action.payload.data.data.totalNotifications;
      }
      return {
        ...state,
        loading: false,
        success: true,
        totalNotifications,
        unreadCount,
        allNotifications: allNotificationsList,
        drawerNotifications: drawerNotificationsList
      };
    },
    [GetNotifications.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      error: action.payload.error
    }),
    [UpdateNotification.pending]: (state) => ({
      ...state,
      loading: true,
      success: false
    }),
    [UpdateNotification.fulfilled]: (state, action) => {
      const { updatedNotification, nextNotification } = action.payload.data;
      const currentState = current(state);
      const allNotificationsList = cloneDeep(currentState.allNotifications);
      let drawerNotificationsList = cloneDeep(currentState.drawerNotifications);

      const index = allNotificationsList.findIndex((notification) => (
        notification._id === updatedNotification?._id
      ));
      allNotificationsList[index] = updatedNotification;
      drawerNotificationsList = drawerNotificationsList.filter(
        (notification) => notification._id !== updatedNotification?._id
      );
      if (nextNotification) {
        drawerNotificationsList.push(nextNotification);
      }

      return {
        ...state,
        loading: false,
        success: true,
        allNotifications: allNotificationsList,
        drawerNotifications: drawerNotificationsList,
        unreadCount: currentState.unreadCount - 1
      };
    },
    [UpdateNotification.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      error: action.payload.error
    })
  }
});

const { reducer, actions } = notifications;

export const { SetNotificationState } = actions;
export default reducer;
