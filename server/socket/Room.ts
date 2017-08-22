/// <reference types="socket.io" />

export default class Room {
  clients: Map<Symbol, SocketIO.Socket> = new Map()
  id: string
  code: string = ''

  constructor(id) {
    this.id = id;
  }

  join(userName: string, socket: SocketIO.Socket) {
    const sym = Symbol(userName);
    this.clients.set(sym, socket);
    socket.join(this.id);

    socket.on('code.change', (data) => {
      this.code = data;
      socket.broadcast.to(this.id).emit('code.change', data);
    });
  }
}