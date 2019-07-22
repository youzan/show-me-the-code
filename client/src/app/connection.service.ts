import io from 'socket.io-client';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MessageService } from 'primeng/components/common/messageservice';
import * as monaco from 'monaco-editor';

declare const process: any;

const url = process.env.NODE_ENV === 'production' ? 'ws://socket.icode.live' : 'ws://127.0.0.1:8086';

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
  position: monaco.IPosition;
  userId: string;
}

@Injectable()
export class ConnectionService implements OnDestroy {
  private readonly socket = io(url);
  readonly roomId$ = new BehaviorSubject('');
  readonly connect$ = new BehaviorSubject(false);
  users = new Map<string, IUser>();
  userId = '';

  constructor(private readonly messageService: MessageService) {
    this.socket
      .on('connect', () => this.connect$.next(true))
      .on('disconnect', () => this.connect$.next(false))
      .on('room.created', ({ roomId, userId }: { roomId: string; userId: string }) => {
        this.roomId$.next(roomId);
        this.userId = userId;
        this.updateUrl();
      })
      .on('room.joint', ({ roomId, users, userId }: { roomId: string; users: IUser[]; userId: string }) => {
        this.roomId$.next(roomId);
        this.userId = userId;
        this.updateUrl();
        users.forEach(user => this.users.set(user.id, user));
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
      });
  }

  create(username: string) {
    this.socket.emit('room.create', {
      username,
    });
  }

  join(roomId: string, username: string) {
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

  cursorChange(pos: monaco.IPosition) {
    this.socket.emit('user.cursor', pos);
  }

  onReceiveUserCursor(cb: (e: IReceiveUserCursor) => void) {
    this.socket.on('user.cursor', cb);
    return this;
  }

  ngOnDestroy() {
    this.socket.close();
  }
}
