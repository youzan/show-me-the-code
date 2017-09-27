/// <reference types="socket.io" />
/// <reference path="../../model/IDisposable.d.ts" />

type Status = 'blur' | 'focus' | '';


export default class Client implements IDisposable {
  name: string
  socket: SocketIO.Socket
  private _status: Status = ''
  onStatusChange: Function

  get status() {
    return this._status;
  }

  set status(value) {
    this._status = value;
    this.onStatusChange();
  }

  constructor(name: string, socket: SocketIO.Socket, onStatusChange: Function = () => {}) {
    this.name = name;
    this.socket = socket;
    this.onStatusChange = onStatusChange;
  }

  dispose() {
    this.socket.leaveAll();
    this.socket.removeAllListeners();
    this.socket = null;
  }
}