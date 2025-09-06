import Button from '@mui/material/Button';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import http from '~/utils/axios';
import { TextField, Box, Typography, Paper, Alert, useTheme, ThemeProvider, CssBaseline } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { $currentUser, setUser } from '~/store/user';
import { basedarkTheme, baselightTheme } from '~/themes';


export default function Login() {
  const dispatch = useDispatch();
  const currentUser = useSelector($currentUser);
  const navigate = useNavigate();
  const theme = useTheme();

  const [nickname, setNick] = useState<string>(localStorage.getItem("username") ?? "");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const identify = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const r = await http.putForm("/identify", { name: nickname });
      if (r.data) {
        dispatch(setUser(r.data));
        navigate('/');
      }
    } catch (error: any) {
      setError(error?.response?.data ?? 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  }, [nickname, dispatch]);

  useEffect(()=>{
      if(currentUser){
        navigate("/")
      }
  }, [currentUser]);

  // Choose theme (example: always dark, or use system)
  const currentTheme = theme.palette.mode === 'dark' ? basedarkTheme : baselightTheme;

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.palette.background.default }}>
        <Paper elevation={6} sx={{ p: 6, borderRadius: 4, minWidth: 400, maxWidth: 500, width: '100%' }}>
          <Typography variant="h4" align="center" gutterBottom>
            Вход в игру
          </Typography>
          <Typography variant="body1" align="center" gutterBottom>
            Введите ваш ник
          </Typography>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }} onSubmit={e => { e.preventDefault(); identify(); }}>
            <TextField
              label="Ник"
              variant="outlined"
              value={nickname}
              onChange={e => setNick(e.target.value)}
              fullWidth
              autoFocus
            />
            {error && <Alert sx={{fontSize: "16px"}} variant="standard" severity="error">{error}</Alert>}
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={identify}
              disabled={loading || !nickname.trim()}
              sx={{ py: 1.5, fontSize: 18 }}
              fullWidth
            >
              Войти
            </Button>
          </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}
