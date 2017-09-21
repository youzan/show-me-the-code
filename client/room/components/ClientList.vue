<template>
  <mu-paper class="client-list">
    <div class="client-list-item" v-for="it in clients" :key="it">{{ it }}</div>
  </mu-paper>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

@Component({
  props: {
    clients: Array
  }
})
export default class ClientList extends Vue {

}

</script>

<style lang="scss">
.client-list {
  position: fixed;
  right: 0;
  top: 0;
  z-index: 100;

  &-item {
    padding: 10px;
  }
}

</style>

