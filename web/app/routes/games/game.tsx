import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { Game } from "~/components/SVOGame/SVoGame";
import type { Package } from "~/components/SVOGame/types";
import { setRoomData } from "~/store/room";
import http from "~/utils/axios";

export default function App (){
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isLoading, setLoading] = useState(true)
  const [pkg, setPackage] = useState<Package>();

  useEffect(()=>{
    http.get("/rooms/get").then(r=>{
      dispatch(setRoomData({ ...r.data}))
      http.get("/game/gamedata").then((r)=>{
        var resp : Package = r.data;
        setPackage(resp);
        setLoading(false);
      })
      
      
    }).catch((err)=>{
      if(err.response.status == 404){
        navigate("/404")
      }
    })
  },[])
  if (isLoading || !pkg){
    return <> Loading. . . .</>
  }
  return <Game pkg={pkg}/>
}
