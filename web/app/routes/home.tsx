import Button from '@mui/material/Button';
import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import http from '~/utils/axios';
import { TextField } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { $currentUser, setUser } from '~/store/user';


export default function Home() {
  const dispatch = useDispatch();
  const currentUser = useSelector($currentUser);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadPackage = async (e: ChangeEvent)=>{
    let file = (e.target as HTMLInputElement)!.files![0];
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
      dispatch(setUser(r.data));
    }
    
  }, [nickname]);

  return <>
  <input
        accept='.siq'
        type="file"
        ref={fileInputRef}
        onChange={uploadPackage}
        style={{ display: 'none' }}
      />
      {currentUser && <>
      Салам, {currentUser.UserName}
        {currentUser.CurrentPackageId ? <Button variant="contained"  component={Link} to="/game"   disableElevation color="primary" >
            Вернуться в игру
          </Button> : <Button variant="contained" onClick={()=>fileInputRef.current!.click()}   disableElevation color="primary" >
            Залить пакет
          </Button>}
      </> || <>
        Введите ваш ник <br></br> <TextField onChange={(e)=>setNick(e.target.value)}></TextField> <Button onClick={identify}>Identify</Button>
      </>}
  
  </>;
}
