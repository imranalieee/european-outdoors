import { createSlice } from '@reduxjs/toolkit';

const error = createSlice({
  name: 'error',
  initialState: {
    errorMessage: ''
  },
  reducers: {
    SetErrorState(state, { payload: { field, value } }) {
      state[field] = value;
    }
  }
});

const { reducer, actions } = error;

export const { SetErrorState } = actions;

export default reducer;
