import Home from "./routes/home";
import Game from "./routes/game";
import NotFound from "./routes/404";

export default [
    { index: true, Component: Home},  
    { path: 'game', Component: Game},   
];
