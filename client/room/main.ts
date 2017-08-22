import 'babel-polyfill';
import Vue from 'vue';
import VueSocketio from 'vue-socket.io';
import MuseUI from 'muse-ui'
import 'muse-ui/dist/muse-ui.css'
import 'muse-ui/dist/theme-carbon.css'

import App from './App';

declare var _global;

Vue.use(MuseUI);
Vue.use(VueSocketio, _global.url.socket);

(window as any).require.config({ paths: { 'vs': '/static/vs' }});

const vm = new Vue({
  el: '#app',
  render: h => h(App)
});
