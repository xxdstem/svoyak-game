import { Avatar, Box, Button, Paper, Popper, Typography, useTheme } from "@mui/material"
import { useDispatch, useSelector } from "react-redux";
import { $room, setPlayerPopper, setRoomData } from "~/store/room";
import { type RoomPlayer } from "./types";
import React, { createRef, useEffect, useMemo, useRef, useState } from "react";
import { $currentUser } from "~/store/user";
import http from "~/utils/axios";
import StarIcon from '@mui/icons-material/Star';
import { useWebSocketMessages } from "~/hooks/websocketHook";
import AnimatedBox from "./QuestioDialog/components/AnimatedBox";
import { player_answer_duration } from "./consts";
import { CustomPopper } from "./CustomPopper";
import { useTimedPopper } from "~/hooks/timedPopper";

export const Players: React.FC = () => {
    
  const theme = useTheme();
  const dispatch = useDispatch();

  const user = useSelector($currentUser);
  const room = useSelector($room);
  const showTimedPopper = useTimedPopper();
  const { subscribe } = useWebSocketMessages();

  const currentPlayer = useMemo<RoomPlayer | undefined>(()=>Object.values(room.players).find(p => p && p.id == user?.session_id), [room]);
  
  const [answeringPlayerID, setAnsweringPlayerID] = useState<string>("");

  const paperRefs = useRef<Record<string, React.RefObject<HTMLDivElement | null>>>({});

  useEffect(()=>{
    return subscribe("answer/open", (data) => {
      setAnsweringPlayerID(data.SessionID);
      setTimeout(()=>{
        setAnsweringPlayerID("");
      }, player_answer_duration * 1000);
    })
  }, [subscribe])

  useEffect(()=>{
    return subscribe("answer/submit", (data) => {
      dispatch(setPlayerPopper({id: data.SessionID, popperText: data.answer == "" ? "Не знаю" : data.answer}))
      setAnsweringPlayerID("");
    })
  }, [subscribe])

  const joinAsUser = async (slotId: number) => {
    if(currentPlayer) return;
    var f = new FormData();
    f.append("slotId", String(slotId))
    try{
      var r = await http.patch("/game/join", f);
      dispatch(setRoomData(r.data))
    } catch(e) {
      console.error(e)
    }
  }
  
  return <Box sx={{ 
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.palette.background.paper,
    padding: 1,
    display: 'flex',
    justifyContent: 'center',
    gap: 2,
  }}>
    {Object.entries(room.players)
      .filter(([slot]) => parseInt(slot) >= 0)
      .map(([slot, player]) => {
        if (!player) {
          if(!room.is_started){
            return (
              <Paper key={slot} onClick={()=>joinAsUser(parseInt(slot))}
                elevation={3} sx={{ 
                padding: '22px',
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
            )
          }
        }else{
          if (!paperRefs.current[player.id]) {
            paperRefs.current[player.id] = createRef<HTMLDivElement>();
          }
          const paperRef = paperRefs.current[player.id];
          return (<React.Fragment key={slot}>
            <AnimatedBox  duration={player_answer_duration} color="yellow" show={answeringPlayerID == player.id}>
              <Paper elevation={1} ref={paperRef} sx={{ 
                padding: 2,
                minWidth: 150,
                border: !player.ws_connected ? "2px solid red" : "",
                opacity: !player.ws_connected ? 0.5 : 1,
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
            </AnimatedBox>
            
            <CustomPopper
              text={player.popperText}
              anchorEl={paperRef.current}
              placement="top"
            />
            </React.Fragment>
          )
        }
      }
    )}
  </Box>
}