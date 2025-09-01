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
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Paper,
  useTheme
} from '@mui/material';

import type { GameData, Host, Package, Player, Question, RoomDetails, RoomPlayer, Theme } from './types';
import { useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { leaveRoom } from '~/store/user';

export const Game: React.FC<{ package: Package, roomData: RoomDetails }> = (props) => {

    const theme = useTheme();
    const dispatch = useDispatch();

    const pkg: Package = props.package;
    const rounds: GameData[] = pkg.Rounds;
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
            ...question,
            isAnswered: false
        }))
    })))

    const [currentQuestion, setCurrentQuestion] = useState < {
        themeIndex: number,
        questionIndex: number
    } | null > (null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [openAddPlayer, setOpenAddPlayer] = useState(false);
    const [newPlayerName, setNewPlayerName] = useState('');

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

    // Получение медиа (изображения/аудио) вопроса
    const getQuestionMedia = (question: Question) => {
        const questionParams = question.Params.find(p => p.Name === 'question');
        if (!questionParams) return null;

        return questionParams.Items.find(item => ['image', 'audio'].includes(item.Type));
    };

    

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
          PaperProps={{
            sx: {
              backgroundColor: theme.palette.background.paper,
            }
          }}
        >
          {(() => {
            const gameTheme = themes[currentQuestion.themeIndex];
            const question = gameTheme.Questions[currentQuestion.questionIndex];
            const questionText = getQuestionText(question);
            const answerText = getAnswerText(question);
            const media = getQuestionMedia(question);
            
            return (
              <>
                <DialogTitle sx={{ 
                  backgroundColor: theme.palette.primary.dark, 
                  color: theme.palette.text.primary 
                }}>
                  {gameTheme.Name} за {question.Price}
                </DialogTitle>
                <DialogContent sx={{ padding: 4 }}>
                  {media?.Type === 'image' && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: 2 }}>
                      <img 
                        src={`http://localhost:8080/files/${pkg.PackageID}/Images/${media.Content}`}
                        alt="Question media" 
                        style={{ maxWidth: '100%', maxHeight: '300px' }} 
                      />
                    </Box>
                  )}
                  
                  {media?.Type === 'audio' && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: 2 }}>
                      <audio controls autoPlay>
                        <source src={`http://localhost:8080/files/${pkg.PackageID}/Audio/${media.Content}`} type="audio/mpeg" />
                        Ваш браузер не поддерживает аудио элемент.
                      </audio>
                    </Box>
                  )}
                  
                  {questionText && (
                    <Typography variant="h5" gutterBottom>
                      {questionText}
                    </Typography>
                  )}
                  
                  {showAnswer && (
                    <>
                      <Divider sx={{ marginY: 3 }} />
                      <Typography variant="h6" color="primary">
                        Ответ:
                      </Typography>
                      <Typography variant="h5">
                        {answerText}
                      </Typography>
                    </>
                  )}
                </DialogContent>
                <DialogActions sx={{ 
                  justifyContent: 'space-between', 
                  padding: 2,
                  backgroundColor: theme.palette.background.default,
                }}>
                  <Box>
                    {!showAnswer && (
                      <Button 
                        onClick={handleShowAnswer} 
                        color="primary" 
                        variant="contained"
                      >
                        Показать ответ
                      </Button>
                    )}
                  </Box>
                  
                  {/* <Box sx={{ display: 'flex', gap: 1 }}>
                    {players.map(player => (
                      <Button
                        key={player.id}
                        onClick={() => handleAddScore(player.id, question.Price)}
                        variant="contained"
                        sx={{ 
                          backgroundColor: player.color,
                          color: theme.palette.getContrastText(player.color),
                          '&:hover': {
                            backgroundColor: player.color,
                            opacity: 0.9,
                          },
                        }}
                      >
                        {player.name} (+{question.Price})
                      </Button>
                    ))}
                  </Box> */}
                </DialogActions>
              </>
            );
          })()}
        </Dialog>
      )}
      
      {/* Диалог добавления игрока */}
      <Dialog 
        open={openAddPlayer} 
        onClose={() => setOpenAddPlayer(false)}
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
          }
        }}
      >
        <DialogTitle>Добавить нового игрока</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Имя игрока"
            fullWidth
            variant="outlined"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            sx={{ marginTop: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddPlayer(false)}>Отмена</Button>
          <Button 
            disabled={!newPlayerName.trim()}
            variant="contained"
            color="primary"
          >
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};