import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { generateRoomCode } from './utils/room.js';
import type { Player, RoomsState, Preset } from '@shared/types';

const app = express();
const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST'],
  },
});

type CreateRoomPayload = Pick<Player, 'id' | 'username'> & { preset: Preset };
type JoinRoomPayload = Pick<Player, 'id' | 'username'> & { roomCode: string };
type LeaveRoomPayload = Pick<Player, 'id' | 'username'> & { roomCode: string };

const rooms: RoomsState = {};

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('create_room', ({ id, username, preset }: CreateRoomPayload) => {
    let roomCode = generateRoomCode();
    while (rooms[roomCode]) {
      roomCode = generateRoomCode();
    }

    const hostPlayer: Player = {
      id,
      socketId: socket.id,
      username,
      isConnected: true,
    };

    rooms[roomCode] = {
      host: hostPlayer,
      players: [],
      isActive: false,
      preset: preset,
    };

    socket.join(roomCode);
    console.log(`Host ${username} created room: ${roomCode} with preset: ${!!preset}`);
    socket.emit('room_created', roomCode);
  });

  socket.on('join_room', ({ id, username, roomCode }: JoinRoomPayload) => {
    console.log(`Player ${username} wants to join room: ${roomCode}`);

    if (!rooms[roomCode]) {
      return socket.emit('error_message', 'Кімнату не знайдено! Перевір код');
    }

    if (rooms[roomCode].host.id === id) {
      rooms[roomCode].host.socketId = socket.id;
      rooms[roomCode].host.isConnected = true;

      console.log(`Host ${username} successfully reconnected to the room ${roomCode}!`);

      socket.join(roomCode);
      socket.emit('update_players', rooms[roomCode].players);
      socket.emit('room_joined_success', { isActive: rooms[roomCode].isActive, roomCode, role: 'host' });

      return;
    }

    const existingPlayer = rooms[roomCode].players.find((p) => p.id === id);

    if (existingPlayer) {
      existingPlayer.socketId = socket.id;
      existingPlayer.isConnected = true;
      console.log(
        `Player ${username} reconnected. Game status: ${rooms[roomCode].isActive ? 'In progress' : 'In lobby'}`,
      );
    } else {
      if (rooms[roomCode].isActive) {
        return socket.emit('error_message', 'Гра вже почалася, нові гравці не можуть приєднатися!');
      }

      const newPlayer: Player = {
        id,
        socketId: socket.id,
        username,
        score: 0,
        isConnected: true,
      };

      rooms[roomCode].players.push(newPlayer);
      console.log(`Player ${username} joined room: ${roomCode}. Total players: ${rooms[roomCode].players.length}`);
    }

    socket.join(roomCode);
    io.to(roomCode).emit('update_players', rooms[roomCode].players);

    socket.emit('room_joined_success', {
      isActive: rooms[roomCode].isActive,
      roomCode: roomCode,
      role: rooms[roomCode].host.id === id ? 'host' : 'player',
    });
  });

  socket.on('leave_room', ({ id, username, roomCode }: LeaveRoomPayload) => {
    if (!rooms[roomCode]) {
      return socket.emit('error_message', 'Кімнату не знайдено! Перевір код');
    }

    if (rooms[roomCode].host.id === id) {
      console.log(`Host ${rooms[roomCode].host.username} closed room ${roomCode}.`);

      rooms[roomCode].players = [];

      io.to(roomCode).emit('update_players', rooms[roomCode].players);
      io.to(roomCode).emit('error_message', 'Хост закрив кімнату');

      io.in(roomCode).socketsLeave(roomCode);

      delete rooms[roomCode];
      return;
    }

    rooms[roomCode].players = rooms[roomCode].players.filter((p) => p.id !== id);

    console.log(`User ${username} left room: ${roomCode}`);

    io.to(roomCode).emit('update_players', rooms[roomCode].players);
    socket.leave(roomCode);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);

    for (const roomCode in rooms) {
      const room = rooms[roomCode];

      if (!room) continue;

      if (room.host.socketId === socket.id) {
        console.log(`Room host ${roomCode} lost connection. Waiting 10 seconds...`);
        room.host.isConnected = false;

        setTimeout(() => {
          const room = rooms[roomCode];
          if (room && room.host.socketId === socket.id) {
            console.log(`Room host ${roomCode} lost connection. Nullifying game.`);

            room.players = [];

            io.to(roomCode).emit('update_players', room.players);
            io.to(roomCode).emit('error_message', "Хост залишив гру через проблеми зі зв'язком");

            io.in(roomCode).socketsLeave(roomCode);

            delete rooms[roomCode];
          }
        }, 10000);

        break;
      }

      const playerIndex = room.players.findIndex((p) => p.socketId === socket.id);

      if (playerIndex !== -1) {
        const disconnectedPlayer = room.players[playerIndex];

        if (disconnectedPlayer) {
          disconnectedPlayer.isConnected = false;
          console.log(`Player ${disconnectedPlayer.username} lost connection. Waiting for reconnection...`);

          io.to(roomCode).emit('update_players', room.players);

          setTimeout(() => {
            const room = rooms[roomCode];
            if (room) {
              const currentPlayer = room.players.find((p) => p.id === disconnectedPlayer.id);

              if (currentPlayer && currentPlayer.socketId === socket.id) {
                if (!room.isActive) {
                  room.players = room.players.filter((p) => p.id !== disconnectedPlayer.id);

                  console.log(`Player ${disconnectedPlayer.username} did not reconnect. Deleted.`);

                  io.to(roomCode).emit('update_players', room.players);
                } else {
                  console.log(`Player ${disconnectedPlayer.username} is offline, but the game is still in progress.`);
                }
              }
            }
          }, 10000);
        }

        break;
      }
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
