/// <reference types="monaco-editor" />

interface ISocketRoomJoin {
  id: string
  key: string
  userName: string
}

interface ISocketCodeChange {
  ident: number
  value: string
  event: monaco.editor.IModelContentChangedEvent
  selections: Array<monaco.ISelection>
}

interface ISocketRoomSuccess {
  clients: string[]
  content: string
  language: string
}
