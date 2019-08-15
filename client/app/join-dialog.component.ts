import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { ConnectionService } from './connection.service';

@Component({
  selector: 'app-join',
  template: `
    <p-dialog [visible]="visible$ | async" [modal]="true" [closable]="false" [draggable]="false">
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
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JoinDialogComponent {
  readonly roomIdReadOnly: boolean;
  @Input() visible$!: Observable<boolean>;
  readonly pending$ = new BehaviorSubject(false);
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

  async create() {
    try {
      this.pending$.next(true);
      await this.connectionService.create(this.username);
    } finally {
      this.pending$.next(false);
    }
  }

  async join() {
    try {
      this.pending$.next(true);
      await this.connectionService.join(this.roomId, this.username);
    } finally {
      this.pending$.next(false);
    }
  }
}
