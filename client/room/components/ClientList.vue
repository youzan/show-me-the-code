<template>
  <mu-paper class="client-list">
    <div class="client-list-item" v-for="it in clients" :key="it.name">
      {{ it.name }}
      <span v-if="it.status === 'blur'" style="color: red;">{{ it.status }}</span>
      <span v-else>{{ it.status }}</span>
    </div>
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
  bottom: 0;
  z-index: 100;

  &-item {
    padding: 10px;
  }
}

</style>

