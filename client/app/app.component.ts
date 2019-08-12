import { Component, HostListener } from '@angular/core';
import { ConnectionService } from './connection.service';
import { CodeService } from './code.service';

declare const process: any;

@Component({
  selector: 'app-root',
  template: `
    <app-header></app-header>
    <div monaco-editor-container></div>
    <app-output></app-output>
    <p-toast></p-toast>
    <app-join></app-join>
    <p-blockUI [blocked]="!(connection$ | async)">
      <p-progressSpinner class="global-spinner"></p-progressSpinner>
    </p-blockUI>
  `,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(private readonly connectionService: ConnectionService, private readonly codeService: CodeService) {}

  get connection$() {
    return this.connectionService.connected$;
  }

  @HostListener('window:beforeunload', ['$event'])
  autoSave(e: BeforeUnloadEvent) {
    if (process.env.NODE_ENV === 'development') {
      return;
    }
    if (this.connectionService.users.size === 1) {
      this.codeService.save();
    }
    e.returnValue = 'Sure ?';
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if (e.metaKey && e.key === 's') {
      e.preventDefault();
      this.codeService.save();
    }
  }
}
