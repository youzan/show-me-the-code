import { Component, HostListener } from '@angular/core';
import { ConnectionService } from './connection.service';

@Component({
  selector: 'app-root',
  template: `
    <app-header></app-header>
    <div monaco-editor-container></div>
  `,
  styles: [
    `
      :host {
        overflow: hidden;
        display: grid;
        grid-template:
          'header header' 60px
          'editor output' 1fr
          'editor users' minmax(min-content, max-content);
        grid-template-columns: auto 38.2%;
      }

      app-header {
        grid-area: header;
        box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.3);
      }

      [monaco-editor-container] {
        grid-area: editor;
      }
    `,
  ],
})
export class AppComponent {
  constructor(private readonly connectionService: ConnectionService) {}

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if (e.metaKey && e.key === 's') {
      e.preventDefault();
    }
  }
}
