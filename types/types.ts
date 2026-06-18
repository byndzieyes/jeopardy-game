export interface Player {
  id: string;
  socketId: string;
  username: string;
  score?: number;
  isConnected: boolean;
}

export interface Room {
  host: Player;
  players: Player[];
  isActive: boolean;
}
export interface RoomsState {
  [roomCode: string]: Room;
}
