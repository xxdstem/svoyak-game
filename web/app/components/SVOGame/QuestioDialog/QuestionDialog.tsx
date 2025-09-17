import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, useTheme } from "@mui/material";
import type { CurrentQuestion, Question, RoomPlayer, Theme } from "../types";
import { $room, setRoomData } from "~/store/room";
import { useDispatch, useSelector } from "react-redux";
import { $currentUser } from "~/store/user";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MusicIcon from "./components/MusicIcon";
import AnimatedBox from "./components/AnimatedBox";
import { useSyncedTimer } from "./components/SyncedTimer";
import { useWebSocketMessages } from "~/hooks/websocketHook";
import { default_delay, player_answer_duration, question_duration } from "../consts";

type Props = {
    themes: Theme[];
    currentQuestion: CurrentQuestion
    handleCloseQuestion: VoidFunction;
}

export const QuestionDialog: React.FC<Props> = (props) => {
  const { themes, currentQuestion, handleCloseQuestion  } = props;

  const room = useSelector($room);
  const user = useSelector($currentUser);
  const theme = useTheme();
  const { sendMessage, subscribe } = useWebSocketMessages();

  const [delaying, setDelaying] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const [triedAnswer, setTriedAnswer] = useState(false);
  const [showAnswerDialog, setShowAnswerDialog] = useState(false);
  const [answer, setAnswer] = useState("");

  const userAnswerTimeout = useRef<NodeJS.Timeout>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const answerTimer = useSyncedTimer(()=>{
    setShowAnswer(true);
    setTimeout(()=>{
        handleCloseQuestion()
    }, default_delay * 1000);
  }, question_duration * 1000)

  const currentPlayer = useMemo<RoomPlayer | undefined>(()=>Object.values(room.players).find(p=>p != null && p.id == user?.session_id), [room]);

  // Получение медиа (изображения/аудио) вопроса
  const getQuestionMedia = useCallback((question: Question) => {
    let questionParams;
    if(showAnswer){
        questionParams = question.Params.find(p => p.Name === 'answer')
    }
    if(!questionParams){
        questionParams = question.Params.find(p => p.Name === 'question')
        if (!questionParams) return null;
    }

    return questionParams.Items.find(item => ['image', 'audio'].includes(item.Type));
  },[showAnswer]);

  useEffect(()=>{
    setTimeout(()=>setDelaying(false), default_delay * 1000);
  }, []);

  useEffect(()=>{
    if(!delaying){
        answerTimer.start();
    }
  }, [delaying]);

  useEffect(()=>{
    return subscribe("answer/open", (data) => {
      if(data.SessionID == currentPlayer?.id) return;
      answerTimer.pause();
      audioRef.current?.pause();
      userAnswerTimeout.current = setTimeout(()=>{
        answerTimer.resume();
        audioRef.current?.play();
      }, player_answer_duration * 1000);
    })
  }, [subscribe, answerTimer])

  useEffect(()=>{
    return subscribe("answer/submit", (data) => {
      if(data.SessionID == currentPlayer?.id) return;
      // TODO: 
      // Запускаем новый таймер, ожидаем пока ХОСТ решит правильный-ли ответ
      audioRef.current?.play();
      answerTimer.resume();
      clearTimeout(userAnswerTimeout.current!);
    })
  }, [subscribe])

  // Получение текста вопроса
  const getQuestionText = (question: Question) => {
    const questionParams = question.Params.find(p => p.Name === 'question');
    if (!questionParams) return '';

    // Ищем текстовый контент (не изображения/аудио)
    const textItems = questionParams.Items.filter(item =>
        !['image', 'audio'].includes(item.Type) &&
        item.Placement !== 'replic' &&
        item.Content.trim()
    );

    return textItems.map(item => item.Content).join('\n');
  };

  // Получение ответа
  const getAnswerText = (question: Question) => {
    return question.Right.Answers.join(' или ');
  };

  const handleShowAnswerDialog = () => {
    if(delaying || triedAnswer || answerTimer.isPaused) return;
    sendMessage("answer/open", {})
    audioRef.current?.pause();
    setTriedAnswer(true);
    setShowAnswerDialog(true);
    answerTimer.pause();
    userAnswerTimeout.current = setTimeout(()=>{
      // Если игрок ничего не отвечает за таймаут, отправляем пустой ответ
      setAnswer("")
      sendMessage("answer/submit", {answer: ""});
      answerTimer.resume();
      setShowAnswerDialog(false);
    }, player_answer_duration * 1000);
  }

  const handleAnswerSubmit = () => {
    sendMessage("answer/submit", {answer});
    setShowAnswerDialog(false);
    audioRef.current?.play();
    answerTimer.resume();
    clearTimeout(userAnswerTimeout.current!);
  }

  const gameTheme = themes[currentQuestion.themeIndex];
  const question = currentQuestion.question;
  const questionText = getQuestionText(question);
  const answerText = getAnswerText(question);
  const media =  getQuestionMedia(question);

  const hostButtons = <>
    <Button
      onClick={()=>setShowAnswer(true)} 
      color="primary" 
      variant="contained"
    >
      Показать ответ
    </Button>
    <Button
      color="warning" 
      variant="contained"
    >
      Пропустить
    </Button>
  </>;

  const answerDialog = (
    <Dialog open={showAnswerDialog}>
      <DialogTitle>Ваш ответ</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Ответ"
          type="text"
          fullWidth
          variant="outlined"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleAnswerSubmit();
            }
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleAnswerSubmit}>Отправить</Button>
      </DialogActions>
    </Dialog>
  )
  
  return (<>
    <DialogTitle mb={1} sx={{backgroundColor: theme.palette.background.paper}}>
      <Box>
        <Typography variant="h2" align="center">
          {gameTheme.Name} за {question.Price}
        </Typography>
      </Box>
    </DialogTitle>
    <AnimatedBox duration={question_duration} show={!delaying} isPaused={answerTimer.isPaused}>
      <Box sx={{ display: 'flex', p: 3, height:"100%", width:"100%", alignItems:"center", overflow: "hidden",   
        flexDirection:"column"}}>
        {(questionText || !media) && (
          <Typography variant="h2" mb={'1'} align="center" gutterBottom>
              {questionText}
          </Typography>
        )}
        {media && <>
          {media.Type === 'image' && (
            <img
            src={`http://localhost:8080/files/${room.package_id}/Images/${encodeURIComponent(encodeURIComponent(media.Content))}`}
            alt="Question media" 
            style={{ maxWidth: '100%',
              maxHeight: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              margin: '0 auto'}} 
            />
          )}
              
          {media.Type === 'audio' && (<>
            <audio ref={audioRef} style={{visibility:"hidden"}} controls autoPlay>
            <source src={`http://localhost:8080/files/${room.package_id}/Audio/${encodeURIComponent(encodeURIComponent(media.Content))}`} type="audio/mpeg" />
            Ваш браузер не поддерживает аудио элемент.
            </audio>
            <MusicIcon/></>
          )}
        </>}
      </Box>
    </AnimatedBox>
    <DialogActions sx={{ 
      mt: 2,
      justifyContent: 'space-between', 
      padding: 0,
      backgroundColor: theme.palette.background.default,
    }}>
      {showAnswer ? <Typography style={{margin: "auto"}} variant="h1">
        {answerText}
        </Typography>
      : (<>
        {currentPlayer?.room_stats.Role == "host" ? hostButtons : <Button
          fullWidth
          onClick={handleShowAnswerDialog}
          disabled={delaying || triedAnswer || answerTimer.isPaused}
          color="success" 
          variant="contained"
          >ОТВЕТИТЬ
        </Button>}</>
      )}
    </DialogActions>
    {answerDialog}
    </>
  );
}