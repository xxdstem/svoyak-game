import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState, User } from '~/types';



const initialState: User | null = null;

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    leaveRoom: (state: User | null) => {
      if (state) {
        state.room_id = "";
      }
    },
    joinRoom: (state: User | null, action) => {
      if (state) {
        state.room_id = action.payload;
      }
    },
    
    setUser: (state: User | null, action) => {
      localStorage.setItem("username", action.payload.username)
      return action.payload;
    },
    clearUser: () => {
      return null;
    }
  }
});

export const { setUser, clearUser, leaveRoom, joinRoom } = userSlice.actions;
export const $currentUser = (state: RootState) => state.user;

export default userSlice.reducer;