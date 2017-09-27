<template>
  <div class="app">
    <mu-text-field label="ID" v-model.trim="id" />
    <mu-text-field label="Key" v-model.trim="key" />
    <mu-raised-button :label="buttonText" @click="handleClick" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import axios from 'axios';

const KEY = '$CODING_CREATOR_KEY';

function saveCreatorKey(room, key) {
  if (localStorage) {
    const str = localStorage.getItem(KEY) || '{}';
    const obj = JSON.parse(str);
    obj[room] = key;
    localStorage.setItem(KEY, JSON.stringify(obj));
  }
}

@Component
export default class App extends Vue {
  id = ''
  key = ''

  get roomURL() {
    return `${_global.url.base}/room/${this.id}?key=${this.key}`;
  }

  get buttonText() {
    if (!this.id) {
      return 'Create';
    }
    return 'GO!'
  }

  handleClick() {
    if (this.id) {
      window.open(this.roomURL, '_blank');
    } else {
      this.handleCreate();
    }
  }

  async handleCreate() {
    const { data } = await axios({
      method: 'post',
      url: `${_global.url.base}/create`
    });
    this.id = data.id;
    this.key = data.key;
    saveCreatorKey(this.id, data.creatorKey);
  }
}

</script>

<style lang="scss">
body {
  display: flex;
  align-items: center;
  justify-content: center;
}

.app {
  padding: 16px;
  display: flex;
  flex-direction: column;

  button {
    margin-top: 10px;
  }
}
</style>

