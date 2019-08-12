import { Socket, Channel } from 'phoenix';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MessageService } from 'primeng/components/common/messageservice';
import * as monaco from 'monaco-editor';
import { post } from './ajax';

declare const process: any;

const url =
  process.env.NODE_ENV === 'production' ? 'ws://socket.icode.live' : `ws://${location.hostname}:4000/websocket`;

export interface IUser {
  name: string;
  id: string;
  color: number;
}

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

@Injectable()
export class ConnectionService implements OnDestroy {
  private readonly socket = new Socket(url, {
    heartbeatIntervalMs: 30000,
  });
  private roomId = '';
  readonly connected$ = new BehaviorSubject(false);
  readonly channel$ = new BehaviorSubject<Channel | null>(null);
  username = '';
  users = new Map<string, IUser>();
  userId = '';
  readonly synchronized$ = new BehaviorSubject(false);
  readonly autoSave$ = new BehaviorSubject(false);

  constructor(private readonly messageService: MessageService) {
    this.socket.onOpen(() => this.connected$.next(true));
    this.socket.onClose(() => {
      this.connected$.next(false);
      this.synchronized$.next(false);
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

  get firstUser(): IUser | undefined {
    return this.users.values().next().value;
  }

  async create(username: string) {
    this.username = username;
    const roomId = await post<string>('api/create-one');
    this.join(roomId, username);
  }

  join(roomId: string, username: string) {
    this.username = username;
    this.socket.connect({
      username,
    });
    const channel = this.socket.channel(`room:${roomId}`, {
      username,
    });
    channel
      .join()
      .receive('ok', msg => {
        this.roomId = roomId;
        this.updateUrl();
        this.channel$.next(channel);
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
        }
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

  ngOnDestroy() {
    // this.socket.close();
  }
}
