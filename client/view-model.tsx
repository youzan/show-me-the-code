import * as monaco from 'monaco-editor';
import { BehaviorSubject } from 'rxjs';
import { store } from 'react-easy-state';

import CodeDatabase from './services/storage';
import { Connection } from './services/connection';
import { Execution } from './services/execution';
import CodeService from './services/code';
import { IClient } from './models';

export class ViewModel {
  hostName$ = new BehaviorSubject<string>('');
  userName$ = new BehaviorSubject<string>('');
  codeId$ = new BehaviorSubject<string>('');
  clientType$ = new BehaviorSubject<'host' | 'guest' | null>(null);
  language$ = new BehaviorSubject('javascript');
  fontSize$ = new BehaviorSubject(14);
  loading$ = new BehaviorSubject(false);
  hostId$ = new BehaviorSubject(null);

  clients = store({
    list: new Map<string, IClient>(),
  });

  output = store({
    blocks: new Map<string, never[][]>(),
  });

  constructor(
    private readonly storage: CodeDatabase,
    private readonly connection: Connection,
    private readonly execution: Execution,
    private readonly codeService: CodeService,
  ) {}

  onLanguageChange = (language: string) => {
    monaco.editor.setModelLanguage(this.codeService.model, language);
  };

  onFontSizeChange = (fontSize: number) => {
    this.fontSize$.next(fontSize);
  };
}
