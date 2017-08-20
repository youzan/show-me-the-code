<template>
  <select @change="$emit('input', $event.target.value)" :value="value">
    <option v-for="language in languages" :key="language">{{ language }}</option>
  </select>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

@Component({
  props: {
    value: String
  }
})
export default class LanguageSelect extends Vue {
  languages = [
    'typescript',
    'javascript',
    'css',
    'less',
    'scss',
    'json',
    'html',
    'xml',
    'php',
    'c#',
    'c++',
    'razor',
    'markdown',
    'diff',
    'java',
    'visualbasic',
    'coffeescript',
    'handlebars',
    'batch',
    'pug',
    'f#',
    'lua',
    'powershell',
    'python',
    'sass',
    'r',
    'objective-c'
  ]
}

</script>

