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

import type { CurrentQuestion, GameData, Package} from './types';

import { QuestionDialog } from './QustionDialog';
import { Players } from './Players';
import { HostBar } from './HostBar';
import http from '~/utils/axios';
import { setRoomData } from '~/store/room';
import { useDispatch } from 'react-redux';

export const Game: React.FC<{pkg: Package}> = (state) => {
    const { pkg } = state
    if(!pkg) return null;

    const rounds: GameData[] = pkg.Rounds;

    const theme = useTheme();
    const dispatch = useDispatch();
    
    const [currentRound, setCurrentRound] = useState(0);
    const gameData = useMemo<GameData>(()=>rounds[currentRound], [rounds, currentRound]);
    
    const themes = useMemo(()=>gameData.Themes.map(theme => ({
        ...theme,
        Questions: theme.Questions.map(question => ({
            ...question
        }))
    })),[gameData])

    const [currentQuestion, setCurrentQuestion] = useState < CurrentQuestion | null > (null);

    const handleQuestionClick = (themeIndex: number, questionIndex: number) => {
        if (!themes[themeIndex].Questions[questionIndex].isAnswered) {
          themes[themeIndex].Questions[questionIndex].isAnswered = true;
            setCurrentQuestion({
                themeIndex,
                questionIndex
            });
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
            <Typography variant="h2" align="center" gutterBottom sx={{ marginBottom: 3 }}>
              Раунд {currentRound + 1}: {gameData?.Name}
            </Typography>
            
            {/* Общий контейнер для всех тем с вопросами */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, paddingBottom: "150px" }}>
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
                          onClick={() => handleQuestionClick(themeIndex, questionIndex)}
                          sx={{ 
                            cursor: question.isAnswered ? 'default' : 'pointer',
                            backgroundColor: question.isAnswered 
                              ? theme.palette.grey[100] 
                              : theme.palette.primary.dark,
                            color: theme.palette.text.primary,
                            width: 100, // Фиксированная ширина вопросов
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            '&:hover': {
                              backgroundColor: question.isAnswered 
                                ? theme.palette.grey[100] 
                                : theme.palette.primary.main,
                            },
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