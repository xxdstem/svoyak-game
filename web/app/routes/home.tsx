import Button from '@mui/material/Button';
import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import http from '~/utils/axios';
import { TextField } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { $currentUser, joinRoom, setUser } from '~/store/user';
import { Box, Paper, Typography } from '@mui/material';


export default function Home() {
  const dispatch = useDispatch();
  const currentUser = useSelector($currentUser);
  const navigate = useNavigate();
  

  const [nickname, setNick] = useState<string>("");

  const identify = useCallback(async ()=>{
    try {
      const r = await http.putForm("/identify", { name: nickname });
      if (r.data) {
        dispatch(setUser(r.data));
      }
    } catch (error: any) {
      alert(error?.response?.data ?? 'An error occurred');
    }
    
  }, [nickname]);

  return <>
    
    {currentUser ? (
      currentUser.room_id ? (
        <Box sx={{ minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
          <Paper elevation={6} sx={{ p: 6, borderRadius: 4, minWidth: 400, maxWidth: 500, width: '100%' }}>
            <Typography variant="h4" align="center" mb={2} gutterBottom>
              Добро пожаловать!
            </Typography>
            <Button variant="contained"  component={Link} to="/game" disableElevation color="primary" fullWidth sx={{ py: 1.5, fontSize: 18 }}>
              Вернуться в игру
            </Button>
          </Paper>
        </Box>
      ) : (
        <Box sx={{ minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
          <Paper elevation={6} sx={{ p: 6, borderRadius: 4, minWidth: 400, maxWidth: 500, width: '100%' }}>
            <Typography variant="h4" align="center" mb={2} gutterBottom>
              Меню
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Button variant="contained" color="primary" onClick={() => navigate('/games/create')} disableElevation fullWidth sx={{ py: 1.5, fontSize: 18 }}>Создать игру</Button>
              <Button variant="contained" color="primary" onClick={() => navigate('/games/list')} fullWidth sx={{ py: 1.5, fontSize: 18 }}>Присоединиться к игре</Button>
              <Button variant="contained" color="primary" onClick={() => window.location.replace("https://www.sibrowser.ru")} fullWidth sx={{ py: 1.5, fontSize: 18 }}>Скачать паки</Button>
            </Box>
          </Paper>
        </Box>
      )
    ) : (
      <Box sx={{ minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
        <Paper elevation={6} sx={{ p: 6, borderRadius: 4, minWidth: 400, maxWidth: 500, width: '100%' }}>
          <Typography variant="h4" align="center" gutterBottom>
            Введите ваш ник
          </Typography>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField onChange={(e) => setNick(e.target.value)} label="Ник" variant="outlined" fullWidth autoFocus />
            <Button onClick={identify} variant="contained" color="primary" size="large" sx={{ py: 1.5, fontSize: 18 }} fullWidth>
              Identify
            </Button>
          </Box>
        </Paper>
      </Box>
    )}
  </>;
}
