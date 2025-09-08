
// Типы для TypeScript
export type Player = {
  id: number;
  name: string;
  score: number;
  avatar: string;
  color: string;
};

export type Host = {
  name: string;
  avatar: string;
};

export type Question = {
  Price: number;
  Params: {
    Name: string;
    Type: string;
    Items: {
      Type: string;
      Content: string;
      Placement?: string;
      Duration?: string;
      IsRef?: boolean;
      WaitForFinish?: boolean;
    }[];
  }[];
  Right: {
    Answers: string[];
  };
  IsAnswered?: boolean;
};

export type Theme = {
  Name: string;
  Questions: Question[];
};

export type GameData = {
  Name: string;
  Type: string;
  Themes: Theme[];
};

export type Package = {
    PackageID: string;
    Rounds: GameData[];
};

export type RoomStats = {
  Role: string;
  QuestionPicker: boolean;
  Points: number;
}

export type RoomPlayer = {
  id: string;
  username: string;
  color: string;
  room_stats: RoomStats;
}

export type RoomDetails = {
	id:          string;            
	name:        string;             
	package_id:   string;           
	package_name: string;      
	players_max:  number;
	players:     Map<number, RoomPlayer>;
  is_started: boolean;
  is_paused: boolean;
}


export type CurrentQuestion ={
    themeIndex: number;
    question: Question;
}