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

  const [isLoading, setLoading] = useState(true)

  useEffect(()=>{
    http.get("/game/gamedata").then((r)=>{
      var resp : Package = r.data;
      
      http.get("/rooms/get").then(r=>{
        dispatch(setGameData({...resp, ...r.data}))
        setLoading(false);
      })
      }).catch((err)=>{
      if(err.response.status == 404){
        navigate("/404")
      }
    })
    
  },[])
  if (isLoading){
    return <> Loading. . . .</>
  }
  return <Game/>
}
