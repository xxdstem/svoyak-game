import Home from "./routes/home";
import Game from "./routes/game";

export default [
    { index: true, Component: Home},
    { path: 'game', Component: Game},
        
];
