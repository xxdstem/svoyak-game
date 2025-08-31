import { lazy } from "react";

export default [
    { index: true, Component: lazy(async ()=>import("./routes/home"))},  
    { path: 'login', Component: lazy(async ()=>import("./routes/login"))},   
    { path: 'games/create', Component: lazy(async ()=>import("./routes/games/create"))}, 
    { path: 'games/list', Component: lazy(async ()=>import("./routes/games/list"))}, 
    { path: 'game', Component: lazy(async ()=>import("./routes/games/game"))},   
];
