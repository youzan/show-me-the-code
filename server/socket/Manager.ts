/// <reference types="socket.io" />

import * as randomString from 'randomstring';

import * as models from '../models';

export default class SocketManager {
  io: SocketIO.Server

  constructor(io: SocketIO.Server) {
    this.io = io;
    this.initSocket();
  }

  initSocket() {
    this.io.on('connection', socket => {
      let userName = '';
      socket.on('room.join', async (data) => {
        userName = data.name;
        try {
          const room = await models.Room.findOne({
            where: {
              id: data.room,
              key: data.key
            }
          });
          if (room) {
            socket.emit('room.success');
          }
        } catch (error) {
          socket.emit('room.fail', error.toString());
        }
      });
    });
  }
}
