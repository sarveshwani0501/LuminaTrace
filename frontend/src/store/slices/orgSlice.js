import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { verifyOTP, loginUser } from './authSlice';

export const fetchOrganizations = createAsyncThunk(
  'org/fetchOrganizations',
  async (_, { rejectWithValue }) => {
    try {
      // In LuminaTrace schema, a user only has one org (the one they own). Or potentially orgs they belong to.
      // But looking at Auth route, login returns organizations array, but let's safely fetch if needed.
      // Wait, `/organizations` endpoint isn't defined? Actually, the user can only fetch the org they are a member of?
      // Since /auth/login returns the orgs, maybe we just use that action via extraReducers!
      // But if we do need this, let's just make it a passthrough since there's no clear GET /organizations endpoint without an ID
      return [] 
    } catch (error) {
      return rejectWithValue('Failed to fetch orgs');
    }
  }
);

export const createOrganization = createAsyncThunk(
  'org/createOrganization',
  async (orgData, { rejectWithValue }) => {
    try {
      // Wait, there is no generic POST /organizations in org route. 
      // Fastify schema creates the org during `/auth/signup`.
      return rejectWithValue('Organizations are created dynamically at Signup');
    } catch (error) {
      return rejectWithValue('Failed to create organization');
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
      });
  },
});

export const { setCurrentOrg, clearOrgError } = orgSlice.actions;

export default orgSlice.reducer;
