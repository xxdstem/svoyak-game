import { createSlice } from '@reduxjs/toolkit';
import type { RoomDetails } from '~/components/SVOGame/types';
import type { RootState } from '~/types';



const initialState: RoomDetails | null = null;

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    setRoomData(state, action) {
      return action.payload
    }
  }
});

export const { setRoomData } = roomSlice.actions;
export const $room = (state: RootState) => state.room;

export default roomSlice.reducer;