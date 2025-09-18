import { Box, List, ListItem, Stack, useTheme } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useWebSocketMessages } from "~/hooks/websocketHook";
import { $room } from "~/store/room";
export const StatusBar: React.FC = () => {
  const theme = useTheme();
  const room = useSelector($room);
  const { subscribe } = useWebSocketMessages();
  const [logs, setLogs] = useState<string[]>([]);
  const logsRef = useRef<string[]>([]);
  const listRef = useRef<HTMLUListElement>(null);

  // Получить имя пользователя по sessionID
  const findUserById = (sessionID: string) => {
    return Object.values(room.players).find(p => p && p.id == sessionID)?.username;
  };

  // Генерация текста лога
  const getLogText = (type: string, data: any) => {
    switch(type) {
      case "answer/open":
        return `${findUserById(data.SessionID)} захотел ответить на вопрос`;
      case "answer/submit":
        return `${findUserById(data.SessionID)} ответил на вопрос: "${data.answer}"`;
      case "question/select":
        return `${findUserById(data.SessionID)} выбрал вопрос`;
      case "player/score": {
        let text = data.score < 0 ? `отвечает неверно (${data.score})` : `отвечает правильно (+${data.score})`;
        return `${findUserById(data.playerId)} ${text}`;
      }
      default:
        return "";
    }
  };

  useEffect(() => {
    const types = ["answer/open", "answer/submit", "question/select", "player/score"];
    const unsubscribes = types.map(type =>
      subscribe(type, (data: any) => {
        const logText = getLogText(type, data);
        logsRef.current = [...logsRef.current, logText];
        setLogs([...logsRef.current]);
      })
    );
    return () => { unsubscribes.forEach(unsub => unsub()); };
  }, [subscribe, room]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <List ref={listRef} sx={{ fontSize: '10px', width: '100%', maxHeight: '100%', overflowY: 'auto' }}>
      <Stack spacing={1}>
        {logs.map((log, idx) => (
          <ListItem key={idx} sx={{ width: '100%', p: 1, background: theme.palette.background.paper }}>
            {log}
          </ListItem>
        ))}
      </Stack>
    </List>
  );
}