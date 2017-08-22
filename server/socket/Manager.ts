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
      socket.emit('connect')
      let userName = '';
      socket.on('room.join', async (data) => {
        userName = data.name;
        try {
          const room = await models.Room.findOne({
            where: {
              id: data.id
            }
          });
          if (!room) {
            socket.emit('room.fail', 'room not exist');
          } else if (room.dataValues.key.trim() === data.key) {
            socket.emit('room.success');
          } else {
            socket.emit('room.fail', 'wrong key');
          }
        } catch (error) {
          socket.emit('room.fail', error.toString());
        }
      });
      socket.on('disconnect', function() {
        console.log('Client disconnected.');
      });
    });
  }
}
