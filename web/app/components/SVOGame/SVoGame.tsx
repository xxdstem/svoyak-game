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

import { QuestionDialog } from './QustionDialog';
import { Players } from './Players';
import { HostBar } from './HostBar';
import http from '~/utils/axios';
import { $room, setRoomData } from '~/store/room';
import { useDispatch, useSelector } from 'react-redux';
import { $currentUser } from '~/store/user';

export const Game: React.FC<{pkg: Package}> = (state) => {
    const { pkg } = state
    if(!pkg) return null;

    const rounds: GameData[] = pkg.Rounds;

    const theme = useTheme();
    const dispatch = useDispatch();
    const room = useSelector($room);
    const user = useSelector($currentUser);

    const [currentRound, setCurrentRound] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState < CurrentQuestion | null > (null);

    const gameData = useMemo<GameData>(()=>rounds[currentRound], [rounds, currentRound]);
    const currentPlayer = useMemo<RoomPlayer | undefined>(()=>room?.players.find(p=>p.id == user?.session_id), [room]);
        
    const themes = useMemo(()=>gameData.Themes.map(theme => ({
      ...theme,
      Questions: theme.Questions.map(question => ({
          ...question
      }))
    })),[gameData])

    const availableQuestion = useCallback((question: Question)=>{
      return !question.isAnswered && (
                        currentPlayer?.room_stats.QuestionPicker
                        || currentPlayer?.room_stats.Role == "host")
    },[currentPlayer])


    const handleQuestionClick = (themeIndex: number, question: Question) => {
      if (availableQuestion(question)) {
        question.isAnswered = true;
          setCurrentQuestion({themeIndex, question});
      }
    };

    const nextRound = () => {
      setCurrentRound(s => s + 1)
    };

    const handleCloseQuestion = useCallback(() => {
      setCurrentQuestion(null);
      if(themes.every(t => t.Questions.every(q => q.isAnswered))){
        nextRound();
      }
    }, [themes]);
  
    // Временное решение, пока нет вебсокета
    useEffect(()=>{
      let timer = setInterval(()=>{
        http.get("/rooms/get").then(r=>{
          dispatch(setRoomData({ ...r.data}))
        });
      }, 5000);
      
      return () => clearInterval(timer);
    }, [])

    const questionBox = (<>
      <Typography variant="h2" align="center" gutterBottom sx={{ marginBottom: 3 }}>
        Раунд {currentRound + 1}: {gameData?.Name}
      </Typography>
      <Box
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, paddingBottom: "150px" }}>
        {themes.map((gameTheme, themeIndex) => (
          <Box 
            key={themeIndex}
            sx={{ 
              display: 'flex', 
              flexDirection: 'row', 
              gap: 1,
            }}
          >
            {/* Карточка с названием темы */}
            <Card sx={{ 
              backgroundColor: theme.palette.primary.light,
              color: theme.palette.text.primary,
              width: 200, // Фиксированная ширина для темы
              minHeight: 80, // Такая же высота, как у вопросов
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <CardContent>
                <Typography variant="h6" align="center">
                  {gameTheme.Name}
                </Typography>
              </CardContent>
            </Card>
            
            {/* Вопросы в строку */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              {gameTheme.Questions
                .sort((a, b) => a.Price - b.Price)
                .map((question, questionIndex) => (
                  <Card 
                    key={questionIndex}
                    onClick={() => handleQuestionClick(themeIndex, question)}
                    
                    sx={{ 
                      cursor: availableQuestion(question)
                        ? 'pointer': 'default',
                      backgroundColor: availableQuestion(question)
                        ? theme.palette.primary.dark
                        : theme.palette.grey[100],
                      color: theme.palette.text.primary,
                      width: 100, // Фиксированная ширина вопросов
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      '&:hover': availableQuestion(question) ? {
                        backgroundColor: theme.palette.primary.main,
                      } : {},
                    }}
                  >
                    <CardContent>
                      <Typography variant="h5" align="center">
                        {question.isAnswered ? '' : question.Price}
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
      padding: 2, 
      backgroundColor: theme.palette.background.default,
      color: theme.palette.text.primary,
    }}>
      {/* Основная сетка */}
      <Grid container spacing={2} sx={{ height: '100%'}}>
        {/* Колонка ведущего */}
        <Grid width={220} >
          <HostBar/>
        </Grid>
        
        {/* Центральная колонка с вопросами */}
        <Grid  sx={{ flexGrow: 1, flex: "1 0" }} >
          <Box sx={{ 
            height: '100%', 
            display: 'flex',
            width: "100%",
            flexDirection: 'column',
          }}>
          {room.is_started ? questionBox : <Typography variant="h1" my={"auto"} align="center">Ожидание начала игры</Typography>}
          </Box>
        </Grid>
      </Grid>
      
      {/* Панель игроков внизу */}
      <Players/>
      
      {/* Диалог вопроса */}
      {currentQuestion && (
        <Dialog 
          open={!!currentQuestion} 
          onClose={handleCloseQuestion}
          maxWidth="md"
          fullWidth
          slotProps={{
            backdrop:{sx:{backdropFilter:"blur(4px)"}},
            paper:{
              sx: {
                backgroundColor: theme.palette.background.paper,
              }
            }
          }}
        >
          <QuestionDialog themes={themes}  currentQuestion={currentQuestion} />
        </Dialog>
      )}
      
    </Box>
  );

  
};