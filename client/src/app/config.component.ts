import { Component } from '@angular/core';
import { LANGUAGE_OPTIONS, FONT_SIZE_OPTIONS } from './constants';
import { EditorService } from './editor.service';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss'],
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
