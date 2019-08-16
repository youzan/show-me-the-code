import { Socket, Channel, Presence } from 'phoenix';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MessageService } from 'primeng/components/common/messageservice';
import EventEmitter from 'eventemitter3';
import { IUser } from '../models';
import { post } from './ajax';
// import * as Users from '../collections/Users';
import { linkEvents, unlinkEvents } from './utils';

declare const process: any;

const url =
  process.env.NODE_ENV === 'production' ? 'ws://socket.icode.live' : `ws://${location.hostname}:4000/websocket`;

export interface ISocketEvents {
  'user.join': IUser;
  'user.leave': { user: string };
  'sync.full': { content: string; language: string; expires: string | null };
  'sync.full.request': { from: string };
  'sync.full.reply': { to: string; content: string; language: string; expires: Date | null };
  'user.edit': { from: string; event: string };
  'user.selection': { from: string; event: string };
}

const EVENTS = ['user.join', 'user.leave', 'sync.full', 'sync.full.request', 'user.edit', 'user.selection'];

function pickMeta(_: string, { metas }: { metas: IUser[] }) {
  return metas[0];
}

@Injectable()
export class ConnectionService extends EventEmitter<keyof ISocketEvents> {
  private socket: Socket | null = null;
  private roomId = '';
  private links: Record<string, number> | null = null;
  readonly connected$ = new BehaviorSubject(false);
  readonly channel$ = new BehaviorSubject<Channel | null>(null);
  readonly userList$ = new BehaviorSubject<IUser[]>([]);
  readonly synchronized$ = new BehaviorSubject(false);
  readonly autoSave$ = new BehaviorSubject(false);
  readonly userMap = new Map<string, IUser>();
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
    this.on('sync.full', () => this.synchronized$.next(true));
    //   .on('code.save.success', () => {
    //     this.messageService.add({
    //       severity: 'success',
    //       summary: 'Save success',
    //       detail: 'Save success',
    //     });
    //   });
  }

  create(username: string): Promise<void> {
    this.username = username;
    return post<string>('/api/create-one').then(roomId => this.join(roomId, username));
  }

  push<K extends keyof ISocketEvents>(event: K, payload: ISocketEvents[K]) {
    const channel = this.channel$.getValue();
    if (channel) {
      channel.push(event, payload);
    }
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

  join(roomId: string, username: string): Promise<void> {
    this.username = username;
    if (this.channel$.getValue() !== null) {
      return Promise.resolve();
    }
    const socket = this.getSocket(username);
    const channel = socket.channel(`room:${roomId}`);
    const links = linkEvents(EVENTS, channel, this as EventEmitter<string>);
    this.links = links;
    const presence = new Presence(channel);
    presence.onSync(() => {
      const userList = presence.list<IUser>(pickMeta);
      this.userList$.next(userList);
      this.userMap.clear();
      for (let i = 0; i < userList.length; i += 1) {
        const user = userList[i];
        this.userMap.set(user.id, user);
      }
    });
    return new Promise<void>((resolve, reject) => {
      channel
        .join()
        .receive('ok', ({ userId }: { userId: string }) => {
          this.roomId = roomId;
          this.userId = userId;
          this.updateUrl();
          this.channel$.next(channel);
          resolve();
        })
        .receive('error', msg => this.handleJoinError(msg, links, channel, reject));
    });
  }

  getUserCount() {
    return this.userList$.getValue().length;
  }

  private updateUrl() {
    const url = new URL(location.href);
    url.searchParams.set('roomId', this.roomId);
    history.replaceState(history.state, '', url.href);
  }

  private handleJoinError(
    { reason }: { reason: string },
    links: Record<string, number>,
    channel: Channel,
    reject: (e: Error) => void,
  ) {
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
      this.links = null;
    }
    reject(new Error(msg));
  }
}
