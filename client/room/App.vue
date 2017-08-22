<template>
  <div class="app">
    <md-toolbar>
      <md-input-container>
        <md-select name="language" id="language" v-model="language">
          <md-option v-for="language in languages" :key="language" :value="language">{{ language }}</md-option>
        </md-select>
      </md-input-container>
    </md-toolbar>
    <div class="content">
      <v-monaco ref="monaco" class="editor" v-model="code" :language="language" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import MonacoEditor from 'vue-monaco';

import { languages } from './config';
import './style';

@Component({
  components: {
    'v-monaco': MonacoEditor
  }
})
export default class App extends Vue {
  code = `console.log('hello world');`
  language = 'javascript'
  languages = languages

}

</script>

