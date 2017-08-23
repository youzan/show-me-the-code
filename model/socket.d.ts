/// <reference types="monaco-editor" />

interface ISocketCodeChange {
  value: string
  event: monaco.editor.IModelContentChangedEvent
  selections: Array<monaco.ISelection>
}
