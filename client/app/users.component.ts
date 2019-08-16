import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ConnectionService } from './connection.service';

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
      [label]="(users$ | async).length || '_'"
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

  get users$() {
    return this.connectionService.userList$;
  }
}
