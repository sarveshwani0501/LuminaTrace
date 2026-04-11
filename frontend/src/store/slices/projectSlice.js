import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchProjects = createAsyncThunk(
  'project/fetchProjects',
  async (orgId, { rejectWithValue }) => {
    try {
      if (!orgId) throw new Error("Organization ID is required");
      // Simulate API call scoped to an Organization
      await new Promise(resolve => setTimeout(resolve, 800));
      return [
        { id: 'proj_1', name: 'Frontend React App', apiKey: 'lumina_pk_xxxx1', platform: 'browser' },
        { id: 'proj_2', name: 'Backend Fastify API', apiKey: 'lumina_pk_xxxx2', platform: 'node' }
      ];
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch projects');
    }
  }
);

export const createProject = createAsyncThunk(
  'project/createProject',
  async ({ orgId, projectData }, { rejectWithValue }) => {
    try {
      if (!orgId) throw new Error("Organization ID is required");
      // Simulate API call to /orgs/:orgId/projects
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { 
        id: `proj_${Math.random().toString(36).substring(7)}`, 
        name: projectData.name, 
        description: projectData.description || '',
        api_key: `lumina_pk_${Math.random().toString(36).substring(2)}`,
        retention_days: 30,
        created_at: new Date().toISOString()
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create project');
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
      // Switches the active project Context
      const selected = state.list.find(p => p.id === action.payload || p.id === action.payload.id);
      if (selected) {
        state.currentProject = selected;
      } else if (action.payload === null) {
        state.currentProject = null;
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
        // Switch to the newly created project
        state.currentProject = action.payload;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setCurrentProject, clearProjectError, clearProjects } = projectSlice.actions;

export default projectSlice.reducer;
