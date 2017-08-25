<template>
  <mu-paper class="client-list">
    <div class="client-list-item" v-for="it in clients" :key="it">{{ it }}</div>
  </mu-paper>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

import './style';

@Component({
  props: {
    clients: Array
  }
})
export default class ClientList extends Vue {

}

</script>

