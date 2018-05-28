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
import * as Babel from 'babel-standalone';
import ts from 'typescript';

function compile(input, type) {
  switch (type) {
    case 'javascript':
        return Babel.transform(input, {
    presets: ['es2015', 'es2017', 'stage-0']
  }).code;
    case 'typescript':
      return ts.transpile(input);  
    default:
      break;
  }
}

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
    window.__run = (code, type) => {
      const zone = Zone.current.fork({
        name: uniqueId('RUN_'),
        properties: {
          output: []
        }
      });
      zone.run(() => {
        try {
          const output = compile(code, type);
          eval(output);
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
