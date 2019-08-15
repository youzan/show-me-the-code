import { Injectable, OnDestroy } from '@angular/core';
import * as monaco from 'monaco-editor';
// import { interval, never } from 'rxjs';
// import { switchMap } from 'rxjs/operators';
import { EditorService } from './editor.service';
import { ConnectionService } from './connection.service';

// function deserializeRange({ startColumn, startLineNumber, endColumn, endLineNumber }: monaco.IRange): monaco.Range {
//   return new monaco.Range(startLineNumber, startColumn, endLineNumber, endColumn);
// }
//
// function positionToRange({ lineNumber, column }: monaco.IPosition): monaco.IRange {
//   return {
//     startColumn: column,
//     startLineNumber: lineNumber,
//     endColumn: column,
//     endLineNumber: lineNumber,
//   };
// }

// interface IUserDecorations {
//   cursor: string[];
//   selection: string[];
// }

// function emptyDecorations(): IUserDecorations {
//   return {
//     cursor: [],
//     selection: [],
//   };
// }

@Injectable()
export class CodeService implements OnDestroy {
  $$: monaco.IDisposable[] = [];

  // private readonly userDecorations = new Map<string, IUserDecorations>();
  private previousSyncVersionId = 0;

  get model() {
    return this.editorService.model;
  }

  constructor(private readonly editorService: EditorService, private readonly connectionService: ConnectionService) {}

  // private getDecorations(userId: string): IUserDecorations {
  //   let decorations = this.userDecorations.get(userId);
  //   if (!decorations) {
  //     decorations = emptyDecorations();
  //     this.userDecorations.set(userId, decorations);
  //   }
  //   return decorations;
  // }

  init(editor: monaco.editor.IStandaloneCodeEditor) {
    this.editorService.model.onDidChangeContent(e => {
      if (e.versionId === this.previousSyncVersionId + 1) {
        return;
      }
      // this.connectionService.userEdit(e.changes);
    });
    this.connectionService
      .on('sync.full', ({ content, language, expires }) => {
        this.setModelValue(content, editor);
        this.editorService.language$.next(language);
        if (!expires) {
          return;
        }
        this.editorService.expires = new Date(expires);
        const expireTime = this.editorService.expires.getTime();
        const now = Date.now();
        if (expireTime <= now) {
          this.editorService.expired$.next(true);
        } else {
          setTimeout(() => this.editorService.expired$.next(true), expireTime - now);
        }
      })
      .on('sync.full.request', ({ from }) => {
        const language = this.editorService.language$.getValue();
        const expires = this.editorService.expires;
        const content = this.model.getValue();
        this.connectionService.push('sync.full.reply', {
          language,
          expires,
          content,
          to: from,
        });
      });
    // this.connectionService
    //   .onReceiveEdit(({ userId, changes }) => {
    //     if (userId === this.connectionService.userId) {
    //       return;
    //     }
    //     const edits = changes.map(change => ({
    //       ...change,
    //       range: deserializeRange(change.range),
    //       remote: true,
    //     }));
    //     const selections = editor.getSelections();
    //     this.previousSyncVersionId = this.model.getVersionId();
    //     this.model.pushEditOperations(selections || [], edits, () => selections);
    //     editor.setSelections(selections || []);
    //   })
    // .onReceiveUserCursor(({ userId, position }) => {
    // const user = this.connectionService.users.get(userId);
    // if (!user || user.id === this.connectionService.userId) {
    //   return;
    // }
    // let decorations = this.getDecorations(userId);
    // let newCursor: string[];
    // if (position !== null) {
    //   newCursor = this.model.deltaDecorations(decorations.cursor, [
    //     {
    //       options: {
    //         className: `user-${user.slot}-cursor`,
    //         hoverMessage: {
    //           value: `Cursor: ${user.name}`,
    //         },
    //       },
    //       range: positionToRange(position),
    //     },
    //   ]);
    // } else {
    //   newCursor = this.model.deltaDecorations(decorations.cursor, []);
    // }
    // decorations.cursor = newCursor;
    // })
    // .onReceiveUserSelection(({ ranges, userId }) => {
    //   if (userId === this.connectionService.userId) {
    //     return;
    //   }
    // const user = this.connectionService.users.get(userId);
    // if (!user) {
    //   return;
    // }
    // const decorations = this.getDecorations(userId);
    // const newDecorationsId = this.model.deltaDecorations(
    //   decorations.selection,
    //   ranges.map<monaco.editor.IModelDeltaDecoration>(it => ({
    //     range: deserializeRange(it),
    //     options: {
    //       stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
    //       className: `user-${user.slot}-selection`,
    //       hoverMessage: {
    //         value: `Selection: ${user.name}`,
    //       },
    //     },
    //   })),
    // );
    // decorations.selection = newDecorationsId;
    // })

    this.$$.push(
      // editor.onDidChangeCursorPosition(e => this.connectionService.cursorChange(e.position)),
      // editor.onDidBlurEditorText(() => this.connectionService.cursorChange(null)),
      // editor.onDidFocusEditorText(() => this.connectionService.cursorChange(editor.getPosition())),
      // editor.onDidChangeCursorSelection(e =>
      //   this.connectionService.selectionChange([e.selection].concat(e.secondarySelections)),
      // ),
      // this.registerAutoSave(),
    );
  }

  // registerAutoSave(): monaco.IDisposable {
  //   const $ = this.connectionService.autoSave$
  //     .pipe(switchMap(autoSave => (autoSave ? interval(60000) : never())))
  //     .subscribe(() => this.save(true));
  //   return {
  //     dispose() {
  //       $.unsubscribe();
  //     },
  //   };
  // }

  save() {
    // const value = this.editorService.model.getValue();
    // this.connectionService.save(value, silent);
  }

  setModelValue(content: string, editor: monaco.editor.IStandaloneCodeEditor) {
    if (this.model.getValue() === content) {
      return;
    }
    this.previousSyncVersionId = this.model.getVersionId();
    const selections = editor.getSelections();
    this.model.setValue(content);
    if (selections) {
      editor.setSelections(selections);
    }
  }

  ngOnDestroy() {
    this.$$.forEach(it => it.dispose());
  }
}
