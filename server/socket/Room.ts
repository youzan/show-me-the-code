/// <reference types="socket.io" />
/// <reference types="monaco-editor" />

/// <reference path="../../model/socket.d.ts" />
/// <reference path="../../model/IDisposable.d.ts" />

import * as createDebug from 'debug';
import * as models from '../models';
import Manager from './Manager';
import Client from './Client';

const debug = createDebug('ROOM');

export default class Room implements IDisposable {
  clients: Map<Symbol, Client> = new Map()
  creatorSocket: SocketIO.Socket = null
  id: string
  content: string = ''
  selections: Array<monaco.ISelection> = [{
    selectionStartLineNumber: 1,
    selectionStartColumn: 1,
    positionLineNumber: 1,
    positionColumn: 1
  }];
  _language: string = 'javascript'
  manager: Manager
  version = 1
  io: SocketIO.Server

  get language() {
    return this._language;
  }

  set language(value) {
    this._language = value.trim();
  }

  constructor(io: SocketIO.Server, id: string, manager: Manager, content: string, language: string, creatorKey: string) {
    this.io = io;
    this.id = id;
    this.manager = manager;
    this.content = content;
    this.language = language;
  }

  async save() {
    await models.Room.update({
      content: this.content,
      language: this.language
    }, {
      where: {
        id: this.id
      }
    });
  }

  onStatusChange = () => {
    if (this.creatorSocket) {
      this.creatorSocket.emit('room.clients', Array.from(this.clients.values()).map(it => ({ name: it.name, status: it.status })));
    }
  }

  join(userName: string, socket: SocketIO.Socket, isCreator: boolean) {
    debug(`${userName} join room ${this.id}`);

    const sym = Symbol(userName);
    const client = new Client(userName, socket, this.onStatusChange);
    this.clients.set(sym, client);
    socket.join(this.id);

    if (isCreator) {
      this.creatorSocket = socket;
    }

    socket.broadcast.to(this.id).emit('room.clients', Array.from(this.clients.values()).map(it => ({ name: it.name, status: '' })));
    this.onStatusChange();

    socket.emit('room.success', {
      clients: Array.from(this.clients.values()).map(it => ({ name: it.name, status: isCreator ? it.status : '' })),
      content: this.content,
      language: this.language
    });

    socket.on('code.change', (codeChange: ISocketCodeChange) => {
      if (this.content !== codeChange.value) {
        this.content = codeChange.value;
        this.selections = codeChange.selections;
        codeChange.ident = this.version;
        this.version += 1;
        socket.broadcast.to(this.id).emit('code.change', codeChange);
      }
    });

    socket.on('selection', (selections: monaco.ISelection[]) => {
      this.selections = selections;
      socket.broadcast.to(this.id).emit('selection', selections);
    });

    socket.on('save', () => {
      this.save();
    });

    socket.on('blur', () => {
      client.status = 'blur';
    });

    socket.on('focus', () => {
      client.status = 'focus';
    });

    socket.on('disconnect', () => {
      if (isCreator) {
        this.creatorSocket = null;
      }
      this.clients.get(sym).dispose();
      this.clients.delete(sym);
      if (this.clients.size === 0) {
        this.dispose();
      } else {
        this.io.to(this.id).emit('room.clients', Array.from(this.clients.values()).map(it => ({ name: it.name, status: '' })));
      }
    });
  }

  dispose() {
    this.save();
    this.io = null;
    this.manager.rooms.delete(this.id);
    this.manager = null;
    this.clients = null;
    this.creatorSocket = null;
  }
}
