import 'babel-polyfill';
import Vue from 'vue';
import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.css'

import App from './App';

(window as any).require.config({ paths: { 'vs': 'static/vs' }});

Vue.use(VueMaterial);

const vm = new Vue({
  el: '#app',
  render: h => h(App)
});
