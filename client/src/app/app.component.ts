import { Component, HostListener } from '@angular/core';
import { ConnectionService } from './connection.service';

@Component({
  selector: 'app-root',
  template: `
    <app-header></app-header>
    <div monaco-editor-container></div>
    <p-toast></p-toast>
    <app-join></app-join>
    <p-blockUI class="global-block" [blocked]="!(connection$ | async)">
      <p-progressSpinner></p-progressSpinner>
    </p-blockUI>
  `,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(private readonly connectionService: ConnectionService) {}

  get connection$() {
    return this.connectionService.connect$;
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if (e.metaKey && e.key === 's') {
      e.preventDefault();
    }
  }
}
