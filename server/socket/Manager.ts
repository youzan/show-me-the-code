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
      socket.on('user.login', (data) => userName = data.userName);
      socket.on('room.create', async (data) => {
        const key = randomString.generate(4);
        try {
          const room = await models.Room.create({
            key,
            code: '',
            lang: 'javascript',
            last_time: Date.now()
          });
          socket.emit('create.success', room.dataValues);
        } catch (error) {
          socket.emit('create.fail', error.toString());
        }
      })
      socket.on('room.join', async ({ room: id, key }) => {
        try {
          const room = await models.Room.findOne({
            where: {
              id,
              key
            }
          });
        } catch (error) {
          socket.emit('room.fail', error.toString());
        }
      });
    });
  }
}
