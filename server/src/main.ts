import http from 'http';
import socket from 'socket.io';
import { createConnection, getRepository } from 'typeorm';
import uuid from 'uuid/v4';
import { Room } from './room';

const server = http.createServer();

const io = socket(server);

createConnection({
  type: 'postgres',
  host: '127.0.0.1',
  database: 'intellild',
  port: 5432,
  username: 'intellild',
  entities: [Room],
  synchronize: true,
});

io.on('connection', socket => {
  const userId = uuid();
  let username = '';
  let roomId = '';

  socket.on('room.join', async data => {
    if (roomId) {
      return;
    }
    username = data.username;

    const room = await getRepository(Room).findOne({
      id: data.id,
    });
    if (!room) {
      socket.emit('room.fail', 'roon not exist');
      return;
    }
    roomId = room.id;
    io.to(room.id).emit('user.join', {
      userId,
      username,
    });
    socket.join(room.id);
    socket.emit('room.joint', roomId);
  });

  socket.on('room.create', async data => {
    username = data.username;
    const repository = getRepository(Room);
    const room = await repository.save({});
    roomId = room.id;
    socket.emit('room.created', room.id);
  });

  socket.on('disconnect', () => {
    if (roomId) {
      socket.leave(roomId);
      io.to(roomId).emit('user.leave', userId);
    }
  });
});

server.listen(8086);
console.log('server listening on port 8086');
