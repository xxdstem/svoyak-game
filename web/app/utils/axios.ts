import axios from 'axios';

const http = axios.create({
    baseURL: "/api",
    timeout: 1000,
    withCredentials: true,
});
http.interceptors.request.use(function (request) {
    if (window.token){
        request.headers["Authorization"] = `Bearer ${window.token}`;
    }
    return request;
  });
export default http;