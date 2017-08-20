/// <reference types="socket.io" />

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
      socket.on('room.join', (data) => {

      });
    });
  }
}
