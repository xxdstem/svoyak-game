import React, { useEffect, useMemo, useState } from 'react';
import http from '~/utils/axios';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Dialog,
  Divider,
  Paper,
  useTheme
} from '@mui/material';

import type { CurrentQuestion, GameData, Host, Package, RoomDetails, RoomPlayer } from './types';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { leaveRoom } from '~/store/user';
import { QuestionDialog } from './QustionDialog';
import { $game } from '~/store/game';

export const Game: React.FC<{ roomData: RoomDetails }> = (props) => {
    const pkg = useSelector($game);
    if(!pkg) return null;
    const rounds: GameData[] = pkg.Rounds;

    const theme = useTheme();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const [currentRound, setCurrentRound] = useState(0);
    const gameData = useMemo<GameData>(()=>rounds[currentRound], [rounds, currentRound]);
    const [players, setPlayers] = useState <RoomPlayer[]> (props.roomData.players);
    
    const [host] = useState <Host> ({
      name: 'Ведущий',
      avatar: 'H',
    });
    
    
    const [themes, setThemes] = useState(()=>gameData.Themes.map(theme => ({
        ...theme,
        Questions: theme.Questions.map(question => ({
            ...question
        }))
    })))

    const [currentQuestion, setCurrentQuestion] = useState < CurrentQuestion | null > (null);
    const [showAnswer, setShowAnswer] = useState(false);
    
    
    // Цвета для новых игроков
    const playerColors = [
      "#2cf",
      "#f6a",
      theme.palette.warning.main,
      theme.palette.error.main
    ];

    // Обработчики событий
    const handleQuestionClick = (themeIndex: number, questionIndex: number) => {
        if (!themes[themeIndex].Questions[questionIndex].isAnswered) {
            setCurrentQuestion({
                themeIndex,
                questionIndex
            });
            setShowAnswer(false);
        }
    };

    const handleCloseQuestion = () => {
        setCurrentQuestion(null);
    };

    const handleShowAnswer = () => {
        setShowAnswer(true);
    };

    const handleAbortGame = async () =>{
      if(window.confirm("Вы уверены?")){
        var r = await http.get("/game/abort");
        dispatch(leaveRoom())
        navigate("/")
      }
    }  

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
        <Grid size={2}>
          <Paper elevation={3} sx={{ 
            height: '100%', 
            padding: 2,
            backgroundColor: theme.palette.background.paper,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <Avatar sx={{ 
              width: 80, 
              height: 80, 
              bgcolor: theme.palette.primary.dark, 
              fontSize: '2rem',
              marginBottom: 2,
            }}>
              {host.avatar}
            </Avatar>
            <Typography variant="h6" gutterBottom>
              {host.name}
            </Typography>
            <Divider sx={{ width: '100%', marginY: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              Управление игрой
            </Typography>
            <Button 
              variant="contained" 
              color="error" 
              onClick={() => handleAbortGame()}
              disabled={players.length >= 5}
              sx={{ marginBottom: 2 }}
            >
              Завершить игру
            </Button>
          </Paper>
        </Grid>
        
        {/* Центральная колонка с вопросами */}
        <Grid size={8} sx={{ flexGrow: 1 }}>
          <Box sx={{ 
            height: '100%', 
            display: 'flex',
            width: "100%",
            flexDirection: 'column',
          }}>
            <Typography variant="h4" align="center" gutterBottom sx={{ marginBottom: 3 }}>
              {gameData?.Name}
            </Typography>
            
            {/* Общий контейнер для всех тем с вопросами */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {themes.map((gameTheme, themeIndex) => (
                <Box 
                  key={themeIndex}
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'row', 
                    alignItems: 'flex-start',
                    gap: 1,
                  }}
                >
                  {/* Карточка с названием темы */}
                  <Card sx={{ 
                    backgroundColor: theme.palette.primary.light,
                    color: theme.palette.text.primary,
                    minWidth: 200, // Фиксированная ширина для темы
                    height: 80, // Такая же высота, как у вопросов
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
                              ? theme.palette.grey[600] 
                              : theme.palette.primary.dark,
                            color: theme.palette.text.primary,
                            height: 80,
                            width: 100, // Фиксированная ширина вопросов
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            '&:hover': {
                              backgroundColor: question.isAnswered 
                                ? theme.palette.grey[600] 
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
      <Box sx={{ 
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: theme.palette.background.paper,
        padding: 2,
        display: 'flex',
        justifyContent: 'center',
        gap: 2,
      }}>
        {players.map((player, i) => (
          <Paper key={player.id} elevation={3} sx={{ 
            padding: 2,
            minWidth: 150,
            backgroundColor: playerColors[i],
            color: "#fff",
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ 
                  width: 40, 
                  height: 40, 
                  bgcolor: 'rgba(0, 0, 0, 0.2)',
                  marginRight: 1,
                }}>
                  ?
                </Avatar>
                <Typography variant="subtitle1" color='#fff'>
                  {player.username}
                </Typography>
              </Box>
              {players.length > 2 && (
                <Button 
                  size="small" 
                  color="inherit" 
                  onClick={() => alert("rm player")}
                  sx={{ minWidth: 24 }}
                >
                  ×
                </Button>
              )}
            </Box>
            <Typography variant="h5" align="center" sx={{ marginTop: 1 }}>
              {player.room_stats.Points}
            </Typography>
          </Paper>
        ))}
      </Box>
      
      {/* Диалог вопроса */}
      {currentQuestion && (
        <Dialog 
          open={!!currentQuestion} 
          onClose={handleCloseQuestion}
          maxWidth="md"
          fullWidth
          slotProps={{
            paper:{
              sx: {
                backgroundColor: theme.palette.background.paper,
              }
            }
          }}
        >
          <QuestionDialog themes={themes} showAnswer={showAnswer} currentQuestion={currentQuestion} handleShowAnswer={handleShowAnswer} />
        </Dialog>
      )}
      
    </Box>
  );
};