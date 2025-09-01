import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Game } from "~/components/SVOGame/SVoGame";
import type { Package, RoomDetails } from "~/components/SVOGame/types";
import { $game, setGameData } from "~/store/game";
import http from "~/utils/axios";

export default function App (){
  const navigate = useNavigate();
  const dispatch = useDispatch();


  const [roomData, setRoomData] = useState<RoomDetails>();

  useEffect(()=>{
    http.get("/game/gamedata").then((r)=>{
      var resp : Package = r.data;
      dispatch(setGameData(resp))
      http.get("/rooms/get").then(r=>setRoomData(r.data));
    }).catch((err)=>{
      if(err.response.status == 404){
        navigate("/404")
      }
    })
  },[])
  if (!roomData){
    return <> Loading. . . .</>
  }
  return <Game roomData={roomData}/>
}
