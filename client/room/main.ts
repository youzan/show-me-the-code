import 'babel-polyfill';
import Vue from 'vue';
import VueSocketio from 'vue-socket.io';
import MuseUI from 'muse-ui'
import 'muse-ui/dist/muse-ui.css'
import 'muse-ui/dist/theme-carbon.css'

import App from './App';

declare var _global: any;

Vue.use(MuseUI);
Vue.use(VueSocketio, 'wss://job.youzan.com');

const vm = new Vue({
  el: '#app',
  render: h => h(App)
});
