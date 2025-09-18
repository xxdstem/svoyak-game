import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useWebSocketMessages } from "~/hooks/websocketHook"
import type { Question } from "./types";
import { useSelector } from "react-redux";
import { $room } from "~/store/room";

type Props = {
  question: Question;
}
export const QuestionHostDialog: React.FC<Props> = (props) => {
  const { question } = props;
  const room = useSelector($room);

  const { subscribe, sendMessage } = useWebSocketMessages();

  const [answer, setAnswer] = useState<{answer: string, SessionID: string} | null>(null);
  
  useEffect(()=>{
    return subscribe("answer/submit", (data)=>{
      setAnswer(data);
    })
  })
  
  const handleChangeScore = (score: number) =>{
    sendMessage("player/score", {playerId: answer!.SessionID,score});
    setAnswer(null);
  }

  const getAnswerText = (question: Question) => {
    return question.Right.Answers.join(' или ');
  };

  const findUserById = useCallback((sessionID: string) =>{
    return Object.values(room.players).find(p => p && p.id == sessionID)?.username
  },[room]);
  if (!answer) return null;

  return <Dialog open={answer != null}>
      <DialogTitle>Ваше решение</DialogTitle>
      <DialogContent>
        <Box textAlign={'center'}>
          {findUserById(answer.SessionID)} ответил: {answer.answer}
          <Divider sx={{my: 2}}/>
          <Typography variant="subtitle2">Правильный ответ: {getAnswerText(question)}</Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant='contained' color="success" onClick={()=>handleChangeScore(question.Price)}>Правильно! (+{question.Price})</Button>
        <Button variant='contained' color="success" onClick={()=>handleChangeScore(question.Price*2)}>Правильно! x2 (+{question.Price*2})</Button>
        <Button variant='contained' color="error" onClick={()=>handleChangeScore(-question.Price)}>Неверно! (-{question.Price})</Button>
        <Button variant='contained' color="error" onClick={()=>handleChangeScore(-question.Price / 2)}>Неверно! 0.5 (-{question.Price / 2})</Button>
        
      </DialogActions>
    </Dialog>
}