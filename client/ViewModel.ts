/// <reference types="monaco-editor" />

import { observable, action, autorun } from 'mobx';
import io from 'socket.io-client';
import { Notify } from 'zent';

const KEY = '$coding_username';

export default class {
  socket = io()
  @observable language = 'javascript'
  @observable userName: string = ''
  @observable room: string
  @observable key: string
  @observable code = ''
  editor: monaco.editor.IStandaloneCodeEditor

  @action userNameChange = (value: string) => this.userName = value

  joinRoom = (room, key) => {
    this.socket.emit('room.join', { room, key });
  }

  createRoom = () => {
    this.socket.emit('room.create');
  }

  @action
  roomJoint = (data) => {
    this.language = data.lang;
    this.room = data.id;
    this.code = data.code;
  }

  @action
  changeLanguage = (e, data) => {
    this.language = data;
  }

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
    this.initSocket();
    autorun(() => {
      if (this.userName && this.room) {
        this.initEditor();
      }
    });
  }

  async initEditor() {
    const monaco = await getMonaco();
    this.editor = monaco.editor.create(document.getElementById('editor'), {
			value: this.code,
			language: this.language
    });
    autorun(() => {
      this.editor.setValue(this.code);
    });
    autorun(() => {
      console.log('set language');
      (window as any).monaco.editor.setModelLanguage(this.editor.getModel(), this.language);
    });
    this.editor.onDidChangeModelContent((e) => () => {});
  }

  initSocket() {
    this.socket.on('room.join', ({ room, key }) => {
      this.room = room;
      this.key = key;
    });
    this.socket.on('room.fail', (err) => Notify.error(`加入房间失败，${err}`));
    this.socket.on('create.fail', (err) => Notify.error(`创建房间失败，${err}`));
    this.socket.on('create.success', this.roomJoint);
    this.socket.on('room.join', this.roomJoint);
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
