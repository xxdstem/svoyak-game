import { createSlice } from '@reduxjs/toolkit';
import type { Package, RoomDetails } from '~/components/SVOGame/types';
import type { RootState } from '~/types';



const initialState: RoomDetails | null = null;

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    setRoomData(state, action) {
      return action.payload
    },
    setRoleForUser(state: RoomDetails | null, action) { 
      if (state !== null) {
        const { user_id, role } = action.payload;
        
        const existingUserIndex = Object.values(state.players).findIndex(user => user.id === user_id);
        
        if (existingUserIndex !== -1) {
          //state.players[existingUserIndex].room_stats.Role = role;
        } 
      }
    }
  }
});

export const { setRoomData, setRoleForUser } = roomSlice.actions;
export const $room = (state: RootState) => state.room;

export default roomSlice.reducer;