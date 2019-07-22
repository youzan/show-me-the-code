import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { EditorService } from './editor.service';
import { ConnectionService } from './connection.service';
import * as monaco from 'monaco-editor';

function deserializeRange({ startColumn, startLineNumber, endColumn, endLineNumber }: monaco.IRange): monaco.Range {
  return new monaco.Range(startLineNumber, startColumn, endLineNumber, endColumn);
}

@Injectable()
export class CodeService implements OnDestroy {
  $$: monaco.IDisposable[] = [];

  private userEditting = false;
  private editor: monaco.editor.IStandaloneCodeEditor | null = null;

  constructor(private readonly editorServie: EditorService, private readonly connectionService: ConnectionService) {}

  init(editor: monaco.editor.IStandaloneCodeEditor) {
    this.editor = editor;
    this.editorServie.model.onDidChangeContent(e => {
      if (this.userEditting) {
        this.connectionService.userEdit(e.changes);
      }
    });
    this.connectionService.onReceiveEdit(({ userId, changes }) => {
      if (userId === this.connectionService.userId || !this.editor) {
        return;
      }
      const edits = changes.map(change => ({
        ...change,
        range: deserializeRange(change.range),
        remote: true,
      }));
      const selections = this.editor.getSelections();
      this.editorServie.model.pushEditOperations(this.editor.getSelections() || [], edits, () => selections || []);
    });
    this.$$.push(
      this.editor.onKeyDown(() => (this.userEditting = true)),
      this.editor.onKeyUp(() => (this.userEditting = false)),
    );
  }

  ngOnDestroy() {
    this.$$.forEach(it => it.dispose());
    this.editor = null;
  }
}
