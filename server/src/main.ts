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
  color: number;
}

class RoomUsers {
  users: IUser[] = [];
  colors = [1, 2, 3, 4, 5];

  addUser(user: IUser) {
    user.color = this.colors.shift() as number;
    this.users.push(user);
  }

  removeUser(user: IUser) {
    const index = this.users.findIndex(it => it.id === user.id);
    if (index !== -1) {
      this.users.splice(index, 1);
      this.colors.push(user.color);
    }
  }
}

const rooms = new Map<string, RoomUsers>();

function addUser(user: IUser, roomId: string) {
  let room = rooms.get(roomId);
  if (!room) {
    room = new RoomUsers();
    rooms.set(roomId, room);
  }
  if (room.users.length >= 5) {
    return null;
  }
  room.addUser(user);
  return room;
}

function removeUser(user: IUser, roomId: string) {
  let room = rooms.get(roomId);
  if (!room) {
    return;
  }
  room.removeUser(user);
  if (room.users.length === 0) {
    rooms.delete(roomId);
  }
}

io.on('connection', socket => {
  const user: IUser = {
    id: uuid(),
    name: '',
    color: 0,
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
    socket.join(room.id);
    const roomUsers = addUser(user, roomId);
    io.to(room.id).emit('user.join', user);
    if (!roomUsers) {
      socket.emit('room.fail', 'room is full');
      return;
    }
    socket.emit('room.joint', {
      roomId,
      users: roomUsers.users,
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
