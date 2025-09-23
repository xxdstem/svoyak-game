import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RoomDetails } from '~/components/SVOGame/types';
import type { RootState } from '~/types';



interface RoomState {
  data: RoomDetails | null;
}

const initialState: RoomState = {
  data: null
};

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    setRoomData(state, action: PayloadAction<RoomDetails | null>) {
      const newRoom = action.payload;
      
      if (newRoom == null) {
        state.data = null;
        return;
      }
      
      if (state.data && state.data.players && newRoom.players) {
        Object.values(newRoom.players).forEach(player => {
          const oldPlayer = Object.values(state.data!.players!).find(p => player && p && p.id === player.id);
          if (oldPlayer) {
            player.popperText = oldPlayer.popperText;
          }
        });
      }
      state.data = newRoom;
    },
    setPlayerPopper(state: RoomState, action) {
      const { id, popperText } = action.payload;
      if (!state.data || !state.data.players) return;
      Object.values(state.data.players).forEach(player => {
        if (player && player.id === id) {
          player.popperText = popperText;
        }
      });
    }
  }
});

export const { setRoomData, setPlayerPopper } = roomSlice.actions;
export const $room = (state: RootState) => state.room.data;

export default roomSlice.reducer;