import { createSlice } from '@reduxjs/toolkit';

type State = {
    user: any
}

const initialState = {
  currentUser: null
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.currentUser = action.payload;
    },
    clearUser: (state) => {
      state.currentUser = null;
    }
  }
});

export const { setUser, clearUser } = userSlice.actions;
export const $currentUser = (state: State) => state.user.currentUser;

export default userSlice.reducer;