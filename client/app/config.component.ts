import { Component, ChangeDetectionStrategy } from '@angular/core';
import { LANGUAGE_OPTIONS, FONT_SIZE_OPTIONS } from './constants';
import { EditorService } from './editor.service';

@Component({
  selector: 'app-config',
  template: `
    <label>Language: </label>
    <p-dropdown
      [options]="languageOptions"
      [ngModel]="language$ | async"
      (ngModelChange)="languageChange($event)"
      [filter]="true"
    ></p-dropdown>
    <label>Font Size: </label>
    <p-dropdown
      [options]="fontSizeOptions"
      [ngModel]="fontSize$ | async"
      (ngModelChange)="fontSizeChange($event)"
    ></p-dropdown>
    <label>Theme: </label>
    <div class="themes">
      <p-radioButton
        value="vs-dark"
        label="Dark"
        [ngModel]="theme$ | async"
        (ngModelChange)="themeChange($event)"
      ></p-radioButton>
      <p-radioButton
        value="vs-light"
        label="Light"
        [ngModel]="theme$ | async"
        (ngModelChange)="themeChange($event)"
      ></p-radioButton>
    </div>
  `,
  styles: [
    `
      :host {
        display: grid;
        grid-template-columns: auto auto;
        grid-auto-rows: minmax(40px, auto);
        align-items: center;
      }

      label {
        padding: 0 10px;
      }
      
      .themes {
        display: flex;
        justify-content: space-around;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfigComponent {
  readonly languageOptions = LANGUAGE_OPTIONS;
  readonly fontSizeOptions = FONT_SIZE_OPTIONS;

  constructor(private readonly editorService: EditorService) {}

  get language$() {
    return this.editorService.language$;
  }

  languageChange(lang: string) {
    this.editorService.language$.next(lang);
  }

  get fontSize$() {
    return this.editorService.fontSize$;
  }

  fontSizeChange(fontSize: number) {
    this.editorService.fontSize$.next(fontSize);
  }

  get theme$() {
    return this.editorService.theme$;
  }

  themeChange(theme: string) {
    this.editorService.theme$.next(theme);
  }
}
