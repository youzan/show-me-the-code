<template>
  <div class="app">
    <mu-text-field label="ID" v-model="id" />
    <mu-text-field label="Key" v-model="key" />
    <mu-raised-button label="GO!" :href="roomURL" target="_blank" />
    <mu-raised-button label="Create" @click="handleCreate" />
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
    return `/room/${this.id}`;
  }

  async handleCreate() {
    const { data } = await axios({
      method: 'post',
      url: '/create'
    });
    this.id = data.id;
    this.key = data.key;
  }
}

</script>

