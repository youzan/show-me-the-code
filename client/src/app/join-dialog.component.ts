import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { ConnectionService } from './connection.service';

@Component({
  selector: 'app-join',
  template: `
    <p-dialog [visible]="visible$ | async" [modal]="true" [closable]="false" [draggable]="false">
      <div class="ui-float-label username">
        <input [(ngModel)]="username" id="username" type="text" size="30" pInputText />
        <label for="username">Username</label>
      </div>
      <div class="ui-float-label room-id">
        <input [(ngModel)]="roomId" id="room-id" type="text" size="30" pInputText [disabled]="roomIdReadOnly" />
        <label for="room-id">Room ID</label>
      </div>
      <p-footer>
        <button pButton type="button" label="Create" class="ui-button-secondary" (click)="create()"></button>
        <button pButton type="button" label="Join" (click)="join()"></button>
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
    this.visible$ = this.connectionService.roomId$.pipe(
      map(it => !it),
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
    // this.visible = false;
  }
}
