import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import rulesReducer from './slices/rulesSlice';
import warehouseReducer from './slices/warehouseSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    rules: rulesReducer,
    warehouse: warehouseReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
