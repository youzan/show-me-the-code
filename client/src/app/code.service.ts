import { Injectable, OnDestroy } from '@angular/core';
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

interface IUserDecorations {
  cursor: string[];
}

function emptyDecorations(): IUserDecorations {
  return {
    cursor: [],
  };
}

@Injectable()
export class CodeService implements OnDestroy {
  $$: monaco.IDisposable[] = [];

  private readonly userDecorations = new Map<string, IUserDecorations>();
  private previousSyncVersionId = 0;

  get model() {
    return this.editorServie.model;
  }

  constructor(private readonly editorServie: EditorService, private readonly connectionService: ConnectionService) {}

  init(editor: monaco.editor.IStandaloneCodeEditor) {
    this.editorServie.model.onDidChangeContent(e => {
      if (e.versionId === this.previousSyncVersionId + 1) {
        return;
      }
      this.connectionService.userEdit(e.changes);
    });
    this.connectionService
      .onReceiveEdit(({ userId, changes }) => {
        if (userId === this.connectionService.userId) {
          return;
        }
        const edits = changes.map(change => ({
          ...change,
          range: deserializeRange(change.range),
          remote: true,
        }));
        const selections = editor.getSelections();
        this.previousSyncVersionId = this.model.getVersionId();
        this.model.pushEditOperations(editor.getSelections() || [], edits, () => selections || []);
      })
      .onReceiveUserCursor(({ userId, position }) => {
        const user = this.connectionService.users.get(userId);
        if (!user || user.id === this.connectionService.userId) {
          return;
        }
        let decorations = this.userDecorations.get(userId);
        if (!decorations) {
          decorations = emptyDecorations();
          this.userDecorations.set(userId, decorations);
        }
        let newCursor: string[];
        if (position !== null) {
          newCursor = this.model.deltaDecorations(decorations.cursor, [
            {
              options: {
                className: `user-${user.color}-cursor`,
              },
              range: positionToRange(position),
            },
          ]);
        } else {
          newCursor = this.model.deltaDecorations(decorations.cursor, []);
        }
        decorations.cursor = newCursor;
      });

    this.$$.push(
      editor.onDidChangeCursorPosition(e => this.connectionService.cursorChange(e.position)),
      editor.onDidBlurEditorText(() => this.connectionService.cursorChange(null)),
      editor.onDidFocusEditorText(() => this.connectionService.cursorChange(editor.getPosition())),
    );
  }

  ngOnDestroy() {
    this.$$.forEach(it => it.dispose());
  }
}
