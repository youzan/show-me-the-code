import { Injectable } from '@angular/core';
import * as monaco from 'monaco-editor';
import { autorun } from 'mobx';
import { observable } from 'mobx-angular';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class EditorService {
  constructor() {
    monaco.editor.setTheme('vs-dark');
    autorun(() => {
      monaco.editor.setModelLanguage(this.model, this.language);
    });
  }

  model = monaco.editor.createModel('', 'javascript');

  @observable
  language = 'javascript';

  fontSize$ = new BehaviorSubject(14);

  setTheme(theme: string) {
    monaco.editor.setTheme(theme);
  }

  getContent() {
    return this.model.getValue();
  }
}
