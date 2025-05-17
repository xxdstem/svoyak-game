import Button from '@mui/material/Button';
import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import http from '~/utils/axios';
import { TextField } from '@mui/material';


export default function Home() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isLoading, setLoading] = useState(true);
  const [identified, setIdentified] = useState(null);
  const uploadPackage = async (e: ChangeEvent)=>{
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('package', file);

      // Отправка файла на сервер
      const response = await http.postForm('/package/upload', formData);

      console.log('Файл успешно загружен:', response.data);
      navigate(`/game`)
    } catch (error) {
      console.error('Ошибка при загрузке файла:', error);
      alert('Произошла ошибка при загрузке файла');
    }
  }

  const [nickname, setNick] = useState<string>("");

  const identify = useCallback(async ()=>{
    var r = await http.putForm("/identify", {name: nickname});
    if(r.data){
      setIdentified(r.data);
    }
    
  }, [nickname]);

  useEffect(()=>{
    var fetch = async () => {
      var r = await http.get("/identify");
      if (r.data){
        setIdentified(r.data);
        setLoading(false);
      }
    }
    fetch();
    
  },[])

  return <>
  <input
        accept='.siq'
        type="file"
        ref={fileInputRef}
        onChange={uploadPackage}
        style={{ display: 'none' }}
      />
      {identified && <>
      Салам, {identified.UserName}
        <Button variant="contained" onClick={()=>fileInputRef.current.click()}   disableElevation color="primary" >
            Залить пакет
          </Button>
      </> || <>
        Введите ваш ник <br></br> <TextField onChange={(e)=>setNick(e.target.value)}></TextField> <Button onClick={identify}>Identify</Button>
      </>}
  
  </>;
}
