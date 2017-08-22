import 'babel-polyfill';
import Vue from 'vue';
import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.css'

import App from './App';
import './style';

Vue.use(VueMaterial);

new Vue({
  el: '#app',
  render: h => h(App)
});
