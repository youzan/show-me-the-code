import { Component } from '@angular/core';
import { LANGUAGE_OPTIONS, FONT_SIZE_OPTIONS } from './constants';
import { EditorService } from './editor.service';

@Component({
  selector: 'app-config',
  template: `
    <label>Language: </label>
    <p-dropdown [options]="languageOptions" [(ngModel)]="language" [filter]="true"></p-dropdown>
    <label>Font Size: </label>
    <p-dropdown [options]="fontSizeOptions" [(ngModel)]="fontSize"></p-dropdown>
  `,
  styles: [
    `
      :host {
        display: grid;
        grid-template:
          'label1 language' 40px
          'label2 fontSize' 40px;
        grid-template-columns: auto auto;
        align-items: center;
      }

      label {
        padding: 0 10px;
      }
    `,
  ],
})
export class ConfigCompoennt {
  readonly languageOptions = LANGUAGE_OPTIONS;
  readonly fontSizeOptions = FONT_SIZE_OPTIONS;

  constructor(private readonly editorService: EditorService) {}

  get language() {
    return this.editorService.language$.getValue();
  }

  set language(lang: string) {
    this.editorService.language$.next(lang);
  }

  get fontSize() {
    return this.editorService.fontSize$.getValue();
  }

  set fontSize(fontSize: number) {
    this.editorService.fontSize$.next(fontSize);
  }
}
