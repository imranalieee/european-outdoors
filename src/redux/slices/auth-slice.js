import { createSlice, createAsyncThunk, current } from '@reduxjs/toolkit';
import { cloneDeep } from 'lodash';

import { HandleCatchBlock } from '../../../utils/helpers';
import { axiosBaseUrl } from '../../config/axios-configuration';

import {
  ROUTE_PATH_BY_PERMISSION_BASE,
  DEFAULT_ROUTES,
  ADMIN_ROUTES
} from '../../constants';

const axios = axiosBaseUrl();

export const SignIn = createAsyncThunk(
  'auth/signIn',
  async (user, { rejectWithValue }) => {
    try {
      const { email, password } = user;
      const response = await axios.post('/auth/sign-in', { email: email.trim(), password });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const ForgotPassword = createAsyncThunk(
  'auth/forgot-password',
  async (data, { rejectWithValue }) => {
    try {
      const { email } = data;
      const response = await axios.post('/auth/forgot-password', { email: email.trim() });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const ResetPassword = createAsyncThunk(
  'auth/reset-password',
  async (data, { rejectWithValue }) => {
    try {
      const { password, userId } = data;
      const response = await axios.patch('/auth/reset-password', { password, userId });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const RegisterUser = createAsyncThunk(
  'auth/register-user',
  async (data, { rejectWithValue }) => {
    try {
      const { password, userId, name } = data;
      const response = await axios.patch('/auth/register-user', { password, userId, name });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

const auth = createSlice({
  name: 'auth',
  initialState: {
    error: '',
    message: '',
    loading: false,
    success: false,
    token: '',
    user: {},
    notifyMessage: '',
    notify: false,
    notifyType: '',
    allowedRoutes: DEFAULT_ROUTES,
    defaultRoute: '/users'
  },
  reducers: {
    SetAuthState(state, { payload: { field, value } }) {
      state[field] = value;
    },
    LogOut: (state) => ({
      ...state,
      error: '',
      loading: false,
      message: '',
      success: false,
      token: '',
      user: {}
    }),
    SetAuthNotifyState(state, { payload: { message, type } }) {
      state.notify = true;
      state.notifyMessage = message;
      state.notifyType = type;
    }
  },

  extraReducers: {
    [SignIn.pending]: (state) => ({
      ...state,
      success: false,
      loading: true
    }),
    [SignIn.fulfilled]: (state, action) => {
      const currentState = current(state);
      let routeList = cloneDeep(currentState.allowedRoutes);
      const { role, permissions, status } = action.payload.data.user;
      let dfRoute = '/users';
      if (role === 'admin') {
        routeList = [...routeList, ...ADMIN_ROUTES];
      } else if (role === 'user' && status === 'registered') {
        const {
          viewProducts, viewOrders, viewPurchasing, viewSuppliers
        } = permissions;

        routeList = [...ROUTE_PATH_BY_PERMISSION_BASE.default];
        if (viewProducts) {
          routeList.push(...ROUTE_PATH_BY_PERMISSION_BASE.viewProducts);
          dfRoute = '/products';
        }

        if (viewOrders) {
          routeList.push(...ROUTE_PATH_BY_PERMISSION_BASE.viewOrders);
          if (dfRoute === '/users') {
            dfRoute = '/orders';
          }
        }

        if (viewPurchasing) {
          routeList.push(...ROUTE_PATH_BY_PERMISSION_BASE.viewPurchasing);
          if (dfRoute === '/users') {
            dfRoute = '/purchasing';
          }
        }

        if (viewSuppliers) {
          routeList.push(...ROUTE_PATH_BY_PERMISSION_BASE.viewSuppliers);
          if (dfRoute === '/users') {
            dfRoute = '/suppliers';
          }
        }
      } else if (role === 'user' && status === 'archived') {
        dfRoute = '/archived-user';
        routeList = [...routeList, '/archived-user'];
      }

      return {
        ...state,
        loading: false,
        success: true,
        token: action.payload.data.token,
        user: action.payload.data.user,
        allowedRoutes: routeList,
        defaultRoute: dfRoute
      };
    },
    [SignIn.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      error: action.payload.error
    }),
    [ForgotPassword.pending]: (state) => ({
      ...state,
      success: false,
      loading: true
    }),
    [ForgotPassword.fulfilled]: (state, action) => ({
      ...state,
      loading: false,
      success: true,
      message: action.payload.message,
      notifyMessage: action.payload.message,
      notifyType: 'success',
      notify: true
    }),
    [ForgotPassword.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      error: action.payload.error,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [ResetPassword.pending]: (state) => ({
      ...state,
      success: false,
      loading: true
    }),
    [ResetPassword.fulfilled]: (state, action) => ({
      ...state,
      loading: false,
      success: true,
      message: action.payload.message,
      notifyMessage: action.payload.message,
      notifyType: 'success',
      notify: true
    }),
    [ResetPassword.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      error: action.payload.error,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    }),
    [RegisterUser.pending]: (state) => ({
      ...state,
      success: false,
      loading: true
    }),
    [RegisterUser.fulfilled]: (state, action) => ({
      ...state,
      loading: false,
      success: true,
      message: action.payload.message,
      notifyMessage: action.payload.message,
      notifyType: 'success',
      notify: true
    }),
    [RegisterUser.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      error: action.payload.error,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true
    })
  }
});

const { reducer, actions } = auth;

export const { SetAuthState, LogOut, SetAuthNotifyState } = actions;

export default reducer;
