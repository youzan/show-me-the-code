import { Injectable } from '@angular/core';
import * as monaco from 'monaco-editor';
// import { interval, never } from 'rxjs';
// import { switchMap } from 'rxjs/operators';
import { EditorService } from './editor.service';
import { ConnectionService, ISocketEvents } from './connection.service';
import { Proto } from '../serializers';
import { decodeArrayBuffer, encodeArrayBuffer } from './utils';

function deserializeRange({ startColumn, startLineNumber, endColumn, endLineNumber }: monaco.IRange): monaco.Range {
  return new monaco.Range(startLineNumber, startColumn, endLineNumber, endColumn);
}

//
// function positionToRange({ lineNumber, column }: monaco.IPosition): monaco.IRange {
//   return {
//     startColumn: column,
//     startLineNumber: lineNumber,
//     endColumn: column,
//     endLineNumber: lineNumber,
//   };
// }

interface IUserDecorations {
  cursor: string[];
  selection: string[];
}

function emptyDecorations(): IUserDecorations {
  return {
    cursor: [],
    selection: [],
  };
}

@Injectable()
export class CodeService {
  private readonly decorationMap = new Map<string, IUserDecorations>();
  private previousSyncVersionId = 0;

  get model() {
    return this.editorService.model;
  }

  constructor(private readonly editorService: EditorService, private readonly connectionService: ConnectionService) {}

  private getDecorations(userId: string): IUserDecorations {
    let decorations = this.decorationMap.get(userId);
    if (!decorations) {
      decorations = emptyDecorations();
      this.decorationMap.set(userId, decorations);
    }
    return decorations;
  }

  init(editor: monaco.editor.IStandaloneCodeEditor) {
    this.editorService.model.onDidChangeContent(e => this.onDidContentChange(e));
    editor.onDidChangeCursorSelection(e => this.onDidChangeCursorSelection(e));
    this.connectionService
      .on('sync.full', msg => this.onReceiveFullSync(msg, editor))
      .on('sync.full.request', msg => this.onReceiveFullSyncRequest(msg))
      .on('user.edit', msg => this.onReceiveUserEdit(msg, editor))
      .on('user.selection', msg => this.onReceiveUserSelection(msg));
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

    // this.$$
    //   .push
    // editor.onDidChangeCursorPosition(e => this.connectionService.cursorChange(e.position)),
    // editor.onDidBlurEditorText(() => this.connectionService.cursorChange(null)),
    // editor.onDidFocusEditorText(() => this.connectionService.cursorChange(editor.getPosition())),
    // editor.onDidChangeCursorSelection(e =>
    //   this.connectionService.selectionChange([e.selection].concat(e.secondarySelections)),
    // ),
    // this.registerAutoSave(),
    // ();
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

  async onDidContentChange(e: monaco.editor.IModelContentChangedEvent) {
    if (e.versionId === this.previousSyncVersionId + 1) {
      return;
    }
    const buffer = Proto.Editor.ModelContentChangedEvent.encode(e).finish();
    const base64 = await encodeArrayBuffer(buffer);
    this.connectionService.push('user.edit', {
      from: this.connectionService.userId,
      event: base64,
    });
  }

  async onDidChangeCursorSelection({ selection, secondarySelections }: monaco.editor.ICursorSelectionChangedEvent) {
    const selections = [selection].concat(secondarySelections);
    const buffer = Proto.Editor.UserSelection.encode({
      selections,
    }).finish();
    const base64 = await encodeArrayBuffer(buffer);
    this.connectionService.push('user.selection', {
      from: this.connectionService.userId,
      event: base64,
    });
  }

  onReceiveFullSync(
    { content, language, expires }: ISocketEvents['sync.full'],
    editor: monaco.editor.IStandaloneCodeEditor,
  ) {
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
  }

  onReceiveFullSyncRequest({ from }: ISocketEvents['sync.full.request']) {
    const language = this.editorService.language$.getValue();
    const expires = this.editorService.expires;
    const content = this.model.getValue();
    this.connectionService.push('sync.full.reply', {
      language,
      expires,
      content,
      to: from,
    });
  }

  async onReceiveUserEdit({ event }: ISocketEvents['user.edit'], editor: monaco.editor.IStandaloneCodeEditor) {
    const buffer = await decodeArrayBuffer(event);
    const { changes } = Proto.Editor.ModelContentChangedEvent.decode(buffer) as monaco.editor.IModelContentChangedEvent;
    const edits = changes.map(change => ({
      ...change,
      range: deserializeRange(change.range),
    }));
    const selections = editor.getSelections();
    this.previousSyncVersionId = this.model.getVersionId();
    this.model.pushEditOperations(selections || [], edits, () => null);
    selections && editor.setSelections(selections);
  }

  async onReceiveUserSelection({ event, from }: ISocketEvents['user.selection']) {
    const buffer = await decodeArrayBuffer(event);
    const { selections } = Proto.Editor.UserSelection.decode(buffer);
    const user = this.connectionService.userMap.get(from);
    if (!user) {
      return;
    }
    const decorations = this.getDecorations(from);
    decorations.selection = this.model.deltaDecorations(
      decorations.selection,
      selections.map<monaco.editor.IModelDeltaDecoration>(it => ({
        range: deserializeRange(it as monaco.IRange),
        options: {
          stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
          className: `user-${user.slot}-selection`,
          hoverMessage: {
            value: `Selection: ${user.name}`,
          },
        },
      })),
    );
  }
}
