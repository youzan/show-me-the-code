import io from 'socket.io-client';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MessageService } from 'primeng/components/common/messageservice';
import * as monaco from 'monaco-editor';

declare const process: any;

const url = process.env.NODE_ENV === 'production' ? 'ws://socket.icode.live' : `ws://${location.hostname}:8086`;

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
  private readonly socket = io(url);
  readonly roomId$ = new BehaviorSubject('');
  readonly connect$ = new BehaviorSubject(false);
  username = '';
  users = new Map<string, IUser>();
  userId = '';
  readonly init$ = new BehaviorSubject(false);

  constructor(private readonly messageService: MessageService) {
    this.socket
      .on('connect', () => this.connect$.next(true))
      .on('disconnect', () => {
        this.connect$.next(false);
        this.init$.next(false);
      })
      .on('reconnect', () => {
        const roomId = this.roomId$.getValue();
        if (roomId) {
          this.socket.emit('room.join', {
            id: roomId,
            username: this.username,
          });
        }
      })
      .on('room.created', ({ roomId, userId }: { roomId: string; userId: string }) => {
        this.roomId$.next(roomId);
        this.userId = userId;
        this.updateUrl();
        this.init$.next(true);
      })
      .on('room.joint', ({ roomId, users, userId }: { roomId: string; users: IUser[]; userId: string }) => {
        this.roomId$.next(roomId);
        this.userId = userId;
        this.updateUrl();
        this.users.clear();
        users.forEach(user => this.users.set(user.id, user));
        this.socket.emit('sync.full');
      })
      .on('room.fail', (msg: string) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Join fail',
          detail: `Join room fail, ${msg}`,
        });
      })
      .on('user.join', (user: IUser) => {
        this.users.set(user.id, user);
      })
      .on('user.leave', (userId: string) => {
        this.users.delete(userId);
      })
      .on('code.save.success', () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Save success',
          detail: 'Save success',
        });
      });
  }

  create(username: string) {
    this.username = username;
    this.socket.emit('room.create', {
      username,
    });
  }

  join(roomId: string, username: string) {
    this.username = username;
    this.socket.emit('room.join', {
      id: roomId,
      username,
    });
  }

  private updateUrl() {
    const url = new URL(location.href);
    url.searchParams.set('roomId', this.roomId$.getValue());
    history.replaceState(history.state, '', url.href);
  }

  userEdit(changes: monaco.editor.IModelContentChange[]) {
    this.socket.emit('user.edit', changes);
  }

  onReceiveEdit(cb: (e: IReceiveEdit) => void) {
    this.socket.on('user.edit', cb);
    return this;
  }

  cursorChange(pos: monaco.IPosition | null) {
    this.socket.emit('user.cursor', pos);
  }

  onReceiveUserCursor(cb: (e: IReceiveUserCursor) => void) {
    this.socket.on('user.cursor', cb);
    return this;
  }

  selectionChange(selections: monaco.IRange[]) {
    this.socket.emit('user.selection', selections);
  }

  onReceiveUserSelection(cb: (e: IReceiveUserSelection) => void) {
    this.socket.on('user.selection', cb);
    return this;
  }

  onReceiveSync(cb: (value: string) => void) {
    this.socket.on('sync.full', cb);
    return this;
  }

  responseSync(code: string) {
    this.socket.emit('sync.full.response', code);
  }

  onReceiveSyncRequest(cb: () => void) {
    this.socket.on('sync.full.request', cb);
    return this;
  }

  save(code: string) {
    this.socket.emit('code.save', code);
  }

  ngOnDestroy() {
    this.socket.close();
  }
}
