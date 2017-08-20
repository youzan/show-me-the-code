<template>
  <div class="app">
    <div class="header">
      <div>
        <v-select v-model="language" />
      </div>
    </div>
    <div class="content">
      <v-monaco ref="monaco" class="editor" v-model="code" :language="language" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import MonacoEditor from 'vue-monaco';

import Select from './components/LanguageSelect';

import './style';

@Component({
  components: {
    'v-monaco': MonacoEditor,
    'v-select': Select
  }
} as any)
export default class App extends Vue {
  code = `console.log('hello world');`
  language = 'javascript'


}

</script>

