/// <reference types="monaco-editor" />

interface ISocketCodeChange {
  ident: number
  value: string
  event: monaco.editor.IModelContentChangedEvent
  selections: Array<monaco.ISelection>
}
