import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConnectionService } from './connection.service';
import * as Users from '../collections/Users';
import { IUser } from '../models';

@Component({
  selector: 'app-users',
  template: `
    <p-overlayPanel #op>
      <ul class="user-list">
        <li *ngFor="let user of users$ | async" [class]="user | userLi">{{ user.name }}</li>
      </ul>
    </p-overlayPanel>

    <button
      pButton
      icon="pi pi-users"
      (click)="op.toggle($event)"
      [label]="count$ | async"
      class="ui-button-success user-count"
    ></button>
  `,
  styles: [
    `
      .user-list {
        padding: 0;
        margin: 5px;
        list-style: none;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersComponent {
  count$: Observable<number | string>;
  users$: Observable<IUser[]>;

  constructor(readonly connectionService: ConnectionService) {
    this.count$ = connectionService.users$.pipe(map(map => Users.size(map) || '_'));
    this.users$ = connectionService.users$.pipe(map(Users.valuesArray));
  }
}
