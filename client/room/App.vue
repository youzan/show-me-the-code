<template>
  <div class="app">
    <mu-appbar>
      <mu-select-field v-model="language">
        <mu-menu-item v-for="language in languages" :key="language" :value="language" :title="language" />
      </mu-select-field>
    </mu-appbar>
    <div class="content">
      <v-monaco v-if="auth" ref="monaco" class="editor" v-model="code" :language="language" />
    </div>
    <mu-dialog :open="!auth">
      <mu-text-field label="Your Name" v-model="userName"/>
      <mu-text-field label="Key" v-model="key" />
      <mu-flat-button slot="actions" primary @click="doAuth" label="OK" />
    </mu-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import MonacoEditor from 'vue-monaco';
import io from 'socket.io-client';

import { languages } from './config';
import './style';

const KEY = '$coding_username';

declare var _global: {
  id: string
};

@Component({
  components: {
    'v-monaco': MonacoEditor
  },
  watch: {
    auth(value) {
      if (value) {
        (this.$refs.dialog as any).close();
      } else {
        (this.$refs.dialog as any).open();
      }
    }
  }
})
export default class App extends Vue {
  code = `console.log('hello world');`
  language = 'javascript'
  languages = languages
  userName = ''
  auth = false
  userNameSet = false
  id = _global.id
  key = ''
  $socket: SocketIOClient.Socket = undefined

  mounted() {
    if (window.localStorage) {
      const userName = localStorage.getItem(KEY);
      if (userName) {
        this.userName = userName;
      }
    }
    this.initSocket();
  }

  initSocket() {
    const socket = io('/socket.io');
    this.$socket = socket;
    socket.on('connection', () => {

    });
    socket.on('room.success', () => {
      this.auth = true;
    });
  }

  doAuth() {
    if (window.localStorage) {
      localStorage.setItem(KEY, this.userName);
    }
    if (this.$socket) {
      this.$socket.emit('room.join', {
        id: this.id,
        key: this.key,
        userName: this.userName
      });
    }
  }
}

</script>

