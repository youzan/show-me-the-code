<template>
  <div class="connect-status">
    <div class="circle" :style="circleStyle" />
    <div class="text">{{ text }}</div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

import './style';

@Component({
  props: {
    status: String
  }
})
export default class ConnectStatus extends Vue {
  get circleStyle() {
    return (this as any).status === 'connected' ? { background: 'green' } : { background: 'red' };
  }

  get text() {
    return (this as any).status === 'connected' ? 'online' : 'offline';
  }
}

</script>

