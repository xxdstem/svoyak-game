import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Game } from "~/components/SVOGame/SVoGame";
import type { Package, RoomDetails } from "~/components/SVOGame/types";
import http from "~/utils/axios";

export default function App (){
  const navigate = useNavigate();

  const [gameData, setGameData] = useState<Package>();
  const [roomData, setRoomData] = useState<RoomDetails>();

  useEffect(()=>{
    http.get("/rooms/get").then(r=>setRoomData(r.data));
    http.get("/game/gamedata").then((r)=>{
      var resp : Package = r.data;
      setGameData(resp);
    }).catch((err)=>{
      if(err.response.status == 404){
        navigate("/404")
      }
    })
  },[])
  if (!gameData || !roomData){
    return <> Loading. . . .</>
  }
  return <Game roomData={roomData} package={gameData}/>
}
