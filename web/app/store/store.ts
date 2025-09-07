import { configureStore } from '@reduxjs/toolkit';
import userReducer from './user';
import roomReducer from './room';

export const store = configureStore({
  reducer: {
    user: userReducer,
    room: roomReducer,
  }
});

export type AppDispatch = typeof store.dispatch;