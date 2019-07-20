import io from 'socket.io-client';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

declare const process: any;

const url = process.env.NODE_ENV === 'production' ? 'ws://socket.icode.live' : 'ws://127.0.0.1:8086';

@Injectable()
export class ConnectionService implements OnDestroy {
  readonly socket = io(url);
  readonly roomId$ = new BehaviorSubject('');

  constructor() {
    this.socket.on('room.created', (roomId: string) => {
      this.roomId$.next(roomId);
      this.updateUrl();
    });
    this.socket.on('room.joint', (roomId: string) => {
      this.roomId$.next(roomId);
      this.updateUrl();
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
