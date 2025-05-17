
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
  isAnswered?: boolean;
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
  