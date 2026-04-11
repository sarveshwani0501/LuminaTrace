import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import orgReducer from './slices/orgSlice';
import projectReducer from './slices/projectSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    org: orgReducer,
    project: projectReducer
  },
});

export default store;
