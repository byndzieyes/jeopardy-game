export interface Player {
  id: string;
  socketId: string;
  username: string;
  score?: number | undefined;
  isConnected: boolean;
}

export interface Question {
  id: string;
  value: number;
  questionText: string;
  answerText: string;
  isAnswered?: boolean | undefined;
}

export interface Category {
  id: string;
  name: string;
  questions: Question[];
}

export interface Preset {
  categories: Category[];
}

export interface Room {
  host: Player;
  players: Player[];
  isActive: boolean;
  preset: Preset;
}

export interface RoomsState {
  [roomCode: string]: Room;
}
