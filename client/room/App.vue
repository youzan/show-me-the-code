<template>
  <div class="app">
    <mu-appbar titleClass="appbar">
      <mu-select-field v-model="language">
        <mu-menu-item v-for="language in languages" :key="language" :value="language" :title="language" />
      </mu-select-field>
      <mu-raised-button label="Save" @click="$socket.emit('save')" />
      <v-connect-status :status="connect" />
    </mu-appbar>
    <div class="content">
      <v-monaco v-if="auth" ref="monaco" class="editor" v-model="code" :language="language" @change="handleCodeChange" theme="vs-dark" />
    </div>
    <mu-dialog body-class="connect-loading" :open="connect !== 'connected' && !auth">
      <mu-circular-progress :size="60" :strokeWidth="5" />
      <div class="connect-loading-text">
        Connecting...
      </div>
    </mu-dialog>
    <mu-dialog :open="connect === 'connected' && !auth">
      <mu-text-field label="Your Name" v-model.trim="userName" />
      <mu-text-field label="Key" v-model.trim="key" :errorText="err" />
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

import { languages } from './config';
import { adaptSelectionToISelection } from './utils';
import ConnectStatus from './components/ConnectStatus';
import ClientList from './components/ClientList';
import './style';

const KEY = '$coding_username';

declare var _global: {
  id: string
};

@Component({
  components: {
    'v-monaco': MonacoEditor,
    'v-connect-status': ConnectStatus,
    'v-client-list': ClientList
  },
  sockets: {
    connect() {
      this.connect = 'connected';
    },
    disconnect() {
      this.connect = 'disconnect'
    },
    reconnect() {
      this.connect = 'connected';
      this.doAuth();
    },
    'room.fail'(msg: string) {
      this.err = msg;
    },
    'room.success'(data: ISocketRoomSuccess) {
      this.auth = true;
      this.code = data.code;
      this.language = data.language;
      this.clients = data.clients;
    },
    'code.change'(data: ISocketCodeChange) {
      this.syncing = true;
      const editor: monaco.editor.IStandaloneCodeEditor = this.$refs.monaco.getMonaco();
      editor.executeEdits('socket', data.event.changes.map((change, index) => ({
        identifier: {
          major: data.ident,
          minor: index
        },
        range: new monaco.Range(change.range.startLineNumber, change.range.startColumn, change.range.endLineNumber, change.range.endColumn),
        text: change.text,
        forceMoveMarkers: true
      })));
      editor.setSelections(data.selections);
      this.code = data.value;
      this.syncing = false;
    },
    'room.clients'(clients: string[]) {
      this.clients = clients;
    }
  }
} as any)
export default class App extends Vue {
  code = ''
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

  mounted() {
    if (window.localStorage) {
      const userName = localStorage.getItem(KEY);
      if (userName) {
        this.userName = userName;
      }
    }
  }

  doAuth() {
    if (window.localStorage) {
      localStorage.setItem(KEY, this.userName);
    }
    (this as any).$socket.emit('room.join', {
      id: this.id,
      key: this.key,
      userName: this.userName
    });
  }

  handleCodeChange(value: string, e: monaco.editor.IModelContentChangedEvent) {
    if (!this.syncing) {
      const editor: monaco.editor.IStandaloneCodeEditor = (this.$refs.monaco as any).getMonaco();
      const selections: Array<monaco.ISelection> = editor.getSelections().map(selection => adaptSelectionToISelection(selection));
      (this as any).$socket.emit('code.change', {
        value,
        event: e,
        selections
      });
    }
  }
}

</script>

