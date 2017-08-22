<template>
  <md-tabs>
    <md-tab md-label="Create Room">
      <md-button class="md-raised" @click="handleCreate">Create</md-button>
    </md-tab>
    <md-tab md-label="Join Room">
      <md-input-container>
        <label>Room ID</label>
        <md-input v-model="id" />
      </md-input-container>
      <md-input-container>
        <label>Room Key</label>
        <md-input v-model="key" />
      </md-input-container>
    </md-tab>
  </md-tabs>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { MDTabs, MDTab } from 'vue-material';

@Component
export default class App extends Vue {
  id = ''
  key = ''

  handleCreate() {

  }
}

</script>

