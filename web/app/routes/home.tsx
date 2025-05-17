import Button from '@mui/material/Button';
import { useRef, useState, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import axiosInst from '../utils/axios';
import { TextField } from '@mui/material';


export default function Home() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [identified, setIdentified] = useState(false);
  const uploadPackage = async (e: ChangeEvent)=>{
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('package', file);

      // Отправка файла на сервер
      const response = await axiosInst.postForm('/package/upload', formData);

      console.log('Файл успешно загружен:', response.data);
      navigate(`/game/${response.data.SessionID}`)
    } catch (error) {
      console.error('Ошибка при загрузке файла:', error);
      alert('Произошла ошибка при загрузке файла');
    }
  }

  const identify = async ()=>{
    await axiosInst.get("/identify");
    setIdentified(true);
  }

  return <>
  <input
        accept='.siq'
        type="file"
        ref={fileInputRef}
        onChange={uploadPackage}
        style={{ display: 'none' }}
      />
      {identified && <>
        <Button variant="contained" onClick={()=>fileInputRef.current.click()}   disableElevation color="primary" >
            Залить пакет
          </Button>
      </> || <>
        Введите ваш ник <br></br> <TextField></TextField> <Button onClick={identify}>Identify</Button>
      </>}
  
  </>;
}
