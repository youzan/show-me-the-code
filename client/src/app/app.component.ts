import { Component, HostListener } from '@angular/core';
import { ConnectionService } from './connection.service';
import { EditorService } from './editor.service';

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
  constructor(private readonly connectionService: ConnectionService, private readonly editorService: EditorService) {}

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
