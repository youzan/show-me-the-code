<template>
  <div class="app">
    <i-menu mode="horizontal" class="appbar" theme="dark">
      <menu-item name="language" class="appbar-language" v-model="language">
        语言
        <i-select class="language-select" v-model="language">
          <i-option v-for="language in languages" :key="language.value" :value="language.value">{{ language.title }}</i-option>
        </i-select>
      </menu-item>
      <menu-item name="fontSize">
        字体大小
        <i-select v-model="fontSize">
          <i-option v-for="it in [10, 12, 14, 16, 18, 20]" :key="it" :value="it">{{ it }}</i-option>
        </i-select>
      </menu-item>
      <menu-item name="connectStatus">
        <v-connect-status :status="connect" />
      </menu-item>
      <menu-item name="save">
        <i-button type="primary" @click="$socket.emit('save')">保存</i-button>
      </menu-item>
      <menu-item v-if="isRunnable" name="run">
        <i-button type="success" @click="runCurrentContent">运行</i-button>
      </menu-item>
      <menu-item name="timer" v-if="creator">
        <v-timer />
      </menu-item>
      <menu-item class="output" v-if="isRunnable" name="run">
        Output:
      </menu-item>
      <div class="right" />
      <menu-item name="clear" v-if="isRunnable">
        <i-button type="info" @click="clearOutput">清除输出</i-button>
      </menu-item>
      <menu-item name="powered-by" class="powered-by">
        <a class="github" href="//github.com/youzan/show-me-the-code" target="_blank" rel="noopener noreferrer">
          <icon type="logo-github" />sPowered by 有赞前端
        </a>
      </menu-item>
    </i-menu>
    <div class="content">
      <v-monaco
        ref="editor"
        class="editor"
        v-if="auth"
        v-model="content"
        :language="language"
        @change="handleCodeChange"
        @editorMount="handleEditorMount"
        @selection="handleSelection"
        @blur="$socket.emit('blur')"
        @focus="$socket.emit('focus')"
        :options="monacoOptions"
        theme="vs-dark" />
      <div v-if="isRunnable" ref="slider" class="code-slider" v-stream:mousedown="mouseDown$" />
      <div v-if="isRunnable" class="runner" ref="runner">
        <iframe ref="iframe" :srcdoc="runContent" />
      </div>
    </div>
    <modal :value="connect === 'connected' && !auth" :closable="false" :mask-closable="false">
      <i-input label="用户名" v-model.trim="userName" :error-text="nameErr">
        <span slot="prepend">用户名</span>
      </i-input>
      <i-button slot="footer" type="primary" @click="doAuth">OK</i-button>
    </modal>
    <v-client-list :clients="clients" />
  </div>
</template>

<script lang="ts">
/// <reference types="monaco-editor" />

/// <reference path="../../model/socket.d.ts" />

import Vue from 'vue';
import Component from 'vue-class-component';
import MonacoEditor from 'vue-monaco';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { debounceTime } from 'rxjs/operators/debounceTime';

import { languages } from './config';
import { adaptSelectionToISelection } from './utils';
import ConnectStatus from './components/ConnectStatus.vue';
import ClientList from './components/ClientList.vue';
import Timer from './components/Timer.vue';
import getContent from './getContent';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { merge } from 'rxjs/observable/merge';
import { mapTo, map, filter, scan, switchMap } from 'rxjs/operators';
import { tap } from 'rxjs/operators/tap';

declare var _global: {
  id: string;
  userName: string;
};

function getCreatorKeys() {
  if (localStorage) {
    const str = localStorage.getItem('$CODING_CREATOR_KEY') || '{}';
    const obj = JSON.parse(str);
    return obj;
  }
  return {};
}

@Component({
  components: {
    'v-monaco': MonacoEditor,
    'v-connect-status': ConnectStatus,
    'v-client-list': ClientList,
    'v-timer': Timer,
  },
  domStreams: ['mouseDown$'],
  watch: {
    fontSize(value) {
      const editor: monaco.editor.IStandaloneCodeEditor = this.editor;
      editor.updateOptions({
        fontSize: value,
      });
    },
    connect(value) {
      if (value !== 'connected') {
        this.$Spin.show();
      } else {
        this.$Spin.hide();
      }
    },
    language() {
      const editor: monaco.editor.IStandaloneCodeEditor = this.editor;
      if (!this.isRunnable) {
        this.$refs.editor.$el.style.width = '100%';
      } else {
        this.$refs.editor.$el.style.width = '';
      }
      Vue.nextTick(() => editor.layout());
    },
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
      const editor: monaco.editor.IStandaloneCodeEditor = this.editor;
      editor.executeEdits(
        'socket',
        data.event.changes.map((change, index) => ({
          identifier: {
            major: data.ident,
            minor: index,
          },
          range: new monaco.Range(
            change.range.startLineNumber,
            change.range.startColumn,
            change.range.endLineNumber,
            change.range.endColumn,
          ),
          text: change.text,
          forceMoveMarkers: true,
        })),
      );
      this.content = data.value;
      this.syncing = false;
    },
    'room.clients'(clients: any[]) {
      this.clients = clients;
    },
    selection(selections: monaco.ISelection[]) {
      this.syncing = true;
      const editor: monaco.editor.IStandaloneCodeEditor = this.editor;
      editor.setSelections(selections);
      this.syncing = false;
    },
    creator() {
      this.creator = true;
    },
  },
} as any)
export default class App extends Vue {
  content = '';
  language = 'javascript';
  languages = languages;
  userName = '';
  auth = false;
  userNameSet = false;
  id = _global.id;
  key = '';
  err = '';
  syncing = false;
  clients: any[] = [];
  connect: 'connected' | 'disconnect' | 'connecting' = 'disconnect';
  editor: monaco.editor.IStandaloneCodeEditor;
  nameErr = '';
  fontSize = 16;
  creator = false;
  subscription = null;

  get title() {
    return `Welcome ${this.userName}`;
  }

  get runContent() {
    return getContent('');
  }

  get isRunnable() {
    return this.language === 'typescript' || this.language === 'javascript';
  }

  monacoOptions = {
    fontSize: 16,
  };

  mounted() {
    window.addEventListener('keydown', event => {
      if ((event.ctrlKey || event.metaKey) && event.keyCode === 83) {
        event.preventDefault();
        (this as any).$socket.emit('save');
      }
    });
    const query: { key?: string } = window.location.search
      .substring(1)
      .split('&')
      .reduce((pv, v) => {
        const r = v.split('=');
        pv[r[0]] = r[1];
        return pv;
      }, {});
    if (query.key) {
      this.key = query.key;
    }
    this.initSlide();
  }

  initSlide() {
    const mouseDown$ = (<any>this).mouseDown$;
    const mouseUp$ = merge(fromEvent(window, 'mouseup'));
    const sliding$ = merge(mouseDown$.pipe(mapTo(true)), mouseUp$.pipe(mapTo(false)));
    sliding$.pipe(debounceTime(1)).subscribe(sliding => {
      const iframe = <HTMLIFrameElement>this.$refs.iframe;
      if (iframe) {
        if (sliding) {
          iframe.style.pointerEvents = 'none';
        } else {
          iframe.style.pointerEvents = undefined;
        }
      }
    });
    const mouseMove$ = fromEvent(window, 'mousemove');
    const start$ = mouseDown$.pipe(map(({ event }) => event.clientX));
    const end$ = mouseMove$.pipe(map((event: MouseEvent) => event.clientX));
    const delta$ = combineLatest(start$, end$, sliding$)
      .pipe(filter(([, , sliding]) => !!sliding), map(([start, end]) => end))
      .subscribe(end => {
        const slider = <HTMLDivElement>this.$refs.slider;
        const editor = <HTMLDivElement>(<Vue>this.$refs.editor).$el;
        const runner = <HTMLDivElement>this.$refs.runner;
        slider.style.left = `${end}px`;
        editor.style.width = `${end}px`;
        runner.style.left = `${end + 5}px`;
        this.editor.layout();
      });
  }

  beforeDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
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
      creatorKey: keys[_global.id] || '',
    });
  }

  handleEditorMount(editor: monaco.editor.IStandaloneCodeEditor) {
    this.editor = editor;
    this.subscription = fromEvent(window, 'resize')
      .pipe(debounceTime(1000))
      .subscribe(() => {
        editor.layout();
      });
  }

  handleCodeChange(value: string, e: monaco.editor.IModelContentChangedEvent) {
    if (!this.syncing) {
      (this as any).$socket.emit('code.change', {
        value,
        event: e,
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
      positionColumn: it.positionColumn,
    }));
    (this as any).$socket.emit('selection', selections);
  }

  runCurrentContent() {
    const code = this.content.slice();
    const iframe: HTMLIFrameElement = <any>this.$refs.iframe;
    const win: any = iframe.contentWindow;
    win.__run(code, this.language);
  }

  clearOutput() {
    const iframe: HTMLIFrameElement = <any>this.$refs.iframe;
    (iframe.contentWindow as any).__clear();
  }
}
</script>

<style lang="scss" scoped>
body,
.app {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  margin: 0;
  overflow: hidden;
  background-color: #1e1e1e;
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
  position: relative;

  .editor {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 61.8%;
    overflow: hidden;
    box-shadow: 1px 0px 10px black;
    border-right: 1px solid black;
  }

  .runner {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: calc(61.8% + 5px);
    overflow: hidden;
  }

  .code-slider {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 5px;
    left: 61.8%;
    cursor: ew-resize;
  }
}

.appbar {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  box-shadow: 0px 1px 10px black;
  background-color: rgb(33, 37, 43);
  position: relative;
  height: 60px;
  flex: 0 0 60px;

  &-language {
    width: 160px;
  }

  &-fontsize {
    color: white;

    input {
      color: inherit !important;
    }
  }

  &-key {
    font-size: 16px;
  }

  .ivu-menu-item {
    padding: 0 5px;
  }

  .ivu-select {
    width: initial !important;
  }

  .ivu-select.language-select {
    width: 100px !important;
  }

  .output {
    position: absolute;
    left: 50%;
  }

  .right {
    margin-left: auto;
  }

  .powered-by {
    line-height: 20px;
    text-align: center;
  }
}

.connect-loading {
  display: flex;
  align-items: center;

  &-text {
    margin-left: 10px;
  }
}

iframe {
  width: 100%;
  height: 100%;
  border: 0;
}

.github {
  color: inherit;
}
</style>

