/// <reference types="socket.io" />
/// <reference path="../../model/IDisposable.d.ts" />

export default class Client implements IDisposable {
  name: string
  socket: SocketIO.Socket

  constructor(name: string, socket: SocketIO.Socket) {
    this.name = name;
    this.socket = socket;
  }

  dispose() {
    this.socket.leaveAll();
    this.socket.removeAllListeners();
    this.socket = null;
  }
}