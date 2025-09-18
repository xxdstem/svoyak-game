import { Box, List, ListItem, Stack, useTheme } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useWebSocketMessages } from "~/hooks/websocketHook";
import { $room } from "~/store/room";

export const StatusBar: React.FC = () => {
  const theme = useTheme();
  const room = useSelector($room);
  const { subscribe } = useWebSocketMessages();

  const [logs, setLogs] = useState < string[] > ([]);
  
  const findUserById = useCallback((sessionID: string) =>{
    return Object.values(room.players).find(p => p && p.id == sessionID)?.username
  },[room]);

  useEffect(()=>{
    return subscribe("answer/open", (data) => {
      setLogs(logs=>[...logs.slice(-5), `${findUserById(data.SessionID)} захотел ответить на вопрос`])
    })
  }, [subscribe, findUserById])

  useEffect(()=>{
    return subscribe("answer/submit", (data) => {
      setLogs(logs=>[...logs.slice(-5), `${findUserById(data.SessionID)}  ответил на вопрос: \"${data.answer}\"`])
    })
  }, [subscribe, findUserById])
  useEffect(()=>{
    return subscribe("question/select", (data) => {
      setLogs(logs=>{
        return [...logs.slice(-5), `${findUserById(data.SessionID)} выбрал вопрос`]
      })
    })
  }, [subscribe, findUserById])  
  useEffect(()=>{
    return subscribe("player/score", (data)=>{
      let text;
      if(data.score < 0){
        text = `отвечает неверно (${data.score})`
      }else{
        text = `отвчеает правильно (+${data.score})`
        
      }
      setLogs(logs=>{
        return [...logs.slice(-5), `${findUserById(data.SessionID)} ${text}`]
      })
      
    })
  }, [subscribe, findUserById])

  return <>
    <List sx={{fontSize: '10px', width: '100%'}}>
      <Stack spacing={1}>
        {logs.map((log, idx) => (
          <ListItem key={idx} sx={{width:'100%', p:1, background: theme.palette.background.paper}}> {log} </ListItem>
        ))}
      </Stack>
    </List>
  </>
};