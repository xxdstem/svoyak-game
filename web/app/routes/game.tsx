import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Game } from "~/components/SVOGame/SVoGame";
import type { Package } from "~/components/SVOGame/types";
import http from "~/utils/axios";

export default function App (){
  const navigate = useNavigate();

  const [gameData, setGameData] = useState<Package>();

  useEffect(()=>{
    http.get("/game/get").then((r)=>{
      var resp : Package = r.data;
      setGameData(resp);
    }).catch((err)=>{
      if(err.response.status == 404){
        navigate("/404")
      }
    })
  },[])
  if (!gameData){
    return <> Loading. . . .</>
  }
  return <Game package={gameData}/>
}
