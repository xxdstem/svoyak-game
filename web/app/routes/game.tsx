import React, { useEffect, useState } from 'react';
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
  useTheme,
  GridLegacy
} from '@mui/material';

// Типы для TypeScript
type Player = {
  id: number;
  name: string;
  score: number;
  avatar: string;
  color: string;
};

type Host = {
  name: string;
  avatar: string;
};

type Question = {
  Price: number;
  Params: {
    Name: string;
    Type: string;
    Items: {
      Type: string;
      Content: string;
      Placement?: string;
      Duration?: string;
      IsRef?: boolean;
      WaitForFinish?: boolean;
    }[];
  }[];
  Right: {
    Answers: string[];
  };
  isAnswered?: boolean;
};

type Theme = {
  Name: string;
  Questions: Question[];
};

type GameData = {
  Name: string;
  Type: string;
  Themes: Theme[];
};


import axios from '../utils/axios';

const Game: React.FC = () => {
  const theme = useTheme();

  const [gameData, setGameData] = useState<GameData|null>(null);
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, name: 'Игрок 1', score: 0, avatar: 'P1', color: theme.palette.primary.main },
    { id: 2, name: 'Игрок 2', score: 0, avatar: 'P2', color: theme.palette.secondary.main },
  ]);
  
  const [host] = useState<Host>({
    name: 'Ведущий',
    avatar: 'H',
  });

  // Преобразуем вопросы из API в наш формат с добавлением isAnswered
  const [themes, setThemes] = useState<Theme[]>([]);

  const [currentQuestion, setCurrentQuestion] = useState<{themeIndex: number, questionIndex: number} | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [openAddPlayer, setOpenAddPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');

  // Цвета для новых игроков
  const playerColors = [
    theme.palette.success.main,
    theme.palette.info.main,
    theme.palette.warning.main,
    theme.palette.error.main
  ];

  // Обработчики событий
  const handleQuestionClick = (themeIndex: number, questionIndex: number) => {
    if (!themes[themeIndex].Questions[questionIndex].isAnswered) {
      setCurrentQuestion({ themeIndex, questionIndex });
      setShowAnswer(false);
    }
  };

  const handleCloseQuestion = () => {
    setCurrentQuestion(null);
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleAddScore = (playerId: number, points: number) => {
    if (!currentQuestion) return;
    
    setPlayers(players.map(player => 
      player.id === playerId ? { ...player, score: player.score + points } : player
    ));
    
    setThemes(prevThemes => {
      const newThemes = [...prevThemes];
      newThemes[currentQuestion.themeIndex].Questions[currentQuestion.questionIndex].isAnswered = true;
      return newThemes;
    });
    
    setCurrentQuestion(null);
  };

  const handleAddPlayer = () => {
    if (newPlayerName.trim() && players.length < 5) {
      const newPlayer: Player = {
        id: players.length + 1,
        name: newPlayerName,
        score: 0,
        avatar: `P${players.length + 1}`,
        color: playerColors[players.length - 2] || theme.palette.primary.main,
      };
      setPlayers([...players, newPlayer]);
      setNewPlayerName('');
      setOpenAddPlayer(false);
    }
  };

  const handleRemovePlayer = (playerId: number) => {
    if (players.length > 2) {
      setPlayers(players.filter(player => player.id !== playerId));
    }
  };

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

  useEffect(()=>{
    axios.get("/round/1").then((r)=>{
      var resp : GameData = r.data;
      setGameData(resp);
      setThemes(resp.Themes.map(theme => ({
        ...theme,
        Questions: theme.Questions.map(question => ({
          ...question,
          isAnswered: false
        }))
      })));
    })
    
  },[])

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
        <GridLegacy item xs={2}>
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
              color="primary" 
              onClick={() => setOpenAddPlayer(true)}
              disabled={players.length >= 5}
              sx={{ marginBottom: 2 }}
            >
              Добавить игрока
            </Button>
          </Paper>
        </GridLegacy>
        
        {/* Центральная колонка с вопросами */}
        <GridLegacy item xs={8}>
          <Box sx={{ 
            height: '100%', 
            display: 'flex',
            flexDirection: 'column',
          }}>
            <Typography variant="h4" align="center" gutterBottom sx={{ marginBottom: 3 }}>
              {gameData?.Name}
            </Typography>
            
            {/* Сетка категорий и вопросов */}
            <Grid container spacing={2} sx={{ flexGrow: 1 }}>
              {themes.map((gameTheme, themeIndex) => (
                <GridLegacy item xs={12 / themes.length} key={themeIndex}>
                  <Card sx={{ 
                    backgroundColor: theme.palette.primary.light,
                    color: theme.palette.text.primary,
                    marginBottom: 2,
                  }}>
                    <CardContent>
                      <Typography variant="h6" align="center">
                        {gameTheme.Name}
                      </Typography>
                    </CardContent>
                  </Card>
                  
                  {gameTheme.Questions
                    .sort((a, b) => a.Price - b.Price)
                    .map((question, questionIndex) => (
                      <Card 
                        key={questionIndex}
                        onClick={() => handleQuestionClick(themeIndex, questionIndex)}
                        sx={{ 
                          marginBottom: 1,
                          cursor: question.isAnswered ? 'default' : 'pointer',
                          backgroundColor: question.isAnswered 
                            ? theme.palette.grey[600] 
                            : theme.palette.primary.dark,
                          color: theme.palette.text.primary,
                          height: 80,
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
                </GridLegacy>
              ))}
            </Grid>
          </Box>
        </GridLegacy>
        
        {/* Пустая колонка для баланса */}
        <GridLegacy item xs={2} />
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
        {players.map(player => (
          <Paper key={player.id} elevation={3} sx={{ 
            padding: 2,
            minWidth: 150,
            backgroundColor: player.color,
            color: theme.palette.getContrastText(player.color),
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ 
                  width: 40, 
                  height: 40, 
                  bgcolor: 'rgba(0, 0, 0, 0.2)',
                  marginRight: 1,
                }}>
                  {player.avatar}
                </Avatar>
                <Typography variant="subtitle1">
                  {player.name}
                </Typography>
              </Box>
              {players.length > 2 && (
                <Button 
                  size="small" 
                  color="inherit" 
                  onClick={() => handleRemovePlayer(player.id)}
                  sx={{ minWidth: 24 }}
                >
                  ×
                </Button>
              )}
            </Box>
            <Typography variant="h5" align="center" sx={{ marginTop: 1 }}>
              {player.score}
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
                        src={media.Content} 
                        alt="Question media" 
                        style={{ maxWidth: '100%', maxHeight: '300px' }} 
                      />
                    </Box>
                  )}
                  
                  {media?.Type === 'audio' && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: 2 }}>
                      <audio controls>
                        <source src={media.Content} type="audio/mpeg" />
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
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
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
                  </Box>
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
            onClick={handleAddPlayer} 
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

export default Game;