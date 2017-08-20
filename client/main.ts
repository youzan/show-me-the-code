import 'babel-polyfill';
import Vue from 'vue';
import VueSocketio from 'vue-socket.io';

import App from './App';

(window as any).require.config({ paths: { 'vs': 'static/vs' }});

Vue.use(VueSocketio, '/socket.io');

const vm = new Vue({
  el: '#app',
  render: h => h(App)
});
