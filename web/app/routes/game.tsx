import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Game } from "~/components/SVOGame/SVoGame";
import type { GameData } from "~/components/SVOGame/types";
import http from "~/utils/axios";

const App = ()=>{
  const navigate = useNavigate();

  const [gameData, setGameData] = useState<GameData>();

  useEffect(()=>{
    http.get("/round/0").then((r)=>{
      var resp : GameData = r.data;
      setGameData(resp);
    }).catch((err)=>{
      if(err.response.status == 404){
        navigate("/404")
      }
    })
  },[])
  if (!gameData){
    return <> Loading . . .</>
  }
  return <Game data={gameData}/>
}

export default App;