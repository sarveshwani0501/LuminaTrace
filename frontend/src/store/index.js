import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import authReducer from './slices/authSlice';
import orgReducer from './slices/orgSlice';
import projectReducer from './slices/projectSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  org: orgReducer,
  project: projectReducer
});


const customStorage = {
  getItem: (key) => Promise.resolve(window.localStorage.getItem(key)),
  setItem: (key, item) => {
    window.localStorage.setItem(key, item);
    return Promise.resolve();
  },
  removeItem: (key) => {
    window.localStorage.removeItem(key);
    return Promise.resolve();
  }
};

const persistConfig = {
  key: 'root',
  storage: customStorage,
  whitelist: ['auth', 'org', 'project']
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, 
    }),
});

export const persistor = persistStore(store);
export default store;
