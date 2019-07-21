import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
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
          [disabled]="!username"
          class="ui-button-secondary"
          (click)="create()"
        ></button>
        <button pButton type="button" label="Join" [disabled]="!username" (click)="join()"></button>
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
  username = '';
  roomId: string;
  roomIdReadOnly: boolean;
  visible$: Observable<boolean>;

  constructor(private readonly connectionService: ConnectionService) {
    const params = new URLSearchParams(location.search);
    const roomId = params.get('roomId');
    const { connect$, roomId$ } = connectionService;
    this.visible$ = combineLatest(connect$, roomId$).pipe(
      map(([connect, roomId]) => connect && !roomId),
      distinctUntilChanged(),
    );
    if (roomId) {
      this.roomId = roomId;
      this.roomIdReadOnly = true;
    } else {
      this.roomId = '';
      this.roomIdReadOnly = false;
    }
  }

  create() {
    this.connectionService.create(this.username);
  }

  join() {
    this.connectionService.join(this.roomId, this.username);
  }
}
