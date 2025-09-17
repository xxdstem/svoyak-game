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
    },
    setPlayerPopper(state: RoomDetails | null, action) {
      const { id, popperText } = action.payload;
      if (!state || !state.players) return;
      Object.values(state.players).forEach(player => {
        if (player && player.id === id) {
          player.popperText = popperText;
        }
      });
    }
  }
});

export const { setRoomData, setPlayerPopper } = roomSlice.actions;
export const $room = (state: RootState) => state.room;

export default roomSlice.reducer;