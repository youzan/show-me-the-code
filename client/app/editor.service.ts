import { Injectable, OnDestroy } from '@angular/core';
import * as monaco from 'monaco-editor';
import { BehaviorSubject, Subscription, Subject } from 'rxjs';

// const defaultTypeScriptCompilerOption: monaco.languages.typescript.CompilerOptions = {
//   target: monaco.languages.typescript.ScriptTarget.ES2018,
//   strictNullChecks: true,
//   strictFunctionTypes: true,
//   lib: ['es2018'],
//   experimentalDecorators: false,
//   emitDecoratorMetadata: false,
//   jsx: monaco.languages.typescript.JsxEmit.None,
// };

monaco.editor.setTheme('vs-dark');
// monaco.languages.typescript.typescriptDefaults.setCompilerOptions(defaultTypeScriptCompilerOption);

@Injectable()
export class EditorService implements OnDestroy {
  readonly language$ = new BehaviorSubject('javascript');
  readonly fontSize$ = new BehaviorSubject(14);
  readonly expired$ = new BehaviorSubject(false);
  readonly format$ = new Subject();
  expires: Date | null = null;

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
