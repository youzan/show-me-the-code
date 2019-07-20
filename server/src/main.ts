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

function verifyUuid(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

interface IUser {
  name: string;
  readonly id: string;
}

const rooms = new Map<string, IUser[]>();

function addUser(user: IUser, room: string) {
  let users = rooms.get(room);
  if (!users) {
    users = [];
    rooms.set(room, users);
  }
  users.push(user);
  return users;
}

function removeUser(user: IUser, room: string) {
  let users = rooms.get(room);
  if (!users) {
    return;
  }
  const index = users.findIndex(it => it.id === user.id);
  if (index !== -1) {
    users.splice(index, 1);
  }
  if (users.length === 0) {
    rooms.delete(room);
  }
}

io.on('connection', socket => {
  const user: IUser = {
    id: uuid(),
    name: '',
  };
  let roomId = '';

  socket.on('room.join', async data => {
    if (!verifyUuid(data.id)) {
      socket.emit('room.fail', 'invalid room id');
      return;
    }
    if (roomId) {
      return;
    }
    user.name = data.username;

    const room = await getRepository(Room).findOne({
      id: data.id,
    });
    if (!room) {
      socket.emit('room.fail', 'room not exist');
      return;
    }
    roomId = room.id;
    io.to(room.id).emit('user.join', user);
    socket.join(room.id);
    const users = addUser(user, roomId);
    socket.emit('room.joint', {
      roomId,
      users,
    });
  });

  socket.on('room.create', async data => {
    user.name = data.username;
    const repository = getRepository(Room);
    const room = await repository.save({});
    roomId = room.id;
    socket.emit('room.created', room.id);
  });

  socket.on('disconnect', () => {
    if (roomId) {
      socket.leave(roomId);
      removeUser(user, roomId);
      io.to(roomId).emit('user.leave', user.id);
    }
  });
});

server.listen(8086);
console.log('server listening on port 8086');
