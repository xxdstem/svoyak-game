import { createSlice } from '@reduxjs/toolkit';
import type { StoreState } from '~/types';



const initialState = null;

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      console.log("setting", action.payload)
      localStorage.setItem("user", JSON.stringify(action.payload));
      return action.payload;
    },
    clearUser: (state) => {
      localStorage.removeItem("user");
      return null;
    }
  }
});

export const { setUser, clearUser } = userSlice.actions;
export const $currentUser = (state: StoreState) => state.user;

export default userSlice.reducer;