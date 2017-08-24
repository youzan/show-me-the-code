/// <reference types="socket.io" />

import * as models from '../models';
import Room from './Room';

export default class SocketManager {
  io: SocketIO.Server
  rooms: Map<string, Room> = new Map()

  constructor(io: SocketIO.Server) {
    this.io = io;
    this.initSocket();
  }

  initSocket() {
    this.io.on('connection', socket => {
      socket.emit('connect')
      let userName = '';
      socket.on('room.join', async (data: ISocketRoomJoin) => {
        userName = data.userName;
        try {
          const room = await models.Room.findOne({
            where: {
              id: data.id
            }
          });
          if (!room) {
            socket.emit('room.fail', 'room not exist');
            return;
          } else if (room.dataValues.key.trim() === data.key) {
            if (!this.rooms.has(data.id)) {
              this.rooms.set(data.id, new Room(data.id, this, room.dataValues.code, room.dataValues.lang));
            }
            this.rooms.get(data.id).join(userName, socket);
          } else {
            socket.emit('room.fail', 'wrong key');
          }
        } catch (error) {
          socket.emit('room.fail', error.toString());
        }
      });
    });
  }
}
