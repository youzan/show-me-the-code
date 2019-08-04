import { Component } from '@angular/core';
import { ConnectionService } from './connection.service';

@Component({
  selector: 'app-users',
  template: `
    <p-overlayPanel #op>
      <ul class="user-list">
        <li *ngFor="let user of users | keyvalue" [class]="user.value | userLi">{{ user.value.name }}</li>
      </ul>
    </p-overlayPanel>

    <button
      pButton
      icon="pi pi-users"
      (click)="op.toggle($event)"
      [label]="count"
      class="ui-button-success user-count"
    ></button>
  `,
  styles: [`
    .user-list {
      padding: 0;
      margin: 5px;
      list-style: none;
    }
  `]
})
export class UsersComponent {
  constructor(private readonly connectionService: ConnectionService) {}

  get count() {
    return this.connectionService.users.size || '_';
  }

  get users() {
    return this.connectionService.users;
  }
}
