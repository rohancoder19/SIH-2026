import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import gisReducer from './gisSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    gis: gisReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
