<template>
  <div class="app">
    <mu-appbar titleClass="appbar">
      <mu-select-field v-model="language">
        <mu-menu-item v-for="language in languages" :key="language" :value="language.value" :title="language.title" />
      </mu-select-field>
      <mu-raised-button label="Save" @click="$socket.emit('save')" />
      <v-connect-status :status="connect" />
    </mu-appbar>
    <div class="content">
      <v-monaco v-if="auth" class="editor" v-model="content" :language="language" @change="handleCodeChange" @editorMount="handleEditorMount" @selection="handleSelection" theme="vs-dark" />
    </div>
    <mu-dialog body-class="connect-loading" :open="connect !== 'connected'">
      <mu-circular-progress :size="60" :strokeWidth="5" />
      <div class="connect-loading-text">
        Connecting...
      </div>
    </mu-dialog>
    <mu-dialog :open="connect === 'connected' && !auth">
      <mu-text-field label="用户名" v-model.trim="userName" :error-text="nameErr" />
      <mu-text-field label="钥匙" v-model.trim="key" :error-text="err" />
      <mu-flat-button slot="actions" primary @click="doAuth" label="OK" />
    </mu-dialog>
    <v-client-list :clients="clients" />
  </div>
</template>

<script lang="ts">
/// <reference types="monaco-editor" />

/// <reference path="../../model/socket.d.ts" />

import Vue from 'vue';
import Component from 'vue-class-component';
import MonacoEditor from 'vue-monaco';
import debounce from 'lodash/debounce';

import { languages } from './config';
import { adaptSelectionToISelection } from './utils';
import ConnectStatus from './components/ConnectStatus';
import ClientList from './components/ClientList';
import './style';

declare var _global: {
  id: string,
  userName: string
};

@Component({
  components: {
    'v-monaco': MonacoEditor,
    'v-connect-status': ConnectStatus,
    'v-client-list': ClientList
  },
  sockets: {
    connect() {
      if (this.connect === 'reconnect') {
        setTimeout(() => this.doAuth(), 1000);
      }
      this.connect = 'connected';
    },
    disconnect() {
      this.connect = 'disconnect';
    },
    reconnect() {
      this.connect = 'reconnect';
    },
    'room.fail'(msg: string) {
      this.err = msg;
      this.connect = 'connected';
    },
    'room.success'(data: ISocketRoomSuccess) {
      this.auth = true;
      this.content = data.content;
      this.language = data.language;
      this.clients = data.clients;
      this.connect = 'connected';
    },
    'code.change'(data: ISocketCodeChange) {
      this.syncing = true;
      const editor: monaco.editor.IStandaloneCodeEditor = this.editor
      editor.executeEdits('socket', data.event.changes.map((change, index) => ({
        identifier: {
          major: data.ident,
          minor: index
        },
        range: new monaco.Range(change.range.startLineNumber, change.range.startColumn, change.range.endLineNumber, change.range.endColumn),
        text: change.text,
        forceMoveMarkers: true
      })));
      this.content = data.value;
      this.syncing = false;
    },
    'room.clients'(clients: string[]) {
      this.clients = clients;
    },
    selection(selections: monaco.ISelection[]) {
      this.syncing = true;
      const editor: monaco.editor.IStandaloneCodeEditor = this.editor;
      editor.setSelections(selections);
      this.syncing = false;
    }
  }
} as any)
export default class App extends Vue {
  content = ''
  language = 'javascript'
  languages = languages
  userName = ''
  auth = false
  userNameSet = false
  id = _global.id
  key = ''
  err = ''
  syncing = false
  clients: string[] = []
  connect: 'connected' | 'disconnect' | 'connecting' = 'disconnect'
  editor: monaco.editor.IStandaloneCodeEditor
  nameErr = ''

  get title() {
    return `Welcome ${this.userName}`;
  }

  doAuth() {
    if (!this.userName) {
      this.nameErr = '请输入你的用户名';
      return;
    }
    (this as any).$socket.emit('room.join', {
      id: this.id,
      key: this.key,
      userName: this.userName
    });
  }

  handleEditorMount(editor: monaco.editor.IStandaloneCodeEditor) {
    this.editor = editor;
  }

  handleCodeChange(value: string, e: monaco.editor.IModelContentChangedEvent) {
    if (!this.syncing) {
      (this as any).$socket.emit('code.change', {
        value,
        event: e
      });
    }
  }

  handleSelection() {
    if (this.syncing) {
      return;
    }
    const selections: monaco.ISelection[] = this.editor.getSelections().map(it => ({
        selectionStartLineNumber: it.selectionStartLineNumber,
        selectionStartColumn: it.selectionStartColumn,
        positionLineNumber: it.positionLineNumber,
        positionColumn: it.positionColumn
    }));
    (this as any).$socket.emit('selection', selections);
  }
}

</script>

