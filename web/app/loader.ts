import type { User } from "./types";
import http from "./utils/axios";

export default async function Loader() : Promise<User | null> {
    var r = await http.get("/identify");
    if (r.data){
      return r.data;
    }
    return null
}