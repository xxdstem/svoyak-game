import { createSlice } from '@reduxjs/toolkit';
import type { Package, RoomDetails } from '~/components/SVOGame/types';
import type { GameState, StoreState } from '~/types';



const initialState: (Package & RoomDetails) | null = null;

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setGameData(state, action) {
      console.log("setting gamedata", action.payload)
      return action.payload
    },
    setRoleForUser(state: GameState, action) { 
      if (state !== null) {
        const { user_id, role } = action.payload;
        
        const existingUserIndex = state.players.findIndex(user => user.id === user_id);
        
        if (existingUserIndex !== -1) {
          state.players[existingUserIndex].room_stats.Role = role;
        } 
      }
    }
  }
});

export const { setGameData, setRoleForUser } = gameSlice.actions;
export const $game = (state: StoreState) => state.game;

export default gameSlice.reducer;