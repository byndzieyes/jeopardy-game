export interface Player {
  id: string;
  socketId: string;
  username: string;
  score?: number;
}

export interface Room {
  host: Player;
  players: Player[];
  isActive: boolean;
}
export interface RoomsState {
  [roomCode: string]: Room;
}
