import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

app.get('/ping', (req, res) => {
  res.send('pong');
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('create_room', ({ username }) => {
    const roomCode = generateRoomCode();
    console.log(`Host ${username} created room: ${roomCode}`);
    socket.join(roomCode);
    socket.emit('room_created', roomCode);
  });

  socket.on('join_room', ({ username, roomCode }) => {
    console.log(`Player ${username} wants to join room: ${roomCode}`);

    socket.join(roomCode);
  });

  socket.on('leave_room', ({ username, roomCode }) => {
    console.log(`User ${username} left room: ${roomCode}`);
    socket.leave(roomCode);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
