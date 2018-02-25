<template>
  <div class="console">
    <div v-for="(output, i) in outputs" :key="i" style="background: #333333; border-radius: 3px; padding: 3px; margin: 0 0 5px 0;">
      <vue-json-pretty v-for="(it, j) in output" :key="`${i}-${j}`" :data="it" :style="getStyle(it)" />
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import Component from 'vue-class-component';
import VueJsonPretty from 'vue-json-pretty';
import uniqueId from 'lodash/uniqueId';

@Component({
  components: {
    VueJsonPretty
  }
})
class App extends Vue {
  outputs = [];

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
      const output = Zone.current.get('output') || [];
      if (!this.outputs.includes(output)) {
        this.outputs.push(output);
      }
      output.push(...args);
      console._log.apply(console, args);
    };
    window.__log = (...args) => {
      const output = Zone.current.get('output') || [];
      if (!this.outputs.includes(output)) {
        this.outputs.push(output);
      }
      output.push(...args);
    };
    window.__clear = () => {
      this.outputs = [];
    };
    window.__run = code => {
      const zone = Zone.current.fork({
        name: uniqueId('RUN_'),
        properties: {
          output: []
        }
      });
      zone.run(() => {
        try {
          const output = window.Babel.transform(code, {
            presets: ['es2015', 'es2017', 'stage-0']
          });
          eval(output.code);
        } catch (error) {
          window.__log(error);
          throw error;
        }
      });
    };
  }
}

export default App;
</script>
