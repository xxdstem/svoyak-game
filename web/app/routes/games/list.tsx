import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import http from "~/utils/axios";
import type { Room } from "~/types";
import { useDispatch } from "react-redux";
import { joinRoom } from "~/store/user";

export default function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [passwordDialog, setPasswordDialog] = useState({
    open: false,
    roomId: '',
    roomName: '',
    error: ''
  });
  const [password, setPassword] = useState('');

  useEffect(() => {
    http.get("/rooms/list").then((r) => {
      setRooms(r.data || []);
    }).catch(() => {
      setRooms([]);
    }).finally(() => setLoading(false));
  }, []);

  const handleRoomClick = useCallback((room: Room) => {
    if (room.with_password) {
      // Показываем диалог для ввода пароля
      setPasswordDialog({
        open: true,
        roomId: room.id,
        roomName: room.name,
        error: ''
      });
      setPassword('');
    } else {
      // Если пароля нет, сразу присоединяемся
      joinGame(room.id, '');
    }
  }, []);

  const handlePasswordSubmit = useCallback(() => {
    if (!password.trim()) {
      setPasswordDialog(prev => ({ ...prev, error: 'Введите пароль' }));
      return;
    }
    joinGame(passwordDialog.roomId, password);
  }, [password, passwordDialog.roomId]);

  const joinGame = useCallback(async (roomID: string, roomPassword: string) => {
    try {
      const formData = new FormData();
      formData.append('room_id', roomID);
      formData.append('password', roomPassword);
      const response = await http.post("/rooms/join", formData);
      
      dispatch(joinRoom(response.data.room_id));
      setPasswordDialog(prev => ({ ...prev, open: false }));
      navigate(`/game`);
    } catch (error: any) {
      if (error.response?.status === 401) {
        setPasswordDialog(prev => ({
          ...prev,
          error: 'Неверный пароль'
        }));
      } else {
        setPasswordDialog(prev => ({
          ...prev,
          error: 'Ошибка присоединения к комнате'
        }));
      }
    }
  }, [dispatch, navigate]);

  const closePasswordDialog = useCallback(() => {
    setPasswordDialog(prev => ({
      ...prev,
      open: false,
      error: ''
    }));
    setPassword('');
  }, []);

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box>;
  }
  if (!isLoading && rooms.length === 0) {
    return <Typography align="center" sx={{ mt: 4 }}>Нет доступных комнат</Typography>;
  }

  return (
    <>
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 6 }}>
        <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h5" align="center" gutterBottom>Список комнат</Typography>
          <List>
            {rooms.map((room: Room) => (
              <ListItem
                key={room.id}
                sx={{
                  cursor: 'pointer',
                  mb: 1,
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  boxShadow: 2,
                  transition: 'background 0.2s',
                  '&:hover': {
                    bgcolor: 'primary.light',
                    boxShadow: 4,
                  },
                }}
                onClick={() => handleRoomClick(room)}
              >
                {room.with_password && (
                  <ListItemIcon><LockIcon color="action" /></ListItemIcon>
                )}
                <ListItemText
                  primary={room.name}
                  secondary={`Игроков: ${room.players_count ?? 0}/${room.players_max ?? 4}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>

      {/* Диалог для ввода пароля */}
      <Dialog open={passwordDialog.open} onClose={closePasswordDialog}>
        <DialogTitle>Введите пароль для комнаты "{passwordDialog.roomName}"</DialogTitle>
        <DialogContent>
          {passwordDialog.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {passwordDialog.error}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Пароль"
            type="password"
            fullWidth
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handlePasswordSubmit();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closePasswordDialog}>Отмена</Button>
          <Button onClick={handlePasswordSubmit} variant="contained">
            Присоединиться
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}