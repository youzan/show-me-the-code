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

@Component({
  
})
export default class App extends Vue {
  id = ''
  key = ''

  get roomURL() {
    return `${_global.url.base}/room/${this.id}`;
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
  }
}

</script>

