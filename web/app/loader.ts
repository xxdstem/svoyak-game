import http from "./utils/axios";

export default async function Loader() {
    var r = await http.get("/identify");
      if (r.data){
        return {user: r.data}
      }
}