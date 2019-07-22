import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { EditorService } from './editor.service';
import { ConnectionService } from './connection.service';
import * as monaco from 'monaco-editor';

function deserializeRange({ startColumn, startLineNumber, endColumn, endLineNumber }: monaco.IRange): monaco.Range {
  return new monaco.Range(startLineNumber, startColumn, endLineNumber, endColumn);
}

function positionToRange({ lineNumber, column }: monaco.IPosition): monaco.IRange {
  return {
    startColumn: column,
    startLineNumber: lineNumber,
    endColumn: column,
    endLineNumber: lineNumber,
  };
}

@Injectable()
export class CodeService implements OnDestroy {
  $$: monaco.IDisposable[] = [];

  private userEditting = false;
  private editor: monaco.editor.IStandaloneCodeEditor | null = null;
  private readonly userDecorations = new Map<string, string[]>();

  constructor(private readonly editorServie: EditorService, private readonly connectionService: ConnectionService) {}

  init(editor: monaco.editor.IStandaloneCodeEditor) {
    this.editor = editor;
    this.editorServie.model.onDidChangeContent(e => {
      if (this.userEditting) {
        this.connectionService.userEdit(e.changes);
      }
    });
    this.connectionService
      .onReceiveEdit(({ userId, changes }) => {
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
      })
      .onReceiveUserCursor(({ userId, position }) => {
        const user = this.connectionService.users.get(userId);
        if (!user || user.id === this.connectionService.userId) {
          return;
        }
        const prevDecorations = this.userDecorations.get(userId) || [];
        const newDecorations = this.editorServie.model.deltaDecorations(prevDecorations, [
          {
            options: {
              className: `user-${user.color}-cursor`,
            },
            range: positionToRange(position),
          },
        ]);
        this.userDecorations.set(userId, newDecorations);
      });

    this.$$.push(
      this.editor.onKeyDown(() => (this.userEditting = true)),
      this.editor.onKeyUp(() => (this.userEditting = false)),
      this.editor.onDidChangeCursorPosition(e => this.connectionService.cursorChange(e.position)),
    );
  }

  ngOnDestroy() {
    this.$$.forEach(it => it.dispose());
    this.editor = null;
  }
}
