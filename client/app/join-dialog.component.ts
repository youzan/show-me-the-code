import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { ConnectionService } from './connection.service';

declare global {
  interface Window {
    notificationMessage?: string;
  }
}

@Component({
  selector: 'app-join',
  template: `
    <p-dialog [visible]="visible$ | async" [modal]="true" [closable]="false" [draggable]="false">
      <p-message *ngIf="hasMessage" class="message" severity="warn" [text]="message" style="display: block"></p-message>
      <div class="ui-float-label username">
        <input [(ngModel)]="username" id="username" type="text" size="30" pInputText autocomplete="off" />
        <label for="username">Name</label>
      </div>
      <div class="ui-float-label room-id">
        <input [(ngModel)]="roomId" id="room-id" type="text" size="30" pInputText [disabled]="roomIdReadOnly" />
        <label for="room-id">Room ID</label>
      </div>
      <p-footer>
        <button
          pButton
          type="button"
          label="Create"
          [disabled]="!username || (pending$ | async)"
          class="ui-button-secondary"
          (click)="create()"
        ></button>
        <button
          pButton
          type="button"
          label="Join"
          [disabled]="!username || (pending$ | async)"
          (click)="join()"
        ></button>
      </p-footer>
    </p-dialog>
  `,
  styles: [
    `
      .room-id,
      .username {
        margin: 20px;
      }

      :host ::ng-deep .ui-message {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JoinDialogComponent {
  readonly roomIdReadOnly: boolean;
  @Input() visible$!: Observable<boolean>;
  readonly pending$ = new BehaviorSubject(false);
  readonly hasMessage = !!window.notificationMessage;
  username = '';
  roomId: string;

  constructor(private readonly connectionService: ConnectionService) {
    const params = new URLSearchParams(location.search);
    const roomId = params.get('roomId');
    if (roomId) {
      this.roomId = roomId;
      this.roomIdReadOnly = true;
    } else {
      this.roomId = '';
      this.roomIdReadOnly = false;
    }
  }

  get message() {
    return window.notificationMessage;
  }

  create() {
    this.pending$.next(true);
    this.connectionService.create(this.username).finally(() => this.pending$.next(false));
  }

  join() {
    this.pending$.next(true);
    this.connectionService.join(this.roomId, this.username).finally(() => this.pending$.next(false));
  }
}
