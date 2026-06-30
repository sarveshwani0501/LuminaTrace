import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { verifyOTP, loginUser, logoutUser } from './authSlice';

export const fetchOrganizations = createAsyncThunk(
  'org/fetchOrganizations',
  async (_, { rejectWithValue }) => {
    try {
     
      return [] 
    } catch (error) {
      return rejectWithValue('Failed to fetch orgs');
    }
  }
);

import { orgApi } from '../../api/org';

export const createOrganization = createAsyncThunk(
  'org/createOrganization',
  async (orgData, { rejectWithValue }) => {
    try {
      const response = await orgApi.createOrg(orgData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create organization');
    }
  }
);

const initialState = {
  list: [],
  currentOrg: null,
  isLoading: false,
  error: null,
};

const orgSlice = createSlice({
  name: 'org',
  initialState,
  reducers: {
    setCurrentOrg: (state, action) => {
      // Expects an organization ID or the whole object
      const selected = state.list.find(org => org.id === action.payload || org.id === action.payload.id);
      if (selected) {
        state.currentOrg = selected;
      }
    },
    clearOrgError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Intercept the Login action to hydrate the Org Array automatically!
      .addCase(loginUser.fulfilled, (state, action) => {
        state.list = action.payload.organizations || [];
        if (state.list.length > 0 && !state.currentOrg) {
          state.currentOrg = state.list[0];
        }
      })
      // Duplicate interceptor for OTP Verification since it auto-logs users in bypassing Login map
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.list = action.payload.organizations || [];
        if (state.list.length > 0 && !state.currentOrg) {
          state.currentOrg = state.list[0];
        }
      })
      .addCase(fetchOrganizations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrganizations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
        // Auto-select the first org if none is currently selected
        if (state.list.length > 0 && !state.currentOrg) {
          state.currentOrg = state.list[0];
        }
      })
      .addCase(fetchOrganizations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createOrganization.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrganization.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list.push(action.payload);
        // Switch context to newly created org
        state.currentOrg = action.payload;
      })
      .addCase(createOrganization.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Clear all org state on logout so the next user starts fresh
      .addCase(logoutUser.fulfilled, (state) => {
        state.list = [];
        state.currentOrg = null;
        state.isLoading = false;
        state.error = null;
      });
  },
});

export const { setCurrentOrg, clearOrgError } = orgSlice.actions;

export default orgSlice.reducer;
