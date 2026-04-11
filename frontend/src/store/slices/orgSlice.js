import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchOrganizations = createAsyncThunk(
  'org/fetchOrganizations',
  async (_, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      return [
        { id: 'org_1', name: 'Test Org', role: 'owner' },
        { id: 'org_2', name: 'Secondary Startup', role: 'member' }
      ];
    } catch (error) {
      return rejectWithValue('Failed to fetch organizations');
    }
  }
);

export const createOrganization = createAsyncThunk(
  'org/createOrganization',
  async (orgData, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { id: `org_${Math.random().toString(36).substring(7)}`, name: orgData.name, role: 'owner' };
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
