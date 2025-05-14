import React, { useState } from 'react';
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

type Question = {
  id: number;
  category: string;
  price: number;
  text: string;
  answer: string;
  isAnswered: boolean;
};

type Host = {
  name: string;
  avatar: string;
};

const Game: React.FC = () => {
  const theme = useTheme();
  
  // Состояния
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, name: 'Игрок 1', score: 0, avatar: 'P1', color: theme.palette.primary.main },
    { id: 2, name: 'Игрок 2', score: 0, avatar: 'P2', color: theme.palette.secondary.main },
  ]);
  
  const [host] = useState<Host>({
    name: 'Ведущий',
    avatar: 'H',
  });

  const [questions, setQuestions] = useState<Question[]>([
    { id: 1, category: 'История', price: 100, text: 'В каком году началась Вторая мировая война?', answer: '1939', isAnswered: false },
    { id: 2, category: 'История', price: 200, text: 'Кто был первым президентом США?', answer: 'Джордж Вашингтон', isAnswered: false },
    { id: 3, category: 'Наука', price: 100, text: 'Какой химический элемент обозначается символом "O"?', answer: 'Кислород', isAnswered: false },
    { id: 4, category: 'Наука', price: 200, text: 'Сколько планет в Солнечной системе?', answer: '8', isAnswered: false },
    { id: 5, category: 'Искусство', price: 100, text: 'Кто написал картину "Мона Лиза"?', answer: 'Леонардо да Винчи', isAnswered: false },
    { id: 6, category: 'Искусство', price: 200, text: 'Какой композитор написал "Лунную сонату"?', answer: 'Бетховен', isAnswered: false },
  ]);

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
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
  const handleQuestionClick = (question: Question) => {
    if (!question.isAnswered) {
      setCurrentQuestion(question);
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
    setPlayers(players.map(player => 
      player.id === playerId ? { ...player, score: player.score + points } : player
    ));
    
    if (currentQuestion) {
      setQuestions(questions.map(q => 
        q.id === currentQuestion.id ? { ...q, isAnswered: true } : q
      ));
    }
    
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

  // Группировка вопросов по категориям
  const categories = [...new Set(questions.map(q => q.category))];

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
              СВОЯ ИГРА
            </Typography>
            
            {/* Сетка категорий и вопросов */}
            <Grid container spacing={2} sx={{ flexGrow: 1 }}>
              {categories.map(category => (
                <GridLegacy item xs={12 / categories.length} key={category}>
                  <Card sx={{ 
                    backgroundColor: theme.palette.primary.light,
                    color: theme.palette.text.primary,
                    marginBottom: 2,
                  }}>
                    <CardContent>
                      <Typography variant="h6" align="center">
                        {category}
                      </Typography>
                    </CardContent>
                  </Card>
                  
                  {questions
                    .filter(q => q.category === category)
                    .sort((a, b) => a.price - b.price)
                    .map(question => (
                      <Card 
                        key={question.id}
                        onClick={() => handleQuestionClick(question)}
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
                            {question.isAnswered ? '' : question.price}
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
        {currentQuestion && (
          <>
            <DialogTitle sx={{ 
              backgroundColor: theme.palette.primary.dark, 
              color: theme.palette.text.primary 
            }}>
              {currentQuestion.category} за {currentQuestion.price}
            </DialogTitle>
            <DialogContent sx={{ padding: 4 }}>
              <Typography variant="h5" gutterBottom>
                {currentQuestion.text}
              </Typography>
              
              {showAnswer && (
                <>
                  <Divider sx={{ marginY: 3 }} />
                  <Typography variant="h6" color="primary">
                    Ответ:
                  </Typography>
                  <Typography variant="h5">
                    {currentQuestion.answer}
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
                    onClick={() => handleAddScore(player.id, currentQuestion.price)}
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
                    {player.name} (+{currentQuestion.price})
                  </Button>
                ))}
              </Box>
            </DialogActions>
          </>
        )}
      </Dialog>
      
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