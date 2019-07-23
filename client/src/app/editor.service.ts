import { Injectable, OnDestroy } from '@angular/core';
import * as monaco from 'monaco-editor';
import { BehaviorSubject, Subscription, Subject } from 'rxjs';

monaco.editor.setTheme('vs-dark');

@Injectable()
export class EditorService implements OnDestroy {
  readonly language$ = new BehaviorSubject('javascript');
  readonly fontSize$ = new BehaviorSubject(14);
  readonly format$ = new Subject();

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
    this.format$.next();
  }

  ngOnDestroy() {
    this.$$.forEach(it => it.unsubscribe());
    this.$$ = [];
  }
}
