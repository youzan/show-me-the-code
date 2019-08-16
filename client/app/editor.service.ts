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

const THEME_KEY = 'THEME';
// monaco.languages.typescript.typescriptDefaults.setCompilerOptions(defaultTypeScriptCompilerOption);

@Injectable()
export class EditorService implements OnDestroy {
  readonly language$ = new BehaviorSubject('javascript');
  readonly fontSize$ = new BehaviorSubject(14);
  readonly expired$ = new BehaviorSubject(false);
  readonly format$ = new Subject();
  readonly theme$: BehaviorSubject<string>;
  expires: Date | null = null;

  readonly model = monaco.editor.createModel('', this.language$.getValue());
  private $$: Subscription[] = [];

  constructor() {
    const initialTheme = localStorage.getItem(THEME_KEY) || 'vs-dark';
    this.theme$ = new BehaviorSubject(initialTheme);
    this.$$.push(
      this.language$.subscribe(language => {
        monaco.editor.setModelLanguage(this.model, language);
      }),
      this.theme$.subscribe(theme => {
        localStorage.setItem(THEME_KEY, theme);
        monaco.editor.setTheme(theme);
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
