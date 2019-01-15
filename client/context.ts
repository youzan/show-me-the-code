import { createContext } from 'react';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import * as monaco from 'monaco-editor';
import { IClient } from './models';

export interface IAppContext {
  language$: Observable<string>;
  onLanguageChange(language: string): void;
  fontSize$: Observable<number>;
  onFontSizeChange(fontSize: number): void;
  undo$: Observable<never>;
  loading$: Observable<boolean>;
  hostId$: Observable<string | null>;
  editorModel: monaco.editor.ITextModel;
  clients: {
    list: Map<string, IClient>;
  };
  output: {
    blocks: Map<string, never[][]>;
  };
}

export const Context = createContext<IAppContext>({
  language$: new BehaviorSubject('javascript'),
  fontSize$: new BehaviorSubject(14),
  undo$: new Subject<never>(),
  loading$: new BehaviorSubject(false),
  hostId$: new BehaviorSubject(null),
  editorModel: null as any,
  clients: {
    list: new Map(),
  },
  output: {
    blocks: new Map(),
  },
  onLanguageChange() {},
  onFontSizeChange() {},
});
