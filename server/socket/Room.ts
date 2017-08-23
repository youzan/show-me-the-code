/// <reference types="socket.io" />
/// <reference types="monaco-editor" />

/// <reference path="../../model/socket.d.ts" />
/// <reference path="../../model/IDisposable.d.ts" />

import Manager from './Manager';

export default class Room implements IDisposable {
  clients: Map<Symbol, SocketIO.Socket> = new Map()
  id: string
  code: string = ''
  selections: Array<monaco.ISelection> = [{
    selectionStartLineNumber: 1,
    selectionStartColumn: 1,
    positionLineNumber: 1,
    positionColumn: 1
  }];
  language: string = 'javascript'
  manager: Manager
  version = 1

  constructor(id, manager: Manager) {
    this.id = id;
    this.manager = manager;
  }

  join(userName: string, socket: SocketIO.Socket) {
    const sym = Symbol(userName);
    this.clients.set(sym, socket);
    socket.join(this.id);
    socket.emit('room.success', {
      clients: Array.from(this.clients.keys()),
      code: this.code,
      language: this.language
    });

    socket.on('code.change', (codeChange: ISocketCodeChange) => {
      if (this.code !== codeChange.value) {
        this.code = codeChange.value;
        this.selections = codeChange.selections;
        codeChange.ident = this.version;
        this.version += 1;
        socket.broadcast.to(this.id).emit('code.change', codeChange);
      }
    });

    socket.on('selection.change', (selections: monaco.ISelection[]) => {
      this.selections = selections;
      socket.broadcast.to(this.id).emit('selection.change', selections);
    });

    socket.on('disconnect', () => {
      this.clients.delete(sym);
    });
  }

  dispose() {
    this.manager.rooms.delete(this.id);
    this.manager = null;
    this.clients = null;
  }
}
