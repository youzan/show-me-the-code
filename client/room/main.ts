import 'babel-polyfill';
import Vue from 'vue';
import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.css'

import App from './App';

(window as any).require.config({ paths: { 'vs': '/static/vs' }});

Vue.use(VueMaterial);

(Vue as any).material.registerTheme('default', {
  primary: {
    color: 'white',
    hue: 900,
    textColor: 'black'
  },
  accent: 'grey',
  warn: 'red',
  background: 'white'
});

const vm = new Vue({
  el: '#app',
  render: h => h(App)
});
