import { Avatar, Box, Button, Divider, Paper, Typography, useTheme } from "@mui/material"
import type { RoomPlayer } from "./types"
import { useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { $currentUser, leaveRoom } from "~/store/user"
import { useNavigate } from "react-router"
import http from "~/utils/axios"
import { $game, setRoleForUser } from "~/store/game"

export const HostBar: React.FC = () => {
    
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useTheme();

    const game = useSelector($game);
    const user = useSelector($currentUser);

    const host = useMemo<RoomPlayer | undefined>(()=> game?.players.find(p=>p.room_stats.Role == "host"), [game]);
    const currentPlayer = useMemo<RoomPlayer | undefined>(()=>game?.players.find(p=>p.id == user?.session_id), [game]);
    
    const handleAbortGame = async () =>{
      if(window.confirm("Вы уверены?")){
        await http.get("/game/abort");
        dispatch(leaveRoom())
        navigate("/")
      }
    }

    const joinAsHost = async () => {
        var f = new FormData();
        f.append("role", "host")
        //await http.post("/game/set_role", f);
        dispatch(setRoleForUser({user_id: user?.session_id, role: "host"}))
    }

    return <Paper elevation={3} sx={{ 
            height: '100%', 
            padding: 2,
            backgroundColor: theme.palette.background.paper,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            {host ? <>
              <Avatar sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: theme.palette.primary.dark, 
                fontSize: '2rem',
                marginBottom: 2,
              }}>
                ?
              </Avatar>
              <Typography variant="h6" gutterBottom>
                {host.username}
              </Typography></>
              : currentPlayer?.room_stats.Role == "" ?  <Paper key={-1} onClick={joinAsHost}
                elevation={3} sx={{ 
                padding: 2,
                minWidth: 150,
                backgroundColor: theme.palette.background.default,
                color: "#fff",
                cursor:"pointer"}}>
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
                    <Typography align='center' variant="subtitle1" color='#fff'>
                      Присоедениться как ведущий
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            : <>waiting for host lol</>}
            
            <Divider sx={{ width: '100%', marginY: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              Управление игрой
            </Typography>
            <Button 
              variant="contained" 
              color="error" 
              onClick={() => handleAbortGame()}
              sx={{ marginBottom: 2 }}
            >
              Покинуть игру
            </Button>
          </Paper>
}