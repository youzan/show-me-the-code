<template>
  <div class="console">
    <template v-for="(li, i) in list">
      <div :key="`${i}-start`">{{ '>' }}</div>
      <vue-json-pretty v-for="(it, j) in li" :key="`${i}-${j}`" :data="it" :style="getStyle(it)" />
    </template>
  </div>
</template>

<script>
import Vue from 'vue';
import Component from 'vue-class-component';
import VueJsonPretty from 'vue-json-pretty';

@Component({
  components: {
    VueJsonPretty
  }
})
class App extends Vue {
  list = [];

  mounted() {
    this.init();
  }

  getStyle(data) {
    if (data instanceof Error) {
      return {
        color: 'red'
      };
    }
    return {};
  }

  init() {
    console._log = console.log;
    console.log = (...args) => {
      this.list.push(args);
      console._log.apply(console, args);
    };
    window.__log = (...args) => {
      this.list.push(args);
    };
    window.__clear = () => {
      this.list = [];
    }
  }
}

export default App;
</script>
