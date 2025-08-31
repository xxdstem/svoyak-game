import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Box, Paper, Typography, List, ListItem, ListItemText, ListItemIcon, CircularProgress } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import http from "~/utils/axios";
import type { Room } from "~/types";
import { useDispatch } from "react-redux";
import { joinRoom } from "~/store/user";

export default function App (){
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setLoading] = useState(true);

  useEffect(()=>{
    http.get("/rooms/list").then((r)=>{
      setRooms(r.data || []);
    }).catch(()=>{
      setRooms([]);
    }).finally(()=>setLoading(false));
  },[]);

  const joinGame = useCallback(async(roomID: string)=>{
    const response = await http.get("/room/join", {data: roomID})
    dispatch(joinRoom(response.data.room_id));
    navigate(`/game`);
  },[])

  if (isLoading){
    return <Box sx={{display:'flex',justifyContent:'center',alignItems:'center',height:'100%'}}><CircularProgress /></Box>;
  }
  if (!isLoading && rooms.length === 0){
    return <Typography align="center" sx={{mt:4}}>Нет доступных комнат</Typography>;
  }
  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 6 }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" align="center" gutterBottom>Список комнат</Typography>
        <List>
          {rooms.map((room:Room) => (
            <ListItem 
              key={room.id} 
              sx={{ 
                cursor: 'pointer', 
                mb: 1, 
                borderRadius: 2, 
                bgcolor: 'background.paper', 
                boxShadow: 2, 
                transition: 'background 0.2s',
                '&:hover': {
                  bgcolor: 'primary.light',
                  boxShadow: 4,
                },
              }} 
              onClick={() => joinGame(room.id)}
            >
              {room.with_password && (
                <ListItemIcon><LockIcon color="action" /></ListItemIcon>
              )}
              <ListItemText
                primary={room.name}
                secondary={`Игроков: ${room.players_count ?? 0}/${room.players_max ?? 4}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}
