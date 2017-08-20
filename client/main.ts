import 'babel-polyfill';
import Vue from 'vue';

import App from './App';

(window as any).require.config({ paths: { 'vs': 'static/vs' }});

const vm = new Vue({
  el: '#app',
  render: h => h(App)
});
