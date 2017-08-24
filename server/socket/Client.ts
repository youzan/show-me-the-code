/// <reference types="socket.io" />

export default class Client {
  name: string
  socket: SocketIO.Socket

  constructor(name: string, socket: SocketIO.Socket) {
    this.name = name;
    this.socket = socket;
  }
}