import io from 'socket.io-client';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MessageService } from 'primeng/components/common/messageservice';

declare const process: any;

const url = process.env.NODE_ENV === 'production' ? 'ws://socket.icode.live' : 'ws://127.0.0.1:8086';

export interface IUser {
  name: string;
  id: string;
  color: number;
}

@Injectable()
export class ConnectionService implements OnDestroy {
  readonly socket = io(url);
  readonly roomId$ = new BehaviorSubject('');
  readonly connect$ = new BehaviorSubject(false);
  users = new Map<string, IUser>();

  constructor(private readonly messageService: MessageService) {
    this.socket.on('connect', () => this.connect$.next(true));
    this.socket.on('disconnect', () => this.connect$.next(false));
    this.socket.on('room.created', (roomId: string) => {
      this.roomId$.next(roomId);
      this.updateUrl();
    });
    this.socket.on('room.joint', ({ roomId, users }: { roomId: string; users: IUser[] }) => {
      this.roomId$.next(roomId);
      this.updateUrl();
      users.forEach(user => this.users.set(user.id, user));
    });
    this.socket.on('room.fail', (msg: string) => {
      this.messageService.add({
        severity: 'error',
        summary: 'Join fail',
        detail: `Join room fail, ${msg}`,
      });
    });
    this.socket.on('user.join', (user: IUser) => {
      this.users.set(user.id, user);
    });
    this.socket.on('user.leave', (userId: string) => {
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

  ngOnDestroy() {
    this.socket.close();
  }
}
