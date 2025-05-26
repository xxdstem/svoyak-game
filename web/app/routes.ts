import Home from "./routes/home";
import Game from "./routes/game";
import NotFound from "./routes/404";
import { lazy } from "react";

export default [
    { index: true, Component: lazy(async ()=>import("./routes/home"))},  
    { path: 'game', Component: lazy(async ()=>import("./routes/game"))},   
];
