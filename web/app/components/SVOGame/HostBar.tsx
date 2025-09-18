import { Avatar, Box, Button, Divider, Paper, Popper, Typography, useTheme } from "@mui/material"
import type { RoomPlayer } from "./types"
import { useEffect, useMemo, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { $currentUser, leaveRoom } from "~/store/user"
import { useNavigate } from "react-router"
import http from "~/utils/axios"
import { $room, setPlayerPopper, setRoomData } from "~/store/room"
import { StatusBar } from "./StatusBar"
import { CustomPopper } from "./CustomPopper"
import { useWebSocketMessages } from "~/hooks/websocketHook"
import { useTimedPopper } from "~/hooks/timedPopper"
import { default_delay } from "./consts"

export const HostBar: React.FC = () => {
    
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useTheme();

    const {subscribe} = useWebSocketMessages();
    const showTimedPopper = useTimedPopper();
    const room = useSelector($room);
    const user = useSelector($currentUser);

    const host = useMemo<RoomPlayer | undefined>(
      ()=> Object.values(room.players).find(p => p && p.room_stats.Role == "host"), [room]);

    const currentPlayer = useMemo<RoomPlayer | undefined>(
      () => Object.values(room.players).find(p => p && p.id == user?.session_id), [room]);
    
    const readyToStart = useMemo<boolean>(()=> Object.values(room.players).filter(p => p && p.room_stats.Role == "player").length > 0, [room])

    const hostRef = useRef(null);


    useEffect(()=>{
      return subscribe("player/score", (data)=>{
        let text;
        if(data.score < 0){
          text = `Неверно! (${data.score})`
        
        }else{
          text = `Абсолютно верно! (+${data.score})`
          
        }
        showTimedPopper(host!.id, text);
        setTimeout(()=>{
          dispatch(setPlayerPopper({id: data.playerId, popperText: null}))
        }, default_delay * 1000)
      })
    }, [subscribe, dispatch])

    const handleAbortGame = async () =>{
      if(window.confirm("Вы уверены?")){
        await http.get("/game/abort");
        dispatch(leaveRoom())
        navigate("/")
      }
    }

    const joinAsHost = async () => {
      var f = new FormData();
      f.append("slotId", "-1")
      try{
        var r = await http.patch("/game/join", f);
        dispatch(setRoomData(r.data))
      } catch(e) {
        console.error(e)
      }
    }

    const pauseUnpause = async () => {
      try{
        var r = await http.patch("/room/pauseUnpause");
        dispatch(setRoomData(r.data))
      } catch (e) {
        console.error(e)
      }
    }

    const startGame = async () => {
      try{
        var r = await http.patch("/room/start");
        dispatch(setRoomData(r.data)) 
      } catch(e) {
        console.error(e)
      }
    }

    return <Paper elevation={3} sx={{ 
      height: '100%', 
      padding: 2,
      backgroundColor: theme.palette.background.paper,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {host ?
        <Box textAlign={"center"}>
          <Avatar ref={hostRef} sx={{ 
            width: 80, 
            height: 80, 
            bgcolor: host.color, 
            fontSize: '2rem',
            marginBottom: 2,
          }}>
            ?
          </Avatar>
          <Typography variant="h6" gutterBottom>
            {host.username}
          </Typography>
          
          <CustomPopper anchorEl={hostRef.current} text={host.popperText}/>
        </Box>
        : !currentPlayer ? 
        <Paper key={-1} onClick={joinAsHost}
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
      {currentPlayer?.room_stats.Role == "host" && (<>
          <Typography variant="subtitle1" gutterBottom>
            Управление игрой
          </Typography>
          {room.is_started ? <Button 
            fullWidth
            variant="contained" 
            color="primary" 
            onClick={pauseUnpause}
            sx={{ marginBottom: 2 }}
          >
            {room.is_paused ? "Продолжить" : "Пауза"}
          </Button> : <Button 
            fullWidth
            variant="contained" 
            color="success" 
            disabled={!readyToStart}
            onClick={startGame}
            sx={{ marginBottom: 2 }}
          >
            Начать игру
          </Button>}
          
          <Button 
            fullWidth
            variant="contained" 
            color="primary" 
        
            sx={{ marginBottom: 2 }}
          >
            Изменить очки
          </Button>
        <Divider sx={{ width: '100%', mb: 2 }} />
      </>)}
      
      <Button 
        variant="contained" 
        color="error" 
        fullWidth
        onClick={() => handleAbortGame()}
        sx={{ marginBottom: 2 }}
      >
        Покинуть игру
      </Button>
      <Divider  sx={{ width: '100%', mb: 2 }}/>
      <StatusBar/>
    </Paper>
}