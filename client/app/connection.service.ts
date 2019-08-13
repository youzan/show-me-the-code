import { Socket, Channel } from 'phoenix';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MessageService } from 'primeng/components/common/messageservice';
import * as monaco from 'monaco-editor';
import Events from 'eventemitter3';
import { IUser } from '../models';
import { post } from './ajax';
import * as Users from '../collections/Users';
import { linkEvents, unlinkEvents, update } from './utils';

declare const process: any;

const url =
  process.env.NODE_ENV === 'production' ? 'ws://socket.icode.live' : `ws://${location.hostname}:4000/websocket`;

export interface IReceiveEdit {
  userId: string;
  changes: monaco.editor.IModelContentChange[];
}

export interface IReceiveUserCursor {
  position: monaco.IPosition | null;
  userId: string;
}

export interface IReceiveUserSelection {
  ranges: monaco.IRange[];
  userId: string;
}

export interface ISocketEvents {
  'user.join': IUser;
  'user.leave': { user: string };
}

const EVENTS = ['user.join', 'user.leave'];

@Injectable()
export class ConnectionService extends Events {
  private socket: Socket | null = null;
  private roomId = '';
  private links: Record<string, number> | null = null;
  readonly connected$ = new BehaviorSubject(false);
  readonly channel$ = new BehaviorSubject<Channel | null>(null);
  readonly users$ = new BehaviorSubject(Users.make());
  readonly synchronized$ = new BehaviorSubject(false);
  readonly autoSave$ = new BehaviorSubject(false);
  username = '';
  userId = '';

  on!: <K extends keyof ISocketEvents>(
    this: this,
    event: K,
    cb: (message: ISocketEvents[K], context?: any) => void,
  ) => this;
  off!: <K extends keyof ISocketEvents>(
    this: this,
    event: K,
    cb: (message: ISocketEvents[K], context?: any) => void,
  ) => this;

  constructor(private readonly messageService: MessageService) {
    super();
    this.on('user.join', user => {
      if (user.id !== this.userId) {
        update(users => Users.add(user, users), this.users$);
      }
    }).on('user.leave', ({ user }) => {
      update(users => Users.remove(user, users), this.users$);
    });
    // this.socket
    //   .on('connect', () => this.connect$.next(true))
    //   .on('disconnect', () => {
    //     this.connect$.next(false);
    //     this.init$.next(false);
    //   })
    //   .on('reconnect', () => {
    //     const roomId = this.roomId$.getValue();
    //     if (roomId) {
    //       this.socket.emit('room.join', {
    //         id: roomId,
    //         username: this.username,
    //       });
    //     }
    //   })
    //   .on('room.created', ({ roomId, userId, users }: { roomId: string; users: IUser[]; userId: string }) => {
    //     this.roomId$.next(roomId);
    //     this.userId = userId;
    //     this.updateUrl();
    //     users.forEach(user => this.users.set(user.id, user));
    //     this.autoSave$.next(true);
    //     this.init$.next(true);
    //   })
    //   .on('room.joint', ({ roomId, users, userId }: { roomId: string; users: IUser[]; userId: string }) => {
    //     this.roomId$.next(roomId);
    //     this.userId = userId;
    //     this.updateUrl();
    //     this.users.clear();
    //     users.forEach(user => this.users.set(user.id, user));
    //     this.socket.emit('sync.full');
    //     const first = this.firstUser;
    //     if (first && first.id === this.userId) {
    //       this.autoSave$.next(true);
    //     }
    //   })
    //   .on('room.fail', (msg: string) => {
    //     this.messageService.add({
    //       severity: 'error',
    //       summary: 'Join fail',
    //       detail: `Join room fail, ${msg}`,
    //     });
    //   })
    //   .on('user.join', (user: IUser) => {
    //     this.users.set(user.id, user);
    //   })
    //   .on('user.leave', (userId: string) => {
    //     this.users.delete(userId);
    //     const first = this.firstUser;
    //     if (first && first.id === this.userId) {
    //       this.autoSave$.next(true);
    //     }
    //   })
    //   .on('code.save.success', () => {
    //     this.messageService.add({
    //       severity: 'success',
    //       summary: 'Save success',
    //       detail: 'Save success',
    //     });
    //   });
  }

  getFirstUser(): IUser | undefined {
    return Users.first(this.users$.getValue());
  }

  async create(username: string) {
    this.username = username;
    const roomId = await post<string>('api/create-one');
    await this.join(roomId, username);
  }

  getSocket(username: string): Socket {
    if (this.socket === null) {
      this.socket = new Socket(url, {
        heartbeatIntervalMs: 30000,
        params: {
          username,
        },
      });
      this.socket.onOpen(() => this.connected$.next(true));
      this.socket.onClose(() => {
        this.connected$.next(false);
        this.synchronized$.next(false);
      });
      this.socket.connect();
    }
    return this.socket;
  }

  join(roomId: string, username: string) {
    this.username = username;
    if (this.channel$.getValue() !== null) {
      return;
    }
    const socket = this.getSocket(username);
    const channel = socket.channel(`room:${roomId}`);
    const links = linkEvents(EVENTS, channel, this);
    this.links = links;
    return new Promise((resolve, reject) => {
      channel
        .join()
        .receive('ok', ({ users, userId }: { users: IUser[]; userId: string }) => {
          this.roomId = roomId;
          this.userId = userId;
          this.users$.next(Users.fromArray(users));
          this.updateUrl();
          this.channel$.next(channel);
          resolve();
        })
        .receive('error', ({ reason }) => {
          let msg = 'Unknown error';
          let leave = false;
          switch (reason) {
            case 'join crashed':
              leave = true;
              break;
            case 'invalid room id':
            case 'room not exist':
            case 'room is full':
              msg = `Join room fail, ${reason}`;
              leave = true;
              break;
            default:
              break;
          }
          this.messageService.add({
            severity: 'error',
            summary: 'Join fail',
            detail: msg,
          });
          if (leave) {
            channel.leave();
            this.channel$.next(null);
            unlinkEvents(links, channel);
          }
          reject(new Error(msg));
        });
    });
  }

  private updateUrl() {
    const url = new URL(location.href);
    url.searchParams.set('roomId', this.roomId);
    history.replaceState(history.state, '', url.href);
  }

  userEdit(changes: monaco.editor.IModelContentChange[]) {
    // this.socket.emit('user.edit', changes);
  }

  onReceiveEdit(cb: (e: IReceiveEdit) => void) {
    // this.socket.on('user.edit', cb);
    return this;
  }

  cursorChange(pos: monaco.IPosition | null) {
    // this.socket.emit('user.cursor', pos);
  }

  onReceiveUserCursor(cb: (e: IReceiveUserCursor) => void) {
    // this.socket.on('user.cursor', cb);
    return this;
  }

  selectionChange(selections: monaco.IRange[]) {
    // this.socket.emit('user.selection', selections);
  }

  onReceiveUserSelection(cb: (e: IReceiveUserSelection) => void) {
    // this.socket.on('user.selection', cb);
    return this;
  }

  onReceiveSync(cb: (value: string) => void) {
    // this.socket.on('sync.full', cb);
    return this;
  }

  responseSync(code: string) {
    // this.socket.emit('sync.full.response', code);
  }

  onReceiveSyncRequest(cb: () => void) {
    // this.socket.on('sync.full.request', cb);
    return this;
  }

  save(code: string, silent = false) {
    // this.socket.emit('code.save-v2', {
    //   code,
    //   silent,
    // });
  }
}
