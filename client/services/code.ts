import * as monaco from 'monaco-editor';
import { Subject } from 'rxjs';
import CodeDatabase from './storage';
import { Connection } from './connection';

export class CodeService {
  readonly model = monaco.editor.createModel('', 'javascript');
  readonly undo$ = new Subject<any>();

  constructor(private readonly db: CodeDatabase, private readonly connection: Connection) {
    
  }
}

export default CodeService;
