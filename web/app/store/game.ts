import { createSlice } from '@reduxjs/toolkit';
import type { Package } from '~/components/SVOGame/types';
import type { StoreState } from '~/types';



const initialState: Package | null = null;

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setGameData(state, action) {
      console.log("setting gamedata", action.payload)
      return action.payload
    }
  }
});

export const { setGameData } = gameSlice.actions;
export const $game = (state: StoreState) => state.game;

export default gameSlice.reducer;