import { Component } from '@angular/core';
import { ConnectionService } from './connection.service';

@Component({
  selector: 'app-users',
  template: `
    <p-overlayPanel #op></p-overlayPanel>

    <button
      pButton
      icon="pi pi-users"
      (click)="op.toggle($event)"
      [label]="count"
      class="ui-button-success user-count"
    ></button>
  `,
})
export class UsersComponent {
  constructor(private readonly connectionService: ConnectionService) {}

  get count() {
    return this.connectionService.users.length;
  }
}
