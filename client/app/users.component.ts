import { Component, ChangeDetectionStrategy } from '@angular/core';
import { map } from 'rxjs/operators';
import { ConnectionService } from './connection.service';
import { size, valuesArray } from '../collections/Users';

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
  constructor(private readonly connectionService: ConnectionService) {}

  get count$() {
    return this.connectionService.users$.pipe(map(map => size(map) || '_'));
  }

  get users$() {
    return this.connectionService.users$.pipe(map(valuesArray));
  }
}
