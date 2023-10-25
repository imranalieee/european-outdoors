import { cloneDeep, extend } from 'lodash';

import { createSlice, createAsyncThunk, current } from '@reduxjs/toolkit';

import { HandleCatchBlock } from '../../../utils/helpers';
import { axiosBaseUrl } from '../../config/axios-configuration';

const axios = axiosBaseUrl();

export const GetJobs = createAsyncThunk(
  'jobs/getJobs',
  async (data, { rejectWithValue }) => {
    try {
      const { skip, limit, filters } = data;
      const response = await axios.get('/jobs/get-jobs', {
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

export const DeleteJob = createAsyncThunk(
  'jobs/deleteJob',
  async (job, { rejectWithValue }) => {
    const { jobId, agendaType } = job;
    try {
      const response = await axios.delete('/jobs/delete-job-by-id', { data: { jobId, agendaType } });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

export const RequeueJob = createAsyncThunk(
  'jobs/requeueJob',
  async (job, { rejectWithValue }) => {
    const { jobId, agendaType } = job;
    try {
      const response = await axios.patch('/jobs/requeue-job-by-id', { jobId, agendaType });
      return response.data;
    } catch (err) {
      return rejectWithValue(HandleCatchBlock(err));
    }
  }
);

const jobs = createSlice({
  name: 'jobs',
  initialState: {
    error: '',
    message: '',
    loading: false,
    success: false,
    notifyMessage: '',
    notify: false,
    notifyType: '',
    totalJobs: 0,
    jobs: [],
    isJobDeleted: false,
    updatedJob: {}
  },
  reducers: {
    SetJobState(state, { payload: { field, value } }) {
      state[field] = value;
    }
  },
  extraReducers: {
    [GetJobs.pending]: (state) => ({
      ...state,
      loading: true,
      success: false
    }),
    [GetJobs.fulfilled]: (state, action) => ({
      ...state,
      loading: false,
      success: true,
      totalJobs: action.payload.data.totalJobs,
      jobs: action.payload.data.jobs
    }),
    [GetJobs.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      error: action.payload.error
    }),
    [DeleteJob.pending]: (state) => ({
      ...state,
      loading: true,
      success: false,
      isJobDeleted: false
    }),
    [DeleteJob.fulfilled]: (state, action) => ({
      ...state,
      loading: false,
      success: true,
      notifyMessage: action.payload.message,
      notifyType: 'success',
      notify: true,
      isJobDeleted: true
    }),
    [DeleteJob.rejected]: (state, action) => ({
      ...state,
      loading: false,
      success: false,
      notifyMessage: action.payload.error,
      notifyType: 'error',
      notify: true,
      error: action.payload.error,
      isJobDeleted: false
    }),
    [RequeueJob.pending]: (state) => ({
      ...state,
      loading: true,
      success: false
    }),
    [RequeueJob.fulfilled]: (state, action) => {
      const { updatedJob } = action.payload.data;

      const currentState = current(state);
      const jobsList = cloneDeep(currentState.jobs);
      const requeuedJob = jobsList.find((job) => job._id === updatedJob?._id);
      const index = jobsList.findIndex((job) => job._id === updatedJob?._id);
      const { storeName } = requeuedJob;
      extend(updatedJob, { storeName });
      jobsList[index] = updatedJob;

      return {
        ...state,
        loading: false,
        success: true,
        notifyMessage: action.payload.message,
        notifyType: 'success',
        notify: true,
        jobs: jobsList
      };
    },
    [RequeueJob.rejected]: (state, action) => ({
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

const { reducer, actions } = jobs;

export const { SetJobState } = actions;
export default reducer;
