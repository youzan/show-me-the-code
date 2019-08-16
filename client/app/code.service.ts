import { Injectable } from '@angular/core';
import * as monaco from 'monaco-editor';
import { EditorService } from './editor.service';
import { ConnectionService, ISocketEvents } from './connection.service';
import { Proto } from '../serializers';
import { decodeArrayBuffer, encodeArrayBuffer } from './utils';

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
    editor.onDidChangeCursorPosition(e => this.onDidChangeCursorPosition(e));
    editor.onDidChangeCursorSelection(e => this.onDidChangeCursorSelection(e));
    this.connectionService
      .on('sync.full', msg => this.onReceiveFullSync(msg, editor))
      .on('sync.full.request', msg => this.onReceiveFullSyncRequest(msg))
      .on('user.edit', msg => this.onReceiveUserEdit(msg, editor))
      .on('user.selection', msg => this.onReceiveUserSelection(msg))
      .on('user.cursor', msg => this.onReceiveUserCursor(msg));
  }

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

  private async onDidContentChange(e: monaco.editor.IModelContentChangedEvent) {
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

  private async onDidChangeCursorPosition({ position, secondaryPositions }: monaco.editor.ICursorPositionChangedEvent) {
    const positions = [position].concat(secondaryPositions);
    const buffer = Proto.Editor.UserCursor.encode({ positions }).finish();
    const base64 = await encodeArrayBuffer(buffer);
    this.connectionService.push('user.cursor', {
      from: this.connectionService.userId,
      event: base64,
    });
  }

  private async onDidChangeCursorSelection({
    selection,
    secondarySelections,
  }: monaco.editor.ICursorSelectionChangedEvent) {
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

  private onReceiveFullSync(
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

  private onReceiveFullSyncRequest({ from }: ISocketEvents['sync.full.request']) {
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

  private async onReceiveUserEdit({ event }: ISocketEvents['user.edit'], editor: monaco.editor.IStandaloneCodeEditor) {
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

  private async onReceiveUserSelection({ event, from }: ISocketEvents['user.selection']) {
    const user = this.connectionService.userMap.get(from);
    if (!user) {
      return;
    }
    const buffer = await decodeArrayBuffer(event);
    const { selections } = Proto.Editor.UserSelection.decode(buffer);
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

  private async onReceiveUserCursor({ from, event }: ISocketEvents['user.cursor']) {
    const user = this.connectionService.userMap.get(from);
    if (!user) {
      return;
    }
    const buffer = await decodeArrayBuffer(event);
    const { positions } = await Proto.Editor.UserCursor.decode(buffer);
    const decorations = this.getDecorations(from);
    decorations.cursor = this.model.deltaDecorations(
      decorations.cursor,
      positions.map(position => ({
        options: {
          className: `user-${user.slot}-cursor`,
          hoverMessage: {
            value: `Cursor: ${user.name}`,
          },
        },
        range: positionToRange(position as monaco.IPosition),
      })),
    );
  }
}
