import { Component, ViewEncapsulation } from '@angular/core';
import { EditorService } from './editor.service';

@Component({
  selector: 'app-header',
  template: `
    <p-overlayPanel #op>
      <app-config></app-config>
    </p-overlayPanel>

    <button
      type="button"
      pButton
      class="options ui-button-secondary"
      icon="pi pi-cog"
      (click)="op.toggle($event)"
    ></button>

    <div class="button-group">
      <button type="button" pButton icon="pi pi-caret-right" class="ui-button-success" (click)="execute()"></button>
      <button type="button" pButton icon="pi pi-times" class="ui-button-danger"></button>
    </div>

    <a class="github" href="https://github.com/youzan/show-me-the-code" target="_blank" rel="noopener noreferrer"></a>
  `,
  styles: [
    `
      :host {
        display: flex;
        align-items: center;
        background: #333;
        padding: 0 20px;
      }

      button {
        outline: none;
      }

      .button-group {
        margin-left: auto;

        button:first-child {
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
        }

        button:last-child {
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
        }
      }

      .github {
        width: 30px;
        height: 30px;
        background-image: url('/assets/GitHub-Mark-Light-120px-plus.png');
        background-size: 100%;
        background-position: center;
        background-repeat: no-repeat;
        margin-left: 20px;
      }
    `,
  ],
})
export class HeaderComponent {
  constructor(private readonly editorService: EditorService) {}

  execute() {}
}
