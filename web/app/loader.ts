import type { User } from "./types";
import http from "./utils/axios";
import { setUser } from "./store/user";
import { store } from "./store/store";


export default async function Loader() : Promise<User | null> {
  let l = localStorage.getItem("user")
  let user: User;
  if(l === null){
    try{
      var r = await http.get("/identify");
      if (!r.data) return null;
      user = r.data;
    }catch{
      return null;
    }
  }else{
    user = JSON.parse(l)
  }
  store.dispatch(setUser(user));
  return user
}