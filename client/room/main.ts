import 'babel-polyfill';
import Vue from 'vue';
import VueSocketio from 'vue-socket.io';
import io from 'socket.io-client';
import MuseUI from 'muse-ui'
import 'muse-ui/dist/muse-ui.css'
import 'muse-ui/dist/theme-carbon.css'
import { parse } from 'cookie';

import App from './App';

declare var _global: any;

const cookie = parse(document.cookie);
console.log(cookie)
if (cookie['CODING_CREATOR_KEY'] && localStorage) {
  const keys = JSON.parse(localStorage.getItem('$CODING_CREATOR_KEY') || '{}');
  keys[_global.id] = cookie['CODING_CREATOR_KEY'];
  localStorage.setItem('$CODING_CREATOR_KEY', JSON.stringify(keys));
}

const socket = io(_global.url.socket, {
  path: `${_global.url.prefix}/socket.io`
})

Vue.use(MuseUI);
Vue.use(VueSocketio, socket);

const vm = new Vue({
  el: '#app',
  render: h => h(App)
});
