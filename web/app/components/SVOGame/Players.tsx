import { Avatar, Box, Button, Paper, Typography, useTheme } from "@mui/material"
import { useSelector } from "react-redux";
import { $game } from "~/store/game";
import type { RoomPlayer } from "./types";
import { useMemo } from "react";
import { $currentUser } from "~/store/user";

type Props = {
    players: RoomPlayer[]
}
export const Players: React.FC<Props> = (props) => {
    const { players } = props;

    const gameData = useSelector($game);
    const user = useSelector($currentUser);
    const theme = useTheme();

    const currentPlayer = useMemo<RoomPlayer | undefined>(()=>players.find(p=>p.id == user?.session_id), [players]);
    
    const playerColors = [
      "#2cf",
      "#f6a",
      theme.palette.warning.main,
      theme.palette.error.main
    ];

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
            <Paper key={-1} onClick={(()=>{
                
            })}
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
        {players.map((player, i) => player.room_stats.Role == "" ? null : (
          <Paper key={player.id} elevation={3} sx={{ 
            padding: 2,
            minWidth: 150,
            backgroundColor: playerColors[i],
            color: "#fff",
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', flexDirection:"column", alignItems: 'center' }}>
                <Avatar sx={{ 
                  width: 40, 
                  height: 40, 
                  bgcolor: 'rgba(0, 0, 0, 0.2)',
                  marginBottom: 1,
                }}>
                  ?
                </Avatar>
                <Typography variant="subtitle1" color='#fff'>
                  {player.username}
                </Typography>
              </Box>
                <Button 
                  size="small" 
                  color="inherit" 
                  onClick={() => alert("rm player")}
                  sx={{ minWidth: 24 }}
                >
                  ×
                </Button>
            </Box>
            <Typography variant="h5" align="center" sx={{ marginTop: 1 }}>
              {player.room_stats.Points}
            </Typography>
          </Paper>
        ))}
      </Box>
}