/// <reference types="monaco-editor" />

import { observable, action, autorun } from 'mobx';
import io from 'socket.io-client';

const KEY = '$coding_username';

export default class {
  socket = io()
  @observable language = 'javascript'
  @observable userName: string = ''

  @action userNameChange = (value: string) => this.userName = value

  constructor() {
    if(localStorage) {
      const userName = localStorage.getItem(KEY);
      if (userName) {
        this.userName = userName;
      }
      autorun(() => {
        localStorage.setItem(KEY, this.userName);
      })
    }
    autorun(() => {
      if (this.userName) {
        this.initEditor();
      }
    })
  }

  async initEditor() {
    const monaco = await getMonaco();
    const editor: monaco.editor.IStandaloneCodeEditor = monaco.editor.create(document.getElementById('editor'), {
			value: [
				'function x() {',
				'\tconsole.log("Hello world!");',
				'}'
			].join('\n'),
			language: 'javascript'
    });
    editor.onDidChangeModelContent((e) => console.log(JSON.stringify(e)))
  }
}

function getMonaco(): Promise<any> {
  return new Promise(resolve => {
    const require = (window as any).require;
    require.config({ paths: { 'vs': 'static/vs' }});
    require(['vs/editor/editor.main'], function() {
       resolve((window as any).monaco)
    });
  });
}
