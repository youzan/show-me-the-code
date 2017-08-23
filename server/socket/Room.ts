/// <reference types="socket.io" />
/// <reference types="monaco-editor" />

/// <reference path="../../model/socket.d.ts" />

export default class Room {
  clients: Map<Symbol, SocketIO.Socket> = new Map()
  id: string
  code: string = ''
  selections: Array<monaco.ISelection> = [{
    selectionStartLineNumber: 1,
    selectionStartColumn: 1,
    positionLineNumber: 1,
    positionColumn: 1
  }];

  version = 1

  constructor(id) {
    this.id = id;
  }

  join(userName: string, socket: SocketIO.Socket) {
    const sym = Symbol(userName);
    this.clients.set(sym, socket);
    socket.join(this.id);

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
  }
}
