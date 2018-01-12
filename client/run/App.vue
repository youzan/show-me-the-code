<template>
  <div class="console">
    <vue-json-pretty v-for="(data, index) in data" :key="index" :data="data" />
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
  data = [];

  mounted() {
    this.init();
  }

  init() {
    console._log = console.log;
    console.log = (...rawArgs) => {
      const args = Array.prototype.slice.call(rawArgs);
      console._log(args)
      this.data.push(...args);
      console._log.apply(console, args);
    };
  }
}

export default App;
</script>
