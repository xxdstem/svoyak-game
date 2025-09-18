import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Dialog,
  useTheme
} from '@mui/material';

import type { CurrentQuestion, GameData, Package, Question, RoomPlayer} from './types';

import { QuestionDialog } from './QuestioDialog/QuestionDialog';
import { Players } from './Players';
import { HostBar } from './HostBar';
import { $room, setPlayerPopper, setRoomData } from '~/store/room';
import { useDispatch, useSelector } from 'react-redux';
import { $currentUser } from '~/store/user';
import { useWebSocketMessages } from '~/hooks/websocketHook';
import { default_delay } from './consts';
import { QuestionHostDialog } from './QuestionHostDialog';
import { useTimedPopper } from '~/hooks/timedPopper';

export const Game: React.FC<{pkg: Package}> = (state) => {
    const { pkg } = state
    if(!pkg) return null;

    const rounds: GameData[] = pkg.Rounds;

    const theme = useTheme();
    const dispatch = useDispatch();
    const { subscribe, sendMessage } = useWebSocketMessages();
    const showTimedPopper = useTimedPopper();
    const room = useSelector($room);
    
    const user = useSelector($currentUser);
    const [currentRound, setCurrentRound] = useState(room.current_round);
    const [currentQuestion, setCurrentQuestion] = useState < CurrentQuestion | null > (null);

    const gameData = rounds[currentRound];

    const currentPlayer = useMemo<RoomPlayer | undefined>(()=>Object.values(room.players).find(p => p && p.id == user?.session_id), [room.players]);
    const host = useMemo<RoomPlayer | undefined>(
      ()=> Object.values(room.players).find(p => p && p.room_stats.Role == "host"), [room]);  

    const isImHost = currentPlayer == host;
    
    const [themes, setThemesState] = useState(Object.assign({}, gameData).Themes);

    useEffect(() => {
      setThemesState(Object.assign({}, gameData).Themes);
    }, [gameData]);


    const availableQuestion = useCallback((question: Question)=>{
      return !question.IsAnswered && ( currentPlayer != null && (
                        currentPlayer?.room_stats.QuestionPicker
                        || currentPlayer?.room_stats.Role == "host"))
    },[currentPlayer])


    const handleQuestionClick = (themeIndex: number, questionIndex: number) => {
      const question = themes[themeIndex].Questions[questionIndex];
      if(!question || !availableQuestion(question)) return;
      sendMessage("question/select", {themeIndex, questionIndex})
    };

    const nextRound = () => {
      setCurrentRound(s => s + 1)
    };

    const handleCloseQuestion = useCallback(() => {
      setCurrentQuestion(null);
      if(themes.every(t => t.Questions.every(q => q.IsAnswered))){
        nextRound();
      }
      const questionPicker = Object.values(room.players).find((p)=> p && p.room_stats.QuestionPicker);
      dispatch(setPlayerPopper({ 
        id: host!.id,
        popperText: `Выбирайте вопрос, ${questionPicker?.username}!`
      }))
    }, [themes]);
  
    // Временное решение, пока нет вебсокета
    // useEffect(()=>{
    //   let timer = setInterval(()=>{
    //     http.get("/rooms/get").then(r=>{
    //       dispatch(setRoomData({ ...r.data}))
    //     });
    //   }, 5000);
      
    //   return () => clearInterval(timer);
    // }, []);

    useEffect(()=>{
      return subscribe("updated_room", (roomData) => {
        dispatch(setRoomData(roomData))
      })
    }, [subscribe, dispatch])

    useEffect(()=>{
      return subscribe("question/select", (data) => {
        const { themeIndex, questionIndex } = data;
        const theme = themes[themeIndex];
        const question = theme.Questions[questionIndex];
        dispatch(setPlayerPopper({ 
          id: host!.id,
          popperText: null
        }))
        showTimedPopper(data.SessionID, `${theme.Name} за ${question.Price}`, default_delay * 1000)
        setThemesState(prev => {
          const newThemes = prev.map((theme, tIdx) => {
            if (tIdx !== themeIndex) return theme;
            return {
              ...theme,
              Questions: theme.Questions.map((q, qIdx) =>
                qIdx === questionIndex ? { ...q, IsAnswered: true } : q
              )
            };
          });
          // Открываем диалог с вопросом
          setCurrentQuestion({ themeIndex, question });
          return newThemes;
        });
      })
    },[subscribe, dispatch, host])

    

    const questionBox = (<>
      <Typography variant="h2" align="center" gutterBottom sx={{ marginBottom: 3 }}>
        Раунд {currentRound + 1}: {gameData?.Name}
      </Typography>
      <Box
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%', overflow: 'auto' }}
      >
        {themes.map((gameTheme, themeIndex) => (
          <Box key={themeIndex} sx={{ display: 'grid', gridTemplateColumns: '1fr 5fr', alignItems: 'stretch', gap: 2, width: '100%' }}>
            <Card sx={{
              backgroundColor: theme.palette.primary.light,
              color: theme.palette.text.primary,
              minWidth: '200px',
              width: '100%',
              minHeight: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              wordBreak: 'break-word',
            }}>
              <CardContent>
                <Typography variant="h6" align="center" mt={1}>
                  {gameTheme.Name}
                </Typography>
              </CardContent>
            </Card>
            <Box sx={{ display: 'flex', gap: 1, width: '100%', height: '100%' }}>
              {gameTheme.Questions
                .sort((a, b) => a.Price - b.Price)
                .map((question, questionIndex) => (
                  <Card
                    key={questionIndex}
                    onClick={() => handleQuestionClick(themeIndex, questionIndex)}
                    sx={{
                      cursor: availableQuestion(question)
                        ? 'pointer' : 'default',
                      backgroundColor: availableQuestion(question)
                        ? theme.palette.primary.dark
                        : theme.palette.grey[100],
                      color: theme.palette.text.primary,
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      '&:hover': availableQuestion(question) ? {
                        backgroundColor: theme.palette.primary.main,
                      } : {},
                    }}
                  >
                    <CardContent>
                      <Typography variant="h5" mt={1} align="center">
                        {question.IsAnswered ? '' : question.Price}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
            </Box>
          </Box>
        ))}
      </Box>
    </>);

    return (
    <Box sx={{ 
      height: 'calc(100vh - 206px)', 
      position: 'relative',
      padding: 2, 
      backgroundColor: theme.palette.background.default,
      color: theme.palette.text.primary,
    }}>
      {/* Основная сетка */}
      <Grid container spacing={2} sx={{ height: '100%'}}>
        {/* Колонка ведущего */}
        <Grid height={'100%'} width={220} >
          <HostBar/>
        </Grid>
        
        {/* Центральная колонка с вопросами */}
        <Grid  sx={{ flexGrow: 1, flex: "1 0 auto", height: "100%", width: 0 }} >
          <Box sx={{ 
            height: '100%', 
            position: "relative",
            display: 'flex',
            width: "100%",
            flexDirection: 'column',
          }}>
            {!room.is_started ? <Typography variant="h1" my={"auto"} align="center">Ожидание начала игры</Typography>
            :(<>
              {currentQuestion 
              ?  <QuestionDialog themes={themes} handleCloseQuestion={handleCloseQuestion} currentQuestion={currentQuestion} />
              : questionBox}
            </>
            )}
          </Box>
        </Grid>
      </Grid>
      {isImHost && currentQuestion && <QuestionHostDialog question={currentQuestion.question}/>}
      {/* Панель игроков внизу */}
      <Players/>
      
    </Box>
  );

  
};