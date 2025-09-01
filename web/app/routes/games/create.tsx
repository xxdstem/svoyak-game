import { Button, TextField, Paper, Box, Typography } from "@mui/material";
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { joinRoom } from "~/store/user";
import http from "~/utils/axios";

export default function App (){
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [playersMax, setPlayersMax] = useState(4);
  const [selectedFile, setSelectedFile] = useState<File|null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadPackage = (e: ChangeEvent) => {
    let file = (e.target as HTMLInputElement)!.files![0];
    if (!file) return;
    setSelectedFile(file);
  };

  const trimFileName = (name: string) =>{
    name = name.split(".siq")[0]
    if (name.length < 16) return name;
    return `${name.slice(0, 14)}...`
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !name) {
      alert("Выберите файл и введите название игры");
      return;
    }
    try {
      const formData = new FormData();
      formData.append('package', selectedFile);
      formData.append('name', name);
      formData.append('password', password);
      formData.append('players_max', String(playersMax));
      // Отправка файла и данных на сервер
      const response = await http.postForm('/game/create', formData);
      dispatch(joinRoom(response.data.room_id));
      navigate(`/game`);
    } catch (error) {
      console.error('Ошибка при загрузке файла:', error);
      alert('Произошла ошибка при загрузке файла');
    }
  };

  return (
    <Box sx={{ maxWidth: 420, mx: 'auto', mt: 6 }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" align="center" gutterBottom>Создать игру</Typography>
        <form onSubmit={handleSubmit}>
          <input
            accept='.siq'
            type="file"
            ref={fileInputRef}
            onChange={uploadPackage}
            style={{ display: 'none' }}
          />
          <Button variant="contained" color="primary"
            style={{textTransform:"none"}}
            onClick={() => fileInputRef.current!.click()} disableElevation
            fullWidth sx={{ py: 1.5, fontSize: 18, mb: 2 }}
          >
            {selectedFile ? `Файл выбран: ${trimFileName(selectedFile.name)}` : "Выбрать пакет"}
          </Button>
          <TextField
            label="Название игры"
            value={name}
            onChange={e => setName(e.target.value)}
            fullWidth
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="Пароль (необязательно)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            type="password"
          />
          <TextField
            label="Максимум игроков"
            type="number"
            value={playersMax}
            onChange={e => setPlayersMax(Number(e.target.value))}
            fullWidth
            sx={{ mb: 2 }}
            inputProps={{ min: 2, max: 20 }}
          />
          <Button type="submit" variant="contained" color="success" fullWidth sx={{ py: 1.5, fontSize: 18 }}>
            Создать игру
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
