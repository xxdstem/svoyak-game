import { Avatar, Box, Button, Paper, Typography, useTheme } from "@mui/material"
import { useDispatch, useSelector } from "react-redux";
import { $room, setRoleForUser, setRoomData } from "~/store/room";
import { type RoomDetails, type RoomPlayer } from "./types";
import { useMemo } from "react";
import { $currentUser } from "~/store/user";
import http from "~/utils/axios";


export const Players: React.FC = () => {
    
    const theme = useTheme();
    const dispatch = useDispatch();

    const user = useSelector($currentUser);
    const room = useSelector($room);

    const currentPlayer = useMemo<RoomPlayer | undefined>(()=>room?.players.find(p=>p.id == user?.session_id), [room]);
    
    const playerColors = [
      "#2cf",
      "#f6a",
      theme.palette.warning.main,
      theme.palette.error.main
    ];

    const joinAsUser = async () => {
        var f = new FormData();
        f.append("role", "player")
        try{
          var r = await http.patch("/room/set_role", f);
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
        {currentPlayer?.room_stats.Role == "" && (
            <Paper key={-1} onClick={joinAsUser}
            elevation={3} sx={{ 
            padding: 2,
            minWidth: 150,
            backgroundColor: theme.palette.background.default,
            color: "#fff",
            cursor:"pointer"
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                  Присоедениться как игрок
                </Typography>
              </Box>
            </Box>
          </Paper>
        )}
        {room?.players.map((player, i) => player.room_stats.Role == "player" ? (
          <Paper key={player.id} elevation={3} sx={{ 
            padding: 2,
            minWidth: 150,
            backgroundColor: playerColors[i],
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
                  {player.username}
                </Typography>
              </Box>
            </Box>
            <Typography variant="h4" align="center" sx={{ marginTop: 1 }}>
              {player.room_stats.Points}
            </Typography>
          </Paper>
        ): null)}
      </Box>
}