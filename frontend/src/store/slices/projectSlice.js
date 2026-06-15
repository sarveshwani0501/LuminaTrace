import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { projectApi } from '../../api/project';
import { logoutUser } from './authSlice';

export const fetchProjects = createAsyncThunk(
  'project/fetchProjects',
  async (orgId, { rejectWithValue }) => {
    try {
      if (!orgId) throw new Error("Organization ID is required");
      const response = await projectApi.getProjects(orgId);
      // Backend returns raw array directly, not wrapped in { projects: [] }
      return Array.isArray(response.data) ? response.data : (response.data.projects || []);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch projects');
    }
  }
);

export const createProject = createAsyncThunk(
  'project/createProject',
  async ({ orgId, projectData }, { rejectWithValue }) => {
    try {
      if (!orgId) throw new Error("Organization ID is required");
      const response = await projectApi.createProject(orgId, projectData);
      // Backend returns the project object directly (with plaintext api_key one-time)
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create project');
    }
  }
);

const initialState = {
  list: [],
  currentProject: null,
  isLoading: false,
  error: null,
};

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setCurrentProject: (state, action) => {
      const payload = action.payload;
      if (!payload) {
        state.currentProject = null;
        return;
      }
      // Accept either a full project object or a string ID
      if (typeof payload === 'object' && payload.id) {
        state.currentProject = payload;
      } else {
        const found = state.list.find(p => p.id === payload);
        if (found) state.currentProject = found;
      }
    },
    clearProjectError: (state) => {
      state.error = null;
    },
    // Clear projects entirely when switching orgs
    clearProjects: (state) => {
      state.list = [];
      state.currentProject = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
        // Auto-select the first project if none is active
        if (state.list.length > 0 && !state.currentProject) {
          state.currentProject = state.list[0];
        }
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list.push(action.payload);
        // NOTE: Do NOT auto-select the project here.
        // The CreateProjectModal controls this — it shows the one-time API key first,
        // then dispatches setCurrentProject only after the user confirms they've saved it.
      })
      .addCase(createProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Clear all project state on logout so the next user starts fresh
      .addCase(logoutUser.fulfilled, (state) => {
        state.list = [];
        state.currentProject = null;
        state.isLoading = false;
        state.error = null;
      });
  },
});

export const { setCurrentProject, clearProjectError, clearProjects } = projectSlice.actions;

export default projectSlice.reducer;
