<template>
  <div class="app">
    <mu-appbar titleClass="appbar">
      <mu-select-field v-model="language">
        <mu-menu-item v-for="language in languages" :key="language.value" :value="language.value" :title="language.title" />
      </mu-select-field>
      <mu-raised-button label="Save" @click="$socket.emit('save')" />
      <div class="appbar-key">钥匙：{{ key }}</div>
      <v-connect-status :status="connect" />
    </mu-appbar>
    <div class="content">
      <v-monaco v-if="auth" class="editor" v-model="content" :language="language" @change="handleCodeChange" @editorMount="handleEditorMount" @selection="handleSelection" @blur="$socket.emit('blur')" @focus="$socket.emit('focus')" theme="vs-dark" />
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

declare var _global: {
  id: string,
  userName: string
};

function getCreatorKeys() {
  if (localStorage) {
    const str = localStorage.getItem('$CODING_CREATOR_KEY') || '{}';
    const obj = JSON.parse(str);
    return obj;
  }
  return { };
}

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

  mounted() {
    window.addEventListener('keydown', event => {
      if ((event.ctrlKey || event.metaKey) && event.keyCode === 83) {
        event.preventDefault();
        (this as any).$socket.emit('save');
      }
    });
    const query: { key?: string } = window.location.search.substring(1).split('&').reduce((pv, v) => {
      const r = v.split('=');
      pv[r[0]] = r[1];
      return pv;
    }, {});
    if (query.key) {
      this.key = query.key;
    }
  }

  doAuth() {
    if (!this.userName) {
      this.nameErr = '请输入你的用户名';
      return;
    }
    const keys = getCreatorKeys();
    (this as any).$socket.emit('room.join', {
      id: this.id,
      key: this.key,
      userName: this.userName,
      creatorKey: keys[_global.id] || ''
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

<style lang="scss">
body,
.app {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  margin: 0;
  overflow: hidden;
}

.header {
  height: 80px;
  display: flex;
  flex-direction: row;
}

.content {
  flex: 1 1 100%;
  display: flex;
  flex-direction: row;

  .editor {
    flex: 1 1 100%;
  }
}

.mu-dropDown-menu-text-overflow {
  color: white;
}

.appbar {
  display: flex;
  align-items: center;
  justify-content: space-around;

  .mu-text-field {
    margin: 0;
  }

  &-key {
    font-size: 16px;
  }
}

.connect-loading {
  display: flex;
  align-items: center;

  &-text {
    margin-left: 10px;
  }
}

.mu-menu-list {
  max-height: 500px;
}
</style>

