import { Injectable, OnDestroy } from '@angular/core';
import * as monaco from 'monaco-editor';
import { BehaviorSubject, Subscription } from 'rxjs';

monaco.editor.setTheme('vs-dark');

@Injectable()
export class EditorService implements OnDestroy {
  readonly language$ = new BehaviorSubject('javascript');
  readonly fontSize$ = new BehaviorSubject(14);

  readonly model = monaco.editor.createModel('', this.language$.getValue());
  private $$: Subscription[] = [];

  constructor() {
    this.$$.push(
      this.language$.subscribe(langauge => {
        monaco.editor.setModelLanguage(this.model, langauge);
      }),
    );
  }

  async format() {
    const prettier = await import('prettier/standalone');
    const out = prettier.format(this.model.getValue());
    this.model.setValue(out);
  }

  ngOnDestroy() {
    this.$$.forEach(it => it.unsubscribe());
    this.$$ = [];
  }
}
