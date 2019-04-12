import { Component } from '@angular/core';
import { EditorService } from './editor.service';
import { LANGUAGE } from '../../config';
import { FONT_SIZE } from './constants';

const options = LANGUAGE.LIST.map(language => ({
  label: LANGUAGE.DISPLAY[language] || language,
  value: language,
}));

const fontSizeOptions = FONT_SIZE.map(fontSize => ({
  label: `${fontSize}`,
  value: fontSize,
}));

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss'],
})
export class ConfigComponent {
  options = options;
  fontSizeOptions = fontSizeOptions;

  constructor(private readonly editorService: EditorService) {}

  get language() {
    return this.editorService.language;
  }

  set language(language: string) {
    this.editorService.language = language;
  }

  get fontSize() {
    return this.editorService.fontSize$.getValue();
  }

  set fontSize(fontSize: number | string) {
    const value = Number(fontSize) || 14;
    this.editorService.fontSize$.next(value);
  }
}
