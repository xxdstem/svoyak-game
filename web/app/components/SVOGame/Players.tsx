import { Avatar, Box, Button, Paper, Typography, useTheme } from "@mui/material"
import { useDispatch, useSelector } from "react-redux";
import { $room, setRoleForUser, setRoomData } from "~/store/room";
import { type RoomDetails, type RoomPlayer } from "./types";
import { useMemo } from "react";
import { $currentUser } from "~/store/user";
import http from "~/utils/axios";
import StarIcon from '@mui/icons-material/Star';

export const Players: React.FC = () => {
    
    const theme = useTheme();
    const dispatch = useDispatch();

    const user = useSelector($currentUser);
    const room = useSelector($room);

    const currentPlayer = useMemo<RoomPlayer | undefined>(()=>Object.values(room.players).find(p => p != null && p.id == user?.session_id), [room]);
    

    const joinAsUser = async (slotId: number) => {
        var f = new FormData();
        f.append("slotId", String(slotId))
        try{
          var r = await http.patch("/game/join", f);
          dispatch(setRoomData(r.data))
        } catch(e) {
          console.error(e)
        }
          
        //dispatch(setRoleForUser({user_id: user?.session_id, role: "player"}))
    }
    
    return <Box sx={{ 
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: theme.palette.background.paper,
        padding: 2,
        display: 'flex',
        justifyContent: 'center',
        gap: 2,
      }}>
        {Object.entries(room.players)
          .filter(([slot]) => parseInt(slot) >= 0)
          .map(([slot, player]) => player == null ? (
            <Paper key={slot} onClick={()=>joinAsUser(parseInt(slot))}
              elevation={3} sx={{ 
              padding: 2,
              minWidth: 150,
              backgroundColor: theme.palette.background.default,
              color: "#fff",
              cursor: !currentPlayer ? "pointer" : "default"
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', flexDirection:"column", alignItems: 'center' }}>
                  <Avatar sx={{ 
                    width: 40, 
                    height: 40, 
                    bgcolor: 'rgba(0, 0, 0, 0.1)',
                    color: "rgba(255, 255, 255, 0.5)",
                    marginBottom: 1,
                  }}>
                    ?
                  </Avatar>
                  <Typography variant="subtitle1" color='#fff'>
                    {!currentPlayer ? "Занять слот" : "Ожидаем игрока"}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          ) :
            <Paper key={slot} elevation={3} sx={{ 
              padding: 2,
              minWidth: 150,
              backgroundColor: player.color,
              color: "#fff",
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', flexDirection:"row", alignItems: 'center' }}>
                  <Avatar sx={{ 
                    width: 40, 
                    height: 40, 
                    bgcolor: 'rgba(0, 0, 0, 0.2)',
                    marginRight: 2,
                  }}>
                    ?
                  </Avatar>
                  <Typography variant="h6" color='#fff'>
                    {player.username} {player.room_stats.QuestionPicker &&  <StarIcon sx={{marginBottom: '-3px'}} fontSize="small" />}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="h4" align="center" sx={{ marginTop: 1 }}>
                {player.room_stats.Points} 
              </Typography>
            </Paper>
          )}
      </Box>
}