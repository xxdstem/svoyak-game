import type { User } from "./types";
import http from "./utils/axios";
import { setUser } from "./store/user";
import { store } from "./store/store";


export default async function Loader() : Promise<User | null> {
  try{
    var r = await http.get("/identify");
    if (!r.data) return null;
    let user = r.data;
    store.dispatch(setUser(user));
    return user;
  }catch{
    return null;
  }
}