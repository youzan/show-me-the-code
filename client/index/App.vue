<template>
  <div class="app">
    <md-input-container>
      <label>Room ID</label>
      <md-input v-model="id" />
    </md-input-container>
    <md-input-container>
      <label>Room Key</label>
      <md-input v-model="key" />
    </md-input-container>
    <md-button :href="roomURL" class="md-raised" target="_blank">GO!</md-button>
    <md-button class="md-raised" @click="handleCreate">Create</md-button>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { MDTabs, MDTab } from 'vue-material';
import axios from 'axios';

@Component
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

