import type { Package } from "./components/SVOGame/types";

export type User = {
    username: string;
    session_id: string;
    room_id: string;
}

export type Room = {
    id: string;
    name: string;
    with_password: string;
    package_id: string;
    package_name: string;
    players_max: number;
    players_count: number;
}

export type StoreState = {
    user: User | null;
    game: Package | null;
}